import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, addDays } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm } from 'react-hook-form';

const medicationFormSchema = z.object({
  medicationName: z.string().min(1, "Medication name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  timeOfDay: z.string().min(1, "Time of day is required"),
  instructions: z.string().optional(),
});

type MedicationFormValues = z.infer<typeof medicationFormSchema>;

interface MedicationScheduleProps {
  patientId: number;
}

export default function MedicationSchedule({ patientId }: MedicationScheduleProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  
  // Fetch medication schedules
  const { data: medications, isLoading, isError } = useQuery({
    queryKey: ['/api/medication-schedules', patientId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/medication-schedules?patientId=${patientId}`, undefined);
      return await response.json();
    }
  });
  
  // Form setup with validation
  const form = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationFormSchema),
    defaultValues: {
      medicationName: '',
      dosage: '',
      frequency: 'once_daily',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(addDays(new Date(), 14), 'yyyy-MM-dd'),
      timeOfDay: 'morning',
      instructions: '',
    }
  });
  
  // Create medication schedule mutation
  const medicationMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/medication-schedules', data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Medication scheduled",
        description: "Your medication schedule has been created successfully.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/medication-schedules'] });
      form.reset();
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error scheduling medication",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (values: MedicationFormValues) => {
    // Create medication schedule data
    const medicationData = {
      patientId,
      medicationName: values.medicationName,
      dosage: values.dosage,
      frequency: values.frequency,
      startDate: values.startDate,
      endDate: values.endDate || undefined,
      timeOfDay: values.timeOfDay,
      isActive: true,
      instructions: values.instructions || undefined
    };
    
    medicationMutation.mutate(medicationData);
  };
  
  // Format frequency for display
  const formatFrequency = (frequency: string) => {
    switch (frequency) {
      case 'once_daily':
        return 'Once daily';
      case 'twice_daily':
        return 'Twice daily';
      case 'three_times_daily':
        return 'Three times daily';
      case 'four_times_daily':
        return 'Four times daily';
      case 'as_needed':
        return 'As needed';
      default:
        return frequency;
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Get next dose time based on timeOfDay and frequency
  const getNextDoseTime = (timeOfDay: string, frequency: string) => {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Simple logic to determine next dose time
    if (timeOfDay.includes('morning') && currentHour < 8) {
      return 'Today, 08:00 AM';
    } else if (timeOfDay.includes('afternoon') && currentHour < 13) {
      return 'Today, 01:00 PM';
    } else if (timeOfDay.includes('evening') && currentHour < 19) {
      return 'Today, 07:00 PM';
    } else {
      return 'Tomorrow, 08:00 AM';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Medication Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <p>Loading medication schedules...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Medication Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <p className="text-destructive">Error loading medications. Please try again.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Medication Schedule</CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Set a start date and time for each medication. Notifications will alert you when it's time to take your dose.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-white">
              <span className="material-icons mr-2">add</span> Add Medication
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Add Medication</DialogTitle>
              <DialogDescription>
                Set the details for your medication and reminder schedule.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="medicationName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medication Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Lisinopril" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dosage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dosage</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 10mg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="once_daily">Once daily</SelectItem>
                            <SelectItem value="twice_daily">Twice daily</SelectItem>
                            <SelectItem value="three_times_daily">Three times daily</SelectItem>
                            <SelectItem value="four_times_daily">Four times daily</SelectItem>
                            <SelectItem value="as_needed">As needed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date (Optional)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="timeOfDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time of Day</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time of day" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="morning">Morning</SelectItem>
                          <SelectItem value="afternoon">Afternoon</SelectItem>
                          <SelectItem value="evening">Evening</SelectItem>
                          <SelectItem value="morning,evening">Morning and Evening</SelectItem>
                          <SelectItem value="morning,afternoon,evening">Morning, Afternoon, and Evening</SelectItem>
                          <SelectItem value="as_needed">As needed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="instructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instructions (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="e.g. Take with food"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={medicationMutation.isPending}
                  >
                    {medicationMutation.isPending ? 'Adding...' : 'Add Medication'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-primary-600 mb-4 bg-primary-50 p-3 rounded-md">
          <span className="material-icons text-xs align-middle mr-1">notifications</span>
          You will receive timely reminders for each scheduled medication.
        </div>
        
        {medications && medications.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medication</TableHead>
                <TableHead>Dosage</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Next Dose</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {medications.map((med: any) => (
                <TableRow key={med.id}>
                  <TableCell className="font-medium">{med.medicationName}</TableCell>
                  <TableCell>{med.dosage}</TableCell>
                  <TableCell>
                    {formatFrequency(med.frequency)}, {med.timeOfDay}
                    <div className="text-xs text-gray-500">
                      {formatDate(med.startDate)} {med.endDate ? `to ${formatDate(med.endDate)}` : ''}
                    </div>
                  </TableCell>
                  <TableCell>{getNextDoseTime(med.timeOfDay, med.frequency)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-primary-600 hover:text-primary-900"
                    >
                      Log
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-10">
            <span className="material-icons text-gray-400 text-3xl mb-2">medication</span>
            <p className="text-gray-500">No medications scheduled.</p>
            <p className="text-gray-500 text-sm mt-1">
              Click "Add Medication" to start tracking your medication schedule.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
