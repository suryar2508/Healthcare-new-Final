import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MedicationSchedule from '@/components/patients/MedicationSchedule';
import BookAppointmentDialog from '@/components/appointments/BookAppointmentDialog';
import HealthTrackingForm from '@/components/patients/HealthTrackingForm';
import AppointmentTable from '@/components/appointments/AppointmentTable';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export default function PatientDashboardPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState('overview');
  
  // Mock patient ID for testing - in a real app, this would come from auth context
  const patientId = 1;

  // Fetch patient information
  const { data: patient, isLoading: patientLoading } = useQuery({
    queryKey: ['/api/patients', patientId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/patients/${patientId}`, undefined);
      return await response.json();
    }
  });
  
  // Fetch health metrics
  const { data: healthMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/health-metrics', patientId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/health-metrics?patientId=${patientId}`, undefined);
      return await response.json();
    }
  });
  
  // Process health metrics for display
  const getLatestMetric = (metricType: string) => {
    if (!healthMetrics || healthMetrics.length === 0) return null;
    
    const metrics = healthMetrics.filter((metric: any) => metric.metricType === metricType);
    if (metrics.length === 0) return null;
    
    return metrics.sort((a: any, b: any) => 
      new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
    )[0];
  };
  
  // Format blood pressure data for chart
  const formatBloodPressureData = () => {
    if (!healthMetrics) return [];
    
    return healthMetrics
      .filter((metric: any) => metric.metricType === 'blood_pressure')
      .slice(0, 7)
      .map((metric: any) => ({
        date: new Date(metric.recordedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        systolic: metric.metricValue.systolic,
        diastolic: metric.metricValue.diastolic
      }))
      .reverse();
  };
  
  // Format glucose data for chart
  const formatGlucoseData = () => {
    if (!healthMetrics) return [];
    
    return healthMetrics
      .filter((metric: any) => metric.metricType === 'glucose')
      .slice(0, 7)
      .map((metric: any) => ({
        date: new Date(metric.recordedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: metric.metricValue.value
      }))
      .reverse();
  };
  
  // Get status color for metric
  const getMetricStatusColor = (metricType: string, value: any) => {
    switch (metricType) {
      case 'blood_pressure':
        const systolic = value.systolic;
        const diastolic = value.diastolic;
        
        if (systolic > 140 || diastolic > 90) return 'text-error font-medium';
        if (systolic < 90 || diastolic < 60) return 'text-warning font-medium';
        return 'text-success font-medium';
        
      case 'glucose':
        if (value.value > 140) return 'text-warning font-medium';
        if (value.value < 70) return 'text-warning font-medium';
        return 'text-success font-medium';
        
      case 'heart_rate':
        if (value.value > 100) return 'text-warning font-medium';
        if (value.value < 60) return 'text-warning font-medium';
        return 'text-success font-medium';
        
      case 'weight':
        // This would need more context to determine status
        return 'text-gray-500';
        
      default:
        return 'text-gray-500';
    }
  };
  
  // Get status message for metric
  const getMetricStatusMessage = (metricType: string, value: any) => {
    switch (metricType) {
      case 'blood_pressure':
        const systolic = value.systolic;
        const diastolic = value.diastolic;
        
        if (systolic > 140 || diastolic > 90) return 'Elevated';
        if (systolic < 90 || diastolic < 60) return 'Below normal';
        return 'Normal range';
        
      case 'glucose':
        if (value.value > 140) return 'Slightly elevated';
        if (value.value < 70) return 'Below normal';
        return 'Normal range';
        
      case 'heart_rate':
        if (value.value > 100) return 'Elevated';
        if (value.value < 60) return 'Below normal';
        return 'Normal range';
        
      case 'weight':
        // For weight, we'd need to check against baseline or BMI
        return '';
        
      default:
        return '';
    }
  };

  // Handle appointment booking success
  const handleAppointmentBooked = () => {
    toast({
      title: "Appointment booked successfully",
      description: "A reminder will be sent before your visit.",
      variant: "default",
    });
    queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
  };
  
  // Handle health tracking success
  const handleHealthDataAdded = () => {
    toast({
      title: "Health data recorded successfully",
      description: "Your health data has been saved and displayed on your dashboard.",
      variant: "default",
    });
    queryClient.invalidateQueries({ queryKey: ['/api/health-metrics'] });
  };

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-medium text-gray-900">Patient Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {patient?.user?.fullName?.split(' ')[0] || 'John'}. Track your health journey here.
        </p>
      </div>
      
      {/* Health Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Blood Pressure</p>
                <p className="text-3xl font-heading font-medium mt-2">
                  {metricsLoading ? '...' : (
                    getLatestMetric('blood_pressure') 
                      ? `${getLatestMetric('blood_pressure').metricValue.systolic}/${getLatestMetric('blood_pressure').metricValue.diastolic}` 
                      : 'N/A'
                  )}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-primary-500">
                <span className="material-icons">favorite</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              {!metricsLoading && getLatestMetric('blood_pressure') && (
                <span className={getMetricStatusColor('blood_pressure', getLatestMetric('blood_pressure').metricValue)}>
                  {getMetricStatusMessage('blood_pressure', getLatestMetric('blood_pressure').metricValue)}
                </span>
              )} as of {!metricsLoading && getLatestMetric('blood_pressure') 
                ? new Date(getLatestMetric('blood_pressure').recordedAt).toLocaleDateString() 
                : 'today'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Heart Rate</p>
                <p className="text-3xl font-heading font-medium mt-2">
                  {metricsLoading ? '...' : (
                    getLatestMetric('heart_rate') 
                      ? getLatestMetric('heart_rate').metricValue.value 
                      : 'N/A'
                  )}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-secondary-400">
                <span className="material-icons">monitor_heart</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              {!metricsLoading && getLatestMetric('heart_rate') && (
                <span className={getMetricStatusColor('heart_rate', getLatestMetric('heart_rate').metricValue)}>
                  {getMetricStatusMessage('heart_rate', getLatestMetric('heart_rate').metricValue)}
                </span>
              )} BPM
            </p>
          </CardContent>
        </Card>
        
        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Glucose Level</p>
                <p className="text-3xl font-heading font-medium mt-2">
                  {metricsLoading ? '...' : (
                    getLatestMetric('glucose') 
                      ? getLatestMetric('glucose').metricValue.value 
                      : 'N/A'
                  )}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-warning">
                <span className="material-icons">water_drop</span>
              </div>
            </div>
            <p className="text-xs mt-4 text-gray-500">
              {!metricsLoading && getLatestMetric('glucose') && (
                <span className={getMetricStatusColor('glucose', getLatestMetric('glucose').metricValue)}>
                  {getMetricStatusMessage('glucose', getLatestMetric('glucose').metricValue)}
                </span>
              )} mg/dL
            </p>
          </CardContent>
        </Card>
        
        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Weight</p>
                <p className="text-3xl font-heading font-medium mt-2">
                  {metricsLoading ? '...' : (
                    getLatestMetric('weight') 
                      ? getLatestMetric('weight').metricValue.value 
                      : 'N/A'
                  )}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
                <span className="material-icons">monitor_weight</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              <span className="text-error font-medium">+1.2 kg</span> in last month
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
            value="appointments" 
            className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-4 rounded-none data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 data-[state=active]:shadow-none border-b-2 font-medium text-sm"
          >
            My Appointments
          </TabsTrigger>
          <TabsTrigger 
            value="medications" 
            className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-4 rounded-none data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 data-[state=active]:shadow-none border-b-2 font-medium text-sm"
          >
            Medication Schedule
          </TabsTrigger>
          <TabsTrigger 
            value="health-tracking" 
            className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-4 rounded-none data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 data-[state=active]:shadow-none border-b-2 font-medium text-sm"
          >
            Health Tracking
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Main Dashboard Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upcoming Appointments */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle>Upcoming Appointments</CardTitle>
                    <CardDescription>Your scheduled consultations</CardDescription>
                  </div>
                  <BookAppointmentDialog 
                    patientId={patientId}
                    trigger={
                      <Button className="bg-primary text-white">
                        <span className="material-icons mr-2">add</span> Book Appointment
                      </Button>
                    }
                    onSuccess={handleAppointmentBooked}
                  />
                </CardHeader>
                
                <CardContent>
                  <AppointmentTable userId={patientId} userRole="patient" />
                </CardContent>
              </Card>
            </div>
            
            {/* Health Metrics */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle>Health Tracking</CardTitle>
                    <CardDescription>Your latest health metrics</CardDescription>
                  </div>
                  <HealthTrackingForm 
                    patientId={patientId}
                    trigger={
                      <Button className="bg-primary text-white" title="Click to enter new health data like blood pressure, glucose level, or weight.">
                        <span className="material-icons mr-2">add</span> Add New Entry
                      </Button>
                    }
                    onSuccess={handleHealthDataAdded}
                  />
                </CardHeader>
                
                <CardContent>
                  {metricsLoading ? (
                    <div className="text-center py-10">
                      <p>Loading health data...</p>
                    </div>
                  ) : healthMetrics && healthMetrics.length > 0 ? (
                    <div className="space-y-6">
                      {/* Blood Pressure Chart */}
                      {formatBloodPressureData().length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-700 mb-2">Blood Pressure</h3>
                          <div className="h-32 bg-gray-50 rounded-md flex items-center justify-center p-4">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={formatBloodPressureData()}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" fontSize={10} />
                                <YAxis fontSize={10} />
                                <Tooltip />
                                <Area type="monotone" dataKey="systolic" stroke="hsl(var(--primary))" fill="hsl(var(--primary-50))" />
                                <Area type="monotone" dataKey="diastolic" stroke="hsl(var(--secondary))" fill="hsl(var(--secondary-50))" />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}
                      
                      {/* Glucose Level Chart */}
                      {formatGlucoseData().length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-700 mb-2">Glucose Level</h3>
                          <div className="h-32 bg-gray-50 rounded-md flex items-center justify-center p-4">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={formatGlucoseData()}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" fontSize={10} />
                                <YAxis fontSize={10} />
                                <Tooltip />
                                <Area type="monotone" dataKey="value" stroke="hsl(var(--warning))" fill="hsl(var(--warning) / 0.2)" />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <span className="material-icons text-gray-400 text-3xl mb-2">favorite</span>
                      <p className="text-gray-500">No health data recorded yet.</p>
                      <p className="text-gray-500 text-sm mt-1">
                        Click "Add New Entry" to start tracking your health.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="appointments" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>My Appointments</CardTitle>
                <CardDescription>Manage your scheduled consultations</CardDescription>
              </div>
              <BookAppointmentDialog 
                patientId={patientId}
                trigger={
                  <Button className="bg-primary text-white tooltip" data-tooltip="Schedule your appointment with a doctor. Your booking will be instantly updated on the doctor's dashboard.">
                    <span className="material-icons mr-2">add</span> Book Appointment
                  </Button>
                }
                onSuccess={handleAppointmentBooked}
              />
            </CardHeader>
            
            <CardContent>
              <AppointmentTable 
                userId={patientId} 
                userRole="patient" 
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="medications" className="space-y-6">
          <MedicationSchedule patientId={patientId} />
        </TabsContent>
        
        <TabsContent value="health-tracking" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Health Tracking</CardTitle>
                <CardDescription>Record and monitor your health metrics</CardDescription>
              </div>
              <HealthTrackingForm 
                patientId={patientId}
                trigger={
                  <Button className="bg-primary text-white tooltip" data-tooltip="Click to enter new health data like blood pressure, glucose level, or weight.">
                    <span className="material-icons mr-2">add</span> Add New Entry
                  </Button>
                }
                onSuccess={handleHealthDataAdded}
              />
            </CardHeader>
            
            <CardContent>
              {metricsLoading ? (
                <div className="text-center py-10">
                  <p>Loading health data...</p>
                </div>
              ) : healthMetrics && healthMetrics.length > 0 ? (
                <div className="space-y-8">
                  {/* Blood Pressure Chart */}
                  {formatBloodPressureData().length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-4">Blood Pressure History</h3>
                      <div className="h-64 bg-gray-50 rounded-md flex items-center justify-center p-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={formatBloodPressureData()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="systolic" name="Systolic" stroke="hsl(var(--primary))" fill="hsl(var(--primary-50))" />
                            <Area type="monotone" dataKey="diastolic" name="Diastolic" stroke="hsl(var(--secondary))" fill="hsl(var(--secondary-50))" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                  
                  {/* Glucose Level Chart */}
                  {formatGlucoseData().length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-4">Glucose Level History</h3>
                      <div className="h-64 bg-gray-50 rounded-md flex items-center justify-center p-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={formatGlucoseData()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="value" name="Glucose (mg/dL)" stroke="hsl(var(--warning))" fill="hsl(var(--warning) / 0.2)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                  
                  {/* Recent Health Metrics Table */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Recent Health Entries</h3>
                    <div className="border rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
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
                              <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                {metric.notes || '-'}
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
                  <p className="text-gray-500">No health data recorded yet.</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Click "Add New Entry" to start tracking your health metrics.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
