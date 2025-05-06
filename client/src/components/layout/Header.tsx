import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Bell, Mail, Menu } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Link } from 'wouter';

interface HeaderProps {
  toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
  const { user, logoutMutation } = useAuth();
  
  // Fetch notifications
  const { data: notifications } = useQuery({
    queryKey: ['/api/notifications'],
    queryFn: () => {
      // For demo purposes, we'll return mock data
      return Promise.resolve({
        unreadNotifications: 3,
        unreadMessages: 5
      });
    },
    enabled: !!user // Only run if user is logged in
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Get the dashboard path based on role
  const getDashboardPath = () => {
    if (!user) return "/";
    
    switch (user.role) {
      case "admin": return "/admin";
      case "doctor": return "/doctor";
      case "patient": return "/patient";
      case "pharmacist": return "/pharmacist";
      default: return "/";
    }
  };

  return (
    <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden mr-2" 
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <h1 className="text-xl font-semibold text-gray-800">
          Healthcare System
        </h1>
      </div>
      
      {user && (
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {notifications?.unreadNotifications > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
              >
                {notifications.unreadNotifications}
              </Badge>
            )}
          </Button>
          
          <Button variant="ghost" size="icon" className="relative">
            <Mail className="h-5 w-5" />
            {notifications?.unreadMessages > 0 && (
              <Badge 
                variant="default" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
              >
                {notifications.unreadMessages}
              </Badge>
            )}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center px-2 gap-2">
                <span className="font-medium">{user.fullName}</span>
                <Badge variant="outline" className="ml-1">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={getDashboardPath()}>
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive" 
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </header>
  );
}
