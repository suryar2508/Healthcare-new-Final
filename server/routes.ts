import { Router, type Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertUserSchema,
  insertDoctorSchema,
  insertPatientSchema,
  insertAppointmentSchema,
  insertPrescriptionSchema,
  insertHealthMetricSchema,
  insertMedicationScheduleSchema,
} from "@shared/schema";
import { billing } from "./services/billing.service";
import { notification } from "./services/notification.service";
import { ZodError } from "zod";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import { db } from "@db";
import * as schema from "@shared/schema";
import { geminiService } from "./services/gemini.service";
import { prescription as prescriptionService } from "./services/prescription.service";

// Import route modules
import vitalsRouter from "./routes/vitals";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Setup WebSocket server for real-time notifications
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: "/ws"  // Explicitly set the WebSocket path
  });
  
  wss.on("connection", (ws) => {
    console.log("WebSocket client connected");
    
    // Send a welcome message to confirm connection
    ws.send(JSON.stringify({
      type: "connection_established",
      message: "Connected to notification service"
    }));
    
    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log("WebSocket message received:", data);
        
        // Register user connection if auth data provided
        if (data.type === "auth" && data.userId) {
          notification.registerClient(data.userId, ws);
          console.log(`WebSocket client registered for user ${data.userId}`);
          
          ws.send(JSON.stringify({
            type: "auth_success",
            message: "Authentication successful"
          }));
        }
      } catch (error) {
        console.error("Invalid WebSocket message", error);
      }
    });
    
    ws.on("close", () => {
      console.log("WebSocket client disconnected");
      // We would need to find the userId associated with this connection and unregister it
    });
    
    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  // Authentication middleware
  const authenticate = async (req: Express.Request, res: any, next: any) => {
    // Check if user is authenticated via Passport
    if (req.isAuthenticated && req.isAuthenticated()) {
      // User is already authenticated by Passport
      return next();
    }
    
    // User is not authenticated, return 401 Unauthorized
    return res.status(401).json({ 
      message: "Authentication required", 
      status: "error" 
    });
  };

  // API Routes
  const apiRouter = Router();
  app.use("/api", apiRouter);

  // Error handling middleware
  const handleErrors = (err: any, req: any, res: any, next: any) => {
    console.error("API Error:", err);
    
    if (err instanceof ZodError) {
      return res.status(400).json({ 
        error: "Validation error", 
        details: err.errors 
      });
    }
    
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal server error";
    
    res.status(statusCode).json({ error: message });
  };

  // User routes are managed by the Passport authentication system
  // in server/auth.ts which sets up /api/login, /api/register, /api/logout, and /api/user routes

  // Doctor routes
  apiRouter.get("/doctors", async (req, res, next) => {
    try {
      const doctors = await storage.getAllDoctors();
      res.json(doctors);
    } catch (error) {
      next(error);
    }
  });

  // Important: Order matters - specific routes before parametrized routes
  apiRouter.get("/doctors/stats", async (req, res, next) => {
    try {
      const stats = await storage.getDoctorStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  });

  apiRouter.get("/doctors/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid doctor ID" });
      }
      
      const doctor = await storage.getDoctorById(id);
      
      if (!doctor) {
        return res.status(404).json({ error: "Doctor not found" });
      }
      
      res.json(doctor);
    } catch (error) {
      next(error);
    }
  });

  apiRouter.post("/doctors", authenticate, async (req, res, next) => {
    try {
      const doctorData = insertDoctorSchema.parse(req.body);
      const doctor = await storage.insertDoctor(doctorData);
      
      res.status(201).json(doctor);
    } catch (error) {
      next(error);
    }
  });

  // Patient routes
  apiRouter.get("/patients", async (req, res, next) => {
    try {
      const patients = await storage.getAllPatients();
      res.json(patients);
    } catch (error) {
      next(error);
    }
  });

  apiRouter.get("/patients/stats", async (req, res, next) => {
    try {
      const stats = await storage.getPatientStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  });

  apiRouter.get("/patients/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid patient ID" });
      }
      
      const patient = await storage.getPatientById(id);
      
      if (!patient) {
        return res.status(404).json({ error: "Patient not found" });
      }
      
      res.json(patient);
    } catch (error) {
      next(error);
    }
  });

  apiRouter.post("/patients", authenticate, async (req, res, next) => {
    try {
      const patientData = insertPatientSchema.parse(req.body);
      const patient = await storage.insertPatient(patientData);
      
      res.status(201).json(patient);
    } catch (error) {
      next(error);
    }
  });

  // Appointment routes
  apiRouter.get("/appointments", async (req, res, next) => {
    try {
      const { status, doctorId, patientId, from, to } = req.query;
      
      let filters: any = {};
      
      if (status && status !== 'all') {
        filters.status = status as string;
      }
      
      if (doctorId) {
        const docId = parseInt(doctorId as string);
        if (!isNaN(docId)) {
          filters.doctorId = docId;
        }
      }
      
      if (patientId) {
        const patId = parseInt(patientId as string);
        if (!isNaN(patId)) {
          filters.patientId = patId;
        }
      }
      
      let dateRange = {};
      if (from) {
        dateRange = { ...dateRange, from: new Date(from as string) };
      }
      
      if (to) {
        dateRange = { ...dateRange, to: new Date(to as string) };
      }
      
      const appointments = await storage.getAppointments(filters, dateRange);
      res.json(appointments);
    } catch (error) {
      next(error);
    }
  });

  apiRouter.get("/appointments/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid appointment ID" });
      }
      
      const appointment = await storage.getAppointmentById(id);
      
      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }
      
      res.json(appointment);
    } catch (error) {
      next(error);
    }
  });

  apiRouter.post("/appointments", authenticate, async (req, res, next) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      
      // Validate that appointment date is not in the past
      const appointmentDate = new Date(appointmentData.appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (appointmentDate < today) {
        return res.status(400).json({ error: "Appointment date cannot be in the past" });
      }
      
      const appointment = await storage.insertAppointment(appointmentData);
      
      // Send notification to doctor about new appointment
      await notification.sendAppointmentNotification(
        appointment.doctorId,
        appointment.patientId,
        appointment.id
      );
      
      res.status(201).json(appointment);
    } catch (error) {
      next(error);
    }
  });

  apiRouter.patch("/appointments/:id/status", authenticate, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid appointment ID" });
      }
      
      const { status } = req.body;
      
      if (!status || !['scheduled', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
      }
      
      const appointment = await storage.updateAppointmentStatus(id, status);
      
      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }
      
      // Send notification about status change
      await notification.sendAppointmentStatusUpdateNotification(
        appointment.patientId,
        appointment.id,
        status
      );
      
      res.json(appointment);
    } catch (error) {
      next(error);
    }
  });

  // Prescription routes
  apiRouter.get("/prescriptions", async (req, res, next) => {
    try {
      const { doctorId, patientId } = req.query;
      
      let filters: any = {};
      
      if (doctorId) {
        const docId = parseInt(doctorId as string);
        if (!isNaN(docId)) {
          filters.doctorId = docId;
        }
      }
      
      if (patientId) {
        const patId = parseInt(patientId as string);
        if (!isNaN(patId)) {
          filters.patientId = patId;
        }
      }
      
      const prescriptions = await storage.getPrescriptions(filters);
      res.json(prescriptions);
    } catch (error) {
      next(error);
    }
  });

  apiRouter.get("/prescriptions/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid prescription ID" });
      }
      
      const prescription = await storage.getPrescriptionById(id);
      
      if (!prescription) {
        return res.status(404).json({ error: "Prescription not found" });
      }
      
      res.json(prescription);
    } catch (error) {
      next(error);
    }
  });

  apiRouter.post("/prescriptions", authenticate, async (req, res, next) => {
    try {
      // Validate prescription data
      const prescriptionData = insertPrescriptionSchema.parse(req.body);
      
      // Validate items array
      const itemsSchema = z.array(schema.insertPrescriptionItemSchema.omit({ id: true, prescriptionId: true }));
      const items = itemsSchema.parse(req.body.items);
      
      // Create prescription with items
      const prescription = await storage.insertPrescription(prescriptionData, items);
      
      // Auto generate bill based on prescription
      const bill = await billing.generateBillFromPrescription(prescription.id);
      
      // Send notification to patient about new prescription
      await notification.sendPrescriptionNotification(prescription.patientId, prescription.id);
      
      // Check vital signs and send alerts if necessary
      if (prescriptionData.vitalSigns) {
        await notification.checkVitalSigns(prescription.patientId, prescriptionData.vitalSigns);
      }
      
      res.status(201).json({ 
        prescription, 
        bill,
        message: "Prescription created successfully and bill generated"
      });
    } catch (error) {
      next(error);
    }
  });

  // Health metrics routes
  apiRouter.get("/health-metrics", async (req, res, next) => {
    try {
      const { patientId, type } = req.query;
      
      if (!patientId) {
        return res.status(400).json({ error: "Patient ID is required" });
      }
      
      const id = parseInt(patientId as string);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid patient ID" });
      }
      
      let filters: any = { patientId: id };
      
      if (type) {
        filters.metricType = type as string;
      }
      
      const metrics = await storage.getHealthMetrics(filters);
      res.json(metrics);
    } catch (error) {
      next(error);
    }
  });

  apiRouter.post("/health-metrics", authenticate, async (req, res, next) => {
    try {
      const metricData = insertHealthMetricSchema.parse(req.body);
      const metric = await storage.insertHealthMetric(metricData);
      
      // Check if the metric is abnormal and send notification if needed
      await notification.checkHealthMetric(metric);
      
      res.status(201).json(metric);
    } catch (error) {
      next(error);
    }
  });

  // Medication schedule routes
  apiRouter.get("/medication-schedules", async (req, res, next) => {
    try {
      const { patientId, active } = req.query;
      
      if (!patientId) {
        return res.status(400).json({ error: "Patient ID is required" });
      }
      
      const id = parseInt(patientId as string);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid patient ID" });
      }
      
      let filters: any = { patientId: id };
      
      if (active !== undefined) {
        filters.isActive = active === 'true';
      }
      
      const schedules = await storage.getMedicationSchedules(filters);
      res.json(schedules);
    } catch (error) {
      next(error);
    }
  });

  apiRouter.post("/medication-schedules", authenticate, async (req, res, next) => {
    try {
      const scheduleData = insertMedicationScheduleSchema.parse(req.body);
      const schedule = await storage.insertMedicationSchedule(scheduleData);
      
      res.status(201).json(schedule);
    } catch (error) {
      next(error);
    }
  });

  // Drug interactions route
  apiRouter.post("/check-drug-interactions", async (req, res, next) => {
    try {
      const { medications } = req.body;
      
      if (!medications || !Array.isArray(medications)) {
        return res.status(400).json({ error: "Medications array is required" });
      }
      
      const interactions = await storage.checkDrugInteractions(medications);
      res.json({ interactions });
    } catch (error) {
      next(error);
    }
  });

  // Notifications routes
  apiRouter.get("/notifications", authenticate, async (req, res, next) => {
    try {
      const userId = req.user.id;
      const notifications = await storage.getNotifications(userId);
      res.json(notifications);
    } catch (error) {
      next(error);
    }
  });

  apiRouter.patch("/notifications/:id/read", authenticate, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid notification ID" });
      }
      
      const notification = await storage.markNotificationAsRead(id);
      
      if (!notification) {
        return res.status(404).json({ error: "Notification not found" });
      }
      
      res.json(notification);
    } catch (error) {
      next(error);
    }
  });

  // OCR Prescription Upload routes
  apiRouter.post("/ocr-prescription/upload", authenticate, async (req, res, next) => {
    try {
      const { image, patientId, submittedBy } = req.body;
      
      if (!image || !patientId) {
        return res.status(400).json({ error: "Image data and patient ID are required" });
      }
      
      // Validate that the image is base64 encoded
      if (!image.startsWith('data:image')) {
        return res.status(400).json({ error: "Image must be base64 encoded" });
      }
      
      // Ensure user object exists and has a default
      const userId = req.user?.id || 1;
      
      try {
        // Use Gemini AI to analyze the prescription image
        const analysisResults = await geminiService.analyzePrescriptionImage(image);
        
        // Insert the OCR prescription upload record with analysis results
        const upload = await db.insert(schema.ocrPrescriptionUploads).values({
          patientId: Number(patientId),
          imageUrl: image, 
          status: 'completed',
          extractedText: JSON.stringify(analysisResults),
          confidenceScore: 0.95, // This would be dynamically determined in a real implementation
          errorMessage: null,
        }).returning();
        
        res.status(201).json({ 
          id: upload[0].id,
          message: "Prescription uploaded and analyzed successfully",
          analysisResults
        });
      } catch (aiError: any) {
        console.error("AI analysis error:", aiError);
        
        // Store the upload but mark it as failed
        const upload = await db.insert(schema.ocrPrescriptionUploads).values({
          patientId: Number(patientId),
          imageUrl: image,
          status: 'failed',
          extractedText: null,
          confidenceScore: null,
          errorMessage: aiError.message || "Analysis failed",
        }).returning();
        
        res.status(201).json({ 
          id: upload[0].id,
          message: "Prescription uploaded but analysis failed. Please try again later.",
          error: aiError.message
        });
      }
    } catch (error) {
      next(error);
    }
  });
  
  apiRouter.get("/ocr-prescription/analysis/:id", authenticate, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid OCR analysis ID" });
      }
      
      // Get the OCR analysis record
      const analysis = await db.query.ocrPrescriptionUploads.findFirst({
        where: eq(schema.ocrPrescriptionUploads.id, id)
      });
      
      if (!analysis) {
        return res.status(404).json({ error: "OCR analysis not found" });
      }
      
      // Parse the extracted text if it exists
      let analysisResults = null;
      if (analysis.extractedText) {
        try {
          analysisResults = JSON.parse(analysis.extractedText);
        } catch (e) {
          console.error("Error parsing analysis results:", e);
        }
      }
      
      // Format response
      const response = {
        ...analysis,
        analysisResults
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  });
  
  // Add an endpoint to convert OCR results into a prescription
  apiRouter.post("/ocr-prescription/convert/:id", authenticate, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid OCR analysis ID" });
      }
      
      // Get the OCR analysis record
      const analysis = await db.query.ocrPrescriptionUploads.findFirst({
        where: eq(schema.ocrPrescriptionUploads.id, id)
      });
      
      if (!analysis) {
        return res.status(404).json({ error: "OCR analysis not found" });
      }
      
      if (analysis.status !== 'completed' || !analysis.extractedText) {
        return res.status(400).json({ 
          error: "Cannot convert incomplete or failed analysis",
          status: analysis.status
        });
      }
      
      // Parse the extracted text
      const analysisResults = JSON.parse(analysis.extractedText);
      
      // Create a new prescription from the OCR results
      const patientId = analysis.patientId;
      const doctorId = req.user?.id || 1;
      
      // Extract medication details from the analysis
      const medications = analysisResults.medications || [];
      
      // Create the prescription
      const prescriptionData = {
        patientId,
        doctorId,
        notes: analysisResults.diagnosis || "Converted from prescription image",
        status: "pending" as const
      };
      
      // Create prescription items from the medications
      const items = medications.map((med: any) => ({
        medicationName: med.name || "Unknown medication",
        dosage: med.dosage || "As directed",
        frequency: med.frequency || "As needed",
        duration: med.duration || "As needed",
        instructions: med.instructions || ""
      }));
      
      // Use the prescription service to create the prescription with items
      const result = await prescriptionService.submitPrescription(prescriptionData, items);
      
      // Access the prescription ID from the result object
      const prescriptionId = result.prescription.id;
      
      // Update the OCR record with the converted prescription ID
      await db.update(schema.ocrPrescriptionUploads)
        .set({ 
          convertedPrescriptionId: prescriptionId,
          processedAt: new Date()
        })
        .where(eq(schema.ocrPrescriptionUploads.id, id))
        .execute();
      
      res.json({
        message: "OCR prescription successfully converted to formal prescription",
        prescriptionId: prescriptionId,
        prescription: result
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Drug side effects route for patient alerts
  apiRouter.get("/drug-side-effects/:medication", async (req, res, next) => {
    try {
      const { medication } = req.params;
      
      if (!medication) {
        return res.status(400).json({ error: "Medication name is required" });
      }
      
      // In a real implementation, we would query a drug side effects database
      // For now, query the drug interactions table
      const sideEffects = await db.query.drugInteractions.findMany({
        where: eq(schema.drugInteractions.drugA, medication)
      });
      
      res.json({ 
        medication,
        sideEffects: sideEffects.map(si => ({
          effect: si.effect || '',
          severity: si.severity
        }))
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Symptom diagnosis mapping route for doctor dashboard
  apiRouter.get("/symptom-diagnosis", async (req, res, next) => {
    try {
      const { symptoms } = req.query;
      
      if (!symptoms) {
        return res.status(400).json({ error: "At least one symptom is required" });
      }
      
      const symptomList = (symptoms as string).split(',').map(s => s.trim());
      
      try {
        // Use Gemini AI to analyze symptoms and provide possible diagnoses
        const analysisResults = await geminiService.analyzeSymptoms(symptomList);
        
        res.json({ 
          symptoms: symptomList,
          possibleDiagnoses: analysisResults.diagnoses || [],
          aiPowered: true
        });
      } catch (aiError: any) {
        console.error("AI symptom analysis error:", aiError);
        
        // Fallback to database if AI fails
        // In a real implementation, we would search a symptom-diagnosis database
        res.json({ 
          symptoms: symptomList,
          possibleDiagnoses: [],
          message: "AI-powered diagnosis temporarily unavailable. Please try again later.",
          error: aiError.message
        });
      }
    } catch (error) {
      next(error);
    }
  });
  
  // Mount vitals router for patient vitals data and AI analysis
  apiRouter.use('/patient-vitals', authenticate, vitalsRouter);

  // Apply error handling middleware
  apiRouter.use(handleErrors);

  return httpServer;
}
