import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';

export default function Sidebar() {
  const [location] = useLocation();
  
  // Fetch user data
  const { data: userData } = useQuery({
    queryKey: ['/api/users/me'],
    queryFn: () => {
      // For demo purposes, we'll return mock data
      // In a real app, this would be fetched from the API
      return Promise.resolve({
        fullName: 'Dr. Sarah Johnson',
        role: 'Cardiologist'
      });
    }
  });

  const isActive = (path: string) => {
    return location.startsWith(path) ? 'active' : '';
  };

  // Define navigation items based on user role
  const userRole = 'doctor'; // This would be dynamically determined from auth context

  const renderNavigation = () => {
    switch (userRole) {
      case 'admin':
        return (
          <>
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Dashboard</p>
            <a href="/admin/dashboard" className={`sidebar-link flex items-center px-4 py-3 text-gray-700 ${isActive('/admin/dashboard')}`}>
              <span className="material-icons mr-3">dashboard</span>
              <span>Overview</span>
            </a>
            
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">Management</p>
            <a href="/admin/doctors" className={`sidebar-link flex items-center px-4 py-3 text-gray-700 ${isActive('/admin/doctors')}`}>
              <span className="material-icons mr-3">medical_services</span>
              <span>Doctors</span>
            </a>
            <a href="/admin/patients" className={`sidebar-link flex items-center px-4 py-3 text-gray-700 ${isActive('/admin/patients')}`}>
              <span className="material-icons mr-3">people</span>
              <span>Patients</span>
            </a>
            <a href="/admin/appointments" className={`sidebar-link flex items-center px-4 py-3 text-gray-700 ${isActive('/admin/appointments')}`}>
              <span className="material-icons mr-3">event</span>
              <span>Appointments</span>
            </a>
          </>
        );
        
      case 'doctor':
        return (
          <>
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Dashboard</p>
            <a href="/doctor/dashboard" className={`sidebar-link flex items-center px-4 py-3 text-gray-700 ${isActive('/doctor/dashboard')}`}>
              <span className="material-icons mr-3">dashboard</span>
              <span>Overview</span>
            </a>
            
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">Patient Care</p>
            <a href="/doctor/appointments" className={`sidebar-link flex items-center px-4 py-3 text-gray-700 ${isActive('/doctor/appointments')}`}>
              <span className="material-icons mr-3">event</span>
              <span>Appointments</span>
            </a>
            <a href="/doctor/prescriptions" className={`sidebar-link flex items-center px-4 py-3 text-gray-700 ${isActive('/doctor/prescriptions')}`}>
              <span className="material-icons mr-3">receipt</span>
              <span>Prescriptions</span>
            </a>
            <a href="/doctor/patients" className={`sidebar-link flex items-center px-4 py-3 text-gray-700 ${isActive('/doctor/patients')}`}>
              <span className="material-icons mr-3">people</span>
              <span>Patients</span>
            </a>
            
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">Medical Records</p>
            <a href="/doctor/medical-history" className={`sidebar-link flex items-center px-4 py-3 text-gray-700 ${isActive('/doctor/medical-history')}`}>
              <span className="material-icons mr-3">history</span>
              <span>Medical History</span>
            </a>
            <a href="/doctor/lab-results" className={`sidebar-link flex items-center px-4 py-3 text-gray-700 ${isActive('/doctor/lab-results')}`}>
              <span className="material-icons mr-3">science</span>
              <span>Lab Results</span>
            </a>
          </>
        );
        
      case 'patient':
        return (
          <>
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">My Health</p>
            <a href="/patient/dashboard" className={`sidebar-link flex items-center px-4 py-3 text-gray-700 ${isActive('/patient/dashboard')}`}>
              <span className="material-icons mr-3">dashboard</span>
              <span>Dashboard</span>
            </a>
            <a href="/patient/appointments" className={`sidebar-link flex items-center px-4 py-3 text-gray-700 ${isActive('/patient/appointments')}`}>
              <span className="material-icons mr-3">event</span>
              <span>Appointments</span>
            </a>
            <a href="/patient/medications" className={`sidebar-link flex items-center px-4 py-3 text-gray-700 ${isActive('/patient/medications')}`}>
              <span className="material-icons mr-3">medication</span>
              <span>Medications</span>
            </a>
            <a href="/patient/health-tracking" className={`sidebar-link flex items-center px-4 py-3 text-gray-700 ${isActive('/patient/health-tracking')}`}>
              <span className="material-icons mr-3">favorite</span>
              <span>Health Tracking</span>
            </a>
            
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">Records</p>
            <a href="/patient/medical-history" className={`sidebar-link flex items-center px-4 py-3 text-gray-700 ${isActive('/patient/medical-history')}`}>
              <span className="material-icons mr-3">history</span>
              <span>Medical History</span>
            </a>
            <a href="/patient/lab-results" className={`sidebar-link flex items-center px-4 py-3 text-gray-700 ${isActive('/patient/lab-results')}`}>
              <span className="material-icons mr-3">science</span>
              <span>Lab Results</span>
            </a>
          </>
        );
        
      default:
        return null;
    }
  };

  return (
    <>
      <div className="flex items-center justify-center h-16 border-b">
        <h1 className="text-xl font-heading font-bold text-primary-500">
          <span className="material-icons mr-2">medical_services</span>
          HealthCare
        </h1>
      </div>
      
      <div className="px-4 py-2 border-b">
        {/* User info */}
        <div className="flex items-center py-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-500">
            <span className="material-icons">person</span>
          </div>
          <div className="ml-3">
            <p className="font-medium text-sm">{userData?.fullName || 'User'}</p>
            <p className="text-xs text-gray-500">{userData?.role || 'Role'}</p>
          </div>
        </div>
      </div>
      
      <nav className="py-4">
        {renderNavigation()}
      </nav>
    </>
  );
}
