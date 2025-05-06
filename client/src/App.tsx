import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AppLayout from "@/components/layout/AppLayout";
import AuthPage from "@/pages/auth-page";
import { AuthProvider } from "@/hooks/use-auth";
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

// Pharmacist pages
import PharmacistDashboardPage from "@/pages/pharmacist/PharmacistDashboardPage";
import MedicineInventoryPage from "@/pages/pharmacist/MedicineInventoryPage";
import OrdersPage from "@/pages/pharmacist/OrdersPage";

function Router() {
  return (
    <Switch>
      {/* Auth route */}
      <Route path="/auth" component={AuthPage} />

      {/* Home route - redirects based on auth status */}
      <Route path="/">
        {() => <Redirect to="/auth" />}
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
