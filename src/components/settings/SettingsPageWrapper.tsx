import { SettingsSidebar } from "../SettingsSidebar";

interface SettingsPageWrapperProps {
  children: React.ReactNode;
}

export function SettingsPageWrapper({ children }: SettingsPageWrapperProps) {
  return (
    <div className="flex h-full">
      {/* Settings Sidebar - positioned after collapsed main sidebar */}
      <SettingsSidebar isOpen={true} />
      
      {/* Settings Content - positioned after settings sidebar */}
      <div className="flex-1 ml-64 bg-zinc-900">
        {children}
      </div>
    </div>
  );
}