/**
 * Navbar Component
 * 
 * Main navigation bar component that provides role-based navigation throughout the application.
 * Supports both desktop and mobile responsive layouts with a hamburger menu.
 * 
 * Features:
 * - Role-based navigation (Patient, Doctor, Admin, Super Admin)
 * - Active route highlighting
 * - Dark mode support
 * - Mobile responsive with hamburger menu
 * - Logout functionality
 * - Conditional rendering based on authentication status
 * 
 * Navigation Structure:
 * - Patient: Home, Doctors, Appointments, Profile
 * - Doctor: Dashboard, Appointments, Profile
 * - Admin/Super Admin: Dashboard, User Management, Logs, Profile
 * 
 * @component
 * @example
 * return (
 *   <Navbar />
 * )
 */
import  { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useApp} from '../context/AppContext';

/**
 * Navbar Component Implementation
 */
const Navbar = () => {
  // Mobile menu toggle state
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Get current user and logout function from context
  const { currentUser,logout } = useApp();

  // Get current location for active link highlighting
  const location = useLocation();
  const navigate = useNavigate();

  /**
   * Handle user logout
   * Calls logout function from context which clears user data and redirects
   */
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  /**
   * Toggle mobile menu visibility
   */
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  /**
   * Debug logging for current user
   * Helps track authentication state changes
   */
  useEffect(() => {
    console.log("navbar effect - currentUser:", currentUser);
    console.log("navbar effect - currentUser.role:", currentUser?.role);
  }, [currentUser])
  
  /**
   * Helper function to determine if a navigation link is active
   * Handles special cases for home and admin routes
   * 
   * @param {string} path - The path to check
   * @returns {boolean} True if the path matches current location
   */
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname.startsWith('/admin');
    }
    return location.pathname === path;
  };

  /**
   * Get CSS classes for navigation links based on active state
   * Returns appropriate classes for active and inactive states
   * 
   * @param {string} path - The path to get classes for
   * @returns {string} Combined CSS classes for the link
   */
  const getLinkClasses = (path: string) => {
    const baseClasses = "px-3 py-2 rounded-md text-sm font-medium transition-colors";
    const activeClasses = "bg-blue-600 text-white dark:bg-blue-500";
    const inactiveClasses = "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700";
    
    return `${baseClasses} ${isActive(path) ? activeClasses : inactiveClasses}`;
  };
  

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link
              to="/"
              className="flex-shrink-0 flex items-center text-xl font-bold text-gray-900 dark:text-white"
            >
              HealthConnect
            </Link>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {/* Home/Dashboard link - different destinations based on role */}
            {(!currentUser || currentUser.role === 'patient') && (
              <Link
                to="/"
                className={getLinkClasses('/')}
              >
                Home
              </Link>
            )}
            {(currentUser?.role === 'admin' || currentUser?.role === 'super_admin') && (
              <Link
                to="/admin"
                className={getLinkClasses('/admin')}
              >
                Dashboard
              </Link>
            )}
            {currentUser?.role === 'doctor' && (
              <Link
                to="/"
                className={getLinkClasses('/')}
              >
                Dashboard
              </Link>
            )}
            {currentUser ? (
              <>
                {currentUser.role === 'patient' && (
                  <Link
                    to="/appointments"
                    className={getLinkClasses('/appointments')}
                  >
                    Appointments
                  </Link>
                )}
                <Link
                  to={'/profile'}
                  className={getLinkClasses('/profile')}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={getLinkClasses('/login')}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className={getLinkClasses('/signup')}
                >
                  Sign Up
                </Link>
                <Link
                  to="/admin/login"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
                >
                  <span className="mr-1">🛡️</span>
                  Admin
                </Link>
              </>
            )}
            {/* <button
              onClick={toggleDarkMode}
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-2 rounded-md"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button> */}
          </div>

          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {/* {isMenuOpen && (
        <div className="sm:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-base font-medium"
              onClick={toggleMenu}
            >
              Home
            </Link>
            {isAuthenticated() ? (
              <>
                <Link
                  to="/profile"
                  className="block text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-base font-medium"
                  onClick={toggleMenu}
                >
                  Profile
                </Link>
                <Link
                  to="/appointments"
                  className="block text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-base font-medium"
                  onClick={toggleMenu}
                >
                  Appointments
                </Link> 
                <Link
                  to="/prescriptions"
                  className="block text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-base font-medium"
                  onClick={toggleMenu}
                >
                  Prescriptions
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                  className="block w-full text-left text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-base font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-base font-medium"
                  onClick={toggleMenu}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-base font-medium"
                  onClick={toggleMenu}
                >
                  Sign Up
                </Link>
                <Link
                  to="/admin/login"
                  className="block text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 px-3 py-2 rounded-md text-base font-medium"
                  onClick={toggleMenu}
                >
                  🛡️ Admin Portal
                </Link>
              </>
            )}
            <button
              onClick={() => {
                toggleDarkMode();
                toggleMenu();
              }}
              className="block w-full text-left text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-base font-medium"
            >
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>
      )} */}
    </nav>
  );
};

export default Navbar;
