import { pgTable, text, serial, integer, boolean, timestamp, varchar, decimal, json, date, time, pgEnum, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'doctor', 'patient', 'pharmacist']);
export const appointmentStatusEnum = pgEnum('appointment_status', ['scheduled', 'completed', 'cancelled']);
export const medicationFrequencyEnum = pgEnum('medication_frequency', ['once_daily', 'twice_daily', 'three_times_daily', 'four_times_daily', 'as_needed']);
export const medicationTimingEnum = pgEnum('medication_timing', ['before_food', 'with_food', 'after_food', 'no_food_restriction']);
export const prescriptionStatusEnum = pgEnum('prescription_status', ['pending', 'processing', 'ready', 'delivered', 'cancelled']);
export const inventoryStatusEnum = pgEnum('inventory_status', ['in_stock', 'low_stock', 'out_of_stock', 'expired', 'discontinued']);
export const feedbackRatingEnum = pgEnum('feedback_rating', ['1', '2', '3', '4', '5']);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  fullName: text("full_name"),
  role: userRoleEnum("role").notNull().default('patient'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Doctors table
export const doctors = pgTable("doctors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  specialization: text("specialization"),
  licenseNumber: text("license_number"),
  phone: text("phone"),
  address: text("address"),
  bio: text("bio"),
  isActive: boolean("is_active").default(true).notNull(),
});

// Patients table
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  dateOfBirth: date("date_of_birth"),
  gender: text("gender"),
  phone: text("phone"),
  address: text("address"),
  emergencyContact: text("emergency_contact"),
  bloodType: text("blood_type"),
  allergies: text("allergies"),
  medicalHistory: text("medical_history"),
});

// Appointments table
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  doctorId: integer("doctor_id").references(() => doctors.id).notNull(),
  appointmentDate: date("appointment_date").notNull(),
  appointmentTime: time("appointment_time").notNull(),
  status: appointmentStatusEnum("status").default('scheduled').notNull(),
  reason: text("reason"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Prescriptions table
export const prescriptions = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  doctorId: integer("doctor_id").references(() => doctors.id),
  diagnosis: text("diagnosis"),
  instructions: text("instructions"),
  followUpDate: date("follow_up_date"),
  status: prescriptionStatusEnum("status").default('pending').notNull(),
  isOcrGenerated: boolean("is_ocr_generated").default(false).notNull(),
  originalImageUrl: text("original_image_url"),
  aiAnalysisData: json("ai_analysis_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  vitalSigns: json("vital_signs").$type<{
    bloodPressure?: string,
    pulse?: number,
    temperature?: number,
    weight?: number
  }>(),
});

// Prescription Items (Medications) table
export const prescriptionItems = pgTable("prescription_items", {
  id: serial("id").primaryKey(),
  prescriptionId: integer("prescription_id").references(() => prescriptions.id).notNull(),
  medication: text("medication").notNull(),
  dosage: text("dosage").notNull(),
  frequency: medicationFrequencyEnum("frequency").notNull(),
  duration: text("duration"),
});

// Bills table
export const bills = pgTable("bills", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  prescriptionId: integer("prescription_id").references(() => prescriptions.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").default('pending').notNull(),
  dueDate: date("due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  details: json("details").$type<{
    items: Array<{
      description: string,
      amount: number
    }>
  }>(),
});

// Health Metrics table
export const healthMetrics = pgTable("health_metrics", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  metricType: text("metric_type").notNull(), // blood_pressure, glucose, weight, etc.
  metricValue: json("metric_value").$type<{
    systolic?: number,
    diastolic?: number,
    value?: number,
    unit?: string
  }>().notNull(),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
  notes: text("notes"),
});

// Medication Schedule table
export const medicationSchedules = pgTable("medication_schedules", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  prescriptionItemId: integer("prescription_item_id").references(() => prescriptionItems.id),
  medicationName: text("medication_name").notNull(),
  dosage: text("dosage").notNull(),
  frequency: medicationFrequencyEnum("frequency").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  timeOfDay: text("time_of_day"), // morning, afternoon, evening, or specific times
  timing: medicationTimingEnum("timing").default('no_food_restriction'), // before food, with food, after food, etc.
  isActive: boolean("is_active").default(true).notNull(),
  instructions: text("instructions"),
  dosageStrength: text("dosage_strength"), // for storing values like "200mg", "500mg"
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(),  // appointment, medication, system, etc.
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  data: json("data"),
});

// Drug Interactions table for storing known drug interactions
export const drugInteractions = pgTable("drug_interactions", {
  id: serial("id").primaryKey(),
  drugA: text("drug_a").notNull(),
  drugB: text("drug_b").notNull(),
  severity: text("severity").notNull(), // mild, moderate, severe
  description: text("description").notNull(),
  effect: text("effect"),
});

