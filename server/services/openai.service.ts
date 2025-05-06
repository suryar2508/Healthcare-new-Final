import OpenAI from "openai";

/**
 * Service class for OpenAI integrations
 * Handles prescription image analysis and other AI-powered features
 */
class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Analyzes a prescription image using OpenAI's Vision capabilities
   * @param imageBase64 Base64 encoded image
   * @returns Structured prescription data
   */
  async analyzePrescriptionImage(imageBase64: string): Promise<any> {
    try {
      // Ensure the image is properly formatted for the API
      const imageUrl = imageBase64.startsWith("data:image") 
        ? imageBase64 
        : `data:image/jpeg;base64,${imageBase64}`;

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
        
        Format your response as a JSON object with these fields. If information is not visible or unclear, indicate with null values.
        Return only the JSON without additional explanation.
      `;

      // Call the OpenAI API with vision capabilities
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000,
      });

      // Get the generated content and parse it as JSON
      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No analysis results returned from OpenAI");
      }

      return JSON.parse(content);
    } catch (error: any) {
      // Log the error for debugging but provide a clean error message
      console.error("OpenAI prescription analysis error:", error);
      if (error.code === 'insufficient_quota') {
        throw new Error("API key has insufficient quota. Please check your OpenAI account.");
      }
      throw new Error(`Failed to analyze prescription: ${error.message || "Unknown error"}`);
    }
  }

  /**
   * Validates extracted medication information against known drug databases
   * In a real system, this would check for drug interactions, correct dosages, etc.
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
}

export const openaiService = new OpenAIService();