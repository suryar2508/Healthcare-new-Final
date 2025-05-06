import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useMutation } from '@tanstack/react-query';
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
import { Loader2, Upload, FileImage, FileText, FilePlus2, FilePen, AlertCircle, CheckCircle, Ban } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

export default function UploadPrescriptionPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  
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
      
      // Store analysis results
      setAnalysisResults(data.analysisResults);
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
      if (!analysisResults || !analysisResults.id) {
        throw new Error('No analysis results to convert');
      }
      
      const res = await apiRequest('POST', `/api/ocr-prescription/convert/${analysisResults.id}`);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Prescription Created',
        description: 'Your prescription has been created and sent to the pharmacy',
      });
      
      // Navigate to prescriptions page
      navigate('/patient/prescriptions');
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
    mutationFn: async () => {
      if (!analysisResults || !analysisResults.prescription?.id) {
        throw new Error('No prescription found to generate bill');
      }
      
      const res = await apiRequest('POST', `/api/billing/generate/${analysisResults.prescription.id}`);
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
  
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Upload Prescription</h1>
        <p className="text-muted-foreground">
          Upload a prescription image for AI-powered analysis
        </p>
      </div>
      
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
              <CardTitle>Analysis Results</CardTitle>
              <CardDescription>
                {analysisResults ? 'Extracted information from your prescription' : 'Upload a prescription to see results'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysisResults ? (
                <Tabs defaultValue="medications">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="medications">Medications</TabsTrigger>
                    <TabsTrigger value="doctor">Doctor Details</TabsTrigger>
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
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                  <FileText className="h-16 w-16 text-muted-foreground/50" />
                  <p className="text-muted-foreground text-center">
                    Upload a prescription image<br />to see the AI analysis results here
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Button 
                className="w-full" 
                disabled={!analysisResults || convertToPrescriptionMutation.isPending}
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
              
              <Button 
                variant="outline" 
                className="w-full" 
                disabled={!analysisResults || generateBillMutation.isPending}
                onClick={() => generateBillMutation.mutate()}
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
            </CardFooter>
          </Card>
          
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">How It Works</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Upload a clear photo of your prescription</li>
              <li>Our AI system will analyze and extract the information</li>
              <li>Review the extracted medications and details</li>
              <li>Convert to a digital prescription or generate a bill</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}