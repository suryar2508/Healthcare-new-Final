import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

type ProtectedRouteProps = {
  path: string;
  component: React.ComponentType;
  allowedRoles?: string[];
};

export function ProtectedRoute({
  path,
  component: Component,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  // Debug logging to identify authentication issues
  console.log(`Protected route check for path: ${path}`);
  console.log(`User authenticated: ${!!user}`);
  if (user) {
    console.log(`User role: ${user.role}`);
    console.log(`Allowed roles: ${allowedRoles ? allowedRoles.join(', ') : 'all'}`);
  }

  if (isLoading) {
    return (
      <Route path={path}>
        {() => (
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </Route>
    );
  }

  if (!user) {
    console.log('No user found, redirecting to auth page');
    return (
      <Route path={path}>
        {() => <Redirect to="/auth" />}
      </Route>
    );
  }

  // Check if user has the required role - with better fallback
  if (allowedRoles && allowedRoles.length > 0) {
    if (!user.role || !allowedRoles.includes(user.role)) {
      console.log(`Access denied - user role ${user.role} not in allowed roles: ${allowedRoles.join(', ')}`);
      return (
        <Route path={path}>
          {() => (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
              <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
              <p className="text-muted-foreground">
                You don't have permission to access this page.
              </p>
              <div className="mt-4">
                <a 
                  href="/" 
                  className="text-sm text-primary hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = '/';
                  }}
                >
                  Return to Home
                </a>
              </div>
            </div>
          )}
        </Route>
      );
    }
  }

  console.log(`Rendering component for path: ${path}`);
  return (
    <Route path={path}>
      {(params) => <Component {...params} />}
    </Route>
  );
}