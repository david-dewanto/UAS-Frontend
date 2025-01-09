import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { X, Info, CheckCircle2 } from "lucide-react";
import { ForgotPasswordModal } from "@/components/forgot-password-modal";
import { authService } from "@/lib/auth";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const handleGoogleSignIn = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); 
    e.stopPropagation();
    setIsLoading(true);
    setAlert(null);

    try {
      const response = await authService.signInWithGoogle();

      if (!response.email_verified) {
        setAlert({
          show: true,
          type: "error",
          title: "Email not verified",
          message: response.message || "Please verify your email address",
        });
        return;
      }

      setAlert({
        show: true,
        type: "success",
        title: "Success",
        message: "Logged in successfully",
      });

      // Navigate to dashboard after successful login
      setTimeout(() => {
        navigate("/dashboard/investments/dashboard");
      }, 1500);
    } catch (error) {
      setAlert({
        show: true,
        type: "error",
        title: "Error",
        message:
          error instanceof Error ? error.message : "Google sign-in failed",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{
    show: boolean;
    type: "error" | "success";
    title: string;
    message: string;
  } | null>(null);
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (alert?.show) {
      // Delay the visibility to ensure proper animation mounting
      requestAnimationFrame(() => {
        setIsAlertVisible(true);
      });

      const timer = setTimeout(() => {
        setIsAlertVisible(false);
        // Wait for fade out animation before removing alert from DOM
        setTimeout(() => {
          setAlert(null);
        }, 300);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAlert(null);

    try {
      const response = await authService.login(formData);

      if (!response.email_verified) {
        setAlert({
          show: true,
          type: "error",
          title: "Email not verified",
          message:
            response.message || "Please check your email for verification link",
        });
        return;
      }

      setAlert({
        show: true,
        type: "success",
        title: "Success",
        message: "Logged in successfully",
      });

      setTimeout(() => {
        navigate("/dashboard/investments/dashboard");
      }, 1500);
    } catch (error) {
      setAlert({
        show: true,
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Login failed",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {alert && (
        <Alert
          variant={alert.type === "error" ? "destructive" : "default"}
          className={cn(
            "absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-[420px] shadow-lg",
            "transition-all duration-300 ease-in-out transform",
            // Apply different styles based on alert type
            alert.type === "success"
              ? "border-green-500 bg-green-50 text-green-700"
              : "border-red-500 bg-red-50 text-red-700", // Added error styling
            isAlertVisible
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
          )}
          role="alert"
        >
          <div className="flex justify-between items-start">
            <div className="flex gap-2">
              {alert.type === "error" ? (
                <Info
                  className={cn(
                    "h-4 w-4",
                    alert.type === "error" && "text-red-700" // Added error icon color
                  )}
                />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-green-700" />
              )}
              <div>
                <AlertTitle>{alert.title}</AlertTitle>
                <AlertDescription>{alert.message}</AlertDescription>
              </div>
            </div>
            <button
              onClick={() => {
                setIsAlertVisible(false);
                setTimeout(() => setAlert(null), 300);
              }}
              className={cn(
                "text-sm hover:opacity-70 transition-opacity",
                alert.type === "error" && "text-red-700" 
              )}
              aria-label="Close alert"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </Alert>
      )}

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Login with your Google Account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button
                  type = "button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  {isLoading ? "Signing in..." : "Login with Google"}
                </Button>
              </div>
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="username@example.com"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <ForgotPasswordModal />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <a href="/register" className="underline underline-offset-4">
                  Sign up
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
