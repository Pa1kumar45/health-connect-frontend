/**
 * Additional Type Definitions
 * 
 * Supplementary type definitions for appointment system.
 * Provides type-safe appointment status and interface.
 * 
 * @module types/types
 */

/**
 * AppointmentStatus Type
 * 
 * Union type for all possible appointment statuses.
 * 
 * @typedef {('pending'|'scheduled'|'completed'|'cancelled'|'rescheduled')} AppointmentStatus
 */
export type AppointmentStatus = 'pending' | 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';

/**
 * Appointment Interface
 * 
 * Extended appointment interface with populated doctor and patient data.
 * Used when appointments include full user information instead of just IDs.
 * 
 * @interface Appointment
 * @property {string} _id - MongoDB unique identifier
 * @property {string|Object} doctorId - Doctor ID or populated doctor object
 * @property {string} doctorId._id - Doctor's unique ID
 * @property {string} doctorId.name - Doctor's full name
 * @property {string} [doctorId.specialization] - Doctor's specialization
 * @property {string|Object} patientId - Patient ID or populated patient object
 * @property {string} patientId._id - Patient's unique ID
 * @property {string} patientId.name - Patient's full name
 * @property {string} date - Appointment date
 * @property {string} startTime - Start time (HH:MM)
 * @property {string} endTime - End time (HH:MM)
 * @property {AppointmentStatus} status - Current appointment status
 * @property {string} [reason] - Patient's reason for visit
 * @property {string} [comment] - Doctor's comment
 * @property {string} [notes] - Session notes
 * @property {number} [rating] - Patient rating (1-5)
 * @property {string} [review] - Patient review text
 */
export interface Appointment {
    _id: string;
    doctorId: string | {
        _id: string;
        name: string;
        specialization?: string;
    };
    patientId: string | {
        _id: string;
        name: string;
    };
    date: string;
    startTime: string;
    endTime: string;
    status: AppointmentStatus;
    reason?: string;
    comment?: string;
    notes?: string;
    rating?: number;
    review?: string;
} 
