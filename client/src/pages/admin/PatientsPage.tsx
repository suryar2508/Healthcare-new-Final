import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import PatientTable from '@/components/patients/PatientTable';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function PatientsPage() {
  const { toast } = useToast();
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [viewType, setViewType] = useState<string>('details');
  
  // Fetch patients
  const { data: patients, isLoading: patientsLoading } = useQuery({
    queryKey: ['/api/patients'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/patients', undefined);
      return await response.json();
    }
  });
  
  // Fetch patient stats
  const { data: patientStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/patients/stats'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/patients/stats', undefined);
      return await response.json();
    }
  });

  // Fetch specific patient's health metrics when selected
  const { data: healthMetrics, isLoading: metricsLoading, refetch: refetchHealthMetrics } = useQuery({
    queryKey: ['/api/health-metrics', selectedPatient?.id],
    queryFn: async () => {
      if (!selectedPatient) return [];
      try {
        console.log(`Fetching health metrics for patient ${selectedPatient.id}`);
        const response = await apiRequest('GET', `/api/health-metrics?patientId=${selectedPatient.id}`, undefined);
        const data = await response.json();
        console.log(`Retrieved ${data.length} health metrics`);
        return data;
      } catch (error) {
        console.error('Error fetching health metrics:', error);
        return [];
      }
    },
    enabled: !!selectedPatient && viewType === 'health'
  });

  // Fetch specific patient's appointments when selected
  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['/api/appointments', selectedPatient?.id],
    queryFn: async () => {
      if (!selectedPatient) return null;
      const response = await apiRequest('GET', `/api/appointments?patientId=${selectedPatient.id}`, undefined);
      return await response.json();
    },
    enabled: !!selectedPatient && viewType === 'appointments'
  });
  
  // Handle patient selection for details view
  const handleViewDetails = (patient: any) => {
    setSelectedPatient(patient);
    setViewType('details');
  };
  
  // Handle patient selection for medical history view
  const handleViewMedicalHistory = (patient: any) => {
    setSelectedPatient(patient);
    setViewType('health');
  };
  
  // Format appointment data for chart display
  const formatAppointmentData = () => {
    if (!patientStats || !patientStats.appointmentsByStatus) return [];
    
    return [
      { name: 'Scheduled', count: patientStats.appointmentsByStatus.scheduled || 0 },
      { name: 'Completed', count: patientStats.appointmentsByStatus.completed || 0 },
      { name: 'Cancelled', count: patientStats.appointmentsByStatus.cancelled || 0 },
    ];
  };
  
  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return 'N/A';
    
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };
  
  // Format health metric data for display
  const formatHealthMetricData = (metrics: any[]) => {
    if (!metrics || metrics.length === 0) return [];
    
    // Group by metric type
    const groupedMetrics: Record<string, any[]> = {};
    
    metrics.forEach(metric => {
      if (!groupedMetrics[metric.metricType]) {
        groupedMetrics[metric.metricType] = [];
      }
      
      groupedMetrics[metric.metricType].push({
        ...metric,
        date: new Date(metric.recordedAt).toLocaleDateString()
      });
    });
    
    return groupedMetrics;
  };
  
  // Format blood pressure data for chart
  const formatBloodPressureData = (metrics: any[]) => {
    if (!metrics || metrics.length === 0) return [];
    
    return metrics.filter(metric => metric.metricType === 'blood_pressure')
      .map(metric => ({
        date: new Date(metric.recordedAt).toLocaleDateString(),
        systolic: metric.metricValue.systolic,
        diastolic: metric.metricValue.diastolic
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-medium text-gray-900">Patients Management</h1>
      
      {/* Stats Section */}
      {!statsLoading && patientStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Patients</p>
                  <p className="text-3xl font-heading font-medium mt-2">{patientStats.totalPatients || 0}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-500">
                  <span className="material-icons">people</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Appointments</p>
                  <p className="text-3xl font-heading font-medium mt-2">
                    {(patientStats.appointmentsByStatus?.scheduled || 0) + 
                     (patientStats.appointmentsByStatus?.completed || 0) + 
                     (patientStats.appointmentsByStatus?.cancelled || 0)}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-primary-500">
                  <span className="material-icons">event</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Recent Health Metrics</p>
                  <p className="text-3xl font-heading font-medium mt-2">{patientStats.recentHealthMetrics || 0}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                  <span className="material-icons">favorite</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Patients Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PatientTable 
            onViewDetails={handleViewDetails}
            onViewMedicalHistory={handleViewMedicalHistory}
          />
        </div>
        
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Appointment Statistics</CardTitle>
              <CardDescription>Distribution of appointment statuses</CardDescription>
            </CardHeader>
            <CardContent>
              {!statsLoading && patientStats ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart 
                    data={formatAppointmentData()}
                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" name="Appointments" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex justify-center items-center h-[250px]">
                  <p>Loading statistics...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Patient Details Dialog */}
      {selectedPatient && (
        <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Patient Information</span>
                <Badge variant="outline" className="bg-primary-50 text-primary-700">
                  ID: {selectedPatient.id}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue={viewType} onValueChange={setViewType}>
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="details">Patient Details</TabsTrigger>
                <TabsTrigger value="health">Health Data</TabsTrigger>
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="mt-4">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-500">
                    <span className="material-icons text-3xl">person</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium">{selectedPatient.user?.fullName || 'N/A'}</h3>
                    <p className="text-gray-500">
                      {calculateAge(selectedPatient.dateOfBirth)} years old • {selectedPatient.gender || 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p>{selectedPatient.user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p>{selectedPatient.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                    <p>{selectedPatient.dateOfBirth ? new Date(selectedPatient.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Blood Type</p>
                    <p>{selectedPatient.bloodType || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    <p>{selectedPatient.address || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-500">Emergency Contact</p>
                    <p>{selectedPatient.emergencyContact || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-500">Allergies</p>
                    <p>{selectedPatient.allergies || 'None'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-500">Medical History</p>
                    <p>{selectedPatient.medicalHistory || 'No medical history recorded'}</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="health" className="mt-4">
                {metricsLoading ? (
                  <div className="text-center py-10">
                    <p>Loading health data...</p>
                  </div>
                ) : healthMetrics && healthMetrics.length > 0 ? (
                  <div className="space-y-6">
                    {/* Blood Pressure Chart */}
                    {healthMetrics.some((metric: any) => metric.metricType === 'blood_pressure') && (
                      <div>
                        <h4 className="font-medium mb-2">Blood Pressure History</h4>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart
                            data={formatBloodPressureData(healthMetrics)}
                            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="systolic" name="Systolic" fill="hsl(var(--primary))" />
                            <Bar dataKey="diastolic" name="Diastolic" fill="hsl(var(--secondary))" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                    
                    {/* Recent Health Metrics Table */}
                    <div>
                      <h4 className="font-medium mb-2">Recent Health Metrics</h4>
                      <div className="border rounded-md overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {healthMetrics.slice(0, 10).map((metric: any) => (
                              <tr key={metric.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                                  {metric.metricType.replace('_', ' ')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {metric.metricType === 'blood_pressure' 
                                    ? `${metric.metricValue.systolic}/${metric.metricValue.diastolic} mmHg`
                                    : `${metric.metricValue.value} ${metric.metricValue.unit}`
                                  }
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(metric.recordedAt).toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <span className="material-icons text-gray-400 text-4xl mb-2">favorite</span>
                    <p className="text-gray-500">No health data recorded for this patient.</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="appointments" className="mt-4">
                {appointmentsLoading ? (
                  <div className="text-center py-10">
                    <p>Loading appointments...</p>
                  </div>
                ) : appointments && appointments.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {appointments.map((appointment: any) => (
                          <tr key={appointment.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {appointment.doctor?.user?.fullName || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.appointmentTime}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {appointment.reason || 'General consultation'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {appointment.status === 'scheduled' && (
                                <Badge className="bg-primary-50 text-primary-700">Upcoming</Badge>
                              )}
                              {appointment.status === 'completed' && (
                                <Badge className="bg-green-50 text-green-700">Completed</Badge>
                              )}
                              {appointment.status === 'cancelled' && (
                                <Badge className="bg-red-50 text-red-700">Cancelled</Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <span className="material-icons text-gray-400 text-4xl mb-2">event_busy</span>
                    <p className="text-gray-500">No appointments found for this patient.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
