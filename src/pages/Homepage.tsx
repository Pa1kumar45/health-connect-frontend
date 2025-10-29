/**
 * Homepage Component
 * 
 * Landing page for the Health Connect application.
 * Displays project information, hero section, and feature highlights.
 * 
 * Features:
 * - Course project information banner
 * - Hero section with gradient background
 * - Feature cards showcasing platform benefits
 * - Responsive design with dark mode support
 * - Animated hover effects on feature cards
 * 
 * Layout:
 * - Project header with team member details
 * - Hero section with main tagline
 * - 4-column feature grid (responsive to mobile)
 * 
 * @component
 * @example
 * return (
 *   <Homepage />
 * )
 */
import { Heart, Users, Clock, Shield, ArrowRight, Stethoscope, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Homepage Component Implementation
 */
const Homepage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Course Project Header */}
      <div className="relative max-w-6xl mx-auto px-4 pt-8 pb-8">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 md:p-12 mb-12 transform hover:scale-[1.02] transition-all duration-300">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white text-sm font-semibold mb-4">
              <Award size={16} />
              SOFTWARE ENGINEERING PROJECT
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              IT303 Course Project
            </h2>
            <h3 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              "ONLINE DOCTOR APPOINTMENT SYSTEM"
            </h3>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <p className="text-gray-600 dark:text-gray-400 font-semibold mb-6 text-center">Project Team</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <p className="font-bold text-gray-900 dark:text-white">C. Lohith Kumar Reddy</p>
                <p className="text-sm text-blue-600 dark:text-blue-400">231IT016</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                <p className="font-bold text-gray-900 dark:text-white">K. Udayram</p>
                <p className="text-sm text-purple-600 dark:text-purple-400">231IT032</p>
              </div>
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-xl p-4 border border-pink-200 dark:border-pink-800">
                <p className="font-bold text-gray-900 dark:text-white">P. Pavan Kumar</p>
                <p className="text-sm text-pink-600 dark:text-pink-400">231IT046</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 pb-20">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white text-sm font-semibold mb-8 shadow-lg hover:shadow-xl transition-shadow">
            <Stethoscope size={18} />
            Healthcare Made Simple
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Your Health, Our Priority
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Connect with <span className="font-bold text-blue-600 dark:text-blue-400">qualified doctors</span>, 
            book appointments online, and manage your healthcare journey with ease.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/doctors"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
            >
              Find a Doctor
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/signup"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-full font-bold text-lg shadow-xl hover:shadow-2xl border-2 border-gray-200 dark:border-gray-700 transform hover:scale-105 transition-all duration-300"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Professional Review Section */}
        <div className="mt-24 mb-20">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-8 border-2 border-blue-200 dark:border-blue-900 shadow-xl">
            <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                {/* Image Section */}
                <div className="flex-shrink-0">
                  <div className="relative w-full lg:w-[400px] h-[400px] overflow-hidden rounded-2xl shadow-2xl">
                    <img
                      src="/team-photo.jpg"
                      alt="Medical Professional"
                      className="absolute top-0 left-0 w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                {/* Content Section */}
                <div className="flex-1">
                  <div className="mb-8">
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                      Reviewed by Professional Doctors
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                      Our platform is trusted and reviewed by medical professionals
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Dr. Nithin</h3>
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-full">
                      MBBS
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">AJ COLLEGE, Mangalore</p>
                  <p className="text-gray-700 dark:text-gray-300 italic text-lg leading-relaxed">
                    "This platform provides an excellent way for patients to connect with qualified doctors. 
                    The interface is user-friendly and the appointment booking system is very efficient."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-24">
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-300"></div>
            <div className="relative text-center p-8 rounded-3xl bg-white dark:bg-gray-800 shadow-xl border-2 border-gray-100 dark:border-gray-700 group-hover:border-blue-500 dark:group-hover:border-blue-500 group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-300">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <Heart className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Quality Care
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Connect with verified, experienced doctors across multiple specializations
              </p>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-300"></div>
            <div className="relative text-center p-8 rounded-3xl bg-white dark:bg-gray-800 shadow-xl border-2 border-gray-100 dark:border-gray-700 group-hover:border-green-500 dark:group-hover:border-green-500 group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-300">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <Clock className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Easy Booking
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Book appointments online 24/7 with real-time availability
              </p>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-purple-600 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-300"></div>
            <div className="relative text-center p-8 rounded-3xl bg-white dark:bg-gray-800 shadow-xl border-2 border-gray-100 dark:border-gray-700 group-hover:border-purple-500 dark:group-hover:border-purple-500 group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-300">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Expert Doctors
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Access to qualified healthcare professionals with proven experience
              </p>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-300"></div>
            <div className="relative text-center p-8 rounded-3xl bg-white dark:bg-gray-800 shadow-xl border-2 border-gray-100 dark:border-gray-700 group-hover:border-pink-500 dark:group-hover:border-pink-500 group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-300">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Secure Platform
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Your health data is protected with industry-standard security measures
              </p>
            </div>
          </div>
        </div>

        {/* How it Works Section */}
        <div className="mt-32">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white text-sm font-semibold mb-6 shadow-lg">
              <Stethoscope size={18} />
              Simple Process
            </div>
            <h2 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Getting healthcare has never been easier - just three simple steps to better health
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connection lines with gradient */}
            <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 z-0 rounded-full"></div>
            
            <div className="text-center relative z-10 group">
              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full text-3xl font-black shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  1
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border-2 border-gray-100 dark:border-gray-700 group-hover:border-blue-500 dark:group-hover:border-blue-500 group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-300">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Choose Your Doctor
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Browse through our list of qualified doctors and select based on specialization and availability
                </p>
              </div>
            </div>

            <div className="text-center relative z-10 group">
              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full text-3xl font-black shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  2
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border-2 border-gray-100 dark:border-gray-700 group-hover:border-purple-500 dark:group-hover:border-purple-500 group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-300">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Book Appointment
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Select your preferred date and time slot, and book your appointment instantly
                </p>
              </div>
            </div>

            <div className="text-center relative z-10 group">
              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-full text-3xl font-black shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  3
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border-2 border-gray-100 dark:border-gray-700 group-hover:border-indigo-500 dark:group-hover:border-indigo-500 group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-300">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Get Treatment
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Meet your doctor at the scheduled time and receive the care you need
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 mb-20">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 md:p-16 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full opacity-10 blur-3xl -mr-48 -mt-48"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full opacity-10 blur-3xl -ml-48 -mb-48"></div>
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                Join thousands of patients who trust us with their healthcare needs
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/signup"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-600 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  Create Account
                  <ArrowRight size={20} />
                </Link>
                <Link 
                  to="/doctors"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-full font-bold text-lg hover:bg-white/20 transform hover:scale-105 transition-all duration-300"
                >
                  Browse Doctors
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
