package main

import (
	"bytes"
	"encoding/json"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/supabase-community/gotrue-go/types"
	"github.com/supabase-community/supabase-go"
	"iot/auth/pkg/config"
	"iot/auth/pkg/routes"
	"log"
	"net/http"
	"net/http/httptest"
	"testing"
)

// TestUser represents a test user for signup and login
type TestUser struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// setupTestRouter creates a router for testing
func setupTestRouter() *gin.Engine {
	supabaseClient, cfg := getSupabaseClient()
	router := routes.SetupRouter(supabaseClient, cfg)
	return router
}

// makeRequest is a helper function to make HTTP requests during testing
func makeRequest(router *gin.Engine, method, url string, body interface{}) *httptest.ResponseRecorder {
	jsonBody, _ := json.Marshal(body)
	url = "http://localhost:5000" + url
	req, _ := http.NewRequest(method, url, bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	return w
}

func afterTest(userId string) {
	// Clean up
	supabaseClient, cfg := getSupabaseClient()

	user, err := supabaseClient.Auth.SignInWithEmailPassword(cfg.AdminEmail, cfg.AdminPassword)
	if err != nil {
		return
	}

	users, err := supabaseClient.Auth.AdminListUsers()
	if err != nil {
		return
	}

	for _, user := range users.Users {
		log.Println(
			user.ID,
			user.Email,
			user.Role,
			user.UserMetadata,
		)
	}

	supabaseClient.UpdateAuthSession(types.Session{AccessToken: user.AccessToken})

	// Delete test user
	userIdParsed, _ := uuid.Parse(userId)
	err = supabaseClient.Auth.AdminDeleteUser(types.AdminDeleteUserRequest{UserID: userIdParsed})
	if err != nil {
		log.Fatalf("Failed to delete test user: %v", err)
	}
}

func getSupabaseClient() (*supabase.Client, config.Config) {
	envPath := "../../infra/.env"
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

	return supabaseClient, cfg
}

// TestSignUp tests the user signup process
func TestSignUp(t *testing.T) {
	router := setupTestRouter()

	// Test successful signup
	testUser := TestUser{
		Email:    "test_signup@example.com",
		Password: "StrongPassword123!",
	}

	w := makeRequest(router, "POST", "/api/v1/auth/signup", testUser)

	assert.Equal(t, http.StatusCreated, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Contains(t, response, "user_id")
	assert.Contains(t, response, "email")

	// Test invalid email
	invalidEmailUser := TestUser{
		Email:    "invalid-email",
		Password: "StrongPassword123!",
	}

	w = makeRequest(router, "POST", "/api/v1/auth/signup", invalidEmailUser)
	assert.Equal(t, http.StatusBadRequest, w.Code)

	// Test weak password
	weakPasswordUser := TestUser{
		Email:    "weak_password@example.com",
		Password: "weak",
	}

	w = makeRequest(router, "POST", "/api/v1/auth/signup", weakPasswordUser)
	assert.Equal(t, http.StatusBadRequest, w.Code)

	// Clean up
	afterTest(response["user_id"].(string))
}

// TestLogin tests the user login process
func TestLogin(t *testing.T) {
	router := setupTestRouter()

	// First, signup a test user
	testUser := TestUser{
		Email:    "test_login@example.com",
		Password: "StrongPassword123!",
	}

	// Signup first
	w := makeRequest(router, "POST", "/api/v1/auth/signup", testUser)

	var userCreated map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &userCreated)

	// Test successful login
	w = makeRequest(router, "POST", "/api/v1/auth/login", testUser)

	assert.Equal(t, http.StatusOK, w.Code)

	var loginResponse map[string]interface{}
	err = json.Unmarshal(w.Body.Bytes(), &loginResponse)
	assert.NoError(t, err)
	assert.Contains(t, loginResponse, "access_token")
	assert.Contains(t, loginResponse, "refresh_token")
	assert.Contains(t, loginResponse, "user_id")
	assert.Contains(t, loginResponse, "email")

	// Test invalid credentials
	invalidUser := TestUser{
		Email:    "test_login@example.com",
		Password: "WrongPassword",
	}

	w = makeRequest(router, "POST", "/api/v1/auth/login", invalidUser)
	assert.Equal(t, http.StatusUnauthorized, w.Code)

	// Clean up
	afterTest(userCreated["user_id"].(string))
}

// TestRefreshToken tests the token refresh process
func TestRefreshToken(t *testing.T) {
	router := setupTestRouter()

	// First, login to get a refresh token
	testUser := TestUser{
		Email:    "test_refresh@example.com",
		Password: "StrongPassword123!",
	}

	// Signup first
	w := makeRequest(router, "POST", "/api/v1/auth/signup", testUser)

	var userCreated map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &userCreated)

	// Login to get refresh token
	loginResp := makeRequest(router, "POST", "/api/v1/auth/login", testUser)

	var loginResponse map[string]interface{}
	err = json.Unmarshal(loginResp.Body.Bytes(), &loginResponse)
	assert.NoError(t, err)

	// Test successful token refresh
	refreshRequest := map[string]string{
		"refresh_token": loginResponse["refresh_token"].(string),
	}

	w = makeRequest(router, "POST", "/api/v1/auth/refresh", refreshRequest)

	assert.Equal(t, http.StatusOK, w.Code)

	var refreshResponse map[string]interface{}
	err = json.Unmarshal(w.Body.Bytes(), &refreshResponse)
	assert.NoError(t, err)
	assert.Contains(t, refreshResponse, "access_token")
	assert.Contains(t, refreshResponse, "refresh_token")

	// Test refresh with invalid token
	invalidRefreshRequest := map[string]string{
		"refresh_token": "invalid_token",
	}

	w = makeRequest(router, "POST", "/api/v1/auth/refresh", invalidRefreshRequest)
	assert.Equal(t, http.StatusInternalServerError, w.Code)

	// Clean up
	afterTest(userCreated["user_id"].(string))
}

// TestAuthMiddleware tests the authentication middleware
func TestAuthMiddleware(t *testing.T) {
	router := setupTestRouter()

	// First, signup and login to get a valid token
	testUser := TestUser{
		Email:    "test_auth_middleware@example.com",
		Password: "StrongPassword123!",
	}

	// Signup first
	w := makeRequest(router, "POST", "/api/v1/auth/signup", testUser)

	var userCreated map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &userCreated)

	// Login to get access token
	loginResp := makeRequest(router, "POST", "/api/v1/auth/login", testUser)

	var loginResponse map[string]interface{}
	err = json.Unmarshal(loginResp.Body.Bytes(), &loginResponse)
	assert.NoError(t, err)

	accessToken := loginResponse["access_token"].(string)

	// Test protected route with valid token
	req, _ := http.NewRequest("GET", "/api/v1/profile", nil)
	req.Header.Set("Authorization", accessToken)
	w = httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	// Test protected route without token
	req, _ = http.NewRequest("GET", "/api/v1/profile", nil)
	w = httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)

	// Test protected route with invalid token
	req, _ = http.NewRequest("GET", "/api/v1/profile", nil)
	req.Header.Set("Authorization",
		"Bearer invalid_token")
	w = httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)

	// Clean up
	afterTest(userCreated["user_id"].(string))
}

// TestHealthCheck tests the health check endpoint
func TestHealthCheck(t *testing.T) {
	router := setupTestRouter()

	w := makeRequest(router, "GET", "/api/v1/health", nil)

	assert.Equal(t, http.StatusOK, w.Code)

	var healthResponse map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &healthResponse)
	assert.NoError(t, err)
	assert.Equal(t, "healthy", healthResponse["status"])
	assert.Contains(t, healthResponse, "supabase")
}

// TestLogout tests the logout endpoint
func TestLogout(t *testing.T) {
	router := setupTestRouter()

	// First, signup and login to get a valid token
	testUser := TestUser{
		Email:    "test_logout@example.com",
		Password: "StrongPassword123!",
	}

	// Signup first
	w := makeRequest(router, "POST", "/api/v1/auth/signup", testUser)

	var userCreated map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &userCreated)

	// Login to get access token
	loginResp := makeRequest(router, "POST", "/api/v1/auth/login", testUser)

	var loginResponse map[string]interface{}
	err = json.Unmarshal(loginResp.Body.Bytes(), &loginResponse)
	assert.NoError(t, err)

	accessToken := loginResponse["access_token"].(string)

	// Test logout
	req, _ := http.NewRequest("POST", "/api/v1/auth/logout", nil)
	req.Header.Set("Authorization", accessToken)
	w = httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var logoutResponse map[string]interface{}
	err = json.Unmarshal(w.Body.Bytes(), &logoutResponse)
	assert.NoError(t, err)
	assert.Equal(t, "Logged out successfully", logoutResponse["message"])

	// Test logout without token
	req, _ = http.NewRequest("POST", "/api/v1/auth/logout", nil)
	w = httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)

	// Test logout with invalid token
	req, _ = http.NewRequest("POST", "/api/v1/auth/logout", nil)
	req.Header.Set("Authorization",
		"Bearer invalid_token")
	w = httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)

	// Clean up
	afterTest(userCreated["user_id"].(string))
}
