import { db } from "@db";
import * as schema from "@shared/schema";
import { eq, and, desc, gte, lte, or, sql, asc, isNull, isNotNull, inArray } from "drizzle-orm";
import { InsertUser, InsertDoctor, InsertPatient, InsertAppointment, InsertPrescription, InsertHealthMetric, InsertMedicationSchedule } from "@shared/schema";

import session from "express-session";
import { db } from "../db";
import { users, InsertUser } from "@shared/schema";
import { eq } from "drizzle-orm";

/**
 * Storage class for database operations
 * Provides methods for CRUD operations on all entities
 */
class Storage {
  sessionStore: session.SessionStore;
  
  constructor() {
    // This will be initialized in setupAuth
    this.sessionStore = {} as session.SessionStore;
  }
  // User operations
  async getUserByCredentials(username: string, password: string) {
    try {
      const user = await db.query.users.findFirst({
        where: and(
          eq(schema.users.username, username),
          eq(schema.users.password, password)
        ),
      });
      return user;
    } catch (error) {
      console.error("Error getting user by credentials:", error);
      throw new Error("Database error when retrieving user");
    }
  }

  async getUserById(id: number) {
    try {
      return await db.query.users.findFirst({
        where: eq(schema.users.id, id),
      });
    } catch (error) {
      console.error("Error getting user by ID:", error);
      throw new Error("Database error when retrieving user");
    }
  }
  
  async getUserByUsername(username: string) {
    try {
      return await db.query.users.findFirst({
        where: eq(schema.users.username, username),
      });
    } catch (error) {
      console.error("Error getting user by username:", error);
      throw new Error("Database error when retrieving user");
    }
  }

  async insertUser(user: InsertUser) {
    try {
      const [newUser] = await db.insert(schema.users).values(user).returning();
      return newUser;
    } catch (error) {
      console.error("Error inserting user:", error);
      throw new Error("Database error when creating user");
    }
  }

  // Doctor operations
  async getAllDoctors() {
    try {
      return await db.query.doctors.findMany({
        with: {
          user: true
        }
      });
    } catch (error) {
      console.error("Error getting all doctors:", error);
      throw new Error("Database error when retrieving doctors");
    }
  }

  async getDoctorById(id: number) {
    try {
      return await db.query.doctors.findFirst({
        where: eq(schema.doctors.id, id),
        with: {
          user: true
        }
      });
    } catch (error) {
      console.error("Error getting doctor by ID:", error);
      throw new Error("Database error when retrieving doctor");
    }
  }

  async getDoctorStats() {
    try {
      // Get active doctor count
      const activeDoctorsCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.doctors)
        .where(eq(schema.doctors.isActive, true));

      // Get total patients count
      const totalPatientsCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.patients);

