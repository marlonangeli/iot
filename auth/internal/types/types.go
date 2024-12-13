package types

import "github.com/golang-jwt/jwt/v5"

type User struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

type Claims struct {
	Email string `json:"email"`
	jwt.RegisteredClaims
}