// Medicine Inventory table for pharmacists
export const medicineInventory = pgTable("medicine_inventory", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  brandName: text("brand_name"),
  description: text("description"),
  dosageForm: text("dosage_form"), // tablet, capsule, liquid, etc.
  strength: text("strength"), // e.g., "500mg", "10mg/ml"
  category: text("category"),
  quantity: integer("quantity").default(0).notNull(),
  threshold: integer("threshold").default(10).notNull(), // alert when stock falls below this
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),
  expiryDate: date("expiry_date"),
  status: inventoryStatusEnum("status").default('in_stock').notNull(),
  location: text("location"), // storage location in pharmacy
  batchNumber: text("batch_number"),
  manufacturer: text("manufacturer"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Prescription Analysis table for ML insights
export const prescriptionAnalysis = pgTable("prescription_analysis", {
  id: serial("id").primaryKey(),
  prescriptionId: integer("prescription_id").references(() => prescriptions.id),
  doctorId: integer("doctor_id").references(() => doctors.id),
  patientId: integer("patient_id").references(() => patients.id),
  analysisType: text("analysis_type").notNull(), // trend, interaction, anomaly, etc.
  analysisResult: json("analysis_result").notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }),
  recommendation: text("recommendation"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Feedback table for patient ratings
export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  doctorId: integer("doctor_id").references(() => doctors.id),
  prescriptionId: integer("prescription_id").references(() => prescriptions.id),
  appointmentId: integer("appointment_id").references(() => appointments.id),
  rating: feedbackRatingEnum("rating").notNull(),
  comment: text("comment"),
  category: text("category").notNull(), // service, doctor, prescription, app_experience
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// OCR Prescription Uploads table
export const ocrPrescriptionUploads = pgTable("ocr_prescription_uploads", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  imageUrl: text("image_url").notNull(),
  status: text("status").default('pending').notNull(), // pending, processing, completed, failed
  extractedText: text("extracted_text"),
  confidenceScore: decimal("confidence_score", { precision: 5, scale: 2 }),
  convertedPrescriptionId: integer("converted_prescription_id").references(() => prescriptions.id),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  doctors: many(doctors),
  patients: many(patients),
  notifications: many(notifications),
}));

export const doctorsRelations = relations(doctors, ({ one, many }) => ({
  user: one(users, { fields: [doctors.userId], references: [users.id] }),
  appointments: many(appointments),
  prescriptions: many(prescriptions),
}));

export const patientsRelations = relations(patients, ({ one, many }) => ({
  user: one(users, { fields: [patients.userId], references: [users.id] }),
  appointments: many(appointments),
  prescriptions: many(prescriptions),
  bills: many(bills),
  healthMetrics: many(healthMetrics),
  medicationSchedules: many(medicationSchedules),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  patient: one(patients, { fields: [appointments.patientId], references: [patients.id] }),
  doctor: one(doctors, { fields: [appointments.doctorId], references: [doctors.id] }),
}));

export const prescriptionsRelations = relations(prescriptions, ({ one, many }) => ({
  patient: one(patients, { fields: [prescriptions.patientId], references: [patients.id] }),
  doctor: one(doctors, { fields: [prescriptions.doctorId], references: [doctors.id] }),
  items: many(prescriptionItems),
  bill: many(bills),
}));

export const prescriptionItemsRelations = relations(prescriptionItems, ({ one, many }) => ({
  prescription: one(prescriptions, { fields: [prescriptionItems.prescriptionId], references: [prescriptions.id] }),
  medicationSchedules: many(medicationSchedules),
}));

export const billsRelations = relations(bills, ({ one }) => ({
  patient: one(patients, { fields: [bills.patientId], references: [patients.id] }),
  prescription: one(prescriptions, { fields: [bills.prescriptionId], references: [prescriptions.id] }),
}));

export const healthMetricsRelations = relations(healthMetrics, ({ one }) => ({
  patient: one(patients, { fields: [healthMetrics.patientId], references: [patients.id] }),
}));

