import type { Express, Request, Response } from "express";
import { db } from "@db";
import { eq } from "drizzle-orm";
import { ocrPrescriptionUploads, selectOcrPrescriptionUploadSchema } from "@shared/schema";
import { geminiService } from "../services/gemini.service";
import { z } from "zod";

/**
 * Routes for OCR prescription uploads and analysis
 */
export function setupOcrPrescriptionRoutes(app: Express) {
  // Upload and analyze a prescription image
  app.post("/api/ocr-prescription/upload", async (req: Request, res: Response) => {
    try {
      const { image, patientId, notes } = req.body;

      if (!image) {
        return res.status(400).json({ error: "No image provided" });
      }

      if (!patientId) {
        return res.status(400).json({ error: "Patient ID is required" });
      }

      // Extract image data from base64 URI (remove the prefix like "data:image/jpeg;base64,")
      let imageData = image;
      if (image.includes(",")) {
        imageData = image.split(",")[1];
      }

      // Process the image with Gemini AI
      const analysisResults = await geminiService.analyzePrescriptionImage(imageData);

      // Save the OCR prescription upload to the database
      const [savedUpload] = await db.insert(ocrPrescriptionUploads).values({
        patientId: patientId,
        imageUrl: image, // We're storing the full base64 image here - in production you might want to save to cloud storage
        status: "completed",
        extractedText: JSON.stringify(analysisResults),
        confidenceScore: analysisResults.confidenceScore?.toString() || "0.85",
        errorMessage: null,
        processedAt: new Date(),
      }).returning();

      return res.status(200).json({
        id: savedUpload.id,
        status: "success",
        analysisResults,
      });
    } catch (error: any) {
      console.error("Error processing prescription image:", error);
      return res.status(500).json({ 
        error: "Failed to process prescription image",
        details: error.message || String(error)
      });
    }
  });

  // Get OCR prescription upload by ID
  app.get("/api/ocr-prescription/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }

      const upload = await db.query.ocrPrescriptionUploads.findFirst({
        where: eq(ocrPrescriptionUploads.id, id),
      });

      if (!upload) {
        return res.status(404).json({ error: "Prescription upload not found" });
      }

      return res.status(200).json(upload);
    } catch (error: any) {
      console.error("Error fetching prescription upload:", error);
      return res.status(500).json({ 
        error: "Failed to fetch prescription",
        details: error.message || String(error)
      });
    }
  });

  // Get all OCR prescription uploads for a patient
  app.get("/api/ocr-prescription/patient/:patientId", async (req: Request, res: Response) => {
    try {
      const patientId = parseInt(req.params.patientId);
      
      if (isNaN(patientId)) {
        return res.status(400).json({ error: "Invalid patient ID" });
      }

      const uploads = await db.query.ocrPrescriptionUploads.findMany({
        where: eq(ocrPrescriptionUploads.patientId, patientId),
        orderBy: (ocrPrescription, { desc }) => [desc(ocrPrescription.createdAt)],
      });

      return res.status(200).json(uploads);
    } catch (error: any) {
      console.error("Error fetching patient prescription uploads:", error);
      return res.status(500).json({ 
        error: "Failed to fetch prescriptions",
        details: error.message || String(error)
      });
    }
  });

  // Convert OCR prescription to formal prescription
  app.post("/api/ocr-prescription/convert/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }

      // 1. Get the OCR upload
      const upload = await db.query.ocrPrescriptionUploads.findFirst({
        where: eq(ocrPrescriptionUploads.id, id),
      });

      if (!upload) {
        return res.status(404).json({ error: "Prescription upload not found" });
      }

      // 2. Parse the extracted text and validate the medications from the analysis
      const extractedText = upload.extractedText ? JSON.parse(upload.extractedText) : {};
      const medications = extractedText.medications || [];
      const validatedMedications = await geminiService.validateMedications(medications);

      // 3. Here you would create a prescription and prescription items in the database
      // This is a placeholder implementation
      const prescription = {
        id: Math.floor(Math.random() * 1000), // Placeholder
        patientId: upload.patientId,
        doctorId: 1, // Placeholder - would be derived from the prescription's doctor information
        medications: validatedMedications,
        createdAt: new Date(),
        status: "pending"
      };

      // 4. Update the OCR upload to mark it as converted
      await db.update(ocrPrescriptionUploads)
        .set({ 
          status: "converted",
          processedAt: new Date()
        })
        .where(eq(ocrPrescriptionUploads.id, id));

      return res.status(200).json({
        status: "success",
        prescription
      });
    } catch (error: any) {
      console.error("Error converting prescription:", error);
      return res.status(500).json({ 
        error: "Failed to convert prescription",
        details: error.message || String(error)
      });
    }
  });
}