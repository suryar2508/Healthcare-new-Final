import { useState, useRef } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Camera, FileUp, Loader2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function OCRPrescriptionPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [analysisId, setAnalysisId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutation for uploading prescription image
  const uploadMutation = useMutation({
    mutationFn: async (data: { image: string; patientId: string }) => {
      const res = await apiRequest("POST", "/api/ocr-prescription/upload", data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Upload successful",
        description: "Prescription image has been uploaded and queued for OCR analysis",
      });
      setAnalysisId(data.id);
      setActiveTab("results");
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
          : "OCR analysis is still in progress",
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

  // Handle file selection for upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image file under 5MB",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle camera capture
  const handleStartCapture = async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      toast({
        title: "Camera error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
      setIsCapturing(false);
    }
  };

  const handleCaptureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to base64 image
      const imageData = canvas.toDataURL("image/jpeg");
      setImagePreview(imageData);
      
      // Stop camera stream
      const stream = video.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      video.srcObject = null;
      setIsCapturing(false);
    }
  };

  // Handle upload submission
  const handleUpload = () => {
    if (!imagePreview) {
      toast({
        title: "No image selected",
        description: "Please select or capture an image first",
        variant: "destructive",
      });
      return;
    }

    if (!selectedPatientId) {
      toast({
        title: "No patient selected",
        description: "Please select a patient for this prescription",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate({
      image: imagePreview,
      patientId: selectedPatientId,
    });
  };

  // Handle analysis refresh
  const handleRefreshAnalysis = () => {
    if (analysisId) {
      analysisMutation.mutate(analysisId);
    }
  };

  // Mock patient data - in a real app, this would come from an API call
  const patients = [
    { id: "1", name: "John Doe" },
    { id: "2", name: "Jane Smith" },
    { id: "3", name: "Robert Johnson" },
  ];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Prescription OCR Analysis</h1>
      
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
                Upload a clear image of a prescription for automated OCR analysis
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="grid gap-6">
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
                  
                  {!isCapturing ? (
                    <Button 
                      variant="outline" 
                      onClick={handleStartCapture}
                      disabled={uploadMutation.isPending}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Use Camera
                    </Button>
                  ) : (
                    <Button 
                      variant="default"
                      onClick={handleCaptureImage}
                    >
                      Capture Photo
                    </Button>
                  )}
                </div>

                {isCapturing && (
                  <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
                    <video 
                      ref={videoRef} 
                      className="w-full h-full object-cover"
                      autoPlay 
                      playsInline
                    ></video>
                  </div>
                )}

                <canvas ref={canvasRef} className="hidden"></canvas>
                
                {imagePreview && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Preview:</p>
                    <div className="border rounded-md p-2 bg-muted">
                      <img 
                        src={imagePreview} 
                        alt="Prescription preview" 
                        className="max-h-[300px] mx-auto" 
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="patient">Select Patient</Label>
                  <Select 
                    value={selectedPatientId} 
                    onValueChange={setSelectedPatientId}
                    disabled={uploadMutation.isPending}
                  >
                    <SelectTrigger id="patient">
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map(patient => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handleUpload}
                disabled={!imagePreview || !selectedPatientId || uploadMutation.isPending}
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : "Upload for OCR Analysis"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="results" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>OCR Analysis Results</CardTitle>
              <CardDescription>
                View the extracted information from the prescription image
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {analysisMutation.isPending ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : analysisMutation.data ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Status:</p>
                      <p className="text-sm">
                        {analysisMutation.data.status === "completed" ? (
                          <span className="text-green-600 font-medium">Completed</span>
                        ) : (
                          <span className="text-amber-600 font-medium">In Progress</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Uploaded:</p>
                      <p className="text-sm">
                        {new Date(analysisMutation.data.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  {analysisMutation.data.status === "completed" && analysisMutation.data.analysisResults ? (
                    <div className="border rounded-md p-4 bg-muted mt-4">
                      <pre className="text-sm whitespace-pre-wrap">
                        {JSON.stringify(analysisMutation.data.analysisResults, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <Alert className="mt-4">
                      <AlertTitle>Analysis in progress</AlertTitle>
                      <AlertDescription>
                        The prescription image is still being processed. Please check back later.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <Alert className="mt-4">
                  <AlertTitle>No data available</AlertTitle>
                  <AlertDescription>
                    Click the refresh button to load the analysis results.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleRefreshAnalysis}
                disabled={analysisMutation.isPending || !analysisId}
              >
                {analysisMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Refresh Analysis
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}