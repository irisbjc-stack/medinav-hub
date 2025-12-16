import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import MapViewerPage from "./pages/MapViewerPage";
import TaskManagerPage from "./pages/TaskManagerPage";
import FleetPage from "./pages/FleetPage";
import AlertsPage from "./pages/AlertsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected App Routes */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/map" element={<MapViewerPage />} />
            <Route path="/tasks" element={<TaskManagerPage />} />
            <Route path="/tasks/new" element={<TaskManagerPage />} />
            <Route path="/fleet" element={<FleetPage />} />
            <Route path="/fleet/:robotId" element={<FleetPage />} />
            <Route path="/zones" element={<DashboardPage />} />
            <Route path="/models" element={<DashboardPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/logs" element={<DashboardPage />} />
            <Route path="/api-docs" element={<DashboardPage />} />
            <Route path="/simulation" element={<DashboardPage />} />
            <Route path="/settings" element={<DashboardPage />} />
          </Route>
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
