import { storage } from "../storage";
import { db } from "@db";
import * as schema from "@shared/schema";

/**
 * Service class for billing related operations
 * Handles automated billing based on prescriptions
 */
class BillingService {
  // Standard pricing for different medication frequencies
  private medicationPricing = {
    once_daily: 15,
    twice_daily: 25,
    three_times_daily: 35,
    four_times_daily: 45,
    as_needed: 20
  };
  
  // Consultation fee based on doctor specialization
  private consultationFees: Record<string, number> = {
    default: 100,
    cardiology: 150,
    neurology: 180,
    dermatology: 120,
    pediatrics: 110,
    orthopedics: 140,
    psychiatry: 160,
    ophthalmology: 130,
    gynecology: 135
  };
  
  /**
   * Generate a bill based on a prescription
   */
  async generateBillFromPrescription(prescriptionId: number) {
    try {
      // Get prescription details with items
      const prescription = await storage.getPrescriptionById(prescriptionId);
      if (!prescription) {
        throw new Error(`Prescription with ID ${prescriptionId} not found`);
      }
      
      // Get doctor details to determine consultation fee
      const doctor = await storage.getDoctorById(prescription.doctorId);
      if (!doctor) {
        throw new Error(`Doctor with ID ${prescription.doctorId} not found`);
      }
      
      // Calculate medication costs
      let medicationTotal = 0;
      const billItems = [];
      
      // Add consultation fee
      const consultationFee = this.getConsultationFee(doctor.specialization);
      billItems.push({
        description: `Medical Consultation (${doctor.specialization || 'General'})`,
        amount: consultationFee
      });
      
      // Calculate cost of each medication
      if (prescription.items && prescription.items.length > 0) {
        for (const item of prescription.items) {
          const medicationCost = this.calculateMedicationCost(item);
          medicationTotal += medicationCost;
          
          billItems.push({
            description: `${item.medication} (${item.dosage}, ${this.formatFrequency(item.frequency)}, ${item.duration})`,
            amount: medicationCost
          });
        }
      }
      
      // Calculate total amount
      const totalAmount = consultationFee + medicationTotal;
      
      // Create bill in database
      const [bill] = await db.insert(schema.bills).values({
        patientId: prescription.patientId,
        prescriptionId: prescription.id,
        amount: totalAmount,
        status: 'pending',
        dueDate: this.calculateDueDate(7), // Due in 7 days
        details: { items: billItems }
      }).returning();
      
      return bill;
    } catch (error) {
      console.error("Error generating bill from prescription:", error);
      throw new Error("Failed to generate bill");
    }
  }
  
  /**
   * Calculate the cost of a medication based on its details
   */
  private calculateMedicationCost(item: any) {
    const baseCost = this.medicationPricing[item.frequency as keyof typeof this.medicationPricing] || 20;
    
    // Calculate duration in days
    let durationDays = 7; // Default to 7 days
    if (item.duration) {
      const durationMatch = item.duration.match(/(\d+)/);
      if (durationMatch) {
        durationDays = parseInt(durationMatch[1]);
      }
    }
    
    // Adjust cost based on duration (longer durations get slight discount)
    let costMultiplier = 1;
    if (durationDays > 30) {
      costMultiplier = 0.85; // 15% discount for month+ prescriptions
    } else if (durationDays > 14) {
      costMultiplier = 0.9; // 10% discount for 2+ week prescriptions
    }
    
    return Math.round(baseCost * durationDays * costMultiplier);
  }
  
  /**
   * Get consultation fee based on doctor specialization
   */
  private getConsultationFee(specialization: string | null) {
    if (!specialization) {
      return this.consultationFees.default;
    }
    
    const lowerSpecialization = specialization.toLowerCase();
    
    for (const [key, fee] of Object.entries(this.consultationFees)) {
      if (lowerSpecialization.includes(key)) {
        return fee;
      }
    }
    
    return this.consultationFees.default;
  }
  
  /**
   * Format the medication frequency to be more readable
   */
  private formatFrequency(frequency: string) {
    switch (frequency) {
      case "once_daily":
        return "Once Daily";
      case "twice_daily":
        return "Twice Daily";
      case "three_times_daily":
        return "Three Times Daily";
      case "four_times_daily":
        return "Four Times Daily";
      case "as_needed":
        return "As Needed";
      default:
        return frequency;
    }
  }
  
  /**
   * Calculate the due date based on days from now
   */
  private calculateDueDate(daysFromNow: number) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + daysFromNow);
    return dueDate;
  }
}

export const billing = new BillingService();
