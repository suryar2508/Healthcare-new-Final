import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Home, LogOut, User, Settings, ChevronDown } from "lucide-react";
import { Link } from "wouter";

export function GlobalNav() {
  const { user, logoutMutation } = useAuth();

  if (!user) return null;

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Get the dashboard path based on role
  const getDashboardPath = () => {
    switch (user.role) {
      case "admin": return "/admin";
      case "doctor": return "/doctor";
      case "patient": return "/patient";
      case "pharmacist": return "/pharmacist";
      default: return "/";
    }
  };

  return (
    <div className="fixed top-0 right-0 p-4 z-50 flex gap-2">
      <Button 
        variant="outline"
        size="sm"
        asChild
      >
        <Link href={getDashboardPath()}>
          <Home className="h-4 w-4 mr-2" />
          Dashboard
        </Link>
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="sm" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {user.fullName}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={getDashboardPath()}>
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-destructive focus:text-destructive" 
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {logoutMutation.isPending ? "Logging out..." : "Logout"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}