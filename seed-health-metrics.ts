import { db } from "./db";
import { patients, healthMetrics } from "./shared/schema";
import { eq } from "drizzle-orm";

// This script adds sample health metrics for existing patients
async function seedHealthMetrics() {
  try {
    console.log("Starting to seed health metrics...");
    // Get all patients
    const allPatients = await db.query.patients.findMany();
    
    if (allPatients.length === 0) {
      console.log("No patients found in the database. Please run the main seed script first.");
      return;
    }
    
    console.log(`Found ${allPatients.length} patients to add health metrics for.`);
    
    // Delete existing health metrics to avoid duplicates
    // In a production environment, you would want to be more careful with this
    await db.delete(healthMetrics);
    console.log("Cleared existing health metrics.");
    
    // Metrics to add for each patient
    const metricsData = [];
    
    // Add health metrics for each patient
    for (const patient of allPatients) {
      console.log(`Adding health metrics for patient ID ${patient.id}`);
      
      // Generate data for the last 90 days
      for (let i = 0; i < 90; i += 5) {
        const recordDate = new Date();
        recordDate.setDate(recordDate.getDate() - i);
        
        // Blood pressure (every 10 days)
        if (i % 10 === 0) {
          metricsData.push({
            patientId: patient.id,
            metricType: "blood_pressure",
            metricValue: {
              systolic: 110 + Math.floor(Math.random() * 30),
              diastolic: 70 + Math.floor(Math.random() * 20),
              unit: "mmHg"
            },
            recordedAt: recordDate,
            notes: i === 0 ? "Latest reading" : null
          });
        }
        
        // Heart rate (every 15 days)
        if (i % 15 === 0) {
          metricsData.push({
            patientId: patient.id,
            metricType: "heart_rate",
            metricValue: {
              value: 60 + Math.floor(Math.random() * 30),
              unit: "BPM"
            },
            recordedAt: recordDate,
            notes: null
          });
        }
        
        // Blood glucose (every 20 days)
        if (i % 20 === 0) {
          metricsData.push({
            patientId: patient.id,
            metricType: "glucose",
            metricValue: {
              value: 90 + Math.floor(Math.random() * 50),
              unit: "mg/dL"
            },
            recordedAt: recordDate,
            notes: null
          });
        }
        
        // Weight (every 30 days)
        if (i % 30 === 0) {
          metricsData.push({
            patientId: patient.id,
            metricType: "weight",
            metricValue: {
              value: 60 + Math.floor(Math.random() * 30),
              unit: "kg"
            },
            recordedAt: recordDate,
            notes: null
          });
        }
      }
    }
    
    // Insert all metrics in batches of 50 to avoid excessive database calls
    if (metricsData.length > 0) {
      console.log(`Inserting ${metricsData.length} health metrics...`);
      
      // Insert in batches of 50
      const batchSize = 50;
      for (let i = 0; i < metricsData.length; i += batchSize) {
        const batch = metricsData.slice(i, i + batchSize);
        await db.insert(healthMetrics).values(batch);
        console.log(`Inserted batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(metricsData.length/batchSize)}`);
      }
      
      console.log(`Successfully added ${metricsData.length} health metrics for ${allPatients.length} patients.`);
    }
    
    console.log("Health metrics seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding health metrics:", error);
  } finally {
    process.exit(0);
  }
}

// Run the seed function
seedHealthMetrics();