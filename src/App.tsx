import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { TendersProvider } from "@/contexts/TendersContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import SavedTenders from "./pages/SavedTenders";
import TenderDetail from "./pages/TenderDetail";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <TendersProvider>
            <Routes>
              {/* Public route - accessible without login */}
              <Route path="/login" element={<Login />} />
              
              {/* Protected routes - require authentication */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              <Route path="/saved" element={
                <ProtectedRoute>
                  <SavedTenders />
                </ProtectedRoute>
              } />
              <Route path="/tender/:id" element={
                <ProtectedRoute>
                  <TenderDetail />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="*" element={
                <ProtectedRoute>
                  <NotFound />
                </ProtectedRoute>
              } />
            </Routes>
          </TendersProvider>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
