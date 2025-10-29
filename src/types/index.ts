/**
 * Core Type Definitions
 * 
 * Central type definitions and interfaces for the Health-Connect application.
 * Defines the data models used across the entire frontend application.
 * 
 * Type Categories:
 * - User Types: Patient, Doctor, Admin
 * - Appointment System: Appointment, Schedule, Slot
 * - Authentication: LoginCredentials, AuthResponse, SignUpFormData
 * - Communication: Message
 * - Medical Records: MedicalRecord, MedicalHistory
 * - Emergency Contacts: EmergencyContact
 * - Error Handling: ApiError
 * 
 * User Roles:
 * - patient: End users seeking medical consultation
 * - doctor: Medical professionals providing services
 * - admin: System administrators
 * - super_admin: Super administrators with full access
 * 
 * Appointment Statuses:
 * - pending: Awaiting doctor confirmation
 * - scheduled: Confirmed appointment
 * - completed: Appointment finished
 * - cancelled: Appointment cancelled
 * - rescheduled: Appointment moved to new time
 * 
 * @module types
 */

/**
 * Patient Interface
 * 
 * Represents a patient user in the system.
 * 
 * @interface Patient
 * @property {string} _id - MongoDB unique identifier
 * @property {string} name - Patient's full name
 * @property {string} email - Patient's email address
 * @property {string} password - Hashed password
 * @property {string} [dateOfBirth] - Date of birth (optional)
 * @property {'male'|'female'|''} [gender] - Patient's gender
 * @property {string} [allergies] - Known allergies
 * @property {string} [contactNumber] - Phone number
 * @property {EmergencyContact[]} [emergencyContact] - Emergency contact persons
 * @property {string} [bloodGroup] - Blood type (A+, B+, O+, etc.)
 * @property {'patient'} role - User role (always 'patient')
 * @property {string} [avatar] - Profile picture URL
 * @property {string} createdAt - Account creation timestamp
 * @property {string} updatedAt - Last update timestamp
 * @property {number} __v - MongoDB version key
 */
export interface Patient{
  _id: string;
  name: string;
  email: string;
  password: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female'|'';
  // medicalHistory?: MedicalHistory[];
  allergies?:string;
  contactNumber?:string;
  emergencyContact?:EmergencyContact[];
  bloodGroup?: string;
  role: 'patient';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  __v:number
  // profileCompleted:boolean;
}

/**
 * Admin Interface
 * 
 * Represents an administrator user with system management capabilities.
 * 
 * @interface Admin
 * @property {string} _id - MongoDB unique identifier
 * @property {string} name - Admin's full name
 * @property {string} email - Admin's email address
 * @property {string} password - Hashed password
 * @property {'admin'|'super_admin'} role - Admin role level
 * @property {boolean} isActive - Account active status
 * @property {string[]} [Permissions] - Admin permissions array
 * @property {Date} [lastlogin] - Last login timestamp
 * @property {Date} [lastLogout] - Last logout timestamp
 * @property {string} [createdBy] - ID of admin who created this account
 * @property {string} createdAt - Account creation timestamp
 * @property {string} updatedAt - Last update timestamp
 * @property {number} __v - MongoDB version key
 */
export interface Admin {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'super_admin';
  isActive: boolean;
  Permissions?: string[];
  lastlogin?: Date;
  lastLogout?: Date;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

/**
 * SignUpFormData Interface
 * 
 * Form data structure for user registration.
 * 
 * @interface SignUpFormData
 * @property {string} name - User's full name
 * @property {string} email - User's email
 * @property {string} password - User's password
 * @property {'doctor'|'patient'|'admin'|'super_admin'} role - Account type
 * @property {string} [specialization] - Doctor's specialization (doctors only)
 * @property {string} [qualification] - Doctor's qualification (doctors only)
 * @property {number} [experience] - Years of experience (doctors only)
 */
export interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  role: 'doctor' | 'patient' | 'admin' | 'super_admin';
  specialization?: string;
  qualification?: string;
  experience?: number;
}

/**
 * EmergencyContact Interface
 * 
 * Emergency contact person information for patients.
 * 
 * @interface EmergencyContact
 * @property {string} name - Contact person's name
 * @property {string} relationship - Relationship to patient
 * @property {string} phone - Contact phone number
 */
export interface EmergencyContact{
  name:string;
  relationship:string;
  phone:string;
}

/**
 * Doctor Interface
 * 
 * Represents a doctor user with medical professional information.
 * 
 * @interface Doctor
 * @property {string} _id - MongoDB unique identifier
 * @property {string} name - Doctor's full name
 * @property {string} email - Doctor's email address
 * @property {string} password - Hashed password
 * @property {string} specialization - Medical specialization (e.g., Cardiology)
 * @property {number} experience - Years of medical experience
 * @property {string} qualification - Educational qualifications (e.g., MBBS, MD)
 * @property {string} about - Professional biography
 * @property {string} contactNumber - Phone number
 * @property {string} [avatar] - Profile picture URL
 * @property {Schedule[]} schedule - Weekly availability schedule
 * @property {'doctor'} role - User role (always 'doctor')
 * @property {string} createdAt - Account creation timestamp
 * @property {string} updatedAt - Last update timestamp
 * @property {number} __v - MongoDB version key
 */
export interface Doctor{
  _id: string;
  name: string;
  email: string;
  password: string;
  specialization: string;
  experience: number;
  qualification: string;
  about: string;
  contactNumber:string;
  avatar?: string;
  schedule: Schedule[];
  role: 'doctor';
  createdAt: string;
  updatedAt: string;
  __v:number
}

