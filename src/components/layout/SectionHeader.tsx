import * as React from "react";
import { cn } from "@/lib/utils";

/** Section header with icon square, title, and a rule line to the right. */
export function SectionHeader({
  icon: Icon,
  children,
  className,
  showRule = true,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
  showRule?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-3 mb-8", className)}>
      {/* Icon square (matches Ledger style) */}
      {Icon ? (
        <div className="w-8 h-8 bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-white" />
        </div>
      ) : null}

      <h2 className="text-2xl font-semibold text-foreground">{children}</h2>

      {showRule ? (
        <div className="flex-1 h-px bg-gradient-to-r from-zinc-700 to-transparent"></div>
      ) : null}
    </div>
  );
}

