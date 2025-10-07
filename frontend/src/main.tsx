import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Enforce dark theme across the app to match the login styling
if (typeof document !== 'undefined') {
  document.documentElement.classList.add('dark')
}

createRoot(document.getElementById("root")!).render(<App />);
