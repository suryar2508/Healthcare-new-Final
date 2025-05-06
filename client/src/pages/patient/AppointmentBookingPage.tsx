import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, User, FileText, CheckCheck, Loader2 } from "lucide-react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Available time slots
const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM'
];

// Appointment form schema
const appointmentFormSchema = z.object({
  doctorId: z.string().min(1, 'Please select a doctor'),
  appointmentDate: z.date({
    required_error: 'Please select a date',
  }),
  appointmentTime: z.string().min(1, 'Please select a time'),
  appointmentType: z.enum(['routine', 'follow_up', 'urgent', 'consultation'], {
    required_error: 'Please select an appointment type',
  }),
  reason: z.string().min(5, 'Please provide a reason for the appointment').max(200, 'Reason is too long'),
  notes: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

export default function AppointmentBookingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [availableTimes, setAvailableTimes] = useState<string[]>(timeSlots);
  
  // Get doctors list
  const { data: doctors, isLoading: doctorsLoading } = useQuery({
    queryKey: ['/api/doctors'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/doctors');
      return await res.json();
    }
  });
  
  // Get doctor availability
  const { data: availability, isLoading: availabilityLoading } = useQuery({
    queryKey: ['/api/doctors/availability', selectedDate],
    queryFn: async () => {
      if (!selectedDate) return timeSlots;
      
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const res = await apiRequest('GET', `/api/doctors/availability?date=${formattedDate}`);
      const data = await res.json();
      return data.availableSlots || timeSlots;
    },
    enabled: !!selectedDate,
  });
  
  // Update available times when availability changes
  useEffect(() => {
    if (availability && Array.isArray(availability)) {
      setAvailableTimes(availability);
    } else {
      setAvailableTimes(timeSlots);
    }
  }, [availability]);
  
  // Form setup
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      appointmentType: 'routine',
      reason: '',
      notes: '',
    },
  });
  
  // Mutation for booking appointment
  const bookingMutation = useMutation({
    mutationFn: async (values: AppointmentFormValues) => {
      const res = await apiRequest('POST', '/api/appointments', {
        ...values,
        patientId: user?.id,
      });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Appointment Booked',
        description: 'Your appointment has been successfully scheduled.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      navigate('/patient/appointments');
    },
    onError: (error: Error) => {
      toast({
        title: 'Booking Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Submit handler
  function onSubmit(values: AppointmentFormValues) {
    bookingMutation.mutate(values);
  }
  
  // Handle date change
  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    form.setValue('appointmentDate', date as Date);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Book Appointment</h1>
        <p className="text-muted-foreground">Schedule a visit with one of our healthcare providers</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Appointment Details</CardTitle>
            <CardDescription>Fill in the details to schedule your appointment</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Doctor Selection */}
                  <FormField
                    control={form.control}
                    name="doctorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Doctor</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={doctorsLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a doctor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {doctorsLoading ? (
                              <div className="flex justify-center items-center py-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                              </div>
                            ) : doctors && Array.isArray(doctors) ? (
                              doctors.map((doctor: any) => (
                                <SelectItem 
                                  key={doctor.id} 
                                  value={doctor.id.toString()}
                                >
                                  Dr. {doctor.user?.fullName || doctor.user?.username} 
                                  {doctor.specialization && ` - ${doctor.specialization}`}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no_doctors">No doctors available</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Appointment Type */}
                  <FormField
                    control={form.control}
                    name="appointmentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Appointment Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select appointment type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="routine">Routine Checkup</SelectItem>
                            <SelectItem value="follow_up">Follow-up Visit</SelectItem>
                            <SelectItem value="urgent">Urgent Care</SelectItem>
                            <SelectItem value="consultation">Consultation</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Date Selection */}
                  <FormField
                    control={form.control}
                    name="appointmentDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Appointment Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={handleDateChange}
                              disabled={(date) => {
                                // Disable past dates and weekends
                                return (
                                  date < new Date(Date.now() - 86400000) ||
                                  date.getDay() === 0 ||
                                  date.getDay() === 6
                                )
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Time Selection */}
                  <FormField
                    control={form.control}
                    name="appointmentTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Appointment Time</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={availabilityLoading || !form.getValues().appointmentDate}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a time slot" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availabilityLoading ? (
                              <div className="flex justify-center items-center py-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                              </div>
                            ) : availableTimes.length > 0 ? (
                              availableTimes.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="p-2 text-center text-sm text-muted-foreground">
                                No available times for selected date
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Reason */}
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason for Visit</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please briefly describe the reason for your appointment"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This helps the doctor prepare for your visit
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Additional Notes */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional information you'd like to share"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end mt-6">
                  <Button 
                    type="submit" 
                    className="w-full md:w-auto"
                    disabled={bookingMutation.isPending}
                  >
                    {bookingMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Booking...
                      </>
                    ) : (
                      <>
                        Book Appointment
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Appointment Reminders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Please arrive 15 minutes before your appointment</h4>
                  <p className="text-sm text-muted-foreground">
                    This allows time for check-in and paperwork
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Bring your ID and insurance card</h4>
                  <p className="text-sm text-muted-foreground">
                    These are required for verification purposes
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Bring a list of your current medications</h4>
                  <p className="text-sm text-muted-foreground">
                    Include prescriptions, over-the-counter medicines, and supplements
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <CheckCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Cancellation Policy</h4>
                  <p className="text-sm text-muted-foreground">
                    Please provide at least 24 hours notice if you need to cancel or reschedule
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <p className="text-xs text-muted-foreground">
              You will receive an email confirmation and reminder for your appointment. You can manage 
              all appointments from your dashboard.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}