import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { TasksProvider } from "@/hooks/useTasks";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import EveningRoutine from "./pages/EveningRoutine";
import PlanTomorrow from "./pages/PlanTomorrow";
import Goals from "./pages/Goals";
import GoalWizard from "./pages/GoalWizard";
import Praxis from "./pages/Praxis";
import Heroes from "./pages/Heroes";
import Planner from "./pages/Planner";
import NotFound from "./pages/NotFound";
import Today from "./pages/Today";
import Index from "./pages/Index";
import Signup from "./pages/Signup";
import Login from "./pages/Login";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TasksProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-zinc-900 text-zinc-100 w-full">
              <Routes>
                {/* Public routes - no sidebar */}
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                
                {/* Application routes - with sidebar */}
                <Route path="/*" element={
                  <ProtectedRoute>
                    <SidebarProvider>
                      <AppSidebar />
                      <SidebarInset className="bg-zinc-900">
                        <Routes>
                          <Route path="/" element={<Today />} />
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/today" element={<Today />} />
                          <Route path="/evening-routine" element={<EveningRoutine />} />
                          <Route path="/plan-tomorrow" element={<PlanTomorrow />} />
                          <Route path="/plan" element={<Index />} />
                          <Route path="/goals" element={<Goals />} />
                          <Route path="/goal-wizard" element={<GoalWizard />} />
                          <Route path="/praxis" element={<Praxis />} />
                          <Route path="/heroes" element={<Heroes />} />
                          <Route path="/planner" element={<Planner />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </SidebarInset>
                    </SidebarProvider>
                  </ProtectedRoute>
                } />
              </Routes>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </TasksProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;