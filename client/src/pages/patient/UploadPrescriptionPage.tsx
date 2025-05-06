import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileUp, Camera, X, Upload, FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function UploadPrescriptionPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [analysisId, setAnalysisId] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mutation for uploading prescription image
  const uploadMutation = useMutation({
    mutationFn: async (image: string) => {
      const res = await apiRequest("POST", "/api/ocr-prescription/upload", {
        image,
        patientId: user?.id,
      });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Upload successful",
        description: data.analysisResults 
          ? "Prescription analyzed successfully with AI" 
          : "Prescription uploaded and queued for analysis",
      });
      setAnalysisId(data.id);
      setActiveTab("results");
      
      // If we have results immediately, fetch them
      if (data.analysisResults) {
        analysisMutation.mutate(data.id);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for fetching analysis results
  const analysisMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("GET", `/api/ocr-prescription/analysis/${id}`);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Analysis retrieved",
        description: data.status === "completed" 
          ? "OCR analysis is complete" 
          : data.status === "failed"
          ? "Analysis failed. Please try again."
          : "Analysis is still in progress",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to retrieve analysis",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCameraToggle = async () => {
    setIsCapturing(!isCapturing);
    if (!isCapturing) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (err) {
        toast({
          title: "Camera access error",
          description: "Could not access your camera. Please check permissions.",
          variant: "destructive",
        });
      }
    } else {
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        setImagePreview(canvas.toDataURL('image/jpeg'));
        stopCamera();
        setIsCapturing(false);
      }
    }
  };

  const handleUpload = () => {
    if (!imagePreview) {
      toast({
        title: "No image selected",
        description: "Please select or capture an image first",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate(imagePreview);
  };

  const clearImage = () => {
    setImagePreview(null);
  };

  const formatMedication = (medication: any) => {
    const details = [];
    if (medication.dosage) details.push(medication.dosage);
    if (medication.frequency) details.push(medication.frequency);
    if (medication.duration) details.push(`for ${medication.duration}`);
    return details.join(', ');
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Prescription Upload & Analysis</h1>
      <p className="text-muted-foreground mb-6">
        Upload a prescription image to extract medication details and generate a bill automatically
      </p>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload Prescription</TabsTrigger>
          <TabsTrigger value="results" disabled={!analysisId}>Analysis Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Prescription Image</CardTitle>
              <CardDescription>
                Upload a clear image of your prescription for automated AI analysis
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadMutation.isPending || isCapturing}
                  >
                    <FileUp className="mr-2 h-4 w-4" />
                    Select Image
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                  
                  <Button 
                    variant="outline" 
                    onClick={handleCameraToggle}
                    disabled={uploadMutation.isPending}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    {isCapturing ? "Stop Camera" : "Use Camera"}
                  </Button>
                </div>
                
                {isCapturing && (
                  <div className="relative border rounded-md overflow-hidden mt-4">
                    <video
                      ref={videoRef}
                      className="w-full h-auto"
                      autoPlay
                      playsInline
                    />
                    <Button
                      className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
                      onClick={captureImage}
                    >
                      Capture Image
                    </Button>
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                )}
                
                {!isCapturing && imagePreview && (
                  <div className="relative border rounded-md overflow-hidden mt-4">
                    <img
                      src={imagePreview}
                      alt="Prescription Preview"
                      className="w-full h-auto object-contain max-h-[300px]"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-8 w-8 p-0"
                      onClick={clearImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handleUpload}
                disabled={!imagePreview || uploadMutation.isPending}
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload for Analysis
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="results" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Analysis Results</CardTitle>
                <CardDescription>
                  AI-extracted information from your prescription
                </CardDescription>
              </div>
              <div>
                {analysisMutation.data?.status && (
                  <Badge 
                    variant={
                      analysisMutation.data.status === "completed" ? "default" : 
                      analysisMutation.data.status === "failed" ? "destructive" : 
                      "outline"
                    }
                  >
                    {analysisMutation.data.status === "completed" ? "Analyzed" : 
                     analysisMutation.data.status === "failed" ? "Failed" : 
                     "Processing"}
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              {analysisMutation.isPending ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : analysisMutation.error ? (
                <div className="text-center py-8">
                  <p className="text-destructive">Error retrieving analysis</p>
                  <p className="text-muted-foreground mt-2">{(analysisMutation.error as Error).message}</p>
                </div>
              ) : analysisMutation.data?.analysisResults ? (
                <div className="space-y-4">
                  {/* Doctor Info */}
                  {analysisMutation.data.analysisResults.doctor && (
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-2">Doctor Information</h3>
                      <div className="text-sm space-y-1">
                        <p><span className="font-medium">Name:</span> {analysisMutation.data.analysisResults.doctor.name}</p>
                        {analysisMutation.data.analysisResults.doctor.specialization && (
                          <p><span className="font-medium">Specialization:</span> {analysisMutation.data.analysisResults.doctor.specialization}</p>
                        )}
                        {analysisMutation.data.analysisResults.doctor.contactInfo && (
                          <p><span className="font-medium">Contact:</span> {analysisMutation.data.analysisResults.doctor.contactInfo}</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Medications Table */}
                  {analysisMutation.data.analysisResults.medications && analysisMutation.data.analysisResults.medications.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2">Prescribed Medications</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Medication</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead>Instructions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {analysisMutation.data.analysisResults.medications.map((med: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{med.name}</TableCell>
                              <TableCell>{formatMedication(med)}</TableCell>
                              <TableCell>{med.instructions}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                  
                  {/* Diagnosis */}
                  {analysisMutation.data.analysisResults.diagnosis && (
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-2">Diagnosis</h3>
                      <p className="text-sm">{analysisMutation.data.analysisResults.diagnosis}</p>
                    </div>
                  )}
                  
                  {/* Additional Notes */}
                  {analysisMutation.data.analysisResults.additionalNotes && (
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-2">Additional Notes</h3>
                      <p className="text-sm">{analysisMutation.data.analysisResults.additionalNotes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Click "Analysis Results" to load the results of your prescription scan</p>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setActiveTab("upload")}
              >
                Back to Upload
              </Button>
              
              {analysisMutation.data?.analysisResults && (
                <Button
                  onClick={() => {
                    toast({
                      title: "Generating bill",
                      description: "Prescription has been sent to the pharmacist for processing and billing",
                    });
                  }}
                >
                  Generate Bill
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}