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
                  <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : healthMetrics && healthMetrics.length > 0 ? (
                  <div className="space-y-6">
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-lg">Health Metrics Summary</h4>
                        <div className="text-xs text-gray-500">
                          {healthMetrics.length} records found
                        </div>
                      </div>
                      
                      {/* Metrics Summary Cards */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {/* Blood Pressure Card */}
                        {healthMetrics.some((metric: any) => metric.metricType === 'blood_pressure') && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="text-xs text-blue-700 font-medium mb-1">Blood Pressure</div>
                            {(() => {
                              const latestBP = healthMetrics
                                .filter((m: any) => m.metricType === 'blood_pressure')
                                .sort((a: any, b: any) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())[0];
                              
                              return (
                                <div className="flex flex-col">
                                  <div className="text-xl font-medium">
                                    {latestBP?.metricValue?.systolic}/{latestBP?.metricValue?.diastolic}
                                    <span className="text-xs ml-1">mmHg</span>
                                  </div>
                                  <div className="text-xs text-gray-600 mt-1">
                                    {new Date(latestBP?.recordedAt).toLocaleDateString()}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}

                        {/* Heart Rate Card */}
                        {healthMetrics.some((metric: any) => metric.metricType === 'heart_rate') && (
                          <div className="bg-red-50 p-3 rounded-lg">
                            <div className="text-xs text-red-700 font-medium mb-1">Heart Rate</div>
                            {(() => {
                              const latestHR = healthMetrics
                                .filter((m: any) => m.metricType === 'heart_rate')
                                .sort((a: any, b: any) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())[0];
                              
                              return (
                                <div className="flex flex-col">
                                  <div className="text-xl font-medium">
                                    {latestHR?.metricValue?.value}
                                    <span className="text-xs ml-1">BPM</span>
                                  </div>
                                  <div className="text-xs text-gray-600 mt-1">
                                    {new Date(latestHR?.recordedAt).toLocaleDateString()}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}

                        {/* Glucose Card */}
                        {healthMetrics.some((metric: any) => metric.metricType === 'glucose') && (
                          <div className="bg-purple-50 p-3 rounded-lg">
                            <div className="text-xs text-purple-700 font-medium mb-1">Blood Glucose</div>
                            {(() => {
                              const latestGL = healthMetrics
                                .filter((m: any) => m.metricType === 'glucose')
                                .sort((a: any, b: any) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())[0];
                              
                              return (
                                <div className="flex flex-col">
                                  <div className="text-xl font-medium">
                                    {latestGL?.metricValue?.value}
                                    <span className="text-xs ml-1">mg/dL</span>
                                  </div>
                                  <div className="text-xs text-gray-600 mt-1">
                                    {new Date(latestGL?.recordedAt).toLocaleDateString()}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}

                        {/* Weight Card */}
                        {healthMetrics.some((metric: any) => metric.metricType === 'weight') && (
                          <div className="bg-green-50 p-3 rounded-lg">
                            <div className="text-xs text-green-700 font-medium mb-1">Weight</div>
                            {(() => {
                              const latestWT = healthMetrics
                                .filter((m: any) => m.metricType === 'weight')
                                .sort((a: any, b: any) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())[0];
                              
                              return (
                                <div className="flex flex-col">
                                  <div className="text-xl font-medium">
                                    {latestWT?.metricValue?.value}
                                    <span className="text-xs ml-1">kg</span>
                                  </div>
                                  <div className="text-xs text-gray-600 mt-1">
                                    {new Date(latestWT?.recordedAt).toLocaleDateString()}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Blood Pressure Chart */}
                    {healthMetrics.some((metric: any) => metric.metricType === 'blood_pressure') && (
                      <div className="bg-white p-4 rounded-lg border">
                        <h4 className="font-medium mb-4">Blood Pressure Trends</h4>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart
                            data={formatBloodPressureData(healthMetrics)}
                            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis domain={['dataMin - 10', 'dataMax + 10']} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="systolic" name="Systolic" fill="#8884d8" />
                            <Bar dataKey="diastolic" name="Diastolic" fill="#82ca9d" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                    
                    {/* Recent Health Metrics Table */}
                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-medium mb-4">Health Metrics Timeline</h4>
                      <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                        {healthMetrics
                          .sort((a: any, b: any) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
                          .map((metric: any, index: number) => {
                            let metricDisplay = '';
                            let metricIcon = '';
                            let bgColor = '';
                            
                            switch(metric.metricType) {
                              case 'blood_pressure':
                                metricDisplay = `Blood Pressure: ${metric.metricValue.systolic}/${metric.metricValue.diastolic} mmHg`;
                                metricIcon = 'favorite';
                                bgColor = 'bg-blue-100';
                                break;
                              case 'heart_rate':
                                metricDisplay = `Heart Rate: ${metric.metricValue.value} ${metric.metricValue.unit}`;
                                metricIcon = 'monitor_heart';
                                bgColor = 'bg-red-100';
                                break;
                              case 'glucose':
                                metricDisplay = `Blood Glucose: ${metric.metricValue.value} ${metric.metricValue.unit}`;
                                metricIcon = 'water_drop';
                                bgColor = 'bg-purple-100';
                                break;
                              case 'weight':
                                metricDisplay = `Weight: ${metric.metricValue.value} ${metric.metricValue.unit}`;
                                metricIcon = 'monitor_weight';
                                bgColor = 'bg-green-100';
                                break;
                              default:
                                metricDisplay = `${metric.metricType}: ${JSON.stringify(metric.metricValue)}`;
                                metricIcon = 'data_object';
                                bgColor = 'bg-gray-100';
                            }
                            
                            return (
                              <div key={index} className="flex items-start space-x-3">
                                <div className={`${bgColor} rounded-full p-2 mt-1`}>
                                  <span className="material-icons text-sm">{metricIcon}</span>
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between">
                                    <p className="text-sm font-medium">{metricDisplay}</p>
                                    <p className="text-xs text-gray-500">
                                      {new Date(metric.recordedAt).toLocaleDateString()} {new Date(metric.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                  {metric.notes && (
                                    <p className="text-xs text-gray-600 mt-1">{metric.notes}</p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-lg border">
                    <div className="inline-flex p-4 rounded-full bg-gray-100 mb-4">
                      <span className="material-icons text-gray-400 text-xl">monitor_heart</span>
                    </div>
                    <p className="text-gray-700">No health metrics available for this patient.</p>
                    <p className="text-xs text-gray-500 mt-2">Health data will appear here once recorded.</p>
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
