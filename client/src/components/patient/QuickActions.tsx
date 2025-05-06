import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Link } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Bell,
  Calendar,
  Heart,
  Phone,
  Upload,
  MessageSquare,
  Clock,
} from "lucide-react";

export default function QuickActions() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [appointmentRequested, setAppointmentRequested] = useState(false);
  
  // Emergency assistance mutation
  const emergencyMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/emergency-assistance', {
        patientId: user?.id,
        urgency: 'high',
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Emergency request sent',
        description: 'A healthcare professional will contact you shortly.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Request failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Medication reminder mutation
  const reminderMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/medication/set-reminder', {
        patientId: user?.id,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Reminder set',
        description: 'You will receive notifications for your medication schedule.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to set reminder',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Quick appointment request
  const appointmentMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/appointments/quick-request', {
        patientId: user?.id,
      });
      return await res.json();
    },
    onSuccess: () => {
      setAppointmentRequested(true);
      toast({
        title: 'Appointment requested',
        description: 'Your primary doctor will be notified of your request.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Request failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Quick Actions</CardTitle>
        <CardDescription>
          Common tasks and shortcuts for your healthcare needs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {/* Book Appointment */}
          <Link href="/patient/appointments">
            <Button variant="outline" className="h-24 w-full flex flex-col gap-1 items-center justify-center">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">Book Appointment</span>
            </Button>
          </Link>
          
          {/* Upload Prescription */}
          <Link href="/patient/upload-prescription">
            <Button variant="outline" className="h-24 w-full flex flex-col gap-1 items-center justify-center">
              <Upload className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">Upload Prescription</span>
            </Button>
          </Link>
          
          {/* Track Health */}
          <Link href="/patient/health-tracking">
            <Button variant="outline" className="h-24 w-full flex flex-col gap-1 items-center justify-center">
              <Heart className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">Track Health</span>
            </Button>
          </Link>
          
          {/* Medication Reminders */}
          <Button 
            variant="outline" 
            className="h-24 w-full flex flex-col gap-1 items-center justify-center"
            onClick={() => reminderMutation.mutate()}
            disabled={reminderMutation.isPending}
          >
            <Clock className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium">Set Medication Reminder</span>
            {reminderMutation.isPending && (
              <Badge variant="outline" className="text-[10px] px-1 py-0">Setting...</Badge>
            )}
          </Button>
          
          {/* Quick Chat */}
          <Link href="/patient/messages">
            <Button variant="outline" className="h-24 w-full flex flex-col gap-1 items-center justify-center">
              <MessageSquare className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">Message Doctor</span>
            </Button>
          </Link>
          
          {/* Emergency Assistance */}
          <Button 
            variant="outline" 
            className="h-24 w-full flex flex-col gap-1 items-center justify-center bg-red-50 border-red-200 hover:bg-red-100"
            onClick={() => emergencyMutation.mutate()}
            disabled={emergencyMutation.isPending}
          >
            <Phone className="h-5 w-5 text-red-600" />
            <span className="text-xs font-medium text-red-600">Emergency Assistance</span>
            {emergencyMutation.isPending && (
              <Badge variant="outline" className="text-[10px] px-1 py-0 border-red-200">Processing...</Badge>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}