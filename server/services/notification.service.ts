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
      
      // If prescription has medication items, notify pharmacist
      if (prescription.items && prescription.items.length > 0) {
        // In a real system, we'd query for pharmacists and notify them
        // For now, let's assume pharmacist has ID 1 for demonstration
        const pharmacistUserId = 3; // Example ID
        
        const pharmacistNotification = {
          userId: pharmacistUserId,
          title: "New Prescription to Process",
          message: `New prescription for patient ${prescription.patient.user.fullName} needs to be processed.`,
          type: "prescription_processing",
          isRead: false,
          data: { prescriptionId }
        };
        
        await this.createNotification(pharmacistNotification);
      }
      
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
   * Send appointment status update notification to a patient
   */
  async sendAppointmentStatusUpdateNotification(patientId: number, appointmentId: number, status: string) {
    try {
      // Get patient details to get userId
      const patient = await storage.getPatientById(patientId);
      if (!patient) {
        throw new Error(`Patient with ID ${patientId} not found`);
      }
      
      // Get appointment details
      const appointment = await storage.getAppointmentById(appointmentId);
      if (!appointment) {
        throw new Error(`Appointment with ID ${appointmentId} not found`);
      }
      
      // Format status message
      let statusMessage = "";
      switch (status) {
        case "scheduled":
          statusMessage = "confirmed";
          break;
        case "completed":
          statusMessage = "marked as completed";
          break;
        case "cancelled":
          statusMessage = "cancelled";
          break;
        default:
          statusMessage = `updated to ${status}`;
      }
      
      // Format appointment date and time
      const date = new Date(appointment.appointmentDate);
      const timeStr = appointment.appointmentTime.toString();
      
      // Create notification for patient
      const notification = {
        userId: patient.userId,
        title: "Appointment Update",
        message: `Your appointment with Dr. ${appointment.doctor.user.fullName} on ${date.toLocaleDateString()} at ${timeStr} has been ${statusMessage}.`,
        type: "appointment_update",
        isRead: false,
        data: { appointmentId }
      };
      
      await this.createNotification(notification);
      
      return true;
    } catch (error) {
      console.error("Error sending appointment status update notification:", error);
      throw new Error("Failed to send appointment status update notification");
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
      
      // Check pulse
      if (vitalSigns.pulse) {
        if (vitalSigns.pulse > thresholds.pulse.high) {
          alerts.push({
            type: "high_pulse",
            message: `High pulse rate detected: ${vitalSigns.pulse} BPM.`
          });
        } else if (vitalSigns.pulse < thresholds.pulse.low) {
          alerts.push({
            type: "low_pulse",
            message: `Low pulse rate detected: ${vitalSigns.pulse} BPM.`
          });
        }
      }
      
      // Check temperature
      if (vitalSigns.temperature) {
        if (vitalSigns.temperature > thresholds.temperature.high) {
          alerts.push({
            type: "high_temperature",
            message: `High temperature detected: ${vitalSigns.temperature}°F.`
          });
        } else if (vitalSigns.temperature < thresholds.temperature.low) {
          alerts.push({
            type: "low_temperature",
            message: `Low temperature detected: ${vitalSigns.temperature}°F.`
          });
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
        
        // Also notify doctor(s)
        // In a real system, we'd get the patient's primary doctor
        // For now, let's notify a specific doctor
        
        // Get a recent appointment to find a doctor for this patient
        const appointments = await storage.getAppointments({ patientId });
        if (appointments.length > 0) {
          const doctorId = appointments[0].doctorId;
          const doctor = await storage.getDoctorById(doctorId);
          
          if (doctor) {
            const doctorNotification = {
              userId: doctor.userId,
              title: "Patient Vital Alert",
              message: `Patient ${patient.user.fullName}: ${alert.message}`,
              type: `doctor_${alert.type}`,
              isRead: false,
              data: { patientId, vitalSigns }
            };
            
            await this.createNotification(doctorNotification);
          }
        }
      }
      
      return alerts;
    } catch (error) {
      console.error("Error checking vital signs:", error);
      throw new Error("Failed to check vital signs");
    }
  }
  
  /**
   * Check health metric and send alert if abnormal
   */
  async checkHealthMetric(metric: any) {
    try {
      // Similar to checkVitalSigns but for a single metric
      // Implementation depends on the metric type and value structure
      
      // Get patient details to get userId
      const patient = await storage.getPatientById(metric.patientId);
      if (!patient) {
        throw new Error(`Patient with ID ${metric.patientId} not found`);
      }
      
      // Define thresholds for different metric types
      const thresholds: any = {
        blood_pressure: {
          systolic: { high: 140, low: 90 },
          diastolic: { high: 90, low: 60 }
        },
        glucose: { high: 140, low: 70 }, // mg/dL
        weight: { highChange: 5, lowChange: -5 }, // kg
        heart_rate: { high: 100, low: 60 }, // BPM
        temperature: { high: 100.4, low: 97.0 }, // °F
        oxygen: { high: 100, low: 95 } // %
      };
      
      if (!thresholds[metric.metricType]) {
        return null; // No thresholds defined for this metric type
      }
      
      let alert = null;
      
      switch (metric.metricType) {
        case "blood_pressure":
          if (metric.metricValue.systolic > thresholds.blood_pressure.systolic.high || 
              metric.metricValue.diastolic > thresholds.blood_pressure.diastolic.high) {
            alert = {
              type: "high_blood_pressure",
              message: `High blood pressure detected: ${metric.metricValue.systolic}/${metric.metricValue.diastolic} mmHg.`
            };
          } else if (metric.metricValue.systolic < thresholds.blood_pressure.systolic.low || 
                    metric.metricValue.diastolic < thresholds.blood_pressure.diastolic.low) {
            alert = {
              type: "low_blood_pressure",
              message: `Low blood pressure detected: ${metric.metricValue.systolic}/${metric.metricValue.diastolic} mmHg.`
            };
          }
          break;
        
        case "glucose":
          if (metric.metricValue.value > thresholds.glucose.high) {
            alert = {
              type: "high_glucose",
              message: `High blood glucose detected: ${metric.metricValue.value} mg/dL.`
            };
          } else if (metric.metricValue.value < thresholds.glucose.low) {
            alert = {
              type: "low_glucose",
              message: `Low blood glucose detected: ${metric.metricValue.value} mg/dL.`
            };
          }
          break;
        
        case "heart_rate":
          if (metric.metricValue.value > thresholds.heart_rate.high) {
            alert = {
              type: "high_heart_rate",
              message: `High heart rate detected: ${metric.metricValue.value} BPM.`
            };
          } else if (metric.metricValue.value < thresholds.heart_rate.low) {
            alert = {
              type: "low_heart_rate",
              message: `Low heart rate detected: ${metric.metricValue.value} BPM.`
            };
          }
          break;
        
        case "temperature":
          if (metric.metricValue.value > thresholds.temperature.high) {
            alert = {
              type: "high_temperature",
              message: `High temperature detected: ${metric.metricValue.value}°F.`
            };
          } else if (metric.metricValue.value < thresholds.temperature.low) {
            alert = {
              type: "low_temperature",
              message: `Low temperature detected: ${metric.metricValue.value}°F.`
            };
          }
          break;
        
        case "oxygen":
          if (metric.metricValue.value < thresholds.oxygen.low) {
            alert = {
              type: "low_oxygen",
              message: `Low oxygen saturation detected: ${metric.metricValue.value}%.`
            };
          }
          break;
      }
      
      if (alert) {
        // Create notification for patient
        const patientNotification = {
          userId: patient.userId,
          title: "Health Alert",
          message: alert.message,
          type: alert.type,
          isRead: false,
          data: { metric }
        };
        
        await this.createNotification(patientNotification);
        
        // Get a recent appointment to find a doctor for this patient
        const appointments = await storage.getAppointments({ patientId: metric.patientId });
        if (appointments.length > 0) {
          const doctorId = appointments[0].doctorId;
          const doctor = await storage.getDoctorById(doctorId);
          
          if (doctor) {
            const doctorNotification = {
              userId: doctor.userId,
              title: "Patient Health Alert",
              message: `Patient ${patient.user.fullName}: ${alert.message}`,
              type: `doctor_${alert.type}`,
              isRead: false,
              data: { patientId: metric.patientId, metric }
            };
            
            await this.createNotification(doctorNotification);
          }
        }
      }
      
      return alert;
    } catch (error) {
      console.error("Error checking health metric:", error);
      throw new Error("Failed to check health metric");
    }
  }
  /**
   * Create medication reminder notification for a patient
   */
  async createMedicationReminder(
    scheduleId: number,
    patientId: number,
    medicationName: string,
    timing: string
  ) {
    try {
      // Get patient details to get userId
      const patient = await storage.getPatientById(patientId);
      if (!patient) {
        throw new Error(`Patient with ID ${patientId} not found`);
      }
      
      // Format timing message
      let timingMessage = "";
      switch (timing) {
        case "before_food":
          timingMessage = "before meals";
          break;
        case "with_food":
          timingMessage = "with meals";
          break;
        case "after_food":
          timingMessage = "after meals";
          break;
        case "no_food_restriction":
        default:
          timingMessage = "as scheduled";
          break;
      }
      
      // Create notification for patient
      const notification = {
        userId: patient.userId,
        title: "Medication Reminder Setup",
        message: `Reminder set for ${medicationName} ${timingMessage}. You'll receive notifications when it's time to take your medication.`,
        type: "medication_reminder",
        isRead: false,
        data: { scheduleId, medicationName, timing }
      };
      
      await this.createNotification(notification);
      
      return true;
    } catch (error) {
      console.error("Error creating medication reminder:", error);
      throw new Error("Failed to create medication reminder");
    }
  }
  
  /**
   * Send medication reminder notification
   * This would typically be called by a scheduled job
   */
  async sendMedicationReminderNotification(scheduleId: number) {
    try {
      // In a real implementation, we would get the medication schedule
      // from the database using the scheduleId
      const schedule = await db.query.medicationSchedules.findFirst({
        where: eq(schema.medicationSchedules.id, scheduleId),
        with: {
          patient: {
            with: {
              user: true
            }
          }
        }
      });
      
      if (!schedule) {
        throw new Error(`Medication schedule with ID ${scheduleId} not found`);
      }
      
      // Format timing message
      let timingMessage = "";
      switch (schedule.timing) {
        case "before_food":
          timingMessage = "Take this medication before meals";
          break;
        case "with_food":
          timingMessage = "Take this medication with meals";
          break;
        case "after_food":
          timingMessage = "Take this medication after meals";
          break;
        case "no_food_restriction":
        default:
          timingMessage = "Take this medication as scheduled";
          break;
      }
      
      // Create notification for patient
      const notification = {
        userId: schedule.patient.user.id,
        title: "Time to Take Your Medication",
        message: `Reminder: It's time to take ${schedule.medicationName}. ${timingMessage}.`,
        type: "medication_due",
        isRead: false,
        data: { scheduleId, medicationName: schedule.medicationName }
      };
      
      await this.createNotification(notification);
      
      return true;
    } catch (error) {
      console.error("Error sending medication reminder notification:", error);
      throw new Error("Failed to send medication reminder notification");
    }
  }
}

export const notification = new NotificationService();
