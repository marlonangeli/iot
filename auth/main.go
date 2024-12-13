package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
	"github.com/supabase-community/gotrue-go/types"
	"github.com/supabase-community/supabase-go"
)

type Config struct {
	SupabaseURL        string
	SupabaseKey        string
	JWTSecret          string
	Port               string
	TokenExpiryAccess  time.Duration
	TokenExpiryRefresh time.Duration
}

type User struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

type Claims struct {
	Email string `json:"email"`
	jwt.RegisteredClaims
}

var (
	supabaseClient *supabase.Client
	config         Config
)

func loadConfig() (Config, error) {
	if err := godotenv.Load(); err != nil {
		log.Println("Using system environment variables")
	}

	return Config{
		SupabaseURL:        os.Getenv("SUPABASE_URL"),
		SupabaseKey:        os.Getenv("SUPABASE_SERVICE_ROLE_KEY"),
		JWTSecret:          os.Getenv("JWT_SECRET"),
		Port:               os.Getenv("PORT"),
		TokenExpiryAccess:  15 * time.Minute,
		TokenExpiryRefresh: 7 * 24 * time.Hour,
	}, nil
}

func main() {
	var err error
	config, err = loadConfig()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	supabaseClient, err = supabase.NewClient(config.SupabaseURL, config.SupabaseKey, nil)
	if err != nil {
		log.Fatalf("Failed to create Supabase client: %v", err)
	}

	if config.JWTSecret == "" {
		log.Fatal("JWT_SECRET must be set")
	}

	router := SetupRouter()
	port := config.Port
	if port == "" {
		port = "5000"
	}

	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func SetupRouter() *gin.Engine {
	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	api := router.Group("/api/v1")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/signup", signUp)
			auth.POST("/login", login)
			auth.POST("/refresh", refreshToken)
			auth.POST("/logout", logout).Use(authMiddleware)
		}

		protected := api.Group("/")
		protected.Use(authMiddleware)
		{
			protected.GET("/profile", getProfile)
		}

		api.GET("/health", healthCheck)
	}

	return router
}

func signUp(c *gin.Context) {
	var user User
	if err := c.ShouldBindJSON(&user); err != nil {
		respondWithError(c, http.StatusBadRequest, "Invalid request payload")
		return
	}

	signUpParams := types.SignupRequest{Email: user.Email, Password: user.Password}
	resp, err := supabaseClient.Auth.Signup(signUpParams)
	if err != nil {
		respondWithError(c, http.StatusInternalServerError, "Failed to sign up user")
		return
	}

	c.JSON(http.StatusCreated, gin.H{"user_id": resp.User.ID, "email": resp.User.Email})
}

func login(c *gin.Context) {
	var user User
	if err := c.ShouldBindJSON(&user); err != nil {
		respondWithError(c, http.StatusBadRequest, "Invalid request payload")
		return
	}

	resp, err := supabaseClient.Auth.SignInWithEmailPassword(user.Email, user.Password)
	if err != nil {
		respondWithError(c, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	accessToken, refreshToken, err := generateTokens(user.Email)
	if err != nil {
		respondWithError(c, http.StatusInternalServerError, "Failed to generate tokens")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user_id":       resp.User.ID,
		"email":         resp.User.Email,
		"access_token":  accessToken,
		"refresh_token": refreshToken,
	})
}

func refreshToken(c *gin.Context) {
	var request struct {
		RefreshToken string `json:"refresh_token" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		respondWithError(c, http.StatusBadRequest, "Invalid request payload")
		return
	}

	claims := &Claims{}
	token, err := jwt.ParseWithClaims(request.RefreshToken, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(config.JWTSecret), nil
	})

	if err != nil || !token.Valid {
		respondWithError(c, http.StatusUnauthorized, "Invalid refresh token")
		return
	}

	accessToken, newRefreshToken, err := generateTokens(claims.Email)
	if err != nil {
		respondWithError(c, http.StatusInternalServerError, "Failed to generate new tokens")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"access_token":  accessToken,
		"refresh_token": newRefreshToken,
	})
}

func logout(c *gin.Context) {

	err := supabaseClient.Auth.Logout()
	if err != nil {
		respondWithError(c, http.StatusInternalServerError, "Failed to log out")
		log.Println(err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

func generateTokens(email string) (string, string, error) {
	accessTokenClaims := Claims{
		Email: email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(config.TokenExpiryAccess)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "auth-service",
		},
	}

	accessToken, err := jwt.NewWithClaims(jwt.SigningMethodHS256, accessTokenClaims).SignedString([]byte(config.JWTSecret))
	if err != nil {
		return "", "", err
	}

	refreshTokenClaims := Claims{
		Email: email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(config.TokenExpiryRefresh)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "auth-service",
		},
	}

	refreshToken, err := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshTokenClaims).SignedString([]byte(config.JWTSecret))
	if err != nil {
		return "", "", err
	}

	return accessToken, refreshToken, nil
}

func respondWithError(c *gin.Context, status int, message string) {
	c.JSON(status, gin.H{"error": message})
}

func authMiddleware(c *gin.Context) {
	tokenString := c.GetHeader("Authorization")
	if tokenString == "" {
		respondWithError(c, http.StatusUnauthorized, "Authorization token missing")
		c.Abort()
		return
	}

	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(config.JWTSecret), nil
	})

	if err != nil || !token.Valid {
		respondWithError(c, http.StatusUnauthorized, "Invalid token")
		c.Abort()
		return
	}

	c.Set("email", claims.Email)
	c.Next()
}

func healthCheck(c *gin.Context) {
	health, err := supabaseClient.Auth.HealthCheck()
	if err != nil {
		respondWithError(c, http.StatusInternalServerError, "Supabase health check failed")
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "healthy", "supabase": health})
}

func getProfile(c *gin.Context) {
	email, exists := c.Get("email")
	if !exists {
		respondWithError(c, http.StatusUnauthorized, "User not authenticated")
		return
	}

	c.JSON(http.StatusOK, gin.H{"email": email, "message": "Profile retrieved successfully"})
}
