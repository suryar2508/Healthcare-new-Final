import { useAuth } from "@/hooks/use-auth";
import { Loader2, ShieldAlert, ArrowLeftCircle } from "lucide-react";
import { Redirect, Route, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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
      
      // Determine the correct redirect path based on user role
      const redirectPath = (() => {
        switch (user.role) {
          case "admin": return "/admin";
          case "doctor": return "/doctor";
          case "patient": return "/patient";
          case "pharmacist": return "/pharmacist";
          default: return "/";
        }
      })();
      
      return (
        <Route path={path}>
          {() => (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
              <Card className="max-w-md w-full shadow-lg">
                <CardHeader className="border-b pb-3">
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="h-8 w-8 text-destructive" />
                    <CardTitle className="text-xl text-destructive">Access Denied</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 pb-4">
                  <div className="space-y-4">
                    <p className="text-gray-700 dark:text-gray-300">
                      You don't have permission to access this page.
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Your current role is <strong>{user.role}</strong>, but this page requires one of these roles: <strong>{allowedRoles.join(', ')}</strong>.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center border-t pt-4">
                  <Button 
                    variant="default"
                    onClick={() => {
                      window.location.href = redirectPath;
                    }}
                    className="gap-2"
                  >
                    <ArrowLeftCircle className="h-4 w-4" />
                    Return to {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard
                  </Button>
                </CardFooter>
              </Card>
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