      // Get today's appointments count
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayAppointmentsCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.appointments)
        .where(and(
          gte(schema.appointments.appointmentDate, today),
          lte(schema.appointments.appointmentDate, tomorrow)
        ));

      // Get recent prescriptions count
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      const recentPrescriptionsCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.prescriptions)
        .where(gte(schema.prescriptions.createdAt, lastMonth));

      return {
        activeDoctors: activeDoctorsCount[0].count,
        totalPatients: totalPatientsCount[0].count,
        todayAppointments: todayAppointmentsCount[0].count,
        recentPrescriptions: recentPrescriptionsCount[0].count
      };
    } catch (error) {
      console.error("Error getting doctor stats:", error);
      throw new Error("Database error when retrieving doctor statistics");
    }
  }

  async insertDoctor(doctor: InsertDoctor) {
    try {
      const [newDoctor] = await db.insert(schema.doctors).values(doctor).returning();
      return newDoctor;
    } catch (error) {
      console.error("Error inserting doctor:", error);
      throw new Error("Database error when creating doctor");
    }
  }

  // Patient operations
  async getAllPatients() {
    try {
      return await db.query.patients.findMany({
        with: {
          user: true
        }
      });
    } catch (error) {
      console.error("Error getting all patients:", error);
      throw new Error("Database error when retrieving patients");
    }
  }

  async getPatientById(id: number) {
    try {
      return await db.query.patients.findFirst({
        where: eq(schema.patients.id, id),
        with: {
          user: true
        }
      });
    } catch (error) {
      console.error("Error getting patient by ID:", error);
      throw new Error("Database error when retrieving patient");
    }
  }

  async getPatientStats() {
    try {
      // Get total patients count
      const totalPatientsCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.patients);

      // Get appointments by status
      const appointmentsByStatus = await db
        .select({
          status: schema.appointments.status,
          count: sql<number>`count(*)`
        })
        .from(schema.appointments)
        .groupBy(schema.appointments.status);

      // Get recent health metrics count
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      const recentHealthMetricsCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.healthMetrics)
        .where(gte(schema.healthMetrics.recordedAt, lastMonth));

      return {
        totalPatients: totalPatientsCount[0].count,
        appointmentsByStatus: appointmentsByStatus.reduce((acc: any, curr) => {
          acc[curr.status] = curr.count;
          return acc;
        }, {}),
        recentHealthMetrics: recentHealthMetricsCount[0].count
      };
    } catch (error) {
      console.error("Error getting patient stats:", error);
      throw new Error("Database error when retrieving patient statistics");
    }
  }

  async insertPatient(patient: InsertPatient) {
    try {
      const [newPatient] = await db.insert(schema.patients).values(patient).returning();
      return newPatient;
    } catch (error) {
      console.error("Error inserting patient:", error);
      throw new Error("Database error when creating patient");
    }
  }

  // Appointment operations
  async getAppointments(filters = {}, dateRange = {}) {
    try {
      let whereClause: any = {};
      
      if ('doctorId' in filters) {
        whereClause.doctorId = eq(schema.appointments.doctorId, filters.doctorId);
      }
      
      if ('patientId' in filters) {
        whereClause.patientId = eq(schema.appointments.patientId, filters.patientId);
      }
      
      if ('status' in filters) {
        whereClause.status = eq(schema.appointments.status, filters.status);
      }
      
      if ('from' in dateRange) {
        whereClause.fromDate = gte(schema.appointments.appointmentDate, dateRange.from);
      }
      
      if ('to' in dateRange) {
        whereClause.toDate = lte(schema.appointments.appointmentDate, dateRange.to);
      }

      return await db.query.appointments.findMany({
        where: and(...Object.values(whereClause)),
        with: {
          doctor: {
            with: {
              user: true
            }
          },
          patient: {
            with: {
              user: true
            }
          }
        },
        orderBy: [asc(schema.appointments.appointmentDate), asc(schema.appointments.appointmentTime)]
      });
    } catch (error) {
      console.error("Error getting appointments:", error);
      throw new Error("Database error when retrieving appointments");
    }
  }

  async getAppointmentById(id: number) {
    try {
      return await db.query.appointments.findFirst({
        where: eq(schema.appointments.id, id),
        with: {
          doctor: {
            with: {
              user: true
            }
          },
          patient: {
            with: {
              user: true
            }
          }
        }
      });
    } catch (error) {
      console.error("Error getting appointment by ID:", error);
      throw new Error("Database error when retrieving appointment");
    }
  }

  async insertAppointment(appointment: InsertAppointment) {
    try {
      const [newAppointment] = await db.insert(schema.appointments).values(appointment).returning();
      return newAppointment;
    } catch (error) {
      console.error("Error inserting appointment:", error);
      throw new Error("Database error when creating appointment");
    }
  }

  async updateAppointmentStatus(id: number, status: string) {
    try {
      const [updatedAppointment] = await db
        .update(schema.appointments)
        .set({ 
          status: status as any,
          updatedAt: new Date()
        })
        .where(eq(schema.appointments.id, id))
        .returning();
      
      return updatedAppointment;
    } catch (error) {
      console.error("Error updating appointment status:", error);
      throw new Error("Database error when updating appointment");
    }
  }

  // Prescription operations
  async getPrescriptions(filters = {}) {
    try {
      let whereClause: any = {};
      
      if ('doctorId' in filters) {
        whereClause.doctorId = eq(schema.prescriptions.doctorId, filters.doctorId);
      }
      
      if ('patientId' in filters) {
        whereClause.patientId = eq(schema.prescriptions.patientId, filters.patientId);
      }

      return await db.query.prescriptions.findMany({
        where: and(...Object.values(whereClause)),
        with: {
          doctor: {
            with: {
              user: true
            }
          },
          patient: {
            with: {
              user: true
            }
          },
          items: true
        },
        orderBy: [desc(schema.prescriptions.createdAt)]
      });
    } catch (error) {
      console.error("Error getting prescriptions:", error);
      throw new Error("Database error when retrieving prescriptions");
    }
  }

  async getPrescriptionById(id: number) {
    try {
      return await db.query.prescriptions.findFirst({
        where: eq(schema.prescriptions.id, id),
        with: {
          doctor: {
            with: {
              user: true
            }
          },
          patient: {
            with: {
              user: true
            }
          },
          items: true,
          bill: true
        }
      });
    } catch (error) {
      console.error("Error getting prescription by ID:", error);
      throw new Error("Database error when retrieving prescription");
    }
  }

  async insertPrescription(prescription: InsertPrescription, items: any[]) {
    try {
      // Begin transaction
      return await db.transaction(async (tx) => {
        // Insert prescription
        const [newPrescription] = await tx
          .insert(schema.prescriptions)
          .values(prescription)
          .returning();

        // Insert prescription items
        if (items.length > 0) {
          const itemsWithPrescriptionId = items.map(item => ({
            ...item,
            prescriptionId: newPrescription.id
          }));

          await tx
            .insert(schema.prescriptionItems)
            .values(itemsWithPrescriptionId);
        }

        // Return the complete prescription with items
        return newPrescription;
      });
    } catch (error) {
      console.error("Error inserting prescription:", error);
      throw new Error("Database error when creating prescription");
    }
  }

  // Health metrics operations
  async getHealthMetrics(filters = {}) {
    try {
      let whereClause: any = {};
      
      if ('patientId' in filters) {
        whereClause.patientId = eq(schema.healthMetrics.patientId, filters.patientId);
      }
      
      if ('metricType' in filters) {
        whereClause.metricType = eq(schema.healthMetrics.metricType, filters.metricType);
      }

      return await db.query.healthMetrics.findMany({
        where: and(...Object.values(whereClause)),
        orderBy: [desc(schema.healthMetrics.recordedAt)]
      });
    } catch (error) {
      console.error("Error getting health metrics:", error);
      throw new Error("Database error when retrieving health metrics");
    }
  }

  async insertHealthMetric(metric: InsertHealthMetric) {
    try {
      const [newMetric] = await db.insert(schema.healthMetrics).values(metric).returning();
      return newMetric;
    } catch (error) {
      console.error("Error inserting health metric:", error);
      throw new Error("Database error when creating health metric");
    }
  }

  // Medication schedule operations
  async getMedicationSchedules(filters = {}) {
    try {
      let whereClause: any = {};
      
      if ('patientId' in filters) {
        whereClause.patientId = eq(schema.medicationSchedules.patientId, filters.patientId);
      }
      
      if ('isActive' in filters) {
        whereClause.isActive = eq(schema.medicationSchedules.isActive, filters.isActive);
      }

      return await db.query.medicationSchedules.findMany({
        where: and(...Object.values(whereClause)),
        orderBy: [asc(schema.medicationSchedules.startDate)]
      });
    } catch (error) {
      console.error("Error getting medication schedules:", error);
      throw new Error("Database error when retrieving medication schedules");
    }
  }

  async insertMedicationSchedule(schedule: InsertMedicationSchedule) {
    try {
      const [newSchedule] = await db.insert(schema.medicationSchedules).values(schedule).returning();
      return newSchedule;
    } catch (error) {
      console.error("Error inserting medication schedule:", error);
      throw new Error("Database error when creating medication schedule");
    }
  }

  // Drug interactions
  async checkDrugInteractions(medications: string[]) {
    try {
      if (medications.length < 2) {
        return [];
      }

      // Query for any interactions between the medications
      const interactions = await db
        .select()
        .from(schema.drugInteractions)
        .where(
          or(
            ...medications.flatMap(med1 => 
              medications
                .filter(med2 => med1 !== med2)
                .map(med2 => 
                  and(
                    eq(schema.drugInteractions.drugA, med1),
                    eq(schema.drugInteractions.drugB, med2)
                  )
                )
            )
          )
        );

      return interactions;
    } catch (error) {
      console.error("Error checking drug interactions:", error);
      throw new Error("Database error when checking drug interactions");
    }
  }

  // Notifications
  async getNotifications(userId: number) {
    try {
      return await db.query.notifications.findMany({
        where: eq(schema.notifications.userId, userId),
        orderBy: [desc(schema.notifications.createdAt)]
      });
    } catch (error) {
      console.error("Error getting notifications:", error);
      throw new Error("Database error when retrieving notifications");
    }
  }

  async insertNotification(notification: any) {
    try {
      const [newNotification] = await db.insert(schema.notifications).values(notification).returning();
      return newNotification;
    } catch (error) {
      console.error("Error inserting notification:", error);
      throw new Error("Database error when creating notification");
    }
  }

  async markNotificationAsRead(id: number) {
    try {
      const [updatedNotification] = await db
        .update(schema.notifications)
        .set({ isRead: true })
        .where(eq(schema.notifications.id, id))
        .returning();
      
      return updatedNotification;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw new Error("Database error when updating notification");
    }
  }
}

export const storage = new Storage();
