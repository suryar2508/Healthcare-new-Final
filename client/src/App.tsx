import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AppLayout from "@/components/layout/AppLayout";
import AuthPage from "@/pages/auth-page";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

// Admin pages
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import DoctorsPage from "@/pages/admin/DoctorsPage";
import PatientsPage from "@/pages/admin/PatientsPage";
import AppointmentsPage from "@/pages/admin/AppointmentsPage";

// Doctor pages
import DoctorDashboardPage from "@/pages/doctor/DoctorDashboardPage";
import PatientListPage from "@/pages/doctor/PatientListPage";
import DoctorAppointmentsPage from "@/pages/doctor/DoctorAppointmentsPage";
import PrescriptionsPage from "@/pages/doctor/PrescriptionsPage";
import OCRPrescriptionPage from "@/pages/doctor/OCRPrescriptionPage";

// Patient pages
import PatientDashboardPage from "@/pages/patient/PatientDashboardPage";
import PatientAppointmentsPage from "@/pages/patient/PatientAppointmentsPage";
import MedicationsPage from "@/pages/patient/MedicationsPage";
import HealthMetricsPage from "@/pages/patient/HealthMetricsPage";
import AppointmentBookingPage from "@/pages/patient/AppointmentBookingPage";
import UploadPrescriptionPage from "@/pages/patient/UploadPrescriptionPage";
import PatientTestPage from "@/pages/patient/PatientTestPage";

// Pharmacist pages
import PharmacistDashboardPage from "@/pages/pharmacist/PharmacistDashboardPage";
import MedicineInventoryPage from "@/pages/pharmacist/MedicineInventoryPage";
import OrdersPage from "@/pages/pharmacist/OrdersPage";

function Router() {
  return (
    <Switch>
      {/* Auth route */}
      <Route path="/auth" component={AuthPage} />

      {/* Root route - always redirects to auth first */}
      <Route path="/">
        {() => <Redirect to="/auth" />}
      </Route>

      {/* Auth check route */}
      <Route path="/auth-check">
        {() => {
          const { user } = useAuth();
          if (!user) {
            return <Redirect to="/auth" />;
          }
          
          // Redirect based on user role
          switch (user.role) {
            case "admin": return <Redirect to="/admin" />;
            case "doctor": return <Redirect to="/doctor" />;
            case "patient": return <Redirect to="/patient" />;
            case "pharmacist": return <Redirect to="/pharmacist" />;
            default: return <Redirect to="/auth" />;
          }
        }}
      </Route>

      {/* Special test route with no role restrictions */}
      <Route path="/patient-test">
        {() => {
          const { user } = useAuth();
          // Only require authentication, not specific role
          if (!user) {
            return <Redirect to="/auth" />;
          }
          return (
            <AppLayout>
              <PatientTestPage />
            </AppLayout>
          );
        }}
      </Route>

      {/* Admin routes */}
      <ProtectedRoute 
        path="/admin" 
        component={AdminDashboardPage} 
        allowedRoles={["admin"]} 
      />
      <ProtectedRoute 
        path="/admin/doctors" 
        component={DoctorsPage} 
        allowedRoles={["admin"]} 
      />
      <ProtectedRoute 
        path="/admin/patients" 
        component={PatientsPage} 
        allowedRoles={["admin"]} 
      />
      <ProtectedRoute 
        path="/admin/appointments" 
        component={AppointmentsPage} 
        allowedRoles={["admin"]} 
      />
      
      {/* Doctor routes */}
      <ProtectedRoute 
        path="/doctor" 
        component={DoctorDashboardPage} 
        allowedRoles={["doctor"]} 
      />
      <ProtectedRoute 
        path="/doctor/patients" 
        component={PatientListPage} 
        allowedRoles={["doctor"]} 
      />
      <ProtectedRoute 
        path="/doctor/appointments" 
        component={DoctorAppointmentsPage} 
        allowedRoles={["doctor"]} 
      />
      <ProtectedRoute 
        path="/doctor/prescriptions" 
        component={PrescriptionsPage} 
        allowedRoles={["doctor"]} 
      />
      <ProtectedRoute 
        path="/doctor/ocr-prescription" 
        component={OCRPrescriptionPage} 
        allowedRoles={["doctor"]} 
      />
      
      {/* Patient routes */}
      <ProtectedRoute 
        path="/patient" 
        component={PatientDashboardPage} 
        allowedRoles={["patient"]} 
      />
      <ProtectedRoute 
        path="/patient/appointments" 
        component={PatientAppointmentsPage} 
        allowedRoles={["patient"]} 
      />
      <ProtectedRoute 
        path="/patient/medications" 
        component={MedicationsPage} 
        allowedRoles={["patient"]} 
      />
      <ProtectedRoute 
        path="/patient/health-metrics" 
        component={HealthMetricsPage} 
        allowedRoles={["patient"]} 
      />
      <ProtectedRoute 
        path="/patient/book-appointment" 
        component={AppointmentBookingPage} 
        allowedRoles={["patient"]} 
      />
      <ProtectedRoute 
        path="/patient/upload-prescription" 
        component={UploadPrescriptionPage} 
        allowedRoles={["patient"]} 
      />
      
      {/* Pharmacist routes */}
      <ProtectedRoute 
        path="/pharmacist" 
        component={PharmacistDashboardPage} 
        allowedRoles={["pharmacist"]} 
      />
      <ProtectedRoute 
        path="/pharmacist/inventory" 
        component={MedicineInventoryPage} 
        allowedRoles={["pharmacist"]} 
      />
      <ProtectedRoute 
        path="/pharmacist/orders" 
        component={OrdersPage} 
        allowedRoles={["pharmacist"]} 
      />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
