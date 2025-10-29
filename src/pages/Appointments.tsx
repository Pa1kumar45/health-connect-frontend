/**
 * Appointments Component
 * 
 * Comprehensive appointment management page for patients.
 * Organizes appointments into pending, upcoming, and past categories.
 * 
 * Features:
 * - Three-column layout (pending/upcoming/past)
 * - Automatic appointment categorization
 * - Real-time status updates
 * - Appointment details display
 * - Empty state handling
 * - Color-coded status badges
 * - Dark mode support
 * 
 * Categorization Logic:
 * - Pending: Status is 'pending' (awaiting doctor approval)
 * - Upcoming: Start time > now AND status is 'scheduled'
 * - Past: End time <= now OR status is 'completed'/'cancelled'
 * 
 * @component
 * @example
 * return (
 *   <Appointments />
 * )
 */

import React, { useState, useEffect } from 'react';
import { Clock, Calendar, User, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { Appointment } from '../types/types';
import { appointmentService } from '../services/appointment.service';

const Appointments: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
    const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
    const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);

    // Fetch appointments on component mount
    useEffect(() => {
        fetchAppointments();
    }, []);

    /**
     * Fetch and categorize all patient appointments
     * 
     * Retrieves appointments and categorizes them into:
     * - Pending: Awaiting approval
     * - Upcoming: Scheduled for future
     * - Past: Already occurred or cancelled
     */
    const fetchAppointments = async () => {
        try {
            setIsLoading(true);
            const appointments = await appointmentService.getPatientAppointments();
            
            const now = new Date();
            
            setPendingAppointments(appointments.filter((app: Appointment) => app.status === 'pending'));
            setUpcomingAppointments(appointments.filter((app: Appointment) => {
                const appointmentDate = new Date(`${app.date}T${app.startTime}`);
                return appointmentDate > now && app.status === 'scheduled';
            }));
            setPastAppointments(appointments.filter((app: Appointment) => {
                const appointmentDate = new Date(`${app.date}T${app.endTime}`);
                return appointmentDate <= now || app.status === 'completed' || app.status === 'cancelled';
            }));
        } catch {
            setError('Failed to fetch appointments');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    My Appointments
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    View and manage your appointments
                </p>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-400 text-red-700 shadow-sm" role="alert">
                    <AlertCircle className="inline-block mr-2" size={20} />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pending Appointments */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6 border-b dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Clock size={20} className="text-blue-500" />
                            Pending Appointments
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Waiting for doctor confirmation
                        </p>
                    </div>
                    <div className="p-6 space-y-4">
                        {pendingAppointments.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <Clock size={32} className="mx-auto mb-2" />
                                <p>No pending appointments</p>
                            </div>
                        ) : (
                            pendingAppointments.map(appointment => (
                                <div key={appointment._id} className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
                                    <div className="flex items-center gap-3 mb-3">
                                        <User size={20} className="text-yellow-600 dark:text-yellow-400" />
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {typeof appointment.doctorId === 'object' ? `Dr. ${appointment.doctorId.name}` : 'Doctor'}
                                        </span>
                                        <span className="ml-auto px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">
                                            Pending
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <Calendar size={20} className="text-gray-500 dark:text-gray-400" />
                                        <span className="text-gray-600 dark:text-gray-300">
                                            {new Date(appointment.date).toLocaleDateString('en-US', { 
                                                weekday: 'long', 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric' 
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <Clock size={20} className="text-gray-500 dark:text-gray-400" />
                                        <span className="text-gray-600 dark:text-gray-300">
                                            {appointment.startTime} - {appointment.endTime}
                                        </span>
                                    </div>
                                    {appointment.reason && (
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                                            <span className="font-medium">Reason:</span> {appointment.reason}
                                        </p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Upcoming Appointments */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6 border-b dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Calendar size={20} className="text-blue-500" />
                            Upcoming Appointments
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Confirmed appointments
                        </p>
                    </div>
                    <div className="p-6 space-y-4">
                        {upcomingAppointments.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <Calendar size={32} className="mx-auto mb-2" />
                                <p>No upcoming appointments</p>
                            </div>
                        ) : (
                            upcomingAppointments.map(appointment => (
                                <div key={appointment._id} className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
                                    <div className="flex items-center gap-3 mb-3">
                                        <User size={20} className="text-green-600 dark:text-green-400" />
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {typeof appointment.doctorId === 'object' ? `Dr. ${appointment.doctorId.name}` : 'Doctor'}
                                        </span>
                                        <span className="ml-auto px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                                            Confirmed
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <Calendar size={20} className="text-gray-500 dark:text-gray-400" />
                                        <span className="text-gray-600 dark:text-gray-300">
                                            {new Date(appointment.date).toLocaleDateString('en-US', { 
                                                weekday: 'long', 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric' 
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <Clock size={20} className="text-gray-500 dark:text-gray-400" />
                                        <span className="text-gray-600 dark:text-gray-300">
                                            {appointment.startTime} - {appointment.endTime}
                                        </span>
                                    </div>
                                    {appointment.reason && (
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                                            <span className="font-medium">Reason:</span> {appointment.reason}
                                        </p>
                                    )}
                                    {appointment.comment && (
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                                            <span className="font-medium">Doctor's Note:</span> {appointment.comment}
                                        </p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Past Appointments */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden lg:col-span-2">
                    <div className="p-6 border-b dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Calendar size={20} className="text-blue-500" />
                            Past Appointments
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Completed and cancelled appointments
                        </p>
                    </div>
                    <div className="p-6">
                        {pastAppointments.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <Calendar size={32} className="mx-auto mb-2" />
                                <p>No past appointments</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {pastAppointments.map(appointment => (
                                    <div key={appointment._id} className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 p-4 rounded-lg">
                                        <div className="flex items-center gap-3 mb-3">
                                            <User size={20} className="text-gray-500 dark:text-gray-400" />
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {typeof appointment.doctorId === 'object' ? `Dr. ${appointment.doctorId.name}` : 'Doctor'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <Calendar size={20} className="text-gray-500 dark:text-gray-400" />
                                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                                {new Date(appointment.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 mb-3">
                                            <Clock size={20} className="text-gray-500 dark:text-gray-400" />
                                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                                {appointment.startTime} - {appointment.endTime}
                                            </span>
                                        </div>
                                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                            appointment.status === 'completed' 
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                                        }`}>
                                            {appointment.status === 'completed' ? 'Completed' : 'Cancelled'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Appointments; 
