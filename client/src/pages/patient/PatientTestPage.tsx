import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { Loader2, AlertCircle } from 'lucide-react';

export default function PatientTestPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // This page is for testing purposes - demonstration of patient UI while logged in as any role
  const { data: patientData, isLoading: patientLoading, error: patientError } = useQuery({
    queryKey: ['/api/patients/1'], // Hardcoded to patient ID 1 for testing
    queryFn: async () => {
      const response = await fetch('/api/patients/1');
      if (!response.ok) {
        throw new Error('Failed to fetch patient data');
      }
      return response.json();
    }
  });

  // Fetch health metrics
  const { data: healthMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/health-metrics', 1], // Hardcoded to patient ID 1 for testing
    queryFn: async () => {
      const response = await fetch(`/api/health-metrics?patientId=1`);
      if (!response.ok) {
        throw new Error('Failed to fetch health metrics');
      }
      return response.json();
    }
  });

  // Fetch appointments
  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['/api/appointments', 1], // Hardcoded to patient ID 1 for testing
    queryFn: async () => {
      const response = await fetch(`/api/appointments?patientId=1`);
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      return response.json();
    }
  });

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Show loading state
  if (patientLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show error state
  if (patientError || !patientData) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          There was an error loading the patient data. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Alert className="bg-yellow-100 border-yellow-400 text-yellow-800">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This is a TEST page that displays patient data regardless of user role. Currently logged in as: 
          <Badge variant="outline" className="ml-2">{user?.role}</Badge>
        </AlertDescription>
      </Alert>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Patient Dashboard Test</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Name:</span> {user?.fullName}
              </div>
              <div>
                <span className="font-medium">Date of Birth:</span> {formatDate(patientData.dateOfBirth)}
              </div>
              <div>
                <span className="font-medium">Gender:</span> {patientData.gender}
              </div>
              <div>
                <span className="font-medium">Blood Type:</span> {patientData.bloodType}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Medical Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Allergies:</span> {patientData.allergies || 'None reported'}
              </div>
              <div>
                <span className="font-medium">Medical History:</span> {patientData.medicalHistory || 'None reported'}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Phone:</span> {patientData.phone}
              </div>
              <div>
                <span className="font-medium">Address:</span> {patientData.address}
              </div>
              <div>
                <span className="font-medium">Emergency Contact:</span> {patientData.emergencyContact}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="metrics">Health Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Health Metrics</CardTitle>
                <CardDescription>Your latest health measurements</CardDescription>
              </CardHeader>
              <CardContent>
                {metricsLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : healthMetrics && healthMetrics.length > 0 ? (
                  <div className="space-y-4">
                    {healthMetrics.slice(0, 3).map((metric: any) => (
                      <div key={metric.id} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <p className="font-medium">{metric.metricType}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(metric.recordedAt)}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {typeof metric.metricValue === 'object'
                            ? metric.metricType === 'blood_pressure'
                              ? `${metric.metricValue.systolic}/${metric.metricValue.diastolic} ${metric.metricValue.unit}`
                              : `${metric.metricValue.value} ${metric.metricValue.unit}`
                            : metric.metricValue}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No health metrics recorded yet.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Your scheduled appointments</CardDescription>
              </CardHeader>
              <CardContent>
                {appointmentsLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : appointments && appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments
                      .filter((apt: any) => apt.status === 'scheduled')
                      .slice(0, 3)
                      .map((appointment: any) => (
                        <div key={appointment.id} className="flex justify-between items-center border-b pb-2">
                          <div>
                            <p className="font-medium">{appointment.reason}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(appointment.appointmentDate)} at {appointment.appointmentTime}
                            </p>
                          </div>
                          <Badge>{appointment.status}</Badge>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No upcoming appointments.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>All Appointments</CardTitle>
              <CardDescription>View and manage your appointments</CardDescription>
            </CardHeader>
            <CardContent>
              {appointmentsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : appointments && appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map((appointment: any) => (
                    <div key={appointment.id} className="flex justify-between items-center border-b pb-3">
                      <div>
                        <p className="font-medium">{appointment.reason}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(appointment.appointmentDate)} at {appointment.appointmentTime}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.notes || 'No additional notes'}
                        </p>
                      </div>
                      <Badge className={
                        appointment.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        appointment.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                      }>
                        {appointment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No appointments found.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Health Metrics History</CardTitle>
              <CardDescription>Track your health measurements over time</CardDescription>
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : healthMetrics && healthMetrics.length > 0 ? (
                <div className="space-y-4">
                  {healthMetrics.map((metric: any) => (
                    <div key={metric.id} className="flex justify-between items-center border-b pb-3">
                      <div>
                        <p className="font-medium">{metric.metricType.replace('_', ' ').toUpperCase()}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(metric.recordedAt)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {metric.notes || 'No additional notes'}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {typeof metric.metricValue === 'object'
                          ? metric.metricType === 'blood_pressure'
                            ? `${metric.metricValue.systolic}/${metric.metricValue.diastolic} ${metric.metricValue.unit}`
                            : `${metric.metricValue.value} ${metric.metricValue.unit}`
                          : metric.metricValue}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No health metrics recorded yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}