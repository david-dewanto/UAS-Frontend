import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface RequireAuthProps {
  children: ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { user } = useAuth();
  const location = useLocation();

  // If not authenticated, show message and redirect to login
  if (!user) {
    // Store auth message for unauthorized access
    localStorage.setItem(
      "authMessage",
      JSON.stringify({
        type: "error",
        title: "Authentication Required",
        message: "Please sign in to access this page.",
        timestamp: Date.now()
      })
    );

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