export const medicationSchedulesRelations = relations(medicationSchedules, ({ one }) => ({
  patient: one(patients, { fields: [medicationSchedules.patientId], references: [patients.id] }),
  prescriptionItem: one(prescriptionItems, { 
    fields: [medicationSchedules.prescriptionItemId], 
    references: [prescriptionItems.id] 
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

export const medicineInventoryRelations = relations(medicineInventory, ({ many }) => ({
  prescriptionItems: many(prescriptionItems),
}));

export const prescriptionAnalysisRelations = relations(prescriptionAnalysis, ({ one }) => ({
  prescription: one(prescriptions, { fields: [prescriptionAnalysis.prescriptionId], references: [prescriptions.id] }),
  doctor: one(doctors, { fields: [prescriptionAnalysis.doctorId], references: [doctors.id] }),
  patient: one(patients, { fields: [prescriptionAnalysis.patientId], references: [patients.id] }),
}));

export const feedbackRelations = relations(feedback, ({ one }) => ({
  patient: one(patients, { fields: [feedback.patientId], references: [patients.id] }),
  doctor: one(doctors, { fields: [feedback.doctorId], references: [doctors.id] }),
  prescription: one(prescriptions, { fields: [feedback.prescriptionId], references: [prescriptions.id] }),
  appointment: one(appointments, { fields: [feedback.appointmentId], references: [appointments.id] }),
}));

export const ocrPrescriptionUploadsRelations = relations(ocrPrescriptionUploads, ({ one }) => ({
  patient: one(patients, { fields: [ocrPrescriptionUploads.patientId], references: [patients.id] }),
  convertedPrescription: one(prescriptions, { 
    fields: [ocrPrescriptionUploads.convertedPrescriptionId], 
    references: [prescriptions.id] 
  }),
}));

// Validation schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDoctorSchema = createInsertSchema(doctors).omit({
  id: true,
});

export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPrescriptionSchema = createInsertSchema(prescriptions).omit({
  id: true,
  createdAt: true,
});

export const insertPrescriptionItemSchema = createInsertSchema(prescriptionItems).omit({
  id: true,
});

export const insertHealthMetricSchema = createInsertSchema(healthMetrics).omit({
  id: true,
  recordedAt: true,
});

export const insertMedicationScheduleSchema = createInsertSchema(medicationSchedules).omit({
  id: true,
});

export const insertMedicineInventorySchema = createInsertSchema(medicineInventory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPrescriptionAnalysisSchema = createInsertSchema(prescriptionAnalysis).omit({
  id: true,
  createdAt: true,
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
});

export const insertOcrPrescriptionUploadSchema = createInsertSchema(ocrPrescriptionUploads).omit({
  id: true,
  createdAt: true,
  processedAt: true,
});

// Select schemas
export const selectUserSchema = createSelectSchema(users);
export const selectDoctorSchema = createSelectSchema(doctors);
export const selectPatientSchema = createSelectSchema(patients);
export const selectAppointmentSchema = createSelectSchema(appointments);
export const selectPrescriptionSchema = createSelectSchema(prescriptions);
export const selectPrescriptionItemSchema = createSelectSchema(prescriptionItems);
export const selectHealthMetricSchema = createSelectSchema(healthMetrics);
export const selectMedicationScheduleSchema = createSelectSchema(medicationSchedules);
export const selectMedicineInventorySchema = createSelectSchema(medicineInventory);
export const selectPrescriptionAnalysisSchema = createSelectSchema(prescriptionAnalysis);
export const selectFeedbackSchema = createSelectSchema(feedback);
export const selectOcrPrescriptionUploadSchema = createSelectSchema(ocrPrescriptionUploads);

// Type definitions
export type User = z.infer<typeof selectUserSchema>;
export type Doctor = z.infer<typeof selectDoctorSchema>;
export type Patient = z.infer<typeof selectPatientSchema>;
export type Appointment = z.infer<typeof selectAppointmentSchema>;
export type Prescription = z.infer<typeof selectPrescriptionSchema>;
export type PrescriptionItem = z.infer<typeof selectPrescriptionItemSchema>;
export type HealthMetric = z.infer<typeof selectHealthMetricSchema>;
export type MedicationSchedule = z.infer<typeof selectMedicationScheduleSchema>;
export type MedicineInventory = z.infer<typeof selectMedicineInventorySchema>;
export type PrescriptionAnalysis = z.infer<typeof selectPrescriptionAnalysisSchema>;
export type Feedback = z.infer<typeof selectFeedbackSchema>;
export type OcrPrescriptionUpload = z.infer<typeof selectOcrPrescriptionUploadSchema>;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;
export type InsertPrescriptionItem = z.infer<typeof insertPrescriptionItemSchema>;
export type InsertHealthMetric = z.infer<typeof insertHealthMetricSchema>;
export type InsertMedicationSchedule = z.infer<typeof insertMedicationScheduleSchema>;
export type InsertMedicineInventory = z.infer<typeof insertMedicineInventorySchema>;
export type InsertPrescriptionAnalysis = z.infer<typeof insertPrescriptionAnalysisSchema>;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type InsertOcrPrescriptionUpload = z.infer<typeof insertOcrPrescriptionUploadSchema>;
