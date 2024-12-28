// src/lib/auth.ts
import { auth, googleProvider } from "./firebase";
import { signInWithPopup } from "firebase/auth";
import api from "./api";
import { AxiosError } from "axios";

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
      const { data } = await api.post<LoginResponse>("/internal/auth/signin/email", credentials);
      if (data.uid) {
        localStorage.setItem("user", JSON.stringify(data));
      }
      return data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
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
      const { data } = await api.post<LoginResponse>("/internal/auth/signin/google", {
        id_token: idToken,
      });

      if (data.uid) {
        localStorage.setItem("user", JSON.stringify(data));
      }

      return data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.detail || "Google sign-in failed");
      }
      throw new Error("Google sign-in failed");
    }
  },

  register: async (credentials: RegisterCredentials): Promise<LoginResponse> => {
    try {
      const { data } = await api.post<LoginResponse>("/internal/auth/signup/email", credentials);
      return data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.detail || "Registration failed");
      }
      throw new Error("Registration failed");
    }
  },
  
  resetPassword: async (email: string): Promise<PasswordResetResponse> => {
    try {
      const { data } = await api.post<PasswordResetResponse>("/internal/auth/reset-password", {
        email: email,
      });
      return data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        if (error.response.status === 404) {
          throw new Error("No account found with this email address");
        }
        throw new Error(error.response.data.detail || "Failed to send reset email");
      }
      throw new Error("Failed to send reset email");
    }
  },
};