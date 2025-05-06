import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AppLayout from "@/components/layout/AppLayout";
import LoginPage from "@/pages/auth/LoginPage";
import DoctorDashboardPage from "@/pages/doctor/DoctorDashboardPage";
import PatientDashboardPage from "@/pages/patient/PatientDashboardPage";
import DoctorsPage from "@/pages/admin/DoctorsPage";
import PatientsPage from "@/pages/admin/PatientsPage";
import AppointmentsPage from "@/pages/admin/AppointmentsPage";

function Router() {
  return (
    <Switch>
      {/* Auth routes */}
      <Route path="/login" component={LoginPage} />
      
      {/* Doctor routes */}
      <Route path="/doctor/dashboard">
        <AppLayout>
          <DoctorDashboardPage />
        </AppLayout>
      </Route>
      
      {/* Patient routes */}
      <Route path="/patient/dashboard">
        <AppLayout>
          <PatientDashboardPage />
        </AppLayout>
      </Route>
      
      {/* Admin routes */}
      <Route path="/admin/doctors">
        <AppLayout>
          <DoctorsPage />
        </AppLayout>
      </Route>
      
      <Route path="/admin/patients">
        <AppLayout>
          <PatientsPage />
        </AppLayout>
      </Route>
      
      <Route path="/admin/appointments">
        <AppLayout>
          <AppointmentsPage />
        </AppLayout>
      </Route>

      {/* Default route - redirect to login */}
      <Route path="/">
        <LoginPage />
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
