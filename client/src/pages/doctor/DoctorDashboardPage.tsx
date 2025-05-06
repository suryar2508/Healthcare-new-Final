import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PrescriptionForm from '@/components/doctors/PrescriptionForm';

export default function DoctorDashboardPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  
  // Mock doctor ID for testing - in a real app, this would come from auth context
  const doctorId = 1;

  // Fetch doctor stats
  const { data: doctorStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/doctors/stats'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/doctors/stats', undefined);
      return await response.json();
    }
  });
  
  // Fetch today's appointments
  const { data: todayAppointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['/api/appointments', { doctorId, date: new Date().toISOString().split('T')[0] }],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const response = await apiRequest('GET', `/api/appointments?doctorId=${doctorId}&from=${today}&to=${today}`, undefined);
      return await response.json();
    }
  });
  
  // Fetch notifications and alerts
  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['/api/notifications'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/notifications', undefined);
      return await response.json();
    }
  });
  
  // Handle appointment status update
  const appointmentStatusMutation = useMutation({
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
    },
    onError: (error) => {
      toast({
        title: "Error updating appointment",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  });
  
  // Handle notification read status update
  const notificationReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('PATCH', `/api/notifications/${id}/read`, {});
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    }
  });
  
  const getAlertStatusClass = (type: string) => {
    if (type.includes('error') || type.includes('high_') || type.includes('critical')) {
      return 'bg-red-50 border-l-4 border-error';
    }
    if (type.includes('warning') || type.includes('drug_interaction') || type.includes('abnormal')) {
      return 'bg-amber-50 border-l-4 border-amber-500';
    }
    return 'bg-blue-50 border-l-4 border-primary-500';
  };
  
  const getAlertIcon = (type: string) => {
    if (type.includes('error') || type.includes('high_') || type.includes('critical')) {
      return 'error';
    }
    if (type.includes('warning') || type.includes('drug_interaction') || type.includes('abnormal')) {
      return 'warning';
    }
    if (type.includes('blood_pressure') || type.includes('heart_rate') || type.includes('vital')) {
      return 'favorite';
    }
    if (type.includes('lab')) {
      return 'science';
    }
    return 'info';
  };
  
  const getAlertTitle = (type: string) => {
    if (type.includes('blood_pressure')) {
      return 'Abnormal Blood Pressure';
    }
    if (type.includes('heart_rate')) {
      return 'Abnormal Heart Rate';
    }
    if (type.includes('glucose')) {
      return 'Abnormal Blood Glucose';
    }
    if (type.includes('drug_interaction')) {
      return 'Drug Interaction Warning';
    }
    if (type.includes('lab')) {
      return 'Lab Results Available';
    }
    if (type.includes('vital')) {
      return 'Abnormal Vital Signs';
    }
    return 'Medical Alert';
  };
  
  // Handle appointment action
  const handleAppointmentAction = (action: string, appointment: any) => {
    if (action === 'view') {
      setSelectedPatient(appointment.patient);
    } else if (action === 'start') {
      // In a real app, this would start a consultation
      toast({
        title: "Consultation Started",
        description: `Started consultation with ${appointment.patient?.user?.fullName}`,
        variant: "default",
      });
    } else if (action === 'complete') {
      appointmentStatusMutation.mutate({ id: appointment.id, status: 'completed' });
    }
  };
  
  // Handle alert action
  const handleAlertAction = (action: string, alert: any) => {
    if (action === 'view') {
      setSelectedAlert(alert);
      notificationReadMutation.mutate(alert.id);
    }
  };

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-medium text-gray-900">Doctor Dashboard</h1>
        <p className="text-gray-600">Welcome back, Dr. Sarah. Here's your practice overview.</p>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Appointments Today</p>
                <p className="text-3xl font-heading font-medium mt-2">
                  {statsLoading ? '...' : (todayAppointments?.length || 0)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-primary-500">
                <span className="material-icons">event</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              <span className={!appointmentsLoading && todayAppointments?.length > 0 ? 'text-success font-medium' : ''}>
                {!appointmentsLoading && todayAppointments?.length > 0 ? '+' + todayAppointments.length + ' new' : 'No new'} since yesterday
              </span>
            </p>
          </CardContent>
        </Card>
        
        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Patients</p>
                <p className="text-3xl font-heading font-medium mt-2">
                  {statsLoading ? '...' : (doctorStats?.totalPatients || 0)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-secondary-400">
                <span className="material-icons">people</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              <span className="text-success font-medium">+7 new</span> this week
            </p>
          </CardContent>
        </Card>
        
        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Prescriptions</p>
                <p className="text-3xl font-heading font-medium mt-2">
                  {statsLoading ? '...' : (doctorStats?.recentPrescriptions || 0)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-accent">
                <span className="material-icons">receipt</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              <span className="text-success font-medium">+12</span> this week
            </p>
          </CardContent>
        </Card>
        
        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Urgent Alerts</p>
                <p className="text-3xl font-heading font-medium mt-2 text-error">
                  {alertsLoading ? '...' : (alerts?.filter((alert: any) => 
                    !alert.isRead && (alert.type.includes('high_') || alert.type.includes('critical')))?.length || 0)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-error">
                <span className="material-icons">priority_high</span>
              </div>
            </div>
            <p className="text-xs text-error mt-4">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="w-full border-b border-gray-200 flex justify-start rounded-none bg-transparent px-0 pb-px">
          <TabsTrigger 
            value="overview" 
            className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-4 rounded-none data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 data-[state=active]:shadow-none border-b-2 font-medium text-sm"
          >
            Dashboard Overview
          </TabsTrigger>
          <TabsTrigger 
            value="prescriptions" 
            className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-4 rounded-none data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 data-[state=active]:shadow-none border-b-2 font-medium text-sm"
          >
            Write Prescription
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Today's Appointments */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle>Today's Appointments</CardTitle>
                    <CardDescription>Patients scheduled for today</CardDescription>
                  </div>
                  <Button variant="link" className="text-primary-500 text-sm font-medium flex items-center">
                    View All <span className="material-icons ml-1 text-sm">arrow_forward</span>
                  </Button>
                </CardHeader>
                <CardContent>
                  {appointmentsLoading ? (
                    <div className="text-center py-10">
                      <p>Loading appointments...</p>
                    </div>
                  ) : todayAppointments && todayAppointments.length > 0 ? (
                    <div className="space-y-6">
                      {todayAppointments.map((appointment: any) => (
                        <div key={appointment.id} className="flex items-center p-4 rounded-lg hover:bg-gray-50">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-500">
                              <span className="material-icons">person</span>
                            </div>
                          </div>
                          <div className="ml-4 flex-1">
                            <div className="flex justify-between">
                              <p className="font-medium">{appointment.patient?.user?.fullName || 'Patient'}</p>
                              <span className="text-sm text-gray-500">{appointment.appointmentTime}</span>
                            </div>
                            <p className="text-sm text-gray-500">{appointment.reason || 'Consultation'}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="text-primary-500 hover:bg-primary-50 rounded-full" 
                              onClick={() => handleAppointmentAction('view', appointment)}
                              title="View Patient Details"
                            >
                              <span className="material-icons">visibility</span>
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="text-secondary-400 hover:bg-secondary-50 rounded-full" 
                              onClick={() => handleAppointmentAction('start', appointment)}
                              title="Start Consultation"
                            >
                              <span className="material-icons">video_call</span>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <span className="material-icons text-gray-400 text-4xl mb-2">event_busy</span>
                      <p className="text-gray-500">No appointments scheduled for today.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Alerts & Notifications */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Medical Alerts</CardTitle>
                </CardHeader>
                
                <CardContent>
                  {alertsLoading ? (
                    <div className="text-center py-10">
                      <p>Loading alerts...</p>
                    </div>
                  ) : alerts && alerts.filter((alert: any) => !alert.isRead).length > 0 ? (
                    <div className="space-y-4">
                      {alerts
                        .filter((alert: any) => !alert.isRead)
                        .slice(0, 5)
                        .map((alert: any) => (
                          <div 
                            key={alert.id} 
                            className={`p-4 ${getAlertStatusClass(alert.type)} rounded`}
                          >
                            <div className="flex">
                              <div className="flex-shrink-0">
                                <span className={`material-icons ${
                                  alert.type.includes('error') || alert.type.includes('high_') || alert.type.includes('critical') 
                                    ? 'text-error' 
                                    : alert.type.includes('warning') || alert.type.includes('drug') 
                                      ? 'text-amber-500' 
                                      : 'text-primary-500'
                                }`}>
                                  {getAlertIcon(alert.type)}
                                </span>
                              </div>
                              <div className="ml-3">
                                <h3 className={`text-sm font-medium ${
                                  alert.type.includes('error') || alert.type.includes('high_') || alert.type.includes('critical') 
                                    ? 'text-error' 
                                    : alert.type.includes('warning') || alert.type.includes('drug') 
                                      ? 'text-amber-700' 
                                      : 'text-primary-700'
                                }`}>
                                  {getAlertTitle(alert.type)}
                                </h3>
                                <div className="mt-1 text-sm text-gray-700">
                                  <p>{alert.message}</p>
                                </div>
                                <div className="mt-2">
                                  <button 
                                    className={`text-xs font-medium flex items-center ${
                                      alert.type.includes('error') || alert.type.includes('high_') || alert.type.includes('critical') 
                                        ? 'text-error' 
                                        : alert.type.includes('warning') || alert.type.includes('drug') 
                                          ? 'text-amber-700' 
                                          : 'text-primary-700'
                                    }`}
                                    onClick={() => handleAlertAction('view', alert)}
                                  >
                                    View details <span className="material-icons ml-1 text-xs">arrow_forward</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <span className="material-icons text-gray-400 text-4xl mb-2">notifications</span>
                      <p className="text-gray-500">No unread alerts at this time.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="prescriptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Write Prescription</CardTitle>
              <CardDescription>Create a new prescription for a patient</CardDescription>
            </CardHeader>
            <CardContent>
              <PrescriptionForm doctorId={doctorId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