/**
 * MedicalHistory Interface
 * 
 * Patient's medical history record.
 * 
 * @interface MedicalHistory
 * @property {string} date - Date of medical record
 * @property {string} diagnosis - Medical diagnosis
 * @property {string} prescription - Prescribed treatment
 * @property {string} doctorId - ID of treating doctor
 */
export interface MedicalHistory {
  date: string;
  diagnosis: string;
  prescription: string;
  doctorId: string;
}

/**
 * Appointment Interface
 * 
 * Represents a medical appointment between doctor and patient.
 * 
 * @interface Appointment
 * @property {string} [_id] - MongoDB unique identifier
 * @property {string | {_id: string, name: string, specialization?: string}} [doctorId] - Doctor's ID or populated doctor object
 * @property {string | {_id: string, name: string}} [patientId] - Patient's ID or populated patient object
 * @property {string} date - Appointment date (YYYY-MM-DD)
 * @property {number} [slotNumber] - Time slot number (1-12 for hourly slots)
 * @property {string} startTime - Appointment start time (HH:MM)
 * @property {string} endTime - Appointment end time (HH:MM)
 * @property {'pending'|'scheduled'|'cancelled'|'completed'|'rescheduled'} status - Current status
 * @property {'video'|'chat'} mode - Consultation mode
 * @property {string} [reason] - Patient's reason for appointment
 * @property {string} [comment] - Doctor's comment during confirmation
 * @property {string} [notes] - Doctor's notes after session
 * @property {number} [rating] - Patient's rating (1-5)
 * @property {string} [review] - Patient's review
 */
export interface Appointment {
  _id?: string;
  doctorId?: string | { _id: string; name: string; specialization?: string };
  patientId?: string | { _id: string; name: string };
  date: string;
  slotNumber?: number;
  startTime: string;
  endTime:string;
  status: 'pending' | 'scheduled' | 'cancelled' | 'completed' | 'rescheduled';
  mode: 'video' | 'chat';

  // By patient while booking
  reason?: string;

  // For doctor while conforming booking
  comment?:string;

  // For doctor after the session
  notes?: string;
  rating?:number;

  // By patient
  review?:string;
}

// export interface Review {
//   id: string;
//   doctorId: string;
//   patientId: string;
//   rating: number;
//   comment: string;
//   date: string;
// }

/**
 * Slot Interface
 * 
 * Represents a single time slot in a doctor's schedule.
 * 
 * @interface Slot
 * @property {number} slotNumber - Slot identifier (1-12)
 * @property {string} startTime - Slot start time (HH:MM)
 * @property {string} endTime - Slot end time (HH:MM)
 * @property {boolean} isAvailable - Whether slot is available for booking
 */
export interface Slot {
  slotNumber: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

/**
 * Schedule Interface
 * 
 * Doctor's weekly schedule for a specific day.
 * 
 * @interface Schedule
 * @property {'Monday'|'Tuesday'|'Wednesday'|'Thursday'|'Friday'|'Saturday'|'Sunday'} day - Day of week
 * @property {Slot[]} slots - Array of time slots for the day
 */
export interface Schedule {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  slots: Slot[];
}

/**
 * Message Interface
 * 
 * Chat message between doctor and patient.
 * 
 * @interface Message
 * @property {string} _id - MongoDB unique identifier
 * @property {string} senderId - Sender's user ID
 * @property {string} receiverId - Receiver's user ID
 * @property {string} content - Message content text
 * @property {string} timestamp - Message timestamp
 * @property {'text'|'image'} type - Message type
 * @property {boolean} read - Whether message has been read
 * @property {string} createdAt - Creation timestamp
 * @property {string} [text] - Message text content
 * @property {string} [image] - Image URL if image message
 */
export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image';
  read: boolean;
  createdAt: string;
  text?: string;
  image?: string;
}

/**
 * LoginCredentials Interface
 * 
 * User login credentials structure.
 * 
 * @interface LoginCredentials
 * @property {string} email - User's email
 * @property {string} password - User's password
 * @property {'doctor'|'patient'|'admin'|'super_admin'} role - User role
 */
export interface LoginCredentials {
  email: string;
  password: string;
  role: 'doctor' | 'patient' | 'admin' | 'super_admin';
}

/**
 * AuthResponse Interface
 * 
 * Authentication response structure from login/signup.
 * 
 * @interface AuthResponse
 * @property {boolean} success - Whether authentication succeeded
 * @property {string} message - Response message
 * @property {Doctor|Patient|Admin} data - User data
 * @property {Object} [sessionInfo] - Session information
 * @property {boolean} [sessionInfo.singleDeviceEnforcement] - Single device login flag
 * @property {string} [sessionInfo.message] - Session message
 * @property {Object} [loginInfo] - Login history information
 * @property {string} [loginInfo.previousLogin] - Previous login timestamp
 * @property {string} [loginInfo.lastLogout] - Last logout timestamp
 */
export interface AuthResponse {
  success:boolean;
  message:string;
  data: Doctor | Patient | Admin;
  sessionInfo?: {
    singleDeviceEnforcement: boolean;
    message: string;
  };
  loginInfo?: {
    previousLogin?: string;
    lastLogout?: string;
  };
}

/**
 * MedicalRecord Interface
 * 
 * Medical record for a patient visit.
 * 
 * @interface MedicalRecord
 * @property {string} id - Record unique identifier
 * @property {string} patientId - Patient's ID
 * @property {string} doctorId - Doctor's ID
 * @property {string} date - Record date
 * @property {string} diagnosis - Medical diagnosis
 * @property {string} prescription - Prescribed medication/treatment
 * @property {string} [notes] - Additional notes
 */
export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  diagnosis: string;
  prescription: string;
  notes?: string;
}

/**
 * API Error Response
 */
export interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}
