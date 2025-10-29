/**
 * DoctorDashboard Component
 * 
 * Central dashboard for doctors to manage their appointments.
 * Displays all appointments with filtering and status management capabilities.
 * 
 * Features:
 * - View all appointments (pending/upcoming/active/past)
 * - Accept or decline pending appointments
 * - Add comments to appointments
 * - Real-time status filtering
 * - Appointment time validation
 * - Color-coded status badges
 * - Dark mode support
 * 
 * Filter Types:
 * - all: Show all appointments
 * - pending: Awaiting doctor approval
 * - upcoming: Scheduled for future
 * - active: Currently in progress
 * - past: Completed or cancelled
 * 
 * @component
 * @example
 * return (
 *   <DoctorDashboard />
 * )
 */

import React, { useState, useEffect } from 'react';
import { Check, X, Clock, Calendar, User, AlertCircle, TrendingUp } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { Appointment, AppointmentStatus } from '../types/types';
import { appointmentService } from '../services/appointment.service';
import { useApp } from '../context/AppContext';

const DoctorDashboard = () => {
    const { currentUser } = useApp();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [filter, setFilter] = useState<'all' | 'pending' | 'upcoming' | 'active' | 'past'>('active');
    const [todayUpcomingCount, setTodayUpcomingCount] = useState<number>(0);
    const [pendingCount, setPendingCount] = useState<number>(0);

    // Fetch appointments on component mount
    useEffect(() => {
        fetchAppointments();
        fetchTodayUpcomingCount();
        fetchPendingCount();
        
        // Refresh counts every minute
        const interval = setInterval(() => {
            fetchTodayUpcomingCount();
            fetchPendingCount();
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    /**
     * Fetch all appointments for the current doctor
     * 
     * Retrieves appointments from the backend and updates state.
     * Handles loading and error states.
     */
    const fetchAppointments = async () => {
        try {
            setIsLoading(true);
            const appointmentsData = await appointmentService.getDoctorAppointments();
            setAppointments(appointmentsData);
        } catch (err) {
            setError('Failed to fetch appointments');
            console.error('Error fetching appointments:', err);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Fetch count of upcoming appointments for today
     * 
     * Updates the counter showing scheduled appointments for today.
     */
    const fetchTodayUpcomingCount = async () => {
        try {
            const data = await appointmentService.getTodayUpcomingCount();
            setTodayUpcomingCount(data.count);
        } catch (err) {
            console.error('Error fetching upcoming count:', err);
        }
    };

    /**
     * Fetch count of pending appointments
     * 
     * Updates the counter showing pending appointments requiring approval.
     */
    const fetchPendingCount = async () => {
        try {
            const data = await appointmentService.getPendingCount();
            setPendingCount(data.count);
        } catch (err) {
            console.error('Error fetching pending count:', err);
        }
    };

    /**
     * Update appointment status
     * 
     * Allows doctor to accept, decline, or complete appointments.
     * Refreshes appointment list and counts after update.
     * 
     * @param {Appointment} appointment - Appointment to update
     * @param {AppointmentStatus} status - New status to set
     */
    const handleUpdateAppointment = async (appointment: Appointment, status: AppointmentStatus) => {
        try {
            await appointmentService.updateAppointment(
                appointment._id,
                { ...appointment, status }
            );
            fetchAppointments();
            
            // Refresh counts if appointment status changed from or to pending
            if (appointment.status === 'pending' || status === 'pending') {
                fetchPendingCount();
            }
            if (status === 'scheduled') {
                fetchTodayUpcomingCount();
            }
        } catch (err) {
            setError('Failed to update appointment');
            console.error('Error updating appointment:', err);
        }
    };

    /**
     * Handle comment change for an appointment
     * 
     * Updates the comment field in appointment state.
     * 
     * @param {string} id - Appointment ID
     * @param {React.ChangeEvent} e - Textarea change event
     */
    const handleChangeComment = (id: string, e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setAppointments(prev => prev.map(appointment =>
            appointment._id === id
                ? { ...appointment, comment: e.target.value }
                : appointment
        ));
    };

    if (!currentUser || currentUser.role !== 'doctor') {
        return <div className='text-white p-8 text-center'>Please login as a doctor to access this dashboard</div>;
    }

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
    }

    /**
     * Filter appointments based on selected filter
     * 
     * Filtering logic:
     * - pending: Status is pending
     * - upcoming: Start time is in future and status is scheduled
     * - active: Currently in progress (between start and end time)
     * - past: End time has passed or status is completed/cancelled
     * - all: No filter applied
     */
    const filteredAppointments = appointments.filter(appointment => {
        const appointmentStartStamp = new Date(`${appointment.date}T${appointment.startTime}`);
        const appointmentEndStamp = new Date(`${appointment.date}T${appointment.endTime}`);
        const now = new Date();
        
        if (filter === 'pending') {
            return appointment.status === 'pending';
        } else if (filter === 'upcoming') {
            return appointmentStartStamp > now && appointment.status === 'scheduled';
        } else if (filter === 'active') {
            return appointmentStartStamp <= now && appointmentEndStamp > now && appointment.status === 'scheduled';
        } else if (filter === 'past') {
            return appointmentEndStamp <= now || appointment.status === 'completed' || appointment.status === 'cancelled';
        }
        return true;
    });

    /**
     * Get color class for appointment status badge
     * 
     * Maps appointment status to Tailwind CSS color classes
     * for visual differentiation.
     * 
     * @param {AppointmentStatus} status - Appointment status
     * @returns {string} Tailwind CSS classes for badge styling
     */
    const getStatusBadgeColor = (status: AppointmentStatus) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'completed': return 'bg-green-100 text-green-800 border-green-300';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
            case 'rescheduled': return 'bg-purple-100 text-purple-800 border-purple-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="max-w-7xl mx-auto p-6">
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-xl mb-6 flex items-center gap-3 shadow-lg animate-fade-in">
                        <AlertCircle size={24} />
                        <span className="font-medium">{error}</span>
                    </div>
                )}

                {/* Header with stats counters */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">
                            My Appointments
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            Welcome back, <span className="font-bold text-blue-600 dark:text-blue-400">Dr. {currentUser?.name}</span>
                        </p>
                    </div>

                    {/* Stats Counters */}
                    <div className="flex gap-4 flex-wrap">
                        {/* Today's Upcoming Appointments Counter */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-75 group-hover:opacity-100 blur-lg transition-all duration-300"></div>
                            <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-2xl p-6 min-w-[250px]">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm opacity-90 font-medium">Today's Upcoming</p>
                                        <p className="text-5xl font-black mt-1">{todayUpcomingCount}</p>
                                    </div>
                                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                                        <TrendingUp size={32} />
                                    </div>
                                </div>
                                <p className="text-xs mt-3 opacity-90">
                                    {todayUpcomingCount === 0 
                                        ? 'No appointments scheduled' 
                                        : `${todayUpcomingCount} appointment${todayUpcomingCount !== 1 ? 's' : ''} remaining today`
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Pending Appointments Counter */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl opacity-75 group-hover:opacity-100 blur-lg transition-all duration-300"></div>
                            <div className="relative bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl shadow-2xl p-6 min-w-[250px]">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm opacity-90 font-medium">Pending Requests</p>
                                        <p className="text-5xl font-black mt-1">{pendingCount}</p>
                                    </div>
                                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                                        <Clock size={32} />
                                    </div>
                                </div>
                                <p className="text-xs mt-3 opacity-90">
                                    {pendingCount === 0 
                                        ? 'No pending approvals' 
                                        : `${pendingCount} appointment${pendingCount !== 1 ? 's' : ''} awaiting approval`
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-3 mb-8">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                            filter === 'all'
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500'
                        }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('active')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                            filter === 'active'
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500'
                        }`}
                    >
                        Active
                    </button>
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                            filter === 'pending'
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500'
                        }`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setFilter('upcoming')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                            filter === 'upcoming'
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500'
                        }`}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setFilter('past')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                            filter === 'past'
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500'
                        }`}
                    >
                        Past
                    </button>
                </div>

                {filteredAppointments.length === 0 ? (
                    <div className="text-center py-24 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border-2 border-gray-100 dark:border-gray-700">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Calendar size={48} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No appointments found</p>
                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                            {filter === 'pending' && "You have no pending appointment requests"}
                            {filter === 'upcoming' && "You have no upcoming appointments"}
                            {filter === 'active' && "You have no active appointments right now"}
                            {filter === 'past' && "You have no past appointments"}
                            {filter === 'all' && "You have no appointments yet"}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredAppointments.map(appointment => (
                            <div 
                                key={appointment._id} 
                                className="group relative"
                            >
                                {/* Hover glow effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-300"></div>
                                
                                {/* Card */}
                                <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-xl border-2 border-gray-100 dark:border-gray-700 group-hover:border-blue-500 dark:group-hover:border-blue-500 overflow-hidden transition-all duration-300">
                                    {/* Header */}
                                    <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700/50 dark:to-gray-700/50 border-b-2 border-gray-100 dark:border-gray-700">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                                                    <User size={24} />
                                                </div>
                                                <span className="font-bold text-xl text-gray-900 dark:text-white">
                                                    {typeof appointment.patientId === 'object' ? appointment.patientId.name : 'Unknown Patient'}
                                                </span>
                                            </div>
                                            <span className={`px-4 py-2 rounded-xl text-sm font-bold border-2 ${getStatusBadgeColor(appointment.status)}`}>
                                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="p-6 space-y-4">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                            <Calendar size={20} className="text-blue-600 dark:text-blue-400" />
                                            <span className="text-gray-900 dark:text-white font-medium">
                                                {new Date(appointment.date).toLocaleDateString('en-US', { 
                                                    weekday: 'long', 
                                                    year: 'numeric', 
                                                    month: 'long', 
                                                    day: 'numeric' 
                                                })}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                            <Clock size={20} className="text-purple-600 dark:text-purple-400" />
                                            <span className="text-gray-900 dark:text-white font-medium">
                                                {appointment.startTime} - {appointment.endTime}
                                            </span>
                                        </div>
                                        
                                        {appointment.reason && (
                                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                                                <p className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-2">Reason:</p>
                                                <p className="text-gray-700 dark:text-gray-300">{appointment.reason}</p>
                                            </div>
                                        )}
                                        
                                        {appointment.status === 'pending' && (
                                            <div className="mt-4">
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block mb-2">
                                                    Add a comment:
                                                </label>
                                                <textarea
                                                    className="w-full p-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200"
                                                    placeholder="Write a comment for the patient..."
                                                    value={appointment.comment || ""}
                                                    onChange={(e) => handleChangeComment(appointment._id, e)}
                                                    rows={3}
                                                />
                                            </div>
                                        )}
                                        
                                        {appointment.comment && appointment.status !== 'pending' && (
                                            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border-2 border-purple-200 dark:border-purple-800">
                                                <p className="text-sm font-bold text-purple-900 dark:text-purple-300 mb-2">Doctor's comment:</p>
                                                <p className="text-gray-700 dark:text-gray-300">{appointment.comment}</p>
                                            </div>
                                        )}
                                        
                                        {appointment.notes && (
                                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border-2 border-green-200 dark:border-green-800">
                                                <p className="text-sm font-bold text-green-900 dark:text-green-300 mb-2">Medical notes:</p>
                                                <p className="text-gray-700 dark:text-gray-300">{appointment.notes}</p>
                                            </div>
                                        )}
                                        
                                        {/* Action buttons based on appointment status */}
                                        {appointment.status === 'pending' && (
                                            <div className="flex gap-3 mt-6">
                                                <button
                                                    onClick={() => handleUpdateAppointment(appointment, 'scheduled')}
                                                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-bold hover:from-green-600 hover:to-green-700 shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                                                >
                                                    <Check size={20} />
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateAppointment(appointment, 'cancelled')}
                                                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-bold hover:from-red-600 hover:to-red-700 shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                                                >
                                                    <X size={20} />
                                                    Decline
                                                </button>
                                            </div>
                                        )}
                                        
                                        {appointment.status === 'scheduled' && (
                                            <button
                                                onClick={() => handleUpdateAppointment(appointment, 'completed')}
                                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 mt-6"
                                            >
                                                <Check size={20} />
                                                Mark as Completed
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorDashboard;
