import { Calendar, MessageSquare, Target, Sun, LayoutDashboard, BookOpen, Calendar as CalendarIcon, Users, Settings, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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

const dashboardItem = {
  title: "Dashboard",
  url: "/dashboard",
  icon: LayoutDashboard,
};

const dailyUsageItems = [
  {
    title: "Today",
    url: "/today",
    icon: Sun,
  },
  {
    title: "Daily Ledger",
    url: "/evening-routine",
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

  const isActive = (url: string) => {
    return location.pathname === url || (location.pathname === "/" && url === "/today");
  };

  const handleLogout = async () => {
    console.log('Logging out user');
    await signOut();
    navigate('/login');
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-zinc-700/50 bg-zinc-900">
      <SidebarHeader className="p-4 flex flex-row items-center justify-between bg-zinc-900">
        <div className="flex flex-col gap-1 group-data-[collapsible=icon]:hidden">
          <h2 className="text-xl font-bold title-gradient">
            {isAuthenticated && user?.email ? user.email.split('@')[0] : 'Guest'}
          </h2>
          <span className="text-xs text-zinc-500 bg-zinc-800/50 px-2 py-0.5 rounded-full w-fit">
            Powered by Praxis
          </span>
        </div>
        <SidebarTrigger className="text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300" />
      </SidebarHeader>
      
      <SidebarContent className="bg-zinc-900">
        {/* Dashboard - Standalone */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  className={`text-zinc-300 transition-all duration-200 ${
                    isActive(dashboardItem.url) 
                      ? 'bg-zinc-800 text-zinc-100 border border-zinc-600/50 shadow-sm' 
                      : ''
                  }`}
                  tooltip={dashboardItem.title}
                  style={{
                    '--sidebar-accent': 'rgb(39 39 42)',
                    '--sidebar-accent-foreground': 'rgb(244 244 245)'
                  } as React.CSSProperties}
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
          <SidebarGroupLabel className="text-zinc-400 title-gradient group-data-[collapsible=icon]:hidden mb-3">
            Daily Usage
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {dailyUsageItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className={`text-zinc-300 transition-all duration-200 ${
                      isActive(item.url) 
                        ? 'bg-zinc-800 text-zinc-100 border border-zinc-600/50 shadow-sm' 
                        : ''
                    }`}
                    tooltip={item.title}
                    style={{
                      '--sidebar-accent': 'rgb(39 39 42)',
                      '--sidebar-accent-foreground': 'rgb(244 244 245)'
                    } as React.CSSProperties}
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
          <SidebarGroupLabel className="text-zinc-400 title-gradient group-data-[collapsible=icon]:hidden mb-3">
            Strategy
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {strategyItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className={`text-zinc-300 transition-all duration-200 ${
                      isActive(item.url) 
                        ? 'bg-zinc-800 text-zinc-100 border border-zinc-600/50 shadow-sm' 
                        : ''
                    }`}
                    tooltip={item.title}
                    style={{
                      '--sidebar-accent': 'rgb(39 39 42)',
                      '--sidebar-accent-foreground': 'rgb(244 244 245)'
                    } as React.CSSProperties}
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
      </SidebarContent>

      {/* Settings Footer */}
      <SidebarFooter className="p-4 border-t border-zinc-700/50 bg-zinc-900">
        {/* Settings Button */}
        {isAuthenticated && (
          <Button
            onClick={() => navigate('/settings')}
            variant="ghost"
            size="sm"
            className="w-full justify-start text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/50 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
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
            className="w-full justify-start text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/50 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
          >
            <User className="w-4 h-4 group-data-[collapsible=icon]:mr-0 mr-2" />
            <span className="group-data-[collapsible=icon]:hidden">Login</span>
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}