import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Form,
  FormControl,
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

const formSchema = z.object({
  metricType: z.string().min(1, "Please select a metric type"),
  systolic: z.string().optional(),
  diastolic: z.string().optional(),
  value: z.string().optional(),
  unit: z.string().optional(),
  recordedAt: z.string().min(1, "Please enter date and time"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface HealthTrackingFormProps {
  patientId: number;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export default function HealthTrackingForm({
  patientId,
  trigger,
  onSuccess
}: HealthTrackingFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  
  // Form setup with validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      metricType: 'blood_pressure',
      systolic: '',
      diastolic: '',
      value: '',
      unit: '',
      recordedAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      notes: '',
    }
  });
  
  // Watch for metric type changes to update form
  const metricType = form.watch('metricType');
  
  // Get the appropriate unit based on metric type
  const getMetricUnit = (type: string) => {
    switch (type) {
      case 'glucose':
        return 'mg/dL';
      case 'weight':
        return 'kg';
      case 'heart_rate':
        return 'BPM';
      case 'temperature':
        return '°F';
      case 'oxygen':
        return '%';
      default:
        return '';
    }
  };
  
  // Create health metric mutation
  const healthMetricMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/health-metrics', data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Health data recorded successfully",
        description: "Your health data has been saved and displayed on your dashboard.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/health-metrics'] });
      form.reset();
      setOpen(false);
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error saving health data",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (values: FormValues) => {
    let metricValue: any = {};
    
    // Format metric value based on type
    if (values.metricType === 'blood_pressure') {
      if (!values.systolic || !values.diastolic) {
        toast({
          title: "Missing values",
          description: "Please enter both systolic and diastolic values.",
          variant: "destructive",
        });
        return;
      }
      
      metricValue = {
        systolic: parseInt(values.systolic),
        diastolic: parseInt(values.diastolic),
        unit: 'mmHg'
      };
    } else {
      if (!values.value) {
        toast({
          title: "Missing value",
          description: "Please enter a value for the selected metric.",
          variant: "destructive",
        });
        return;
      }
      
      metricValue = {
        value: parseFloat(values.value),
        unit: getMetricUnit(values.metricType)
      };
    }
    
    // Create health metric data
    const healthMetricData = {
      patientId,
      metricType: values.metricType,
      metricValue,
      recordedAt: values.recordedAt,
      notes: values.notes || undefined
    };
    
    healthMetricMutation.mutate(healthMetricData);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button className="bg-primary text-white flex items-center" title="Click to enter new health data like blood pressure, glucose level, or weight.">
            <span className="material-icons mr-2">add</span> Add New Entry
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Health Entry</DialogTitle>
          <DialogDescription>
            Enter your health metrics below to keep track of your wellness progress.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="metricType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Metric Type</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Reset values when changing metric type
                      if (value === 'blood_pressure') {
                        form.setValue('value', '');
                        form.setValue('unit', '');
                      } else {
                        form.setValue('systolic', '');
                        form.setValue('diastolic', '');
                      }
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select metric type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="blood_pressure">Blood Pressure</SelectItem>
                      <SelectItem value="glucose">Blood Glucose</SelectItem>
                      <SelectItem value="weight">Weight</SelectItem>
                      <SelectItem value="heart_rate">Heart Rate</SelectItem>
                      <SelectItem value="temperature">Body Temperature</SelectItem>
                      <SelectItem value="oxygen">Oxygen Saturation</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {metricType === 'blood_pressure' ? (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="systolic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Systolic (mmHg)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g. 120" 
                          {...field}
                          onChange={(e) => {
                            // Ensure value is a valid number
                            const value = e.target.value === "" ? "" : e.target.value;
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="diastolic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diastolic (mmHg)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g. 80" 
                          {...field}
                          onChange={(e) => {
                            // Ensure value is a valid number
                            const value = e.target.value === "" ? "" : e.target.value;
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : (
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value</FormLabel>
                    <div className="flex">
                      <FormControl>
                        <Input 
                          type="number" 
                          step={metricType === 'weight' || metricType === 'temperature' ? '0.1' : '1'}
                          placeholder="Enter value" 
                          className="rounded-r-none"
                          {...field}
                          onChange={(e) => {
                            // Ensure value is a valid number
                            const value = e.target.value === "" ? "" : e.target.value;
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        {getMetricUnit(metricType)}
                      </span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="recordedAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date & Time</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={2} 
                      placeholder="Any additional details about this measurement"
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
                disabled={healthMetricMutation.isPending}
              >
                {healthMetricMutation.isPending ? 'Saving...' : 'Save Entry'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
