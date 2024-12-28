// src/lib/auth.ts
import axios from "axios";
import { auth, googleProvider } from "./firebase";
import { signInWithPopup } from "firebase/auth";

const API_URL = "http://localhost:8000/v1";
const INTERNAL_API_KEY =
  "621f00b1-c60e-44dc-9455-fc3cd86b7868-4fdd7370-25db-42c5-9de2-71487994c6ad";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": INTERNAL_API_KEY,
  },
});

export interface RegisterCredentials {
  email: string;
  password: string;
  display_name: string;
}

export interface LoginResponse {
  uid: string;
  email: string;
  email_verified: boolean;
  message: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string; 
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const { data } = await api.post(
        "/internal/auth/signin/email",
        credentials
      );
      if (data.uid) {
        localStorage.setItem("user", JSON.stringify(data));
      }
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.detail || "Login failed");
      }
      throw new Error("Login failed");
    }
  },

  logout: () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  },

  getCurrentUser: (): LoginResponse | null => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  async signInWithGoogle(): Promise<LoginResponse> {
    try {
      const result = await signInWithPopup(auth, googleProvider);

      const idToken = await result.user.getIdToken();

      const { data } = await api.post<LoginResponse>(
        "/internal/auth/signin/google",
        {
          id_token: idToken,
        }
      );

      if (data.uid) {
        localStorage.setItem("user", JSON.stringify(data));
      }

      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.detail || "Google sign-in failed");
      }
      throw new Error("Google sign-in failed");
    }
  },

  register: async (
    credentials: RegisterCredentials
  ): Promise<LoginResponse> => {
    try {
      const { data } = await api.post<LoginResponse>(
        "/internal/auth/signup/email",
        credentials
      );

      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.detail || "Registration failed");
      }
      throw new Error("Registration failed");
    }
  },
  
  resetPassword: async (email: string): Promise<PasswordResetResponse> => {
    try {
      const { data } = await api.post<PasswordResetResponse>(
        "/internal/auth/reset-password",
        {
          email: email,
        }
      );
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Handle specific error cases
        if (error.response.status === 404) {
          throw new Error("No account found with this email address");
        }
        throw new Error(
          error.response.data.detail || "Failed to send reset email"
        );
      }
      throw new Error("Failed to send reset email");
    }
  },
};
