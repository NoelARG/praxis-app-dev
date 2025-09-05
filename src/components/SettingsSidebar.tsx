import { User, Settings2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface SettingsSidebarProps {
  isOpen: boolean;
}

const settingsItems = [
  {
    title: "Account",
    url: "/settings/account",
    icon: User,
    description: "Manage your account and sign out"
  },
  {
    title: "Preferences", 
    url: "/settings/preferences",
    icon: Settings2,
    description: "App preferences and customization"
  }
];

export function SettingsSidebar({ isOpen }: SettingsSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (url: string) => location.pathname === url;

  const handleNavigation = (url: string) => {
    navigate(url);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed top-0 left-12 h-full w-64 bg-zinc-900 border-r border-zinc-700/50 z-40 transform transition-transform duration-300 ease-out"
    >
      {/* Header */}
      <div className="p-6 border-b border-zinc-700/50">
        <h2 className="text-lg font-semibold text-zinc-100">Settings</h2>
        <p className="text-sm text-zinc-400 mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Navigation Menu */}
      <div className="p-4">
        <nav className="space-y-2">
          {settingsItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.url);
            
            return (
              <button
                key={item.title}
                onClick={() => handleNavigation(item.url)}
                className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors duration-200 ${
                  active 
                    ? 'bg-zinc-800 text-zinc-100 border border-zinc-600/50' 
                    : 'text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100'
                }`}
              >
                <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    {item.description}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}