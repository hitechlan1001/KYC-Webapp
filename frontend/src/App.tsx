import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Import KYC page components
import KYC from "./pages/KYC";
import KYCStatus from "./pages/KYCStatus";
import KYCAdmin from "./pages/KYCAdmin";
import KYCLanding from "./pages/KYCLanding";
import { Login } from "./pages/Login";

function RequireAdmin({ children }: { children: JSX.Element }) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const userRaw = typeof window !== 'undefined' ? localStorage.getItem('auth_user') : null;
  const user = userRaw ? JSON.parse(userRaw) : null;
  if (!token || user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  return children;
}


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<KYCLanding />} />
        <Route path="/kyc" element={<KYC />} />
        <Route path="/kyc/status" element={<KYCStatus />} />
        <Route path="/login" element={<Login />} />
        <Route path="/kyc-admin" element={<RequireAdmin><KYCAdmin /></RequireAdmin>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
