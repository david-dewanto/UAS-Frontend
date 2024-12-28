import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { X, Info, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { authService } from "@/lib/auth"

export function ForgotPasswordModal() {
  // Form state
  const [email, setEmail] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Alert state for feedback
  const [alert, setAlert] = useState<{
    show: boolean;
    type: "error" | "success";
    title: string;
    message: string;
  } | null>(null)
  const [isAlertVisible, setIsAlertVisible] = useState(false)

  // Handle alert visibility and auto-dismiss
  useEffect(() => {
    if (alert?.show) {
      requestAnimationFrame(() => {
        setIsAlertVisible(true)
      })

      const timer = setTimeout(() => {
        setIsAlertVisible(false)
        setTimeout(() => {
          setAlert(null)
        }, 300)
      }, 5000) // Show for 5 seconds for reset password feedback

      return () => clearTimeout(timer)
    }
  }, [alert])

  // Validate email before submission
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Validate email
    if (!validateEmail(email)) {
      setAlert({
        show: true,
        type: "error",
        title: "Invalid Email",
        message: "Please enter a valid email address",
      })
      return
    }

    setIsSubmitting(true)
    setAlert(null)
    
    try {
      const response = await authService.resetPassword(email)
      
      setAlert({
        show: true,
        type: "success",
        title: "Email Sent",
        message: response.message || "Password reset instructions have been sent to your email",
      })

      // Clear the form and close modal after success
      setEmail("")
      // Keep the modal open for a moment so user can see success message
      setTimeout(() => {
        setIsOpen(false)
      }, 2000)
    } catch (error) {
      setAlert({
        show: true,
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to send reset email",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset state when modal closes
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setEmail("")
      setAlert(null)
      setIsAlertVisible(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="link"
          className="ml-auto text-sm px-0 font-normal"
        >
          Forgot your password?
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset your password</DialogTitle>
          <DialogDescription>
            Enter your email address and we'll send you instructions to reset your password.
          </DialogDescription>
        </DialogHeader>
        {alert && (
          <Alert
            variant={alert.type === "error" ? "destructive" : "default"}
            className={cn(
              "w-full shadow-lg",
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
                  setIsAlertVisible(false)
                  setTimeout(() => setAlert(null), 300)
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">Email address</Label>
            <Input
              id="reset-email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
              className="w-full"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Reset Instructions"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}