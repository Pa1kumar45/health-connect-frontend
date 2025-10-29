/**
 * LoadingSpinner Component
 * 
 * A reusable loading spinner component that displays a centered, animated circular spinner.
 * Used throughout the application to indicate loading states.
 * 
 * Features:
 * - Full-screen centered display
 * - Blue color scheme matching application theme
 * - Smooth rotation animation
 * - Responsive design
 * 
 * @component
 * @example
 * return (
 *   <LoadingSpinner />
 * )
 */
const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      {/* Animated spinner with blue border */}
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
};

export default LoadingSpinner;
