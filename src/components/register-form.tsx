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
import { authService } from "@/lib/auth";

export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
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
    display_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Handle alert visibility and auto-dismiss
  useEffect(() => {
    if (alert?.show) {
      requestAnimationFrame(() => {
        setIsAlertVisible(true);
      });

      const timer = setTimeout(() => {
        setIsAlertVisible(false);
        setTimeout(() => {
          setAlert(null);
        }, 300);
      }, 5000); // Show for 5 seconds for registration feedback

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

  const validateForm = (): string | null => {
    if (!formData.display_name.trim()) {
      return "Please enter your full name";
    }
    if (!formData.email.trim()) {
      return "Please enter your email";
    }
    if (!formData.password) {
      return "Please enter a password";
    }
    if (formData.password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAlert(null);

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setAlert({
        show: true,
        type: "error",
        title: "Validation Error",
        message: validationError,
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.register({
        email: formData.email,
        password: formData.password,
        display_name: formData.display_name,
      });

      setAlert({
        show: true,
        type: "success",
        title: "Registration Successful",
        message: response.message || "Please check your email for verification link",
      });

      // Clear the form
      setFormData({
        display_name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      // Redirect to login page after a delay
      setTimeout(() => {
        navigate("/login");
      }, 5000);
    } catch (error) {
      setAlert({
        show: true,
        type: "error",
        title: "Registration Failed",
        message: error instanceof Error ? error.message : "Failed to create account",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setAlert(null);

    try {
      const response = await authService.signInWithGoogle();
      
      setAlert({
        show: true,
        type: "success",
        title: "Success",
        message: "Account created successfully",
      });

      // Navigate to dashboard after successful registration
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      setAlert({
        show: true,
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Google sign-up failed",
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
            alert.type === "success"
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
              {alert.type === "error" ? (
                <Info className="h-4 w-4 text-red-700" />
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
          <CardTitle className="text-xl">Create an account</CardTitle>
          <CardDescription>Sign up with your Google Account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignUp}
                  disabled={isLoading}
                >
                  <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  {isLoading ? "Signing up..." : "Sign up with Google"}
                </Button>
              </div>
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="display_name">Full Name</Label>
                  <Input
                    id="display_name"
                    type="text"
                    placeholder="John Doe"
                    required
                    value={formData.display_name}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
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
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </div>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <a href="/login" className="underline underline-offset-4">
                  Login
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}