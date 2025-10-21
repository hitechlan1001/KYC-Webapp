import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Import KYC page components
import KYC from "./pages/KYC";
import KYCLanding from "./pages/KYCLanding";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<KYCLanding />} />
        <Route path="/kyc" element={<KYC />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
