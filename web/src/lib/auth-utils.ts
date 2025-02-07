import {z} from 'zod';
import axios from 'axios';
import jwt from 'jsonwebtoken';

// Zod Schemas for Validation
export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password too long')
});

export const SignupSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name too long'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must include uppercase, lowercase, number, and special character')
});

// User Role Enum
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  OPERATOR = 'OPERATOR',
  VIEWER = 'VIEWER'
}

// User Interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

// Authentication API Service
export class AuthService {
  private static BASE_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || '/api/auth';

  // Login method with Zod validation
  static async login(credentials: z.infer<typeof LoginSchema>): Promise<{
    user: User,
    token: string
  }> {
    try {
      // Validate input
      const validatedData = LoginSchema.parse(credentials);

      // Make API call
      const response = await axios.post(`${this.BASE_URL}/login`, validatedData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(error.errors[0].message);
      }
      throw error;
    }
  }

  // Signup method with Zod validation
  static async signup(userData: z.infer<typeof SignupSchema>): Promise<{
    user: User,
    token: string
  }> {
    try {
      // Validate input
      const validatedData = SignupSchema.parse(userData);

      // Make API call
      const response = await axios.post(`${this.BASE_URL}/signup`, validatedData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(error.errors[0].message);
      }
      throw error;
    }
  }

  // Token verification utility
  static verifyToken(token: string): User | null {
    try {
      return jwt.verify(
        token,
        process.env.NEXT_PUBLIC_JWT_SECRET || ''
      ) as User;
    } catch {
      return null;
    }
  }

  // Token refresh method
  static async refreshToken(token: string): Promise<string> {
    try {
      const response = await axios.post(`${this.BASE_URL}/refresh`,
        {token},
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data.token;
    } catch {
      throw new Error('Token refresh failed');
    }
  }
}
