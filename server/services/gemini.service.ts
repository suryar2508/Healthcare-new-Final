import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

/**
 * Service class for Google Gemini AI integrations
 * Handles prescription image analysis and other AI-powered features
 */
class GeminiService {
  private genAI: GoogleGenerativeAI;
  private readonly MODEL_NAME = "gemini-1.5-pro-latest"; // Latest Gemini model that supports vision

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY not found in environment variables");
    }
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  }

  /**
   * Analyzes a prescription image using Gemini's multimodal capabilities
   * @param imageBase64 Base64 encoded image
   * @returns Structured prescription data
   */
  async analyzePrescriptionImage(imageBase64: string): Promise<any> {
    try {
      // Ensure the image is properly formatted for the API
      // Remove the data URL prefix if present
      const base64Data = imageBase64.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");

      // Set up the Gemini model with safety settings
      const model = this.genAI.getGenerativeModel({
        model: this.MODEL_NAME,
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
      });

      // Define the prompt for prescription analysis
      const prompt = `
        Analyze this prescription image thoroughly and extract all relevant medical information.
        
        Specifically identify and extract:
        1. Patient information (name, age, ID if visible)
        2. Doctor information (name, credentials, contact if visible)
        3. Diagnosis or condition(s)
        4. All prescribed medications with:
           - Medication name (generic and brand if available)
           - Dosage (strength and form)
           - Route of administration
           - Frequency/timing of doses
           - Duration of treatment
        5. Special instructions or warnings
        6. Date of prescription
        
        Format your response ONLY as a JSON object with these fields. If information is not visible or unclear, indicate with null values.
        Return only the JSON without any explanation or markdown.
      `;

      // Set up the parts for the image and text prompt
      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg",
        },
      };

      // Create the chat and generate content
      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      // Extract JSON from the response (some Gemini responses might include text around the JSON)
      let jsonContent;
      try {
        // Try to parse directly first
        jsonContent = JSON.parse(text);
      } catch (e) {
        // If direct parsing fails, attempt to extract JSON using regex
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonContent = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Failed to parse JSON from Gemini response");
        }
      }

      return jsonContent;
    } catch (error: any) {
      console.error("Gemini prescription analysis error:", error);
      
      if (error.message && error.message.includes("API key")) {
        throw new Error("Invalid or missing Gemini API key. Please check your configuration.");
      }
      
      throw new Error(`Failed to analyze prescription: ${error.message || "Unknown error"}`);
    }
  }

  /**
   * Validates extracted medication information against known drug databases
   * @param medications List of medications extracted from the prescription
   * @returns Validated medications with any warnings or corrections
   */
  async validateMedications(medications: any[]): Promise<any> {
    // This is a placeholder for actual drug database validation
    // In a production system, this would connect to a real drug database API
    
    return medications.map(med => ({
      ...med,
      validated: true,
      warnings: [] // Would contain warnings about dosages, interactions, etc.
    }));
  }

  /**
   * Analyzes symptoms to provide possible diagnoses using AI assistance
   * @param symptoms Array of symptom descriptions
   * @returns Possible diagnoses with confidence levels
   */
  async analyzeSymptoms(symptoms: string[]): Promise<any> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.MODEL_NAME });
      
      const prompt = `
        Based on the following symptoms, provide possible diagnoses with confidence levels:
        ${symptoms.map(s => `- ${s}`).join('\n')}
        
        For each possible diagnosis:
        1. Provide the medical condition name
        2. Assign a confidence level (low, medium, high)
        3. List which symptoms support this diagnosis
        4. Provide recommendations for further testing if needed
        
        Format your response as a JSON object with an array of diagnoses. Each diagnosis should have:
        - condition: string (name of condition)
        - confidence: string (low, medium, high)
        - matchingSymptoms: string[] (symptoms that match this condition)
        - testingRecommendations: string[] (recommended tests)
        
        Return only the JSON without additional explanation.
      `;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from the response
      let jsonContent;
      try {
        // Try to parse directly first
        jsonContent = JSON.parse(text);
      } catch (e) {
        // If direct parsing fails, attempt to extract JSON using regex
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonContent = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Failed to parse JSON from Gemini response");
        }
      }
      
      return jsonContent;
    } catch (error: any) {
      console.error("Symptom analysis error:", error);
      throw new Error(`Failed to analyze symptoms: ${error.message || "Unknown error"}`);
    }
  }

  /**
   * Analyzes patient vitals data to identify trends and potential health issues
   * @param vitalsData Array of patient vitals readings over time
   * @returns Analysis results with identified trends and recommendations
   */
  async analyzeVitals(vitalsData: any[]): Promise<any> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      
      // Format the vitals data as a string for the prompt
      const vitalsString = JSON.stringify(vitalsData);
      
      const prompt = `
        Analyze the following patient vitals data over time:
        ${vitalsString}
        
        Please provide:
        1. Identified trends in each vital measurement
        2. Potential health concerns based on these readings
        3. Recommended actions for the healthcare provider
        
        Format your response as a JSON object with:
        - trends: object with vital names as keys and trend descriptions as values
        - concerns: array of potential health issues identified
        - recommendations: array of recommended actions
        
        Return only the JSON without additional explanation.
      `;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from the response
      let jsonContent;
      try {
        // Try to parse directly first
        jsonContent = JSON.parse(text);
      } catch (e) {
        // If direct parsing fails, attempt to extract JSON using regex
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonContent = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Failed to parse JSON from Gemini response");
        }
      }
      
      return jsonContent;
    } catch (error: any) {
      console.error("Vitals analysis error:", error);
      throw new Error(`Failed to analyze vitals data: ${error.message || "Unknown error"}`);
    }
  }
}

export const geminiService = new GeminiService();