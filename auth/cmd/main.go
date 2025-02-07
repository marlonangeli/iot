package main

import (
	"log"

	"github.com/supabase-community/supabase-go"

	"iot/auth/pkg/config"
	"iot/auth/pkg/routes"
)

func main() {
	// Load configuration
	envPath := "../infra/.env"
	cfg, err := config.LoadConfig(envPath)
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Validate configuration
	if err := cfg.Validate(); err != nil {
		log.Fatalf("Invalid configuration: %v", err)
	}

	// Create Supabase client
	supabaseClient, err := supabase.NewClient(cfg.SupabaseURL, cfg.SupabaseKey, nil)
	if err != nil {
		log.Fatalf("Failed to create Supabase client: %v", err)
	}

	// Setup router
	router := routes.SetupRouter(supabaseClient, cfg)

	// Determine port
	port := cfg.Port
	if port == "" {
		port = "5000"
	}

	// Start server
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
