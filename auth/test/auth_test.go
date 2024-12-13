package test

import (
	"bytes"
	"encoding/json"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"github.com/supabase-community/gotrue-go/types"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"iot/auth"

	"github.com/stretchr/testify/assert"
	"github.com/supabase-community/supabase-go"
)

type TestUser struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

var (
	baseURL  = "/api/v1/auth"
	testUser = TestUser{
		Email:    "testuser@example.com",
		Password: "Test@12345",
	}
	userId string
)

func TestAuthAPI(t *testing.T) {
	router := setupTestServer()
	testServer := httptest.NewServer(router)
	defer testServer.Close()
	var accessToken, refreshToken string

	t.Run("Sign Up", func(t *testing.T) {
		body, _ := json.Marshal(testUser)
		resp, err := http.Post(testServer.URL+baseURL+"/signup", "application/json", bytes.NewReader(body))
		// get user id from body
		var result map[string]interface{}
		err = json.NewDecoder(resp.Body).Decode(&result)
		userId = result["user_id"].(string)

		assert.NoError(t, err)
		assert.Equal(t, http.StatusCreated, resp.StatusCode)
	})

	t.Run("Login", func(t *testing.T) {
		body, _ := json.Marshal(testUser)
		resp, err := http.Post(testServer.URL+baseURL+"/login", "application/json", bytes.NewReader(body))
		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var result map[string]interface{}
		err = json.NewDecoder(resp.Body).Decode(&result)
		assert.NoError(t, err)
		assert.NotEmpty(t, result["access_token"])
		assert.NotEmpty(t, result["refresh_token"])

		accessToken = result["access_token"].(string)
		refreshToken = result["refresh_token"].(string)
	})

	t.Run("Refresh Token", func(t *testing.T) {
		body, _ := json.Marshal(map[string]string{"refresh_token": refreshToken})
		resp, err := http.Post(testServer.URL+baseURL+"/refresh", "application/json", bytes.NewReader(body))
		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var result map[string]interface{}
		err = json.NewDecoder(resp.Body).Decode(&result)
		assert.NoError(t, err)
		assert.NotEmpty(t, result["access_token"])
		assert.NotEmpty(t, result["refresh_token"])

		accessToken = result["access_token"].(string)
		refreshToken = result["refresh_token"].(string)
	})

	t.Run("Logout", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodPost, testServer.URL+baseURL+"/logout", nil)
		req.Header.Set("Authorization", accessToken)
		client := &http.Client{}
		resp, err := client.Do(req)
		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, resp.StatusCode)
	})

	t.Cleanup(func() {
		deleteTestUser()
	})
}

func setupTestServer() http.Handler {
	r := main.SetupRouter()
	return r
}

func deleteTestUser() {
	err := godotenv.Load()
	if err != nil {
		return
	}

	supabaseUrl := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_KEY")

	client, _ := supabase.NewClient(supabaseUrl, supabaseKey, nil)

	userIdDelete := uuid.MustParse(userId)
	err = client.Auth.AdminDeleteUser(types.AdminDeleteUserRequest{UserID: userIdDelete})
	if err != nil {
		panic("Failed to delete test user: " + err.Error())
	}
}
