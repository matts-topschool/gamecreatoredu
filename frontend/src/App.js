import React, { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

// Stores
import useAuthStore from "@/stores/authStore";

// Layout
import Layout from "@/components/common/Layout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Pages
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Dashboard from "@/pages/Dashboard";
import Studio from "@/pages/Studio";
import StudioNew from "@/pages/StudioNew";
import StudioEditor from "@/pages/StudioEditor";
import Play from "@/pages/Play";
import Classes from "@/pages/Classes";
import ClassDetail from "@/pages/ClassDetail";
import Marketplace from "@/pages/Marketplace";
import MarketplaceListing from "@/pages/MarketplaceListing";
import Integrations from "@/pages/Integrations";
import GoogleCourses from "@/pages/GoogleCourses";
import FileImport from "@/pages/FileImport";

// Placeholder pages for Phase 1
const Placeholder = ({ title }) => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
      <p className="text-muted-foreground">Coming soon in next phase</p>
    </div>
  </div>
);
const DashboardGames = () => <Placeholder title="My Games" />;
const DashboardSessions = () => <Placeholder title="Sessions" />;
const DashboardAnalytics = () => <Placeholder title="Analytics" />;
const MarketplacePurchases = () => <Placeholder title="My Purchases" />;
const Settings = () => <Placeholder title="Settings" />;
const PlaySession = () => <Placeholder title="Live Session" />;

function App() {
  const { checkAuth } = useAuthStore();

  // Check authentication on app load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
          <Route path="/pricing" element={<Placeholder title="Pricing" />} />
          <Route path="/about" element={<Placeholder title="About" />} />

          {/* Protected Routes with Layout */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/games" element={<DashboardGames />} />
            <Route path="/dashboard/sessions" element={<DashboardSessions />} />
            <Route path="/dashboard/sessions/:id" element={<Placeholder title="Session Detail" />} />
            <Route path="/dashboard/classes" element={<Classes />} />
            <Route path="/dashboard/classes/:classId" element={<ClassDetail />} />
            <Route path="/dashboard/analytics" element={<DashboardAnalytics />} />

            {/* Studio */}
            <Route path="/studio" element={<Studio />} />
            <Route path="/studio/new" element={<StudioNew />} />
            <Route path="/studio/:gameId" element={<StudioEditor />} />
            <Route path="/studio/:gameId/preview" element={<Placeholder title="Game Preview" />} />

            {/* Marketplace */}
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/marketplace/purchases" element={<MarketplacePurchases />} />
            <Route path="/marketplace/sell" element={<Placeholder title="Seller Dashboard" />} />
            <Route path="/marketplace/publisher/:userId" element={<Placeholder title="Publisher Profile" />} />
            <Route path="/marketplace/:gameId" element={<MarketplaceListing />} />

            {/* Settings */}
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/subscription" element={<Placeholder title="Subscription" />} />
            <Route path="/settings/integrations" element={<Placeholder title="Integrations" />} />

            {/* Integrations */}
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/integrations/google_classroom/courses" element={<GoogleCourses />} />
            <Route path="/integrations/import" element={<FileImport />} />
          </Route>

          {/* Play Routes (semi-public) */}
          <Route path="/play/:gameId" element={<Play />} />
          <Route path="/play/join" element={<Placeholder title="Join Game" />} />
          <Route path="/play/session/:code" element={<PlaySession />} />
          <Route path="/play/demo" element={<Placeholder title="Demo Game" />} />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      {/* Toast notifications */}
      <Toaster 
        position="top-right" 
        richColors 
        closeButton
        toastOptions={{
          style: {
            fontFamily: 'Manrope, sans-serif'
          }
        }}
      />
    </div>
  );
}

export default App;
