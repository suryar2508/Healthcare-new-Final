import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db } from "@db";
import * as schema from "@shared/schema";
import { geminiService } from "../services/gemini.service";

const vitalsRouter = Router();

// Get patient vitals history
vitalsRouter.get("/history/:patientId", async (req, res, next) => {
  try {
    const patientId = parseInt(req.params.patientId);
    
    if (isNaN(patientId)) {
      return res.status(400).json({ error: "Invalid patient ID" });
    }
    
    // Get the patient's health metrics, ordered by date
    const vitals = await db.query.healthMetrics.findMany({
      where: eq(schema.healthMetrics.patientId, patientId),
      orderBy: [desc(schema.healthMetrics.recordedAt)]
    });
    
    res.json(vitals);
  } catch (error) {
    next(error);
  }
});

// Analyze patient vitals for health trends and recommendations
vitalsRouter.post("/analyze", async (req, res, next) => {
  try {
    const { patientId, period } = req.body;
    
    if (!patientId) {
      return res.status(400).json({ error: "Patient ID is required" });
    }
    
    // Get the patient's health metrics for the specified time period
    let vitalsQuery = db.query.healthMetrics.findMany({
      where: eq(schema.healthMetrics.patientId, Number(patientId)),
      orderBy: [desc(schema.healthMetrics.recordedAt)]
    });
    
    // Limit the results based on the period if specified
    if (period) {
      const limit = period === 'week' ? 7 : period === 'month' ? 30 : 90; // 3 months
      vitalsQuery = db.query.healthMetrics.findMany({
        where: eq(schema.healthMetrics.patientId, Number(patientId)),
        orderBy: [desc(schema.healthMetrics.recordedAt)],
        limit
      });
    }
    
    const vitals = await vitalsQuery;
    
    if (vitals.length === 0) {
      return res.status(404).json({ 
        error: "No vitals data found for this patient",
        message: "Please record vitals data before analysis"
      });
    }
    
    try {
      // Use Gemini AI to analyze the vitals data and provide insights
      const analysis = await geminiService.analyzeVitals(vitals);
      
      res.json({
        patientId,
        vitalsCount: vitals.length,
        period: period || 'all',
        analysis,
        aiPowered: true
      });
    } catch (aiError: any) {
      console.error("AI vitals analysis error:", aiError);
      
      // Provide basic analysis if AI fails
      res.json({
        patientId,
        vitalsCount: vitals.length,
        period: period || 'all',
        error: aiError.message,
        message: "AI-powered analysis temporarily unavailable. Basic vitals data provided.",
        vitals: vitals.slice(0, 5) // Return the 5 most recent vitals
      });
    }
  } catch (error) {
    next(error);
  }
});

// Record new vitals data
vitalsRouter.post("/record", async (req, res, next) => {
  try {
    const { patientId, metric, value, unit, notes } = req.body;
    
    if (!patientId || !metric || value === undefined) {
      return res.status(400).json({ error: "Patient ID, metric type, and value are required" });
    }
    
    // Insert the new health metric
    const newVital = await db.insert(schema.healthMetrics).values({
      patientId: Number(patientId),
      metricType: metric,
      value: String(value),
      unit: unit || '',
      notes: notes || null,
      recordedAt: new Date()
    }).returning();
    
    res.status(201).json({
      id: newVital[0].id,
      message: "Vitals data recorded successfully",
      vital: newVital[0]
    });
  } catch (error) {
    next(error);
  }
});

export default vitalsRouter;