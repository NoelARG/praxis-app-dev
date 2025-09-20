import React, { useState, useEffect } from 'react';
import { Calendar, MessageSquare, Target, Sun, LayoutDashboard, BookOpen, Calendar as CalendarIcon, Users, Settings, User, Shield } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from '@/integrations/supabase/client';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { formatDisplayName } from "@/lib/formatDisplayName";

const dashboardItem = {
  title: "Dashboard",
  url: "/dashboard",
  icon: LayoutDashboard,
};

const dailyUsageItems = [
  {
    title: "Active Journal",
    url: "/journal",
    icon: Sun,
  },
  {
    title: "Daily Ledger",
    url: "/ledger",
    icon: Calendar,
  },
];

const strategyItems = [
  {
    title: "Goals",
    url: "/goals",
    icon: Target,
  },
  {
    title: "Praxis",
    url: "/praxis",
    icon: BookOpen,
  },
  {
    title: "Heroes",
    url: "/heroes",
    icon: Users,
  },
  {
    title: "Planner",
    url: "/planner",
    icon: CalendarIcon,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  const isActive = (url: string) => {
    return location.pathname === url || (location.pathname === "/" && url === "/journal");
  };

  // Check if current user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
          return;
        }

        console.log('Admin check result:', profile?.role, 'isAdmin:', profile?.role === 'admin');
        setIsAdmin(profile?.role === 'admin');
      } catch (error) {
        console.error('Error in checkAdminStatus:', error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const handleLogout = async () => {
    console.log('Logging out user');
    await signOut();
    navigate('/login');
  };

  // Get display name using helper
  const displayName = formatDisplayName(
    user?.user_metadata?.first_name,
    user?.user_metadata?.last_name,
    user?.email
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="p-4 flex flex-row items-center justify-between bg-sidebar">
        <div className="flex flex-col gap-1 group-data-[collapsible=icon]:hidden">
          <h2 className="text-xl font-bold text-sidebar-foreground">
            {isAuthenticated ? displayName : 'Guest'}
          </h2>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full w-fit">
            Powered by Praxis
          </span>
        </div>
        <SidebarTrigger className="text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" />
      </SidebarHeader>
      
      <SidebarContent className="bg-sidebar [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-thumb:hover]:bg-zinc-600">
        {/* Dashboard - Standalone */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  className={`text-sidebar-foreground transition-all duration-200 ${
                    isActive(dashboardItem.url) 
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground border border-sidebar-border shadow-sm' 
                      : ''
                  }`}
                  tooltip={dashboardItem.title}
                >
                  <Link to={dashboardItem.url}>
                    <dashboardItem.icon className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden">{dashboardItem.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Daily Usage Group */}
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-muted-foreground group-data-[collapsible=icon]:hidden mb-3">
            Daily Usage
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {dailyUsageItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className={`text-sidebar-foreground transition-all duration-200 ${
                      isActive(item.url) 
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground border border-sidebar-border shadow-sm' 
                        : ''
                    }`}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-5 w-5" />
                      <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Strategy Group */}
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-muted-foreground group-data-[collapsible=icon]:hidden mb-3">
            Strategy
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {strategyItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className={`text-sidebar-foreground transition-all duration-200 ${
                      isActive(item.url) 
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground border border-sidebar-border shadow-sm' 
                        : ''
                    }`}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-5 w-5" />
                      <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section - Only show for admins */}
        {isAdmin && (
          <SidebarGroup className="mt-6">
            <SidebarGroupLabel className="text-muted-foreground group-data-[collapsible=icon]:hidden mb-3">
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    className={`text-sidebar-foreground transition-all duration-200 ${
                      isActive('/admin') 
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground border border-sidebar-border shadow-sm' 
                        : ''
                    }`}
                    tooltip="Admin Panel"
                  >
                    <Link to="/admin">
                      <Shield className="h-5 w-5" />
                      <span className="group-data-[collapsible=icon]:hidden">Admin Panel</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Sidebar divider with proper spacing */}
        <hr className="mx-4 my-2 border-t border-sidebar-border" />
      </SidebarContent>

      {/* Settings Footer */}
      <SidebarFooter className="p-4 border-t border-sidebar-border bg-sidebar">
        {/* Settings Button */}
        {isAuthenticated && (
          <Button
            onClick={() => navigate('/settings')}
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
          >
            <Settings className="w-4 h-4 group-data-[collapsible=icon]:mr-0 mr-2" />
            <span className="group-data-[collapsible=icon]:hidden">Settings</span>
          </Button>
        )}

        {/* Login Button for unauthenticated users */}
        {!isAuthenticated && (
          <Button
            onClick={() => navigate('/login')}
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
          >
            <User className="w-4 h-4 group-data-[collapsible=icon]:mr-0 mr-2" />
            <span className="group-data-[collapsible=icon]:hidden">Login</span>
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}