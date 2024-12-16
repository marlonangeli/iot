package routes

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/supabase-community/supabase-go"

	"iot/auth/pkg/config"
	"iot/auth/pkg/handlers"
)

// SetupRouter creates and configures the Gin router
func SetupRouter(supabaseClient *supabase.Client, cfg config.Config) *gin.Engine {
	router := gin.Default()

	// CORS middleware
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Create auth handlers
	authHandlers := handlers.NewAuthHandlers(supabaseClient, cfg)

	// API v1 group
	api := router.Group("/api/v1")
	{
		// Authentication routes
		auth := api.Group("/auth")
		{
			auth.POST("/signup", authHandlers.SignUp)
			auth.POST("/login", authHandlers.Login)
			auth.POST("/refresh", authHandlers.RefreshToken)

			// Routes requiring authentication
			out := auth.Use(authHandlers.AuthMiddleware)
			{
				out.POST("/logout", authHandlers.Logout)
			}
		}

		// Protected routes
		protected := api.Group("/")
		protected.Use(authHandlers.AuthMiddleware)
		{
			protected.GET("/profile", authHandlers.GetProfile)
		}

		// Public routes
		api.GET("/health", authHandlers.HealthCheck)
	}

	return router
}
