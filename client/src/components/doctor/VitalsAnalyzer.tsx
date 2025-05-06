import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Activity, Loader2, BarChart3, Heart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function VitalsAnalyzer() {
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [period, setPeriod] = useState<string>("week");
  const { toast } = useToast();
  
  // Get list of patients for the select dropdown
  const { data: patients, isLoading: patientsLoading } = useQuery({
    queryKey: ['/api/patients'],
    enabled: true,
  });
  
  const analysisMutation = useMutation({
    mutationFn: async (data: { patientId: number, period: string }) => {
      const res = await apiRequest("POST", `/api/patient-vitals/analyze`, data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Analysis complete",
        description: "AI has analyzed the patient's vitals",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleAnalyze = () => {
    if (!selectedPatient) {
      toast({
        title: "No patient selected",
        description: "Please select a patient to analyze vitals",
        variant: "destructive",
      });
      return;
    }
    
    analysisMutation.mutate({ 
      patientId: parseInt(selectedPatient),
      period 
    });
  };
  
  const renderTrendCard = (title: string, trend: string, trendType: "positive" | "negative" | "neutral" = "neutral") => {
    const bgColor = 
      trendType === "positive" ? "bg-green-50 border-green-100" : 
      trendType === "negative" ? "bg-red-50 border-red-100" :
      "bg-blue-50 border-blue-100";
    
    const textColor = 
      trendType === "positive" ? "text-green-800" : 
      trendType === "negative" ? "text-red-800" :
      "text-blue-800";
    
    return (
      <div className={`p-4 rounded-lg border ${bgColor} mb-3`}>
        <div className="flex items-center justify-between">
          <h4 className="font-medium">{title}</h4>
          <BarChart3 className={`h-4 w-4 ${textColor}`} />
        </div>
        <p className={`text-sm mt-1 ${textColor}`}>{trend}</p>
      </div>
    );
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="mr-2 h-5 w-5 text-primary" />
          AI Vitals Analyzer
        </CardTitle>
        <CardDescription>
          Analyze patient vitals with AI to identify health trends and potential issues
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="patient-select">Select Patient</Label>
              <Select
                value={selectedPatient}
                onValueChange={setSelectedPatient}
              >
                <SelectTrigger id="patient-select">
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent>
                  {patientsLoading ? (
                    <SelectItem value="loading" disabled>Loading patients...</SelectItem>
                  ) : patients && patients.length > 0 ? (
                    patients.map((patient: any) => (
                      <SelectItem key={patient.id} value={patient.id.toString()}>
                        {patient.firstName} {patient.lastName}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No patients found</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="period-select">Time Period</Label>
              <Select
                value={period}
                onValueChange={setPeriod}
              >
                <SelectTrigger id="period-select" className="w-[160px]">
                  <SelectValue placeholder="Select time period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Last 3 Months</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {analysisMutation.isPending && (
            <div className="flex justify-center items-center py-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Analyzing patient vitals with AI...</span>
            </div>
          )}
          
          {analysisMutation.isSuccess && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Vitals Analysis Results</h3>
              
              {analysisMutation.data.analysis ? (
                <Tabs defaultValue="trends">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="trends">Trends</TabsTrigger>
                    <TabsTrigger value="concerns">Health Concerns</TabsTrigger>
                    <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="trends" className="mt-4">
                    <div className="space-y-1">
                      {analysisMutation.data.analysis.trends && Object.entries(analysisMutation.data.analysis.trends).map(([metric, trend]: [string, any]) => {
                        const trendType = 
                          trend.includes("improved") || trend.includes("normal") || trend.includes("stable") ? "positive" :
                          trend.includes("elevated") || trend.includes("concerning") || trend.includes("declined") ? "negative" :
                          "neutral";
                        
                        return renderTrendCard(
                          metric.charAt(0).toUpperCase() + metric.slice(1).replace(/([A-Z])/g, ' $1'), 
                          trend, 
                          trendType
                        );
                      })}
                      
                      {(!analysisMutation.data.analysis.trends || Object.keys(analysisMutation.data.analysis.trends).length === 0) && (
                        <p className="text-muted-foreground">No trends identified in the available data.</p>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="concerns" className="mt-4">
                    <div className="space-y-2">
                      {analysisMutation.data.analysis.concerns && analysisMutation.data.analysis.concerns.length > 0 ? (
                        <div className="space-y-3">
                          {analysisMutation.data.analysis.concerns.map((concern: string, index: number) => (
                            <div key={index} className="p-3 bg-red-50 border border-red-100 rounded-md">
                              <div className="flex items-start gap-2">
                                <Heart className="h-5 w-5 text-red-500 mt-0.5" />
                                <p className="text-red-800">{concern}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No health concerns identified.</p>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="recommendations" className="mt-4">
                    <div className="space-y-2">
                      {analysisMutation.data.analysis.recommendations && analysisMutation.data.analysis.recommendations.length > 0 ? (
                        <ul className="space-y-2">
                          {analysisMutation.data.analysis.recommendations.map((recommendation: string, index: number) => (
                            <li key={index} className="p-3 bg-blue-50 border border-blue-100 rounded-md">
                              {recommendation}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground">No recommendations available.</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-destructive">
                  <p>{analysisMutation.data.message || "No analysis results available"}</p>
                  {analysisMutation.data.error && (
                    <p className="text-sm mt-2">Error: {analysisMutation.data.error}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleAnalyze} 
          disabled={!selectedPatient || analysisMutation.isPending}
          className="w-full"
        >
          {analysisMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Analyze Vitals with AI"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}