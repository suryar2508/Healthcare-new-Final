import { db } from "./index";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";
import { createHash } from "crypto";

// Simple password hashing function using SHA-256 (same as in auth.ts)
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

async function seed() {
  try {
    console.log("Starting database seed...");

    // Check for existing users to avoid duplicates
    const existingUsers = await db.select().from(schema.users);
    
    if (existingUsers.length > 0) {
      console.log(`Found ${existingUsers.length} existing users. Skipping user seed.`);
    } else {
      // Create admin user
      const [adminUser] = await db.insert(schema.users).values({
        username: "admin",
        password: hashPassword("password123"),
        email: "admin@example.com",
        fullName: "System Administrator",
        role: "admin"
      }).returning();
      console.log(`Created admin user: ${adminUser.username}`);
      
      // Create doctor users
      const doctorUsers = [
        {
          username: "dr.johnson",
          password: hashPassword("password123"),
          email: "dr.johnson@example.com",
          fullName: "Dr. Sarah Johnson",
          role: "doctor"
        },
        {
          username: "dr.chen",
          password: hashPassword("password123"),
          email: "dr.chen@example.com",
          fullName: "Dr. Michael Chen",
          role: "doctor"
        },
        {
          username: "dr.rodriguez",
          password: hashPassword("password123"),
          email: "dr.rodriguez@example.com",
          fullName: "Dr. Emily Rodriguez",
          role: "doctor"
        }
      ];
      
      const insertedDoctorUsers = await db.insert(schema.users).values(doctorUsers).returning();
      console.log(`Created ${insertedDoctorUsers.length} doctor users`);
      
      // Create doctor profiles
      const doctors = insertedDoctorUsers.map((user, index) => ({
        userId: user.id,
        specialization: ["Cardiology", "General Medicine", "Neurology"][index % 3],
        licenseNumber: `MD${10000 + index}`,
        phone: `+1 (555) ${100 + index}-${1000 + index}`,
        address: "123 Medical Center, Healthcare City",
        bio: `Experienced ${["Cardiology", "General Medicine", "Neurology"][index % 3]} specialist with over 10 years of practice.`,
        isActive: true
      }));
      
      const insertedDoctors = await db.insert(schema.doctors).values(doctors).returning();
      console.log(`Created ${insertedDoctors.length} doctor profiles`);
      
      // Create patient users
      const patientUsers = [
        {
          username: "john.doe",
          password: hashPassword("password123"),
          email: "john.doe@example.com",
          fullName: "John Doe",
          role: "patient"
        },
        {
          username: "jane.smith",
          password: hashPassword("password123"),
          email: "jane.smith@example.com",
          fullName: "Jane Smith",
          role: "patient"
        },
        {
          username: "robert.johnson",
          password: hashPassword("password123"),
          email: "robert.johnson@example.com",
          fullName: "Robert Johnson",
          role: "patient"
        },
        {
          username: "emily.brown",
          password: hashPassword("password123"),
          email: "emily.brown@example.com",
          fullName: "Emily Brown",
          role: "patient"
        },
        {
          username: "mark.wilson",
          password: hashPassword("password123"),
          email: "mark.wilson@example.com",
          fullName: "Mark Wilson",
          role: "patient"
        }
      ];
      
      const insertedPatientUsers = await db.insert(schema.users).values(patientUsers).returning();
      console.log(`Created ${insertedPatientUsers.length} patient users`);
      
      // Create patient profiles
      const today = new Date();
      const patients = insertedPatientUsers.map((user, index) => {
        const birthYear = today.getFullYear() - (25 + index * 10); // Ages 25, 35, 45, 55, 65
        const birthDate = new Date(birthYear, today.getMonth(), today.getDate());
        
        return {
          userId: user.id,
          dateOfBirth: birthDate,
          gender: index % 2 === 0 ? 'male' : 'female',
          phone: `+1 (555) ${200 + index}-${2000 + index}`,
          address: `${(index + 1) * 100} Residential St, Healthcare City`,
          emergencyContact: `Emergency Contact: ${(index + 1) * 100}-555-${3000 + index}`,
          bloodType: ['A+', 'B+', 'O+', 'AB+', 'O-'][index % 5],
          allergies: index % 3 === 0 ? 'Penicillin, Peanuts' : (index % 3 === 1 ? 'Shellfish' : null),
          medicalHistory: index % 2 === 0 ? 'Hypertension, Diabetes' : (index % 3 === 1 ? 'Asthma' : null)
        };
      });
      
      const insertedPatients = await db.insert(schema.patients).values(patients).returning();
      console.log(`Created ${insertedPatients.length} patient profiles`);
      
      // Create appointments
      const appointmentStatuses = ["scheduled", "completed", "cancelled"];
      const appointmentReasons = [
        "Regular Check-up", 
        "Follow-up Consultation", 
        "Annual Physical", 
        "Medication Review",
        "Urgent Consultation"
      ];
      
      // Generate appointments for the next 14 days
      const appointments = [];
      for (let i = 0; i < insertedPatients.length; i++) {
        for (let j = 0; j < 3; j++) {
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + j * 3 + i); // Spread appointments over next 14 days
          
          const appointmentHour = 9 + (i + j) % 8; // Between 9 AM and 4 PM
          const appointmentMinute = (i * 15) % 60; // 0, 15, 30, or 45 minutes
          
          const appointmentTime = `${appointmentHour.toString().padStart(2, '0')}:${appointmentMinute.toString().padStart(2, '0')}`;
          
          appointments.push({
            patientId: insertedPatients[i].id,
            doctorId: insertedDoctors[j % insertedDoctors.length].id,
            appointmentDate: futureDate,
            appointmentTime: appointmentTime,
            status: j === 0 ? "scheduled" : (j === 1 ? "completed" : appointmentStatuses[Math.floor(Math.random() * 3)]),
            reason: appointmentReasons[Math.floor(Math.random() * appointmentReasons.length)],
            notes: j === 1 ? "Patient reported improvements since last visit." : null
          });
        }
      }
      
      const insertedAppointments = await db.insert(schema.appointments).values(appointments).returning();
      console.log(`Created ${insertedAppointments.length} appointments`);
      
      // Create prescriptions for completed appointments
      const completedAppointments = insertedAppointments.filter(app => app.status === "completed");
      
      if (completedAppointments.length > 0) {
        const prescriptions = completedAppointments.map(appointment => ({
          patientId: appointment.patientId,
          doctorId: appointment.doctorId,
          diagnosis: "Hypertension Stage 1",
          instructions: "Take medications as prescribed, follow a low-sodium diet, exercise regularly.",
          followUpDate: (() => {
            const followUp = new Date(appointment.appointmentDate);
            followUp.setMonth(followUp.getMonth() + 1);
            return followUp;
          })(),
          vitalSigns: {
            bloodPressure: "138/88",
            pulse: 78,
            temperature: 98.6,
            weight: 72.5
          }
        }));
        
        const insertedPrescriptions = await db.insert(schema.prescriptions).values(prescriptions).returning();
        console.log(`Created ${insertedPrescriptions.length} prescriptions`);
        
        // Create prescription items (medications)
        const medications = [
          ["Lisinopril", "10mg tablet", "once_daily", "30 days"],
          ["Metformin", "500mg tablet", "twice_daily", "30 days"],
          ["Aspirin", "81mg tablet", "once_daily", "30 days"],
          ["Atorvastatin", "20mg tablet", "once_daily", "30 days"],
          ["Hydrochlorothiazide", "25mg tablet", "once_daily", "30 days"]
        ];
        
        const prescriptionItems = [];
        for (let i = 0; i < insertedPrescriptions.length; i++) {
          // Each prescription gets 1-3 medications
          const numMeds = Math.floor(Math.random() * 3) + 1;
          
          for (let j = 0; j < numMeds; j++) {
            const medIndex = (i + j) % medications.length;
            prescriptionItems.push({
              prescriptionId: insertedPrescriptions[i].id,
              medication: medications[medIndex][0],
              dosage: medications[medIndex][1],
              frequency: medications[medIndex][2] as any,
              duration: medications[medIndex][3]
            });
          }
        }
        
        const insertedPrescriptionItems = await db.insert(schema.prescriptionItems).values(prescriptionItems).returning();
        console.log(`Created ${insertedPrescriptionItems.length} prescription items`);
        
        // Generate medication schedules
        const now = new Date();
        const medicationSchedules = insertedPrescriptionItems.map(item => ({
          patientId: insertedPrescriptions.find(p => p.id === item.prescriptionId)!.patientId,
          prescriptionItemId: item.id,
          medicationName: item.medication,
          dosage: item.dosage,
          frequency: item.frequency,
          startDate: now,
          endDate: (() => {
            const endDate = new Date(now);
            const durationMatch = item.duration.match(/^(\d+)/);
            const durationDays = durationMatch ? parseInt(durationMatch[1]) : 30;
            endDate.setDate(endDate.getDate() + durationDays);
            return endDate;
          })(),
          timeOfDay: item.frequency === "once_daily" ? "morning" : 
                     item.frequency === "twice_daily" ? "morning,evening" : 
                     item.frequency === "three_times_daily" ? "morning,afternoon,evening" : 
                     "morning,noon,afternoon,evening",
          isActive: true,
          instructions: "Take with food"
        }));
        
        const insertedMedicationSchedules = await db.insert(schema.medicationSchedules).values(medicationSchedules).returning();
        console.log(`Created ${insertedMedicationSchedules.length} medication schedules`);
      }
      
      // Create health metrics for patients
      const metricTypes = ["blood_pressure", "glucose", "heart_rate", "weight", "temperature", "oxygen"];
      const healthMetrics = [];
      
      for (let i = 0; i < insertedPatients.length; i++) {
        // Create metrics over the last 30 days
        for (let j = 0; j < 30; j += 3) {
          const recordDate = new Date();
          recordDate.setDate(recordDate.getDate() - j);
          
          // Blood pressure
          if (j % 4 === 0) {
            healthMetrics.push({
              patientId: insertedPatients[i].id,
              metricType: "blood_pressure",
              metricValue: {
                systolic: 120 + Math.floor(Math.random() * 20),
                diastolic: 80 + Math.floor(Math.random() * 10),
                unit: "mmHg"
              },
              recordedAt: recordDate,
              notes: j === 0 ? "Morning reading, after breakfast" : null
            });
          }
          
          // Glucose
          if (j % 6 === 0) {
            healthMetrics.push({
              patientId: insertedPatients[i].id,
              metricType: "glucose",
              metricValue: {
                value: 100 + Math.floor(Math.random() * 40),
                unit: "mg/dL"
              },
              recordedAt: recordDate,
              notes: null
            });
          }
          
          // Heart rate
          if (j % 5 === 0) {
            healthMetrics.push({
              patientId: insertedPatients[i].id,
              metricType: "heart_rate",
              metricValue: {
                value: 65 + Math.floor(Math.random() * 20),
                unit: "BPM"
              },
              recordedAt: recordDate,
              notes: null
            });
          }
          
          // Weight
          if (j % 7 === 0) {
            healthMetrics.push({
              patientId: insertedPatients[i].id,
              metricType: "weight",
              metricValue: {
                value: 70 + Math.floor(Math.random() * 10) + (i / 10),
                unit: "kg"
              },
              recordedAt: recordDate,
              notes: null
            });
          }
        }
      }
      
      const insertedHealthMetrics = await db.insert(schema.healthMetrics).values(healthMetrics).returning();
      console.log(`Created ${insertedHealthMetrics.length} health metrics`);
      
      // Create drug interactions
      const drugInteractions = [
        {
          drugA: "Lisinopril",
          drugB: "Spironolactone",
          severity: "moderate",
          description: "Potential increased risk of hyperkalemia (high potassium levels).",
          effect: "Monitor potassium levels closely and adjust dosages if necessary."
        },
        {
          drugA: "Aspirin",
          drugB: "Warfarin",
          severity: "severe",
          description: "Increased risk of bleeding complications.",
          effect: "Avoid concomitant use when possible or monitor closely."
        },
        {
          drugA: "Simvastatin",
          drugB: "Erythromycin",
          severity: "severe",
          description: "Increased risk of myopathy and rhabdomyolysis.",
          effect: "Avoid combination or reduce simvastatin dose."
        },
        {
          drugA: "Metformin",
          drugB: "Furosemide",
          severity: "mild",
          description: "May reduce metformin efficacy.",
          effect: "Monitor blood glucose levels more frequently."
        },
        {
          drugA: "Amiodarone",
          drugB: "Levofloxacin",
          severity: "severe",
          description: "Increased risk of QT interval prolongation and cardiac arrhythmias.",
          effect: "Avoid combination when possible or monitor ECG regularly."
        }
      ];
      
      const insertedDrugInteractions = await db.insert(schema.drugInteractions).values(drugInteractions).returning();
      console.log(`Created ${insertedDrugInteractions.length} drug interactions`);
      
      // Create notifications
      const notificationTypes = [
        "appointment_reminder", 
        "medication_reminder", 
        "prescription_available",
        "lab_results_ready",
        "high_blood_pressure",
        "low_blood_sugar"
      ];
      
      const notifications = [];
      for (let i = 0; i < insertedPatientUsers.length; i++) {
        for (let j = 0; j < 3; j++) {
          const notificationType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
          let title, message;
          
          switch (notificationType) {
            case "appointment_reminder":
              title = "Upcoming Appointment";
              message = "You have an appointment tomorrow at 10:00 AM.";
              break;
            case "medication_reminder":
              title = "Medication Reminder";
              message = "Time to take your Lisinopril medication.";
              break;
            case "prescription_available":
              title = "Prescription Ready";
              message = "Your prescription is ready for pickup.";
              break;
            case "lab_results_ready":
              title = "Lab Results Available";
              message = "Your recent lab results are now available.";
              break;
            case "high_blood_pressure":
              title = "Health Alert";
              message = "Your blood pressure reading is elevated.";
              break;
            case "low_blood_sugar":
              title = "Health Alert";
              message = "Your blood sugar reading is below normal range.";
              break;
            default:
              title = "System Notification";
              message = "You have a new notification.";
          }
          
          notifications.push({
            userId: insertedPatientUsers[i].id,
            title,
            message,
            type: notificationType,
            isRead: j > 0, // Only the first notification is unread
            createdAt: new Date(),
            data: { meta: "Additional data for notification" }
          });
        }
      }
      
      // Add notifications for doctors too
      for (let i = 0; i < insertedDoctorUsers.length; i++) {
        notifications.push({
          userId: insertedDoctorUsers[i].id,
          title: "Patient Alert",
          message: "Patient John Doe has reported abnormal blood pressure readings.",
          type: "patient_vital_alert",
          isRead: false,
          createdAt: new Date(),
          data: { patientId: insertedPatients[0].id, vitalType: "blood_pressure" }
        });
        
        notifications.push({
          userId: insertedDoctorUsers[i].id,
          title: "New Appointment",
          message: "You have a new appointment scheduled for tomorrow.",
          type: "new_appointment",
          isRead: true,
          createdAt: new Date(),
          data: { appointmentId: 1 }
        });
      }
      
      const insertedNotifications = await db.insert(schema.notifications).values(notifications).returning();
      console.log(`Created ${insertedNotifications.length} notifications`);
    }
    
    console.log("Database seed completed successfully!");
  } catch (error) {
    console.error("Error during database seed:", error);
  }
}

seed();
