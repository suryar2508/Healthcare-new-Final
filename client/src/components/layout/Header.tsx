import { useQuery } from '@tanstack/react-query';

interface HeaderProps {
  toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
  // Fetch notifications
  const { data: notifications } = useQuery({
    queryKey: ['/api/notifications'],
    queryFn: () => {
      // For demo purposes, we'll return mock data
      return Promise.resolve({
        unreadNotifications: 3,
        unreadMessages: 5
      });
    }
  });

  return (
    <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6">
      <button className="md:hidden text-gray-500" onClick={toggleSidebar}>
        <span className="material-icons">menu</span>
      </button>
      
      <div className="flex items-center space-x-4">
        <button className="relative text-gray-500 hover:text-gray-700">
          <span className="material-icons">notifications</span>
          {notifications?.unreadNotifications > 0 && (
            <span className="badge absolute -top-1 -right-1 bg-destructive text-white">
              {notifications.unreadNotifications}
            </span>
          )}
        </button>
        
        <button className="relative text-gray-500 hover:text-gray-700">
          <span className="material-icons">mail</span>
          {notifications?.unreadMessages > 0 && (
            <span className="badge absolute -top-1 -right-1 bg-primary text-white">
              {notifications.unreadMessages}
            </span>
          )}
        </button>
        
        <div className="border-l pl-4 ml-2">
          <button className="flex items-center text-sm text-gray-700">
            <span className="font-medium mr-1">Dr. Sarah Johnson</span>
            <span className="material-icons text-sm">arrow_drop_down</span>
          </button>
        </div>
      </div>
    </header>
  );
}
