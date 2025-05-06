import { storage } from "../storage";
import { notification } from "./notification.service";
import { billing } from "./billing.service";

/**
 * Service class for prescription related operations
 * Handles automation for prescription submission, drug interaction checking, etc.
 */
class PrescriptionService {
  /**
   * Submits a prescription, checks for drug interactions, generates bill,
   * and sends notifications to relevant parties
   */
  async submitPrescription(prescriptionData: any, items: any[]) {
    try {
      // Check drug interactions
      const medications = items.map(item => item.medication);
      const interactions = await storage.checkDrugInteractions(medications);
      
      // Create prescription
      const prescription = await storage.insertPrescription(prescriptionData, items);
      
      // Auto generate bill
      const bill = await billing.generateBillFromPrescription(prescription.id);
      
      // Send notifications
      await notification.sendPrescriptionNotification(prescription.patientId, prescription.id);
      
      // Create medication schedules for the patient
      await this.createMedicationSchedules(prescription.id, prescription.patientId, items);
      
      // Check vital signs
      if (prescriptionData.vitalSigns) {
        await notification.checkVitalSigns(prescription.patientId, prescriptionData.vitalSigns);
      }
      
      return { 
        prescription, 
        bill, 
        interactions: interactions.length > 0 ? interactions : null 
      };
    } catch (error) {
      console.error("Error submitting prescription:", error);
      throw new Error("Failed to submit prescription");
    }
  }
  
  /**
   * Creates medication schedules from prescription items
   */
  private async createMedicationSchedules(prescriptionId: number, patientId: number, items: any[]) {
    try {
      const today = new Date();
      const schedules = items.map(item => {
        // Calculate end date based on duration (assuming duration is in days)
        const durationDays = parseInt(item.duration) || 7;  // Default to 7 days if not specified
        const endDate = new Date(today);
        endDate.setDate(endDate.getDate() + durationDays);
        
        // Determine time of day based on frequency
        let timeOfDay = "morning";
        switch (item.frequency) {
          case "twice_daily":
            timeOfDay = "morning,evening";
            break;
          case "three_times_daily":
            timeOfDay = "morning,afternoon,evening";
            break;
          case "four_times_daily":
            timeOfDay = "morning,noon,afternoon,evening";
            break;
          case "as_needed":
            timeOfDay = "as needed";
            break;
        }
        
        return {
          patientId,
          prescriptionItemId: item.id,
          medicationName: item.medication,
          dosage: item.dosage,
          frequency: item.frequency,
          startDate: today,
          endDate,
          timeOfDay,
          isActive: true,
          instructions: item.instructions || null
        };
      });
      
      // Insert all schedules
      for (const schedule of schedules) {
        await storage.insertMedicationSchedule(schedule);
      }
      
      return schedules;
    } catch (error) {
      console.error("Error creating medication schedules:", error);
      throw new Error("Failed to create medication schedules");
    }
  }
}

export const prescription = new PrescriptionService();
