import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface SettingsLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function SettingsLayout({ title, children }: SettingsLayoutProps) {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate('/dashboard');
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header with breadcrumb */}
      <div className="border-b border-zinc-700/50 bg-zinc-900 p-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackClick}
            className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="h-4 w-px bg-zinc-700/50" />
          <h1 className="text-xl font-semibold text-zinc-100">{title}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  );
}