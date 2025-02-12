package config

import (
	"fmt"
	"github.com/joho/godotenv"
	"log"
	"os"
	"path/filepath"
)

type Config struct {
	SupabaseURL   string
	SupabaseKey   string
	JWTSecret     string
	Port          string
	AdminEmail    string
	AdminPassword string
}

// LoadConfig dynamically loads the .env file based on the provided path.
// If no path is provided, it defaults to loading from the current working directory.
func LoadConfig(envPath ...string) (Config, error) {
	// Determine the .env file path
	var envFilePath string
	if len(envPath) > 0 && envPath[0] != "" {
		envFilePath = filepath.Clean(envPath[0])
	} else {
		envFilePath = ".env"
	}

	// Load the .env file
	if err := godotenv.Load(envFilePath); err != nil {
		log.Printf("Using system environment variables or failed to load .env from %s: %v\n", envFilePath, err)
	}

	// Return the configuration struct
	return Config{
		SupabaseURL:   os.Getenv("SUPABASE_URL"),
		SupabaseKey:   os.Getenv("SUPABASE_SERVICE_ROLE_KEY"),
		JWTSecret:     os.Getenv("JWT_SECRET"),
		Port:          os.Getenv("AUTH_PORT"),
		AdminEmail:    os.Getenv("ADMIN_EMAIL"),
		AdminPassword: os.Getenv("ADMIN_PASSWORD"),
	}, nil
}

func (c Config) Validate() error {
	if c.SupabaseURL == "" {
		return fmt.Errorf("SUPABASE_URL must be set")
	}
	if c.SupabaseKey == "" {
		return fmt.Errorf("SUPABASE_SERVICE_ROLE_KEY must be set")
	}
	if c.JWTSecret == "" {
		return fmt.Errorf("JWT_SECRET must be set")
	}

    log.Println("Config is valid")
	return nil
}
