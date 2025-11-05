package client

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
)

// UserClient defines the interface for communicating with the User Service.
type UserClient interface {
	GetUser(ctx context.Context, userID string) (*UserInfo, error)
	GetUsersBatch(ctx context.Context, userIDs []string) ([]UserInfo, error)
	SearchUsers(ctx context.Context, query string) ([]UserInfo, error)
	GetSimpleUser(userID string) (*SimpleUser, error)
	GetSimpleUsers(userIDs []string) ([]SimpleUser, error)
}

type userClient struct {
	baseURL string
	client  *http.Client
}

// UserInfo represents detailed user information from User Service.
type UserInfo struct {
	UserID   string `json:"userId"`
	Name     string `json:"name"`
	Email    string `json:"email"`
	IsActive bool   `json:"isActive"`
}

// SimpleUser represents basic user information needed for display.
type SimpleUser struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	AvatarURL string `json:"avatarUrl"`
}

// NewUserClient creates a new User Service client.
func NewUserClient(baseURL string) UserClient {
	return &userClient{
		baseURL: baseURL,
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// GetSimpleUser retrieves basic info for a single user.
func (c *userClient) GetSimpleUser(userID string) (*SimpleUser, error) {
	// This endpoint might not exist yet in user-service, assuming it will be /api/users/{id}/simple
	url := fmt.Sprintf("%s/api/users/%s", c.baseURL, userID)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request for simple user: %w", err)
	}

	resp, err := c.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to get simple user: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("user service returned status %d for simple user", resp.StatusCode)
	}

	var user SimpleUser
	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
		return nil, fmt.Errorf("failed to decode simple user response: %w", err)
	}
	return &user, nil
}

// GetSimpleUsers retrieves basic info for multiple users.
func (c *userClient) GetSimpleUsers(userIDs []string) ([]SimpleUser, error) {
	// This endpoint might not exist yet, assuming /api/users/batch/simple
	url := fmt.Sprintf("%s/api/users/batch?ids=%s", c.baseURL, strings.Join(userIDs, ","))
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request for simple users: %w", err)
	}

	resp, err := c.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to get simple users: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("user service returned status %d for simple users", resp.StatusCode)
	}

	var users []SimpleUser
	if err := json.NewDecoder(resp.Body).Decode(&users); err != nil {
		return nil, fmt.Errorf("failed to decode simple users response: %w", err)
	}
	return users, nil
}

// GetUser retrieves a single user by ID
func (c *userClient) GetUser(ctx context.Context, userID string) (*UserInfo, error) {
	url := fmt.Sprintf("%s/api/users/%s", c.baseURL, userID)

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	resp, err := c.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("user service returned status %d", resp.StatusCode)
	}

	var userInfo UserInfo
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return &userInfo, nil
}

// GetUsersBatch retrieves multiple users by IDs
func (c *userClient) GetUsersBatch(ctx context.Context, userIDs []string) ([]UserInfo, error) {
	url := fmt.Sprintf("%s/api/users/batch", c.baseURL)

	requestBody := map[string][]string{
		"userIds": userIDs,
	}

	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("user service returned status %d", resp.StatusCode)
	}

	var users []UserInfo
	if err := json.NewDecoder(resp.Body).Decode(&users); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return users, nil
}

// SearchUsers searches for users by query string
func (c *userClient) SearchUsers(ctx context.Context, query string) ([]UserInfo, error) {
	url := fmt.Sprintf("%s/api/users/search?query=%s", c.baseURL, query)

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	resp, err := c.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("user service returned status %d", resp.StatusCode)
	}

	var users []UserInfo
	if err := json.NewDecoder(resp.Body).Decode(&users); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return users, nil
}
