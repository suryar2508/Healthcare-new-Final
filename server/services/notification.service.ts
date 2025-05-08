import { storage } from "../storage";
import { WebSocket } from "ws";
import { db } from "@db";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";

// Store connected WebSocket clients by userId
const connectedClients: Map<number, WebSocket> = new Map();

/**
 * Service class for notification related operations
 * Handles sending notifications to users via WebSocket and storing in database
 */
class NotificationService {
  /**
   * Register a WebSocket client for a user
   */
  registerClient(userId: number, ws: WebSocket) {
    connectedClients.set(userId, ws);
  }
  
  /**
   * Unregister a WebSocket client for a user
   */
  unregisterClient(userId: number) {
    connectedClients.delete(userId);
  }
  
  /**
   * Send a real-time notification to a user via WebSocket
   */
  sendRealTimeNotification(userId: number, notification: any) {
    const client = connectedClients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(notification));
    }
  }
  
  /**
   * Create a notification in the database and send via WebSocket if possible
   */
  async createNotification(notification: any) {
    try {
      // Store in database
      const newNotification = await storage.insertNotification(notification);
      
      // Send via WebSocket if user is connected
      this.sendRealTimeNotification(notification.userId, newNotification);
      
      return newNotification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw new Error("Failed to create notification");
    }
  }
  
  /**
   * Send a prescription notification to a patient
   */
  async sendPrescriptionNotification(patientId: number, prescriptionId: number) {
    try {
      // Get patient details to get userId
      const patient = await storage.getPatientById(patientId);
      if (!patient) {
        throw new Error(`Patient with ID ${patientId} not found`);
      }
      
      // Get prescription details
      const prescription = await storage.getPrescriptionById(prescriptionId);
      if (!prescription) {
        throw new Error(`Prescription with ID ${prescriptionId} not found`);
      }
      
      // Create notification for patient
      let doctorName = "Your doctor";
      
      // Safely access the doctor's name if available
      if (prescription.doctor && prescription.doctor.user) {
        doctorName = `Dr. ${prescription.doctor.user.fullName}`;
      }
      
      const patientNotification = {
        userId: patient.userId,
        title: "New Prescription",
        message: `${doctorName} has prescribed you new medications.`,
        type: "prescription",
        isRead: false,
        data: { prescriptionId }
      };
      
      await this.createNotification(patientNotification);
      
      return true;
    } catch (error) {
      console.error("Error sending prescription notification:", error);
      throw new Error("Failed to send prescription notification");
    }
  }
  
  /**
   * Send an appointment notification to a doctor
   */
  async sendAppointmentNotification(doctorId: number, patientId: number, appointmentId: number) {
    try {
      // Get doctor details to get userId
      const doctor = await storage.getDoctorById(doctorId);
      if (!doctor) {
        throw new Error(`Doctor with ID ${doctorId} not found`);
      }
      
      // Get patient details
      const patient = await storage.getPatientById(patientId);
      if (!patient) {
        throw new Error(`Patient with ID ${patientId} not found`);
      }
      
      // Get appointment details
      const appointment = await storage.getAppointmentById(appointmentId);
      if (!appointment) {
        throw new Error(`Appointment with ID ${appointmentId} not found`);
      }
      
      // Format appointment date and time
      const date = new Date(appointment.appointmentDate);
      const timeStr = appointment.appointmentTime.toString();
      
      // Create notification for doctor
      const notification = {
        userId: doctor.userId,
        title: "New Appointment",
        message: `New appointment with ${patient.user.fullName} on ${date.toLocaleDateString()} at ${timeStr}.`,
        type: "appointment",
        isRead: false,
        data: { appointmentId }
      };
      
      await this.createNotification(notification);
      
      return true;
    } catch (error) {
      console.error("Error sending appointment notification:", error);
      throw new Error("Failed to send appointment notification");
    }
  }
  
  /**
   * Send medication reminder notification to a patient
   */
  async sendMedicationReminderNotification(patientId: number, medication: any) {
    try {
      // Get patient details to get userId
      const patient = await storage.getPatientById(patientId);
      if (!patient) {
        throw new Error(`Patient with ID ${patientId} not found`);
      }
      
      // Format date range
      const startDate = new Date(medication.startDate).toLocaleDateString();
      const endDate = new Date(medication.endDate).toLocaleDateString();
      const dateRange = startDate === endDate ? startDate : `${startDate} to ${endDate}`;
      
      // Format days
      let daysText = "everyday";
      if (medication.days && medication.days.length < 7) {
        daysText = medication.days.map((day: string) => 
          day.charAt(0).toUpperCase() + day.slice(1)
        ).join(", ");
      }
      
      // Create notification for patient
      const notificationData = {
        userId: patient.userId,
        title: "Medication Reminder",
        message: `Remember to take ${medication.medicationName} at ${medication.time} ${daysText} (${dateRange})`,
        type: "medication_reminder",
        isRead: false,
        data: { medication }
      };
      
      await this.createNotification(notificationData);
      
      return true;
    } catch (error) {
      console.error("Error sending medication reminder notification:", error);
      throw new Error("Failed to send medication reminder notification");
    }
  }
  
  /**
   * Send email notification for medication reminder
   */
  async sendMedicationReminderEmail(patientId: number, medication: any) {
    try {
      // Get patient details
      const patient = await storage.getPatientById(patientId);
      if (!patient) {
        throw new Error(`Patient with ID ${patientId} not found`);
      }
      
      // Check if SendGrid API key is available
      if (!process.env.SENDGRID_API_KEY) {
        console.warn("SendGrid API key not found. Email notification not sent.");
        return false;
      }
      
      // Format days text
      let daysText = "everyday";
      if (medication.days && medication.days.length < 7) {
        daysText = medication.days.map((day: string) => 
          day.charAt(0).toUpperCase() + day.slice(1)
        ).join(", ");
      }
      
      // Construct email content
      const emailSubject = `Medication Reminder: ${medication.medicationName}`;
      const emailContent = `
        <h1>Medication Reminder</h1>
        <p>Hello ${patient.user?.fullName},</p>
        <p>This is a reminder to take your medication:</p>
        <ul>
          <li><strong>Medication:</strong> ${medication.medicationName}</li>
          <li><strong>Time:</strong> ${medication.time}</li>
          <li><strong>Days:</strong> ${daysText}</li>
          <li><strong>Period:</strong> ${new Date(medication.startDate).toLocaleDateString()} to ${new Date(medication.endDate).toLocaleDateString()}</li>
        </ul>
        <p>Please take your medication as prescribed by your doctor.</p>
        <p>Thank you for using our healthcare service!</p>
      `;
      
      // In a real implementation, we would use SendGrid to send the email
      // For demonstration purposes, we'll just log the email details
      console.log(`Email notification would be sent to ${patient.user?.email}`);
      console.log(`Subject: ${emailSubject}`);
      console.log(`Content: ${emailContent}`);
      
      return true;
    } catch (error) {
      console.error("Error sending medication reminder email:", error);
      throw new Error("Failed to send medication reminder email");
    }
  }
  
  /**
   * Check vital signs and send alerts if they exceed thresholds
   */
  async checkVitalSigns(patientId: number, vitalSigns: any) {
    try {
      // Get patient details to get userId
      const patient = await storage.getPatientById(patientId);
      if (!patient) {
        throw new Error(`Patient with ID ${patientId} not found`);
      }
      
      // Define vital sign thresholds
      const thresholds = {
        bloodPressure: {
          systolic: { high: 140, low: 90 },
          diastolic: { high: 90, low: 60 }
        },
        pulse: { high: 100, low: 60 },
        temperature: { high: 100.4, low: 97.0 }, // in Fahrenheit
        weight: { highChange: 5, lowChange: -5 } // significant change in kg
      };
      
      const alerts = [];
      
      // Check blood pressure
      if (vitalSigns.bloodPressure) {
        const bpParts = vitalSigns.bloodPressure.split('/').map(Number);
        if (bpParts.length === 2) {
          const [systolic, diastolic] = bpParts;
          
          if (systolic > thresholds.bloodPressure.systolic.high || diastolic > thresholds.bloodPressure.diastolic.high) {
            alerts.push({
              type: "high_blood_pressure",
              message: `High blood pressure detected: ${systolic}/${diastolic} mmHg.`
            });
          } else if (systolic < thresholds.bloodPressure.systolic.low || diastolic < thresholds.bloodPressure.diastolic.low) {
            alerts.push({
              type: "low_blood_pressure",
              message: `Low blood pressure detected: ${systolic}/${diastolic} mmHg.`
            });
          }
        }
      }
      
      // Send alerts if any
      for (const alert of alerts) {
        // Create notification for patient
        const patientNotification = {
          userId: patient.userId,
          title: "Health Alert",
          message: alert.message,
          type: alert.type,
          isRead: false,
          data: { vitalSigns }
        };
        
        await this.createNotification(patientNotification);
      }
      
      return alerts;
    } catch (error) {
      console.error("Error checking vital signs:", error);
      throw new Error("Failed to check vital signs");
    }
  }
}

export const notification = new NotificationService();