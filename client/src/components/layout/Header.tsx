import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Bell, Mail, Menu, LogOut } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

interface HeaderProps {
  toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
  const { user, logoutMutation } = useAuth();

  // Fetch notifications - retained from original code
  const { data: notifications } = useQuery({
    queryKey: ['/api/notifications'],
    queryFn: () => {
      // For demo purposes, we'll return mock data.  Ideally, fetch from API.
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
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleLogout}
            className="flex items-center gap-2"
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4" />
            {logoutMutation.isPending ? "Logging out..." : "Logout"}
          </Button>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {notifications?.unreadNotifications > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
              >
                {notifications?.unreadNotifications}
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
                {notifications?.unreadMessages}
              </Badge>
            )}
          </Button>

          <div className="flex items-center ml-4">
            <span className="font-medium mr-2">{user.fullName}</span>
            <Badge variant="outline" className="capitalize">
              {user.role}
            </Badge>
          </div>
        </div>
      )}
    </header>
  );
}