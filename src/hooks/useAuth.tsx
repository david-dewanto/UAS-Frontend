import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from "lucide-react";

interface RequireAuthProps {
  children: ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { user, isLoading, isValidating } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth state
  if (isLoading || isValidating) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    // Preserve the current location and query parameters
    const searchParams = new URLSearchParams(location.search);
    const currentPath = location.pathname;
    const from = currentPath + (searchParams.toString() ? `?${searchParams.toString()}` : '');
    
    // Encode the return URL to handle special characters
    const encodedFrom = encodeURIComponent(from);
    
    // Redirect to login with the return URL
    return <Navigate to={`/login?returnUrl=${encodedFrom}`} replace state={{ from: location }} />;
  }

  // Render children if authenticated
  return <>{children}</>;
}