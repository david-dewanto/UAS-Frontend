import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";
import logo from '@/assets/logo.svg'
import { LoginForm } from "@/components/login-form"
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { X, Info, CheckCircle2 } from "lucide-react";

interface AuthMessage {
  show: boolean;
  type: "error" | "success";
  title: string;
  message: string;
  timestamp?: number;
}

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [authMessage, setAuthMessage] = useState<AuthMessage | null>(null);
  const [isAlertVisible, setIsAlertVisible] = useState(false);

  // Handle auth messages from localStorage
  useEffect(() => {
    const checkStoredMessage = () => {
      const storedMessage = localStorage.getItem('authMessage');
      if (storedMessage) {
        try {
          const parsedMessage = JSON.parse(storedMessage);
          
          // Check if message is less than 5 seconds old
          const messageAge = Date.now() - (parsedMessage.timestamp || 0);
          if (messageAge < 5000) {
            setAuthMessage({
              show: true,
              type: parsedMessage.type,
              title: parsedMessage.title,
              message: parsedMessage.message,
              timestamp: parsedMessage.timestamp
            });
            setIsAlertVisible(true);
          }
        } catch (error) {
          console.error('Error parsing auth message:', error);
        }
        
        // Clear the message from localStorage
        localStorage.removeItem('authMessage');
      }
    };

    // Check for messages on mount and when localStorage changes
    checkStoredMessage();
    
    // Listen for localStorage changes in other tabs/windows
    window.addEventListener('storage', checkStoredMessage);
    
    return () => {
      window.removeEventListener('storage', checkStoredMessage);
    };
  }, []);

  // Handle alert visibility and auto-dismiss
  useEffect(() => {
    if (authMessage?.show) {
      // Ensure alert is visible
      setIsAlertVisible(true);

      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        setIsAlertVisible(false);
        setTimeout(() => {
          setAuthMessage(null);
        }, 300); // Wait for fade-out animation
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [authMessage]);

  // Handle already authenticated users
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const isAlreadyAuthenticated = storedUser !== null && user !== null && !isLoading;
  
    if (isAlreadyAuthenticated) {
      setAuthMessage({
        show: true,
        type: "success",
        title: "Already Logged In",
        message: "Redirecting to dashboard..."
      });
  
      setTimeout(() => {
        navigate('/dashboard/investments/dashboard');
      }, 2000);
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        {/* Alert Component */}
        {authMessage && (
          <Alert
            variant={authMessage.type === "error" ? "destructive" : "default"}
            className={cn(
              "absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-[420px] shadow-lg",
              "transition-all duration-300 ease-in-out transform",
              authMessage.type === "success"
                ? "border-green-500 bg-green-50 text-green-700"
                : "border-red-500 bg-red-50 text-red-700",
              isAlertVisible
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
            )}
            role="alert"
          >
            <div className="flex justify-between items-start">
              <div className="flex gap-2">
                {authMessage.type === "error" ? (
                  <Info className={cn("h-4 w-4", authMessage.type === "error" && "text-red-700")} />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-green-700" />
                )}
                <div>
                  <AlertTitle>{authMessage.title}</AlertTitle>
                  <AlertDescription>{authMessage.message}</AlertDescription>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAlertVisible(false);
                  setTimeout(() => setAuthMessage(null), 300);
                }}
                className={cn(
                  "text-sm hover:opacity-70 transition-opacity",
                  authMessage.type === "error" && "text-red-700" 
                )}
                aria-label="Close alert"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </Alert>
        )}

        {/* Logo and Login Form */}
        <a href="/" className="flex items-center gap-2 self-center font-medium">
          <img src={logo} alt="Logo" className="h-12 w-auto" />
        </a>
        <LoginForm />
      </div>
    </div>
  );
}