import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
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
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

// Form validation schema for doctor
const doctorFormSchema = z.object({
  userId: z.string().min(1, "User is required"),
  specialization: z.string().min(1, "Specialization is required"),
  licenseNumber: z.string().min(1, "License number is required"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().optional(),
  bio: z.string().optional(),
});

type DoctorFormValues = z.infer<typeof doctorFormSchema>;

export default function DoctorsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewDoctorDetails, setViewDoctorDetails] = useState<any>(null);
  const [addDoctorOpen, setAddDoctorOpen] = useState(false);
  
  // Fetch doctors
  const { data: doctors, isLoading: doctorsLoading } = useQuery({
    queryKey: ['/api/doctors'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/doctors', undefined);
      return await response.json();
    }
  });
  
  // Fetch doctor stats
  const { data: doctorStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/doctors/stats'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/doctors/stats', undefined);
      return await response.json();
    }
  });
  
  // Fetch users for adding a new doctor
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/users', undefined);
      return await response.json();
    }
  });
  
  // Form for adding a new doctor
  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: {
      userId: "",
      specialization: "",
      licenseNumber: "",
      phone: "",
      address: "",
      bio: ""
    }
  });
  
  // Add doctor mutation
  const addDoctorMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/doctors', data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Doctor added successfully",
        description: "The new doctor has been added to the system",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/doctors'] });
      form.reset();
      setAddDoctorOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error adding doctor",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (values: DoctorFormValues) => {
    // Convert userId to number
    const doctorData = {
      ...values,
      userId: parseInt(values.userId),
      isActive: true
    };
    
    addDoctorMutation.mutate(doctorData);
  };
  
  // Filter doctors based on search query
  const filteredDoctors = doctors?.filter((doctor: any) => {
    if (!searchQuery) return true;
    
    const fullName = doctor.user?.fullName || '';
    const specialization = doctor.specialization || '';
    const phone = doctor.phone || '';
    
    return (
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone.includes(searchQuery)
    );
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-medium text-gray-900">Doctors Management</h1>
      
      {/* Stats Section */}
      {!statsLoading && doctorStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Active Doctors</p>
                  <p className="text-3xl font-heading font-medium mt-2">{doctorStats.activeDoctors || 0}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-500">
                  <span className="material-icons">medical_services</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Patients</p>
                  <p className="text-3xl font-heading font-medium mt-2">{doctorStats.totalPatients || 0}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-secondary-400">
                  <span className="material-icons">people</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Today's Appointments</p>
                  <p className="text-3xl font-heading font-medium mt-2">{doctorStats.todayAppointments || 0}</p>
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
                  <p className="text-gray-500 text-sm font-medium">Recent Prescriptions</p>
                  <p className="text-3xl font-heading font-medium mt-2">{doctorStats.recentPrescriptions || 0}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-amber-500">
                  <span className="material-icons">receipt</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Doctors Listing */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Doctors</CardTitle>
            <CardDescription>Manage doctors in the healthcare system</CardDescription>
          </div>
          <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search doctors..."
                className="w-full sm:w-64 pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="material-icons absolute left-2 top-2.5 text-gray-400 text-sm">search</span>
            </div>
            
            <Dialog open={addDoctorOpen} onOpenChange={setAddDoctorOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-white">
                  <span className="material-icons mr-2">add</span> Add Doctor
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Add New Doctor</DialogTitle>
                  <DialogDescription>
                    Add a new doctor to the healthcare system.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="userId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select User</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a user" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {!usersLoading && users?.map((user: any) => (
                                <SelectItem key={user.id} value={user.id.toString()}>
                                  {user.fullName || user.username}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="specialization"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Specialization</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Cardiology" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="licenseNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>License Number</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. MD12345" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. +1 (555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Office address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Professional background" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter className="pt-4">
                      <Button type="button" variant="outline" onClick={() => setAddDoctorOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={addDoctorMutation.isPending}
                      >
                        {addDoctorMutation.isPending ? 'Adding...' : 'Add Doctor'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {doctorsLoading ? (
            <div className="text-center py-10">
              <p>Loading doctors...</p>
            </div>
          ) : filteredDoctors && filteredDoctors.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>License</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDoctors.map((doctor: any) => (
                  <TableRow key={doctor.id}>
                    <TableCell className="font-medium">{doctor.user?.fullName || 'N/A'}</TableCell>
                    <TableCell>{doctor.specialization || 'N/A'}</TableCell>
                    <TableCell>{doctor.licenseNumber || 'N/A'}</TableCell>
                    <TableCell>
                      <div>
                        <div>{doctor.user?.email || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{doctor.phone || 'No phone'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {doctor.isActive ? (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewDoctorDetails(doctor)}
                        className="h-8 px-2 text-primary-500"
                      >
                        <span className="material-icons text-sm mr-1">visibility</span>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10">
              <span className="material-icons text-gray-400 text-4xl mb-2">medical_services</span>
              <p className="text-gray-500">No doctors found.</p>
              {searchQuery && (
                <p className="text-gray-500 mt-1">Try adjusting your search criteria.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Doctor Details Dialog */}
      {viewDoctorDetails && (
        <Dialog open={!!viewDoctorDetails} onOpenChange={() => setViewDoctorDetails(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Doctor Details</DialogTitle>
              <DialogDescription>
                Detailed information about the doctor.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-500">
                  <span className="material-icons text-3xl">person</span>
                </div>
                <div>
                  <h3 className="text-xl font-medium">{viewDoctorDetails.user?.fullName || 'N/A'}</h3>
                  <p className="text-gray-500">{viewDoctorDetails.specialization || 'No specialization'}</p>
                </div>
              </div>
              
              <Tabs defaultValue="info">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="info">Basic Info</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                  <TabsTrigger value="professional">Professional</TabsTrigger>
                </TabsList>
                
                <TabsContent value="info" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Full Name</p>
                      <p>{viewDoctorDetails.user?.fullName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Username</p>
                      <p>{viewDoctorDetails.user?.username || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p>{viewDoctorDetails.user?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <p>
                        {viewDoctorDetails.isActive ? (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                        )}
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="contact" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p>{viewDoctorDetails.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p>{viewDoctorDetails.user?.email || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-500">Address</p>
                      <p>{viewDoctorDetails.address || 'N/A'}</p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="professional" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Specialization</p>
                      <p>{viewDoctorDetails.specialization || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">License Number</p>
                      <p>{viewDoctorDetails.licenseNumber || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-500">Bio</p>
                      <p>{viewDoctorDetails.bio || 'No bio available'}</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            <DialogFooter>
              <Button onClick={() => setViewDoctorDetails(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
