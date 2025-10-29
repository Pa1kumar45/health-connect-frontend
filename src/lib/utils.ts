/**
 * Utility Functions
 * 
 * Common utility functions used across the application.
 */

/**
 * Format message timestamp to display time
 * 
 * Converts a date object or ISO string to a 24-hour time format (HH:MM).
 * Used primarily for displaying message timestamps in chat interface.
 * 
 * @param {Date | string} date - Date object or ISO date string
 * @returns {string} Formatted time string in HH:MM format (24-hour)
 * 
 * @example
 * formatMessageTime(new Date()) // "14:30"
 * formatMessageTime("2024-01-15T14:30:00Z") // "14:30"
 */
export function formatMessageTime(date) {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }