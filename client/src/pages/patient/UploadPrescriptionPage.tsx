import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { format, addDays } from 'date-fns';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, FileImage, FileText, FilePlus2, FilePen, AlertCircle, CheckCircle, Ban, Undo2, BellRing, Clock, FileCheck } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

// Import sample prescriptions component
import SamplePrescriptions from "@/components/prescription/SamplePrescriptions";
import MedicationReminderForm from "@/components/notification/MedicationReminderForm";

export default function UploadPrescriptionPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [uploadId, setUploadId] = useState<number | null>(null);
  const [prescriptionCreated, setPrescriptionCreated] = useState<boolean>(false);
  const [medicationSchedules, setMedicationSchedules] = useState<any[]>([]);
  
  // Initialize medication schedules when analysis results change
  useEffect(() => {
    if (analysisResults?.medications?.length) {
      const initialSchedules = analysisResults.medications.map((med: any) => ({
        medicationName: med.name || 'Unknown medication',
        dosage: med.dosage || 'As directed',
        dosageStrength: extractDosageStrength(med.dosage || ''),
        frequency: mapToFrequency(med.frequency || 'once_daily'),
        timing: 'no_food_restriction',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: med.duration ? calculateEndDate(med.duration) : format(addDays(new Date(), 30), 'yyyy-MM-dd'),
        timeOfDay: 'morning',
        enableNotifications: true,
        instructions: med.instructions || '',
      }));
      
      setMedicationSchedules(initialSchedules);
    }
  }, [analysisResults]);
  
  // Extract dosage strength (e.g. "500mg" from "1 tablet of 500mg")
  const extractDosageStrength = (dosage: string): string => {
    const strengthMatch = dosage.match(/\d+\s*(?:mg|mcg|g|ml)/i);
    return strengthMatch ? strengthMatch[0] : '';
  };
  
  // Map text frequency to enum values
  const mapToFrequency = (frequency: string): string => {
    if (frequency.includes('twice') || frequency.includes('two times') || frequency.includes('2 times'))
      return 'twice_daily';
    if (frequency.includes('three times') || frequency.includes('3 times'))
      return 'three_times_daily'; 
    if (frequency.includes('four times') || frequency.includes('4 times'))
      return 'four_times_daily';
    if (frequency.toLowerCase().includes('as needed') || frequency.toLowerCase().includes('prn'))
      return 'as_needed';
    return 'once_daily'; // default
  };
  
  // Calculate end date based on duration text
  const calculateEndDate = (duration: string): string => {
    const daysMatch = duration.match(/(\d+)\s*days?/i);
    const weeksMatch = duration.match(/(\d+)\s*weeks?/i);
    const monthsMatch = duration.match(/(\d+)\s*months?/i);
    
    let days = 0;
    if (daysMatch) days += parseInt(daysMatch[1]);
    if (weeksMatch) days += parseInt(weeksMatch[1]) * 7;
    if (monthsMatch) days += parseInt(monthsMatch[1]) * 30;
    
    // Default to 30 days if no valid duration found
    if (days === 0) days = 30;
    
    return format(addDays(new Date(), days), 'yyyy-MM-dd');
  };
  
  // Update medication schedule settings
  const updateMedicationSchedule = (index: number, field: string, value: any) => {
    const updatedSchedules = [...medicationSchedules];
    updatedSchedules[index] = {
      ...updatedSchedules[index],
      [field]: value
    };
    setMedicationSchedules(updatedSchedules);
  };
  
  // Create medication schedules when prescription is created
  const createMedicationScheduleMutation = useMutation({
    mutationFn: async (scheduleData: any) => {
      const res = await apiRequest('POST', '/api/medication-schedules', scheduleData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Medication Schedule Created',
        description: 'Your medication schedule has been created with reminders',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/medication-schedules'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Schedule Creation Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create preview URL
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
      
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setBase64Image(base64);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Upload and analyze prescription
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!base64Image || !user?.id) {
        throw new Error('Please select a prescription image to upload');
      }
      
      const data = {
        image: base64Image,
        patientId: user.id,
        notes: notes,
      };
      
      const res = await apiRequest('POST', '/api/ocr-prescription/upload', data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Prescription Analyzed',
        description: 'Your prescription has been successfully processed',
      });
      
      // Store upload ID and extracted data
      setUploadId(data.id);
      
      // Parse the extracted text from JSON string if it exists
      if (data.extractedText) {
        try {
          const extractedData = JSON.parse(data.extractedText);
          setAnalysisResults(extractedData);
        } catch (error) {
          console.error("Error parsing extracted text:", error);
          setAnalysisResults({
            medications: [],
            doctor: {},
            diagnosis: "Error parsing prescription data"
          });
        }
      } else {
        // Handle case where no text was extracted
        setAnalysisResults({
          medications: [],
          doctor: {},
          diagnosis: "No data could be extracted from the prescription"
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Analysis Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Convert OCR results to prescription
  const convertToPrescriptionMutation = useMutation({
    mutationFn: async () => {
      if (!uploadId) {
        throw new Error('No prescription upload to convert');
      }
      
      const res = await apiRequest('POST', `/api/ocr-prescription/convert/${uploadId}`);
      return await res.json();
    },
    onSuccess: (data) => {
      setPrescriptionCreated(true);
      
      toast({
        title: 'Prescription Created',
        description: 'Your prescription has been created and sent to the pharmacy',
      });
      
      // Store the prescription ID for billing if needed
      if (data && data.prescriptionId) {
        console.log('Created prescription with ID:', data.prescriptionId);
      } else {
        console.warn('No prescription ID returned from conversion');
      }
      
      // Don't navigate away immediately so user can generate bill
      // navigate('/patient/prescriptions');
    },
    onError: (error: Error) => {
      toast({
        title: 'Conversion Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Generate bill from prescription
  const generateBillMutation = useMutation({
    mutationFn: async (prescriptionId: number) => {
      if (!prescriptionId) {
        throw new Error('No prescription found to generate bill');
      }
      
      const res = await apiRequest('POST', `/api/billing/generate/${prescriptionId}`);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Bill Generated',
        description: 'A bill has been generated based on your prescription',
      });
      
      // Navigate to billing page
      navigate('/patient/billing');
    },
    onError: (error: Error) => {
      toast({
        title: 'Billing Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Reset all states
  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setBase64Image(null);
    setNotes('');
    setAnalysisResults(null);
    setUploadId(null);
    setPrescriptionCreated(false);
  };
  
  // Render medications from analysis results
  const renderMedications = () => {
    if (!analysisResults || !analysisResults.medications || !analysisResults.medications.length) {
      return (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No medications detected in the prescription</p>
        </div>
      );
    }
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Medication</TableHead>
            <TableHead>Dosage</TableHead>
            <TableHead>Frequency</TableHead>
            <TableHead>Duration</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {analysisResults.medications.map((med: any, index: number) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{med.name || "Unknown"}</TableCell>
              <TableCell>{med.dosage || "As directed"}</TableCell>
              <TableCell>{med.frequency || "As needed"}</TableCell>
              <TableCell>{med.duration || "As prescribed"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };
  
  // Render medication scheduling configuration
  const renderMedicationScheduling = () => {
    if (!medicationSchedules.length) {
      return (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No medications available for scheduling</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        {medicationSchedules.map((schedule, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{schedule.medicationName}</h4>
              <Badge variant="outline">{schedule.dosageStrength || schedule.dosage}</Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor={`frequency-${index}`}>Frequency</Label>
                  <Select 
                    value={schedule.frequency} 
                    onValueChange={(value) => updateMedicationSchedule(index, 'frequency', value)}
                  >
                    <SelectTrigger id={`frequency-${index}`}>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once_daily">Once Daily</SelectItem>
                      <SelectItem value="twice_daily">Twice Daily</SelectItem>
                      <SelectItem value="three_times_daily">Three Times Daily</SelectItem>
                      <SelectItem value="four_times_daily">Four Times Daily</SelectItem>
                      <SelectItem value="as_needed">As Needed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor={`timing-${index}`}>Timing</Label>
                  <Select 
                    value={schedule.timing} 
                    onValueChange={(value) => updateMedicationSchedule(index, 'timing', value)}
                  >
                    <SelectTrigger id={`timing-${index}`}>
                      <SelectValue placeholder="Select timing" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="before_food">Before Food</SelectItem>
                      <SelectItem value="with_food">With Food</SelectItem>
                      <SelectItem value="after_food">After Food</SelectItem>
                      <SelectItem value="no_food_restriction">No Food Restriction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1">
                  <Label>Time of Day</Label>
                  <RadioGroup 
                    value={schedule.timeOfDay} 
                    onValueChange={(value) => updateMedicationSchedule(index, 'timeOfDay', value)}
                    className="flex space-x-4 pt-1"
                  >
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="morning" id={`morning-${index}`} />
                      <Label htmlFor={`morning-${index}`} className="cursor-pointer">Morning</Label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="afternoon" id={`afternoon-${index}`} />
                      <Label htmlFor={`afternoon-${index}`} className="cursor-pointer">Afternoon</Label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="evening" id={`evening-${index}`} />
                      <Label htmlFor={`evening-${index}`} className="cursor-pointer">Evening</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="grid gap-1">
                    <Label htmlFor={`notifications-${index}`}>Notifications</Label>
                    <span className="text-sm text-muted-foreground">Receive reminders for this medication</span>
                  </div>
                  <Switch
                    id={`notifications-${index}`}
                    checked={schedule.enableNotifications}
                    onCheckedChange={(checked) => updateMedicationSchedule(index, 'enableNotifications', checked)}
                  />
                </div>
                
                <div className="space-y-1">
                  <Label>Start/End Dates</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor={`start-date-${index}`} className="sr-only">Start Date</Label>
                      <input
                        id={`start-date-${index}`}
                        type="date"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={schedule.startDate}
                        min={format(new Date(), 'yyyy-MM-dd')}
                        onChange={(e) => updateMedicationSchedule(index, 'startDate', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`end-date-${index}`} className="sr-only">End Date</Label>
                      <input
                        id={`end-date-${index}`}
                        type="date"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={schedule.endDate}
                        min={schedule.startDate}
                        onChange={(e) => updateMedicationSchedule(index, 'endDate', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor={`instructions-${index}`}>Additional Instructions</Label>
                  <Textarea
                    id={`instructions-${index}`}
                    placeholder="Any special instructions"
                    className="resize-none"
                    value={schedule.instructions}
                    onChange={(e) => updateMedicationSchedule(index, 'instructions', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
        
        <Button
          className="w-full"
          onClick={() => {
            if (medicationSchedules.length > 0) {
              createMedicationScheduleMutation.mutate(medicationSchedules);
            }
          }}
          disabled={createMedicationScheduleMutation.isPending || medicationSchedules.length === 0}
        >
          {createMedicationScheduleMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving Schedules...
            </>
          ) : (
            <>
              <BellRing className="mr-2 h-4 w-4" />
              Save Medication Schedules
            </>
          )}
        </Button>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Upload Prescription</h1>
        <p className="text-muted-foreground">
          Upload a prescription image for AI-powered analysis
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Tabs defaultValue="upload">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="upload">Upload Prescription</TabsTrigger>
            <TabsTrigger value="samples">Sample Prescriptions</TabsTrigger>
            <TabsTrigger value="reminders">Medication Reminders</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Prescription Image</CardTitle>
                  <CardDescription>
                    Take a clear photo or scan of your prescription
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div 
                      className={`
                        border-2 border-dashed rounded-lg p-8 w-full h-48 flex flex-col items-center justify-center
                        ${previewUrl ? 'border-primary' : 'border-muted-foreground/25'}
                        ${uploadMutation.isPending ? 'bg-muted/50' : 'hover:bg-muted/50 cursor-pointer'}
                      `}
                      onClick={() => !uploadMutation.isPending && document.getElementById('prescription-upload')?.click()}
                    >
                      {previewUrl ? (
                        <div className="relative w-full h-full">
                          <img src={previewUrl} alt="Prescription preview" className="object-contain w-full h-full" />
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="absolute top-0 right-0 bg-background" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReset();
                            }}
                            disabled={uploadMutation.isPending}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <FileImage className="h-10 w-10 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground text-center">
                            {uploadMutation.isPending ? (
                              <span className="flex items-center">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Analyzing prescription...
                              </span>
                            ) : (
                              <span>
                                Click to upload or drag and drop<br />
                                JPG, PNG or PDF (max 10MB)
                              </span>
                            )}
                          </p>
                        </>
                      )}
                      <input 
                        id="prescription-upload" 
                        type="file" 
                        accept="image/jpeg,image/png,application/pdf" 
                        className="hidden" 
                        onChange={handleFileChange}
                        disabled={uploadMutation.isPending}
                      />
                    </div>
                    
                    <Textarea 
                      placeholder="Add notes about this prescription (optional)" 
                      className="resize-none" 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      disabled={uploadMutation.isPending}
                    />
                    
                    <div className="flex w-full justify-between space-x-2">
                      <Button 
                        variant="outline" 
                        className="w-1/2"
                        onClick={handleReset}
                        disabled={!selectedFile || uploadMutation.isPending}
                      >
                        Reset
                      </Button>
                      <Button 
                        className="w-1/2"
                        onClick={() => uploadMutation.mutate()}
                        disabled={!base64Image || uploadMutation.isPending}
                      >
                        {uploadMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Analyze Prescription
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col text-xs text-muted-foreground space-y-2">
                  <p>
                    Our AI will extract medication details, dosage, and other information from your prescription.
                  </p>
                  <p>
                    For best results, ensure the prescription is well-lit and clearly legible.
                  </p>
                </CardFooter>
              </Card>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="mr-2 h-5 w-5" /> Analysis Results
                    </CardTitle>
                    <CardDescription>
                      {analysisResults ? 'Extracted information from your prescription' : 'Upload a prescription to see results'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analysisResults ? (
                      <Tabs defaultValue="medications">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="medications">Medications</TabsTrigger>
                          <TabsTrigger value="schedule">Schedule</TabsTrigger>
                          <TabsTrigger value="doctor">Doctor</TabsTrigger>
                          <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="medications" className="mt-4">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <h3 className="text-lg font-semibold">Prescribed Medications</h3>
                              <Badge variant="outline">
                                {analysisResults.medications?.length || 0} items
                              </Badge>
                            </div>
                            {renderMedications()}
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="schedule" className="mt-4">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <h3 className="text-lg font-semibold">Medication Schedule</h3>
                              <Badge variant="outline">
                                Configure Reminders
                              </Badge>
                            </div>
                            {renderMedicationScheduling()}
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="doctor" className="mt-4">
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Doctor Information</h3>
                            <div className="grid grid-cols-2 gap-y-2">
                              <div className="text-sm text-muted-foreground">Name:</div>
                              <div className="text-sm font-medium">
                                {analysisResults.doctor?.name || "Not detected"}
                              </div>
                              
                              <div className="text-sm text-muted-foreground">Specialization:</div>
                              <div className="text-sm font-medium">
                                {analysisResults.doctor?.specialization || "Not detected"}
                              </div>
                              
                              <div className="text-sm text-muted-foreground">Contact:</div>
                              <div className="text-sm font-medium">
                                {analysisResults.doctor?.contact || "Not detected"}
                              </div>
                              
                              <div className="text-sm text-muted-foreground">Hospital/Clinic:</div>
                              <div className="text-sm font-medium">
                                {analysisResults.doctor?.clinic || "Not detected"}
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="diagnosis" className="mt-4">
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Medical Information</h3>
                            <div className="grid grid-cols-2 gap-y-2">
                              <div className="text-sm text-muted-foreground">Diagnosis:</div>
                              <div className="text-sm font-medium">
                                {analysisResults.diagnosis || "Not detected"}
                              </div>
                              
                              <div className="text-sm text-muted-foreground">Date:</div>
                              <div className="text-sm font-medium">
                                {analysisResults.date || "Not detected"}
                              </div>
                              
                              <div className="text-sm text-muted-foreground">Follow-up:</div>
                              <div className="text-sm font-medium">
                                {analysisResults.followUp || "Not specified"}
                              </div>
                            </div>
                            
                            <div className="pt-2">
                              <div className="text-sm text-muted-foreground">Additional Instructions:</div>
                              <div className="text-sm mt-1 p-2 bg-muted rounded">
                                {analysisResults.instructions || "No additional instructions detected"}
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-center text-muted-foreground">
                          Upload a prescription image to see analysis results here.
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-3">
                    {prescriptionCreated ? (
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-900 space-y-3">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <p className="font-medium text-green-700 dark:text-green-300">Prescription Created Successfully</p>
                        </div>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          Your prescription has been created and sent to the pharmacy.
                        </p>
                        <Button 
                          variant="outline" 
                          className="w-full" 
                          disabled={!convertToPrescriptionMutation.data?.prescriptionId || generateBillMutation.isPending}
                          onClick={() => {
                            if (convertToPrescriptionMutation.data?.prescriptionId) {
                              generateBillMutation.mutate(convertToPrescriptionMutation.data.prescriptionId);
                            }
                          }}
                        >
                          {generateBillMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <FilePen className="mr-2 h-4 w-4" />
                              Generate Bill
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="w-full" 
                          onClick={handleReset}
                        >
                          <Undo2 className="mr-2 h-4 w-4" />
                          Upload New Prescription
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        className="w-full" 
                        disabled={!analysisResults || convertToPrescriptionMutation.isPending || !uploadId}
                        onClick={() => convertToPrescriptionMutation.mutate()}
                      >
                        {convertToPrescriptionMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <FilePlus2 className="mr-2 h-4 w-4" />
                            Convert to Prescription
                          </>
                        )}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="samples" className="mt-6">
            <SamplePrescriptions />
          </TabsContent>
          
          <TabsContent value="reminders" className="mt-6">
            <MedicationReminderForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}