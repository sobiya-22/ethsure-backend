import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./ProtectedRoute";

// Lazy-loaded pages
const Landing = lazy(() => import("./pages/Landing"));
const Signup = lazy(() => import("./pages/Signup"));
const Login = lazy(() => import("./pages/Login"));
const AdminDashboard = lazy(() => import("./pages/Dashboard/AdminDashboard"));
const AgentDashboard = lazy(() => import("./pages/Dashboard/AgentDashboard"));
const CustomerDashboard = lazy(() => import("./pages/Dashboard/CustomerDashboard"));
const SubmitClaim = lazy(() => import("./pages/Claim/SubmitClaim"));
const ClaimDetails = lazy(() => import("./pages/Claim/ClaimDetails"));
const Services = lazy(() => import("./pages/Services"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));
const CustomerKYC = lazy(() => import("./pages/CustomerKYC"));


function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white w-full">
          <Suspense fallback={<div className="text-center p-6">Loading...</div>}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/services" element={<Services />} />
              <Route path="/kyc" element={<ProtectedRoute roles={['customer']}><CustomerKYC /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute roles={["admin", "agent", "customer"]}><Profile /></ProtectedRoute>} />

              {/* Dashboards */}
              <Route path="/dashboard/admin" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/dashboard/agent" element={<ProtectedRoute roles={["agent"]}><AgentDashboard /></ProtectedRoute>} />
              <Route path="/dashboard/customer" element={<ProtectedRoute roles={["customer"]}><CustomerDashboard /></ProtectedRoute>} />

              {/* Claims */}
              <Route path="/claim/submit" element={<ProtectedRoute roles={["agent", "customer"]}><SubmitClaim /></ProtectedRoute>} />
              <Route path="/claim/:id" element={<ProtectedRoute roles={["admin", "agent", "customer"]}><ClaimDetails /></ProtectedRoute>} />

              {/* 404 fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
