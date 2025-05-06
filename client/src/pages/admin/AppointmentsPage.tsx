import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppointmentTable from '@/components/appointments/AppointmentTable';
import AppointmentCalendar from '@/components/appointments/AppointmentCalendar';

export default function AppointmentsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [viewType, setViewType] = useState<string>('table');
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  
  // Fetch all appointments
  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['/api/appointments'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/appointments', undefined);
      return await response.json();
    }
  });
  
  // Update appointment status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest('PATCH', `/api/appointments/${id}/status`, { status });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Appointment updated",
        description: "The appointment status has been updated successfully",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      setSelectedAppointment(null);
    },
    onError: (error) => {
      toast({
        title: "Error updating appointment",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  });
  
  // Handle appointment status update
  const handleUpdateStatus = (appointmentId: number, status: string) => {
    updateStatusMutation.mutate({ id: appointmentId, status });
  };
  
  // Handle appointment selection for details view
  const handleViewDetails = (appointment: any) => {
    setSelectedAppointment(appointment);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-medium text-gray-900">Appointments Management</h1>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Appointments</CardTitle>
          <div className="flex space-x-2">
            <Tabs value={viewType} onValueChange={setViewType} className="w-[400px]">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="table" className="flex items-center">
                  <span className="material-icons mr-2 text-sm">view_list</span>
                  List View
                </TabsTrigger>
                <TabsTrigger value="calendar" className="flex items-center">
                  <span className="material-icons mr-2 text-sm">calendar_month</span>
                  Calendar View
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        
        <CardContent>
          <TabsContent value="table" className="mt-0">
            <AppointmentTable 
              onViewDetails={handleViewDetails} 
              onUpdateStatus={handleUpdateStatus}
            />
          </TabsContent>
          
          <TabsContent value="calendar" className="mt-0">
            {appointmentsLoading ? (
              <div className="text-center py-10">
                <p>Loading appointment calendar...</p>
              </div>
            ) : (
              <AppointmentCalendar 
                appointments={appointments || []} 
                onAppointmentSelect={handleViewDetails}
              />
            )}
          </TabsContent>
        </CardContent>
      </Card>
      
      {/* Appointment Details Dialog */}
      {selectedAppointment && (
        <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Appointment Details</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-500">
                  <span className="material-icons text-xl">event</span>
                </div>
                <div>
                  <h3 className="text-xl font-medium">{formatDate(selectedAppointment.appointmentDate)}</h3>
                  <p className="text-gray-500">{selectedAppointment.appointmentTime}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Patient</p>
                  <p>{selectedAppointment.patient?.user?.fullName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Doctor</p>
                  <p>{selectedAppointment.doctor?.user?.fullName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="capitalize">{selectedAppointment.status}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Reason</p>
                  <p>{selectedAppointment.reason || 'General consultation'}</p>
                </div>
                {selectedAppointment.notes && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-500">Notes</p>
                    <p className="text-sm mt-1 p-2 bg-gray-50 rounded-md">{selectedAppointment.notes}</p>
                  </div>
                )}
              </div>
              
              {selectedAppointment.status === 'scheduled' && (
                <div className="flex space-x-2 justify-end pt-4 border-t">
                  <Button
                    variant="outline"
                    className="border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                    onClick={() => handleUpdateStatus(selectedAppointment.id, 'completed')}
                    disabled={updateStatusMutation.isPending}
                  >
                    <span className="material-icons mr-2 text-sm">check_circle</span>
                    Mark as Completed
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                    onClick={() => handleUpdateStatus(selectedAppointment.id, 'cancelled')}
                    disabled={updateStatusMutation.isPending}
                  >
                    <span className="material-icons mr-2 text-sm">cancel</span>
                    Cancel Appointment
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
