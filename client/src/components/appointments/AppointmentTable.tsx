import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface AppointmentTableProps {
  userId?: number;
  userRole?: string;
  onViewDetails?: (appointment: any) => void;
  onUpdateStatus?: (appointmentId: number, status: string) => void;
}

export default function AppointmentTable({
  userId,
  userRole,
  onViewDetails,
  onUpdateStatus,
}: AppointmentTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTab, setSelectedTab] = useState<string>("all");

  // Fetch appointments with filters
  const { data: appointments, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/appointments', statusFilter, userId, userRole],
    queryFn: async () => {
      // Build query params based on filters
      let url = '/api/appointments?';

      if (statusFilter !== 'all') {
        url += `status=${statusFilter}&`;
      }

      if (userId && userRole) {
        if (userRole === 'doctor') {
          url += `doctorId=${userId}&`;
        } else if (userRole === 'patient') {
          url += `patientId=${userId}&`;
        }
      }

      const response = await apiRequest('GET', url, undefined);
      return await response.json();
    }
  });

  useEffect(() => {
    if (selectedTab !== "all") {
      setStatusFilter(selectedTab);
    } else {
      setStatusFilter("all");
    }
    refetch();
  }, [selectedTab, refetch]);

  // Format date and time for display
  const formatAppointmentDateTime = (date: string, time: string) => {
    try {
      const appointmentDate = new Date(date);
      return `${format(appointmentDate, 'MMM dd, yyyy')} - ${time}`;
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return (
          <div className="flex items-center">
            <div className="status-indicator status-upcoming"></div>
            <Badge variant="outline" className="bg-primary-50 text-primary-700 border-primary-200">
              Upcoming
            </Badge>
          </div>
        );
      case 'completed':
        return (
          <div className="flex items-center">
            <div className="status-indicator status-completed"></div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Completed
            </Badge>
          </div>
        );
      case 'cancelled':
        return (
          <div className="flex items-center">
            <div className="status-indicator status-cancelled"></div>
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              Cancelled
            </Badge>
          </div>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            {status}
          </Badge>
        );
    }
  };

  // Filter appointments based on selected tab
  const getFilteredAppointments = () => {
    if (!appointments) return [];
    
    if (selectedTab === "all") {
      return appointments;
    }
    
    return appointments.filter((appointment: any) => appointment.status === selectedTab);
  };

  const filteredAppointments = getFilteredAppointments();

  // Empty state messages
  const getEmptyStateMessage = () => {
    if (isLoading) return "Loading appointments...";
    if (isError) return "Error loading appointments.";
    
    switch (selectedTab) {
      case 'scheduled':
        return "No upcoming appointments found.";
      case 'completed':
        return "No completed appointments yet.";
      case 'cancelled':
        return "No cancelled appointments recorded.";
      default:
        return "No appointments found.";
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="all" onValueChange={setSelectedTab}>
        <TabsList className="mb-4 border-b border-gray-200 w-full justify-start rounded-none bg-transparent px-0 pb-px">
          <TabsTrigger
            value="all"
            className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-4 rounded-none data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 data-[state=active]:shadow-none border-b-2 font-medium text-sm"
          >
            All Appointments
          </TabsTrigger>
          <TabsTrigger
            value="scheduled"
            className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-4 rounded-none data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 data-[state=active]:shadow-none border-b-2 font-medium text-sm"
          >
            Upcoming
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-4 rounded-none data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 data-[state=active]:shadow-none border-b-2 font-medium text-sm"
          >
            Completed
          </TabsTrigger>
          <TabsTrigger
            value="cancelled"
            className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-4 rounded-none data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 data-[state=active]:shadow-none border-b-2 font-medium text-sm"
          >
            Cancelled
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="p-0 border-none">
          <p className="text-sm text-gray-500 mb-4">
            {filteredAppointments?.length ? `Showing ${filteredAppointments.length} appointments` : getEmptyStateMessage()}
          </p>

          {filteredAppointments?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((appointment: any) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">
                      {appointment.patient?.user?.fullName || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {appointment.doctor?.user?.fullName || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {formatAppointmentDateTime(appointment.appointmentDate, appointment.appointmentTime)}
                    </TableCell>
                    <TableCell>{appointment.reason || 'General Consultation'}</TableCell>
                    <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewDetails && onViewDetails(appointment)}
                          className="h-8 px-2 text-primary-500"
                        >
                          <span className="material-icons text-sm mr-1">visibility</span>
                          View
                        </Button>
                        
                        {userRole === 'doctor' && appointment.status === 'scheduled' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onUpdateStatus && onUpdateStatus(appointment.id, 'completed')}
                            className="h-8 px-2 text-green-600"
                          >
                            <span className="material-icons text-sm mr-1">check_circle</span>
                            Complete
                          </Button>
                        )}
                        
                        {appointment.status === 'scheduled' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onUpdateStatus && onUpdateStatus(appointment.id, 'cancelled')}
                            className="h-8 px-2 text-red-600"
                          >
                            <span className="material-icons text-sm mr-1">cancel</span>
                            Cancel
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <div className="text-gray-500">
                <span className="material-icons text-4xl mb-2">event_busy</span>
                <p>{getEmptyStateMessage()}</p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
