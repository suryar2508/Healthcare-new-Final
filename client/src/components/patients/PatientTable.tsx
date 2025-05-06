import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PatientTableProps {
  onViewDetails?: (patient: any) => void;
  onViewMedicalHistory?: (patient: any) => void;
}

export default function PatientTable({ 
  onViewDetails,
  onViewMedicalHistory
}: PatientTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch patients
  const { data: patients, isLoading, isError } = useQuery({
    queryKey: ['/api/patients'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/patients', undefined);
      return await response.json();
    }
  });

  // Filter patients based on search query
  const filteredPatients = patients?.filter((patient: any) => {
    if (!searchQuery) return true;
    
    const fullName = patient.user?.fullName || '';
    const email = patient.user?.email || '';
    const phone = patient.phone || '';
    
    return (
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone.includes(searchQuery)
    );
  });

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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Patients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <p>Loading patients...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Patients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <p className="text-destructive">Error loading patients. Please try again.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
          <CardTitle>Patients</CardTitle>
          <div className="relative">
            <Input
              type="search"
              placeholder="Search patients..."
              className="w-full sm:w-64 pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="material-icons absolute left-2 top-2.5 text-gray-400 text-sm">search</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredPatients?.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Blood Type</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient: any) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.user?.fullName || 'N/A'}</TableCell>
                  <TableCell>{calculateAge(patient.dateOfBirth)}</TableCell>
                  <TableCell className="capitalize">{patient.gender || 'N/A'}</TableCell>
                  <TableCell>
                    <div>
                      <div>{patient.user?.email || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{patient.phone || 'No phone'}</div>
                    </div>
                  </TableCell>
                  <TableCell>{patient.bloodType || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails && onViewDetails(patient)}
                        className="h-8 px-2 text-primary-500"
                      >
                        <span className="material-icons text-sm mr-1">visibility</span>
                        View
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewMedicalHistory && onViewMedicalHistory(patient)}
                        className="h-8 px-2 text-secondary-500"
                      >
                        <span className="material-icons text-sm mr-1">history</span>
                        History
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-10">
            <span className="material-icons text-gray-400 text-4xl mb-2">people</span>
            <p className="text-gray-500">No patients found.</p>
            {searchQuery && (
              <p className="text-gray-500 mt-1">Try adjusting your search criteria.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
