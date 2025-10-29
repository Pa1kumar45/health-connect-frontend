/**
 * Main Entry Point
 * 
 * Application entry point that initializes React and wraps the app with necessary providers.
 * Sets up the root element and renders the application tree.
 * 
 * Structure:
 * - AppProvider: Provides global state and context (auth, theme, etc.)
 * - App: Root component with routing and navigation
 * 
 * Note: StrictMode is commented out to avoid double-rendering issues during development.
 * Can be enabled for additional development checks if needed.
 * 
 * @module main
 */
import { createRoot } from 'react-dom/client'
import { AppProvider } from './context/AppContext.tsx'
import './index.css'
import App from './App.tsx'

// Create root element and render application
createRoot(document.getElementById('root')!).render(
  // StrictMode disabled to avoid double-rendering during development
  // <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  // </StrictMode>,
)
