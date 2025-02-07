package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/supabase-community/gotrue-go/types"
	"github.com/supabase-community/supabase-go"
	"log"
	"net/http"

	_types "iot/auth/internal/types"
	"iot/auth/pkg/config"
)

type AuthHandlers struct {
	supabaseClient *supabase.Client
	config         config.Config
}

func NewAuthHandlers(client *supabase.Client, cfg config.Config) *AuthHandlers {
	return &AuthHandlers{
		supabaseClient: client,
		config:         cfg,
	}
}

func (h *AuthHandlers) SignUp(c *gin.Context) {
	var user _types.User

	if err := c.ShouldBindJSON(&user); err != nil {
		respondWithError(c, http.StatusBadRequest, "Invalid request payload")
		return
	}

	signUpParams := types.SignupRequest{Email: user.Email, Password: user.Password}
	resp, err := h.supabaseClient.Auth.Signup(signUpParams)
	if err != nil {
		respondWithError(c, http.StatusInternalServerError, "Failed to sign up user")
		return
	}

	c.JSON(http.StatusCreated, gin.H{"user_id": resp.User.ID, "email": resp.User.Email})
}

func (h *AuthHandlers) Login(c *gin.Context) {
	var user _types.User
	if err := c.ShouldBindJSON(&user); err != nil {
		respondWithError(c, http.StatusBadRequest, "Invalid request payload")
		return
	}

	resp, err := h.supabaseClient.Auth.SignInWithEmailPassword(user.Email, user.Password)
	if err != nil {
		respondWithError(c, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user_id":       resp.User.ID,
		"email":         resp.User.Email,
		"access_token":  resp.AccessToken,
		"refresh_token": resp.RefreshToken,
	})
}

func (h *AuthHandlers) RefreshToken(c *gin.Context) {
	var request struct {
		RefreshToken string `json:"refresh_token" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		respondWithError(c, http.StatusBadRequest, "Invalid request payload")
		return
	}

	resp, err := h.supabaseClient.Auth.RefreshToken(request.RefreshToken)
	if err != nil {
		respondWithError(c, http.StatusInternalServerError, "Failed to refresh token")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"access_token":  resp.AccessToken,
		"refresh_token": resp.RefreshToken,
	})
}

func (h *AuthHandlers) Logout(c *gin.Context) {
	err := h.supabaseClient.Auth.Logout()
	if err != nil {
		respondWithError(c, http.StatusInternalServerError, "Failed to log out")
		log.Println(err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

func (h *AuthHandlers) GetProfile(c *gin.Context) {
	email, exists := c.Get("email")
	role, _ := c.Get("role")
	userId, _ := c.Get("user_id")
	if !exists {
		respondWithError(c, http.StatusUnauthorized, "User not authenticated")
		return
	}

	c.JSON(http.StatusOK, gin.H{"email": email, "role": role, "user_id": userId})
}

func (h *AuthHandlers) HealthCheck(c *gin.Context) {
	health, err := h.supabaseClient.Auth.HealthCheck()
	if err != nil {
		respondWithError(c, http.StatusInternalServerError, "Supabase health check failed")
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "healthy", "supabase": health})
}

func (h *AuthHandlers) AuthMiddleware(c *gin.Context) {
	tokenString := c.GetHeader("Authorization")
	if tokenString == "" {
		respondWithError(c, http.StatusUnauthorized, "Authorization token missing")
		c.Abort()
		return
	}

	claims := &_types.Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(h.config.JWTSecret), nil
	})

	if err != nil || !token.Valid {
		respondWithError(c, http.StatusUnauthorized, "Invalid token")
		c.Abort()
		return
	}

	// Update the session in Supabase with the access token
	session := types.Session{AccessToken: tokenString}
	h.supabaseClient.UpdateAuthSession(session)

	c.Set("email", claims.Email)
	c.Set("role", claims.Role)
	c.Set("user_id", claims.Subject)
	c.Next()
}

// Helper function to respond with error
func respondWithError(c *gin.Context, status int, message string) {
	c.JSON(status, gin.H{"error": message})
}
