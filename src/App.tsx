import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { TasksProvider } from "@/hooks/useTasks";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ChatSessionProvider } from "@/components/chat/ChatSessionProvider";
import Dashboard from "./pages/Dashboard";
import EveningRoutine from "./pages/EveningRoutine";
import Reflection from "./pages/Reflection";
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
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TasksProvider>
        <ChatSessionProvider>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
            <div className="min-h-screen bg-background text-foreground w-full relative">
              <Routes>
                {/* Public routes - no sidebar */}
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                
                {/* Application routes - with sidebar */}
                <Route path="/*" element={
                  <ProtectedRoute>
                    <SidebarProvider>
                      <AppSidebar />
                      
                      {/* Single vertical separator - simple implementation */}
                      <div className="vertical-separator" />
                      
                      <SidebarInset className="bg-background">
                        <Routes>
                          <Route path="/" element={<Today />} />
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/journal" element={<Today />} />
                          <Route path="/ledger" element={<EveningRoutine />} />
                          <Route path="/reflection" element={<Reflection />} />
                          <Route path="/plan-tomorrow" element={<PlanTomorrow />} />
                          <Route path="/plan" element={<Index />} />
                          <Route path="/goals" element={<Goals />} />
                          <Route path="/goal-wizard" element={<GoalWizard />} />
                          <Route path="/praxis" element={<Praxis />} />
                          <Route path="/heroes" element={<Heroes />} />
                          <Route path="/planner" element={<Planner />} />
                          <Route path="/admin" element={<Admin />} />
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
        </ChatSessionProvider>
      </TasksProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;