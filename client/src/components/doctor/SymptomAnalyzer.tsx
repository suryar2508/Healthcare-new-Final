import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Brain, Loader2 } from "lucide-react";

export default function SymptomAnalyzer() {
  const [symptom, setSymptom] = useState("");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const { toast } = useToast();
  
  const analysisMutation = useMutation({
    mutationFn: async (symptoms: string[]) => {
      // Convert array to comma-separated string for query parameter
      const symptomsParam = symptoms.join(",");
      const res = await apiRequest("GET", `/api/symptom-diagnosis?symptoms=${symptomsParam}`);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Analysis complete",
        description: "AI has analyzed the symptoms",
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
  
  const handleAddSymptom = () => {
    if (symptom.trim() && !symptoms.includes(symptom.trim())) {
      setSymptoms([...symptoms, symptom.trim()]);
      setSymptom("");
    }
  };
  
  const handleRemoveSymptom = (index: number) => {
    setSymptoms(symptoms.filter((_, i) => i !== index));
  };
  
  const handleAnalyze = () => {
    if (symptoms.length > 0) {
      analysisMutation.mutate(symptoms);
    } else {
      toast({
        title: "No symptoms",
        description: "Please add at least one symptom to analyze",
        variant: "destructive",
      });
    }
  };
  
  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Brain className="mr-2 h-5 w-5 text-primary" />
          AI Symptom Analyzer
        </CardTitle>
        <CardDescription>
          Input patient symptoms for AI-powered diagnosis suggestions
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid gap-4">
          <div className="flex gap-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="symptom">Add Symptom</Label>
              <Input
                id="symptom"
                placeholder="e.g., persistent cough, fever, fatigue"
                value={symptom}
                onChange={(e) => setSymptom(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSymptom();
                  }
                }}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddSymptom}>Add</Button>
            </div>
          </div>
          
          {symptoms.length > 0 && (
            <div>
              <Label className="mb-2 block">Added Symptoms:</Label>
              <div className="flex flex-wrap gap-2">
                {symptoms.map((s, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
                    {s}
                    <button
                      onClick={() => handleRemoveSymptom(index)}
                      className="ml-2 text-xs font-medium"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {analysisMutation.isPending && (
            <div className="flex justify-center items-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Analyzing symptoms with AI...</span>
            </div>
          )}
          
          {analysisMutation.isSuccess && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Possible Diagnoses:</h3>
              {analysisMutation.data.possibleDiagnoses && 
                analysisMutation.data.possibleDiagnoses.length > 0 ? (
                <div className="space-y-3">
                  {analysisMutation.data.possibleDiagnoses.map((diagnosis: any, index: number) => (
                    <div key={index} className="border rounded-md p-3">
                      <div className="flex justify-between items-start">
                        <span className="font-medium">{diagnosis.condition}</span>
                        <Badge className={getConfidenceColor(diagnosis.confidence)}>
                          {diagnosis.confidence} confidence
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-1">
                        Matching symptoms: {diagnosis.matchingSymptoms.join(", ")}
                      </p>
                      
                      {diagnosis.testingRecommendations && diagnosis.testingRecommendations.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Recommended tests:</p>
                          <ul className="text-sm list-disc list-inside">
                            {diagnosis.testingRecommendations.map((test: string, i: number) => (
                              <li key={i}>{test}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No diagnoses could be determined. Please add more symptoms or consult with a specialist.</p>
              )}
              
              {analysisMutation.data.error && (
                <div className="text-destructive mt-2">
                  Error: {analysisMutation.data.message || analysisMutation.data.error}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleAnalyze} 
          disabled={symptoms.length === 0 || analysisMutation.isPending}
          className="w-full"
        >
          {analysisMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Analyze Symptoms with AI"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}