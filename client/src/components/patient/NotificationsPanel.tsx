import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Bell, Clock, FileText, Calendar, Heart, AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
}

export default function NotificationsPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [notificationCount, setNotificationCount] = useState(0);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  
  // Query to get notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['/api/notifications'],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await apiRequest('GET', '/api/notifications');
      return await res.json();
    },
    enabled: !!user?.id,
    onSuccess: (data) => {
      if (Array.isArray(data)) {
        const unreadCount = data.filter((notification: Notification) => !notification.isRead).length;
        setNotificationCount(unreadCount);
      }
    }
  });
  
  // Mutation to mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('POST', `/api/notifications/${id}/read`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to mark notification as read',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Mutation to mark all notifications as read
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/notifications/read-all');
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: 'Notifications cleared',
        description: 'All notifications have been marked as read',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to mark all as read',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Setup WebSocket connection for real-time notifications
  useEffect(() => {
    if (!user?.id) return;
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const newSocket = new WebSocket(wsUrl);
    
    newSocket.onopen = () => {
      console.log('WebSocket connected');
      // Authenticate the WebSocket connection
      newSocket.send(JSON.stringify({
        type: 'auth',
        userId: user.id,
      }));
    };
    
    newSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'notification') {
          // Update notifications in cache
          queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
          
          // Show toast for new notification
          toast({
            title: data.title,
            description: data.message,
          });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    newSocket.onclose = () => {
      console.log('WebSocket disconnected');
    };
    
    setSocket(newSocket);
    
    return () => {
      if (newSocket.readyState === WebSocket.OPEN || newSocket.readyState === WebSocket.CONNECTING) {
        newSocket.close();
      }
    };
  }, [user?.id, queryClient, toast]);
  
  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'medication_reminder':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'prescription':
      case 'prescription_processing':
      case 'prescription_available':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'appointment':
      case 'appointment_reminder':
        return <Calendar className="h-4 w-4 text-purple-500" />;
      case 'health_alert':
      case 'high_blood_pressure':
      case 'low_blood_sugar':
        return <Heart className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-primary text-white"
            >
              {notificationCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex justify-between items-center">
            <span>Notifications</span>
            {notificationCount > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
              >
                {markAllReadMutation.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : "Mark all as read"}
              </Button>
            )}
          </SheetTitle>
          <SheetDescription>
            Stay updated with your healthcare notifications
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-180px)] mt-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications && notifications.length > 0 ? (
            <div className="space-y-4 pr-2">
              {notifications.map((notification: Notification) => (
                <div 
                  key={notification.id}
                  className={`border rounded-lg p-4 ${!notification.isRead ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{notification.title}</div>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    {!notification.isRead && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={() => markAsReadMutation.mutate(notification.id)}
                        disabled={markAsReadMutation.isPending}
                      >
                        <div className="bg-primary rounded-full h-2 w-2" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No notifications to display</p>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}