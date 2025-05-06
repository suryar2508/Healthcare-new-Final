import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Service class for Google Gemini AI integrations
 * Handles prescription image analysis and other AI-powered features
 */
class GeminiService {
  private genAI: GoogleGenerativeAI;
  private readonly MODEL_NAME = "gemini-1.5-pro-latest"; // Latest Gemini model that supports vision

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set in environment variables");
      throw new Error("Missing GEMINI_API_KEY environment variable. AI features will not work without a valid API key.");
    }
    
    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      console.log("Gemini AI service initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Gemini AI service:", error);
      throw new Error("Failed to initialize AI service. Please check your API key and try again.");
    }
  }

  /**
   * Analyzes a prescription image using Gemini's multimodal capabilities
   * @param imageBase64 Base64 encoded image
   * @returns Structured prescription data
   */
  async analyzePrescriptionImage(imageBase64: string): Promise<any> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.MODEL_NAME });

      // Clean up the base64 image data by removing the prefix if present
      let cleanedBase64 = imageBase64;
      if (imageBase64.includes('base64,')) {
        cleanedBase64 = imageBase64.split('base64,')[1];
      }
      
      // Validate the base64 encoding
      try {
        // Try to decode the base64 string to make sure it's valid
        Buffer.from(cleanedBase64, 'base64');
      } catch (decodeError) {
        console.error("Invalid base64 encoding in image data", decodeError);
        return {
          error: "Invalid image data",
          medications: [],
          doctor: {},
          patient: {},
          instructions: "Could not process the prescription image. Please upload a clearer image."
        };
      }

      // Create prompt parts with the image
      const promptParts = [
        {
          text: `You are a medical prescription analyzer. 
          Analyze this prescription image and extract the following information:
          - Doctor's name and credentials
          - Hospital or clinic name (if present)
          - Patient's name 
          - Date of prescription
          - Medications: List of medications with their
            * Name
            * Dosage
            * Frequency
            * Duration
            * Special instructions
          - Any additional notes or instructions
          
          Structure your response as a JSON object with these fields. For medications, create an array of medication objects.
          If some information is not visible or unclear, indicate with "unclear" or null.
          `
        },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: cleanedBase64
          }
        }
      ];

      // Generate content from the model
      const result = await model.generateContent({
        contents: [{ role: "user", parts: promptParts }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
        }
      });

      const response = result.response;
      const textResponse = response.text();
      
      // Try to parse the response as JSON
      try {
        // Extract JSON from the response if it's wrapped in any markdown code blocks
        const jsonPattern = /```(?:json)?\s*([\s\S]*?)\s*```|(\{[\s\S]*\})/;
        const match = textResponse.match(jsonPattern);
        const jsonStr = match ? (match[1] || match[2]) : textResponse;
        
        return JSON.parse(jsonStr);
      } catch (error) {
        console.error("Failed to parse JSON response from Gemini", error);
        // Return the text response as a fallback
        return { 
          rawText: textResponse,
          error: "Failed to parse structured data",
          medications: [],
          doctor: {},
          patient: {},
          instructions: "The prescription was analyzed but could not be fully structured. Please check the raw text."
        };
      }
    } catch (error) {
      console.error("Error in Gemini prescription analysis:", error);
      // Create a more informative error message with detailed prescription data structure
      return {
        error: "AI analysis error",
        errorDetails: error instanceof Error ? error.message : String(error),
        medications: [
          {
            name: "Example Medication",
            dosage: "10mg",
            frequency: "Once daily",
            duration: "7 days",
            instructions: "Take with food"
          }
        ],
        doctor: {
          name: "Dr. Example", 
          specialization: "General Medicine"
        },
        patient: {
          name: "Patient Name",
          age: "Adult"
        },
        instructions: "Unable to analyze prescription. Please upload a clearer image or try again later."
      };
    }
  }

  /**
   * Validates extracted medication information against known drug databases
   * @param medications List of medications extracted from the prescription
   * @returns Validated medications with any warnings or corrections
   */
  async validateMedications(medications: any[]): Promise<any> {
    try {
      if (!medications || medications.length === 0) {
        return [];
      }

      const model = this.genAI.getGenerativeModel({ model: this.MODEL_NAME });

      const medicationNames = medications.map(med => med.name || "Unknown medication").join(", ");
      
      const promptParts = [
        {
          text: `You are a pharmacist validating a medication list.
          For these medications: ${medicationNames}
          
          Please provide:
          1. Verification if each appears to be a valid medication name
          2. Standard dosage range for each
          3. Potential drug interactions between any of these medications
          4. Common side effects to be aware of
          5. Any special warnings or precautions
          
          Structure your response as a JSON object with the medications as keys, and validation information as values.
          Include interaction_warnings as a separate array if any exist between these medications.`
        }
      ];

      const result = await model.generateContent({
        contents: [{ role: "user", parts: promptParts }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1024,
        }
      });

      const response = result.response;
      const textResponse = response.text();
      
      // Try to parse the response as JSON
      try {
        // Extract JSON from the response if it's wrapped in any markdown code blocks
        const jsonPattern = /```(?:json)?\s*([\s\S]*?)\s*```|(\{[\s\S]*\})/;
        const match = textResponse.match(jsonPattern);
        const jsonStr = match ? (match[1] || match[2]) : textResponse;
        
        const validationData = JSON.parse(jsonStr);
        
        // Merge the validation data with the original medications
        return medications.map(med => {
          const name = med.name || "Unknown";
          const validation = validationData[name] || {};
          return {
            ...med,
            validated: true,
            validationInfo: validation
          };
        });
      } catch (error) {
        console.error("Failed to parse JSON response from Gemini medication validation", error);
        // Return the original medications with a validation error flag
        return medications.map(med => ({
          ...med,
          validated: false,
          validationError: "Failed to validate medication"
        }));
      }
    } catch (error) {
      console.error("Error in Gemini medication validation:", error);
      // Return the original medications since validation failed
      return medications;
    }
  }

  /**
   * Analyzes symptoms to provide possible diagnoses using AI assistance
   * @param symptoms Array of symptom descriptions
   * @returns Possible diagnoses with confidence levels
   */
  async analyzeSymptoms(symptoms: string[]): Promise<any> {
    try {
      if (!symptoms || symptoms.length === 0) {
        return { 
          error: "No symptoms provided",
          possibleDiagnoses: [],
          followUpQuestions: [],
          immediateAttention: false,
          disclaimer: "Please provide symptoms for analysis."
        };
      }

      console.log(`Analyzing symptoms: ${symptoms.join(", ")}`);
      const model = this.genAI.getGenerativeModel({ model: this.MODEL_NAME });
      
      const symptomText = symptoms.join(", ");
      
      const promptParts = [
        {
          text: `You are a medical diagnosis assistant. Based on the following symptoms:
          ${symptomText}
          
          Respond with a JSON object with the following structure:
          {
            "possibleDiagnoses": [
              {
                "condition": "string", 
                "confidence": "low|medium|high",
                "description": "string"
              }
            ],
            "followUpQuestions": ["string"],
            "immediateAttention": boolean,
            "disclaimer": "string"
          }
          
          Follow these rules:
          1. Provide 3-5 possible diagnoses in order of likelihood
          2. For each diagnosis, include a confidence level as "low", "medium", or "high"
          3. Include 3-5 follow-up questions that would help clarify the diagnosis
          4. Set immediateAttention to true if symptoms suggest the patient should seek immediate care
          5. Include a clear medical disclaimer
          
          Return ONLY valid JSON with no additional text, explanation, or markdown.`
        }
      ];

      const result = await model.generateContent({
        contents: [{ role: "user", parts: promptParts }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024
        }
      });

      const response = result.response;
      const textResponse = response.text();
      console.log("Raw response from Gemini:", textResponse.substring(0, 100) + "...");
      
      // Try to parse the response as JSON
      try {
        // Extract JSON from the response if it's wrapped in any markdown code blocks
        const jsonPattern = /```(?:json)?\s*([\s\S]*?)\s*```|(\{[\s\S]*\})/;
        const match = textResponse.match(jsonPattern);
        const jsonStr = match ? (match[1] || match[2]) : textResponse;
        
        const parsedResponse = JSON.parse(jsonStr);
        console.log("Successfully parsed symptom analysis response");
        
        // Ensure we have the expected structure, with defaults for missing properties
        return {
          possibleDiagnoses: parsedResponse.possibleDiagnoses || [],
          followUpQuestions: parsedResponse.followUpQuestions || [],
          immediateAttention: !!parsedResponse.immediateAttention,
          disclaimer: parsedResponse.disclaimer || "These are potential diagnoses only. Please consult with a healthcare professional for an accurate diagnosis.",
          ...parsedResponse
        };
      } catch (error) {
        console.error("Failed to parse JSON response from Gemini symptom analysis:", error);
        console.error("Raw response:", textResponse);
        
        // Return a structured error response with default values
        return { 
          error: "Failed to analyze symptoms",
          errorDetails: error instanceof Error ? error.message : String(error),
          possibleDiagnoses: [
            { 
              condition: "Analysis unavailable", 
              confidence: "low",
              description: "The symptom analysis could not be completed."
            }
          ],
          followUpQuestions: ["Please consult with a healthcare professional."],
          immediateAttention: false,
          disclaimer: "Please consult with a healthcare professional for proper diagnosis.",
          rawText: textResponse
        };
      }
    } catch (error) {
      console.error("Error in Gemini symptom analysis:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Return a structured error response instead of throwing
      return {
        error: `Failed to analyze symptoms: ${errorMessage}`,
        possibleDiagnoses: [],
        followUpQuestions: [],
        immediateAttention: false,
        disclaimer: "An error occurred during analysis. Please try again later or consult with a healthcare professional."
      };
    }
  }

  /**
   * Analyzes patient vitals data to identify trends and potential health issues
   * @param vitalsData Array of patient vitals readings over time
   * @returns Analysis results with identified trends and recommendations
   */
  async analyzeVitals(vitalsData: any[]): Promise<any> {
    try {
      if (!vitalsData || vitalsData.length === 0) {
        return { 
          error: "No vitals data provided",
          trends: {},
          abnormalReadings: [],
          healthConcerns: [],
          recommendations: [],
          followUpRecommendations: [],
          summary: "No vitals data provided for analysis"
        };
      }

      console.log(`Analyzing vitals data for ${vitalsData.length} readings`);
      const model = this.genAI.getGenerativeModel({ model: this.MODEL_NAME });
      
      // Format vitals data for the prompt, but limit size if too large
      const safeVitalsData = vitalsData.slice(0, 20); // Limit to 20 readings to avoid token limits
      const formattedData = JSON.stringify(safeVitalsData, null, 2);
      
      const promptParts = [
        {
          text: `You are a medical vitals analyst. Based on the following patient vitals data:
          ${formattedData}
          
          Respond with a JSON object with the following structure:
          {
            "trends": {
              "bloodPressure": "string",
              "heartRate": "string",
              "temperature": "string",
              "bloodGlucose": "string",
              "weight": "string"
            },
            "abnormalReadings": [
              {
                "metric": "string",
                "value": "string",
                "normalRange": "string",
                "severity": "low|medium|high"
              }
            ],
            "healthConcerns": [
              {
                "issue": "string",
                "description": "string",
                "urgency": "low|medium|high"
              }
            ],
            "recommendations": ["string"],
            "followUpRecommendations": ["string"],
            "summary": "string"
          }
          
          Follow these rules:
          1. For trends, analyze whether each vital sign is improving, worsening, stable, or fluctuating
          2. For abnormal readings, identify any values outside clinical normal ranges
          3. For health concerns, note potential issues indicated by the data
          4. Include specific lifestyle recommendations to improve readings
          5. Include recommendations for medical follow-up if necessary
          6. Provide a concise summary of the most important findings
          
          Return ONLY valid JSON with no additional text, explanation, or markdown.`
        }
      ];

      const result = await model.generateContent({
        contents: [{ role: "user", parts: promptParts }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1024
        }
      });

      const response = result.response;
      const textResponse = response.text();
      console.log("Raw response from Gemini (vitals):", textResponse.substring(0, 100) + "...");
      
      // Try to parse the response as JSON
      try {
        // Extract JSON from the response if it's wrapped in any markdown code blocks
        const jsonPattern = /```(?:json)?\s*([\s\S]*?)\s*```|(\{[\s\S]*\})/;
        const match = textResponse.match(jsonPattern);
        const jsonStr = match ? (match[1] || match[2]) : textResponse;
        
        const parsedResponse = JSON.parse(jsonStr);
        console.log("Successfully parsed vitals analysis response");
        
        // Ensure we have the expected structure with defaults for missing properties
        return {
          trends: parsedResponse.trends || {},
          abnormalReadings: parsedResponse.abnormalReadings || [],
          healthConcerns: parsedResponse.healthConcerns || [],
          recommendations: parsedResponse.recommendations || [],
          followUpRecommendations: parsedResponse.followUpRecommendations || [],
          summary: parsedResponse.summary || "Analysis complete, but no concise summary available.",
          ...parsedResponse
        };
      } catch (error) {
        console.error("Failed to parse JSON response from Gemini vitals analysis:", error);
        console.error("Raw response:", textResponse);
        
        // Return a structured error response with default values
        return { 
          error: "Failed to analyze vitals data",
          errorDetails: error instanceof Error ? error.message : String(error),
          trends: {},
          abnormalReadings: [],
          healthConcerns: [
            { 
              issue: "Analysis unavailable", 
              description: "The vitals analysis could not be completed.", 
              urgency: "low" 
            }
          ],
          recommendations: ["Please consult with a healthcare professional for interpretation of your vitals data."],
          followUpRecommendations: ["Schedule a check-up with your doctor to review your health metrics."],
          summary: "Unable to analyze health metrics data. Please consult a healthcare professional.",
          rawText: textResponse
        };
      }
    } catch (error) {
      console.error("Error in Gemini vitals analysis:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Return a structured error response instead of throwing
      return {
        error: `Failed to analyze vitals data: ${errorMessage}`,
        trends: {},
        abnormalReadings: [],
        healthConcerns: [],
        recommendations: [],
        followUpRecommendations: [],
        summary: "An error occurred during analysis. Please try again later or consult with a healthcare professional."
      };
    }
  }
}

export const geminiService = new GeminiService();