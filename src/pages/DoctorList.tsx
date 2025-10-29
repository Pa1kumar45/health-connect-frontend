/**
 * DoctorList Component
 * 
 * Displays a searchable and filterable list of all available doctors.
 * Allows patients to browse doctors and view their profiles.
 * 
 * Features:
 * - Search by name or specialization
 * - Filter by specialization
 * - Filter by minimum experience
 * - Responsive grid layout
 * - Avatar fallback with color-coded initials
 * - Dark mode support
 * - Loading and error states
 * 
 * @component
 * @example
 * return (
 *   <DoctorList />
 * )
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Stethoscope, Filter, X } from 'lucide-react';
import { doctorService } from '../services/doctor.service';
import { Doctor } from '../types/index.ts';
import LoadingSpinner from '../components/LoadingSpinner';

const DoctorList = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [minExperience, setMinExperience] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Load doctors on component mount
  useEffect(() => {
    loadDoctors();
  }, []);

  /**
   * Load all doctors from the backend
   */
  const loadDoctors = async () => {
    try {
      setLoading(true);
      const data = await doctorService.getAllDoctors();
      console.log("all doctors details",data);
      setDoctors(data);
    } catch (err) {
      setError('Failed to load doctors');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Extract unique specializations from all doctors for filter dropdown
  const specializations = [...new Set(doctors.map(doctor => doctor.specialization))];

  /**
   * Filter doctors based on search criteria
   */
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = !selectedSpecialization || doctor.specialization === selectedSpecialization;
    const matchesExperience = doctor.experience >= minExperience;

    return matchesSearch && matchesSpecialization && matchesExperience;
  });

  /**
   * Get doctor avatar or generate fallback
   */
  const getAvatarUrl = (doctor: Doctor) => {
    if (doctor.avatar) return doctor.avatar;
    
    const colors = [
      'from-red-500 to-red-600', 'from-blue-500 to-blue-600', 'from-green-500 to-green-600', 
      'from-yellow-500 to-yellow-600', 'from-purple-500 to-purple-600', 'from-pink-500 to-pink-600', 
      'from-indigo-500 to-indigo-600', 'from-teal-500 to-teal-600'
    ];
    const colorIndex = doctor.name.charCodeAt(0) % colors.length;
    const gradientColor = colors[colorIndex];
    
    return (
      <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradientColor} flex items-center justify-center text-white text-3xl font-bold shadow-lg`}>
        {doctor.name.charAt(0).toUpperCase()}
      </div>
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSpecialization('');
    setMinExperience(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12 max-w-md">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Oops! Something went wrong</h2>
          <p className="text-red-600 dark:text-red-400 text-lg mb-6">{error}</p>
          <button
            onClick={loadDoctors}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full opacity-10 blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full opacity-10 blur-3xl -ml-48 -mb-48"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold mb-3">
              <Stethoscope size={16} />
              Find Your Perfect Doctor
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
              Discover Top Doctors
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Browse through our network of qualified healthcare professionals
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-2">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by name or specialization..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 bg-gray-50 dark:bg-gray-700 dark:text-white transition-all duration-200 text-lg"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 shadow-lg transition-all duration-300 flex items-center gap-2 justify-center"
                >
                  <Filter size={20} />
                  Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8 border border-gray-100 dark:border-gray-700 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Filter size={20} className="text-blue-600" />
                Filter Doctors
              </h3>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
              >
                Clear All
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Specialization
                </label>
                <select
                  value={selectedSpecialization}
                  onChange={(e) => setSelectedSpecialization(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 bg-white dark:bg-gray-700 dark:text-white transition-all duration-200"
                >
                  <option value="">All Specializations</option>
                  {specializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Minimum Experience
                </label>
                <select
                  value={minExperience}
                  onChange={(e) => setMinExperience(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 bg-white dark:bg-gray-700 dark:text-white transition-all duration-200"
                >
                  <option value={0}>Any Experience</option>
                  <option value={5}>5+ Years</option>
                  <option value={10}>10+ Years</option>
                  <option value={15}>15+ Years</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            <span className="font-bold text-gray-900 dark:text-white">{filteredDoctors.length}</span> doctors found
          </p>
        </div>

        {/* Doctor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map(doctor => (
            <Link
              key={doctor._id}
              to={`/doctor/${doctor._id}`}
              className="group relative"
            >
              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-300"></div>
              
              {/* Card */}
              <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-xl border-2 border-gray-100 dark:border-gray-700 group-hover:border-blue-500 dark:group-hover:border-blue-500 overflow-hidden transition-all duration-300 group-hover:-translate-y-2">
                {/* Content */}
                <div className="px-6 py-6">
                  {/* Avatar */}
                  <div className="flex justify-center mb-4">
                    {typeof getAvatarUrl(doctor) === 'string' ? (
                      <img
                        src={getAvatarUrl(doctor) as string}
                        alt={doctor.name}
                        className="w-20 h-20 rounded-2xl object-cover shadow-xl"
                      />
                    ) : (
                      getAvatarUrl(doctor)
                    )}
                  </div>

                  {/* Doctor Info */}
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Dr. {doctor.name}
                    </h2>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                      {doctor.specialization}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Experience</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{doctor.experience} years</span>
                    </div>
                    
                    {doctor.qualification && (
                      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Qualification</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{doctor.qualification}</span>
                      </div>
                    )}
                  </div>

                  {/* View Profile Button */}
                  <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold group-hover:from-blue-700 group-hover:to-purple-700 shadow-lg transition-all duration-300 transform group-hover:scale-105">
                    View Profile
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* No Results */}
        {filteredDoctors.length === 0 && (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-16 h-16 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                No Doctors Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We couldn't find any doctors matching your search criteria. Try adjusting your filters.
              </p>
              <button
                onClick={clearFilters}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 shadow-lg transition-all duration-300"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorList;
