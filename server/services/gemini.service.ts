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
    }
    this.genAI = new GoogleGenerativeAI(apiKey || "");
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
          medications: []
        };
      }
    } catch (error) {
      console.error("Error in Gemini prescription analysis:", error);
      throw new Error(`Failed to analyze prescription: ${error.message}`);
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
        return { error: "No symptoms provided" };
      }

      const model = this.genAI.getGenerativeModel({ model: this.MODEL_NAME });
      
      const symptomText = symptoms.join(", ");
      
      const promptParts = [
        {
          text: `You are a medical diagnosis assistant. Based on the following symptoms:
          ${symptomText}
          
          Please provide:
          1. Possible diagnoses in order of likelihood
          2. For each diagnosis, include a confidence estimate (low, medium, high)
          3. Suggested follow-up questions that would help clarify the diagnosis
          4. Whether the patient should seek immediate medical attention
          
          Structure your response as a JSON object.
          
          Be careful not to provide absolute diagnoses - these are suggestions that should be confirmed by a healthcare professional.
          Include a clear disclaimer at the end of your response.`
        }
      ];

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
        console.error("Failed to parse JSON response from Gemini symptom analysis", error);
        // Return a structured error response
        return { 
          error: "Failed to analyze symptoms",
          rawText: textResponse
        };
      }
    } catch (error) {
      console.error("Error in Gemini symptom analysis:", error);
      throw new Error(`Failed to analyze symptoms: ${error.message}`);
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
        return { error: "No vitals data provided" };
      }

      const model = this.genAI.getGenerativeModel({ model: this.MODEL_NAME });
      
      // Format vitals data for the prompt
      const formattedData = JSON.stringify(vitalsData, null, 2);
      
      const promptParts = [
        {
          text: `You are a medical vitals analyst. Based on the following patient vitals data:
          ${formattedData}
          
          Please provide:
          1. Analysis of trends for each vital sign
          2. Identification of any readings outside normal ranges
          3. Potential health concerns based on the data
          4. Suggestions for improving or maintaining healthy readings
          5. Recommendations for follow-up with healthcare providers if needed
          
          Structure your response as a JSON object with sections for each of the above categories.
          Include a summary section with the most important findings.`
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
        
        return JSON.parse(jsonStr);
      } catch (error) {
        console.error("Failed to parse JSON response from Gemini vitals analysis", error);
        // Return a structured error response
        return { 
          error: "Failed to analyze vitals data",
          rawText: textResponse
        };
      }
    } catch (error) {
      console.error("Error in Gemini vitals analysis:", error);
      throw new Error(`Failed to analyze vitals data: ${error.message}`);
    }
  }
}

export const geminiService = new GeminiService();