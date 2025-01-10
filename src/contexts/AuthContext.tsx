import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { authService, LoginResponse } from "@/lib/auth";
import { useLocation } from "react-router-dom";
import api from "@/lib/api";

interface AuthContextType {
  user: LoginResponse | null;
  isLoading: boolean;
  isValidating: boolean;
  login: (user: LoginResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const location = useLocation();

  const setAuthMessage = (type: "error" | "success", title: string, message: string) => {
    localStorage.setItem(
      "authMessage",
      JSON.stringify({
        type,
        title,
        message,
        timestamp: Date.now()
      })
    );
  };

  // Function to validate token
  const validateToken = async (showToast = true) => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser?.id_token) {
      setUser(null);
      return false;
    }

    setIsValidating(true);
    try {
      const { data } = await api.post("/internal/validate-token", {
        token: currentUser.id_token,
      });

      if (!data.is_valid) {
        if (showToast) {
          setAuthMessage(
            "error",
            "Session Expired",
            "Your session has expired. Please sign in again to continue."
          );
        }
        authService.logout();
        setUser(null);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Token validation error:", error);
      if (showToast) {
        setAuthMessage(
          "error",
          "Authentication Error",
          "There was a problem with your authentication. Please sign in again."
        );
      }
      authService.logout();
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      const currentUser = authService.getCurrentUser();

      if (currentUser) {
        const isValid = await validateToken(false); // Don't show toast on initial load
        if (isValid) {
          setUser(currentUser);
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Set up periodic token validation (every 5 minutes)
  useEffect(() => {
    if (!user) return;

    const intervalId = setInterval(() => {
      validateToken();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(intervalId);
  }, [user]);

  // Validate token on route change
  useEffect(() => {
    if (user) {
      validateToken();
    }
  }, [location.pathname]);

  const login = (newUser: LoginResponse) => {
    setUser(newUser);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    isLoading,
    isValidating,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}