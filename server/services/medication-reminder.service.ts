import { storage } from "../storage";
import { notification } from "./notification.service";

/**
 * Service class for medication reminder related operations
 * Handles sending reminders to patients and managing medication schedules
 */
class MedicationReminderService {
  /**
   * Create medication reminders for a patient
   */
  async createMedicationReminders(patientId: number, medications: any[]) {
    try {
      // Save medication reminders to database
      const savedReminders = [];
      
      for (const medication of medications) {
        // Format reminder data for storage
        const reminderData = {
          patientId,
          medicationName: medication.medicationName,
          dosage: medication.dosage || '1 tablet',
          frequency: 'once_daily',
          timeOfDay: medication.time,
          startDate: medication.startDate,
          endDate: medication.endDate || medication.startDate,
          isActive: medication.active !== false,
          instructions: `Take at ${medication.time} on: ${medication.days.join(', ')}`,
          enableNotifications: true
        };
        
        // Save to database
        const savedReminder = await storage.insertMedicationSchedule(reminderData);
        savedReminders.push(savedReminder);
        
        // Send notification to patient about new reminder - pass medication data directly
        await notification.sendMedicationReminderNotification(patientId, medication);
      }
      
      return savedReminders;
    } catch (error) {
      console.error("Error creating medication reminders:", error);
      throw new Error("Failed to create medication reminders");
    }
  }
  
  /**
   * Send reminder notifications for due medications
   * This would typically be called by a scheduler/cron job
   */
  async sendDueReminderNotifications() {
    try {
      // Get current date and time
      const now = new Date();
      const currentTime = now.toTimeString().substring(0, 5); // HH:MM format
      const currentDay = this.getDayOfWeek(now.getDay());
      
      // Find all active reminders due at the current time on the current day
      const dueReminders = await storage.getMedicationSchedules({
        active: true,
        reminderTime: currentTime
      });
      
      // Filter reminders by day of week and date range
      const filteredReminders = dueReminders.filter(reminder => {
        // Check if today is in the days of week for this reminder
        const daysOfWeek = reminder.daysOfWeek.split(',');
        if (!daysOfWeek.includes(currentDay)) {
          return false;
        }
        
        // Check if current date is within the reminder's date range
        const startDate = new Date(reminder.startDate);
        const endDate = new Date(reminder.endDate);
        return now >= startDate && now <= endDate;
      });
      
      // Send notifications for each due reminder
      for (const reminder of filteredReminders) {
        // Format reminder data for notification
        const medicationData = {
          medicationName: reminder.medicationName,
          time: reminder.reminderTime,
          startDate: reminder.startDate,
          endDate: reminder.endDate,
          days: reminder.daysOfWeek.split(',')
        };
        
        // Send in-app notification
        await notification.sendMedicationReminderNotification(reminder.patientId, medicationData);
        
        // Send email notification if email is configured
        try {
          await notification.sendMedicationReminderEmail(reminder.patientId, medicationData);
        } catch (emailError) {
          console.warn(`Failed to send email for reminder ${reminder.id}:`, emailError);
          // Continue with other reminders even if email fails
        }
      }
      
      return filteredReminders.length;
    } catch (error) {
      console.error("Error sending due reminder notifications:", error);
      throw new Error("Failed to send due reminder notifications");
    }
  }
  
  /**
   * Get day of week string from day number (0-6)
   */
  private getDayOfWeek(day: number): string {
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    return days[day];
  }
}

export const medicationReminder = new MedicationReminderService();