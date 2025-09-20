import * as React from "react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

type Props = {
  label: string
  value: number | null
  onChange: (v: number) => void
  className?: string
}

export function RatingRow({ label, value, onChange, className }: Props) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-[1fr_auto] items-center gap-2 ${className || ""}`}>
      <div className="text-sm font-medium text-foreground">{label}</div>
      <ToggleGroup
        type="single"
        value={value ? String(value) : ""}
        onValueChange={(v) => { if (v) onChange(Number(v)) }}
        className="justify-end gap-2"
      >
        {[1,2,3,4,5].map(n => (
          <ToggleGroupItem
            key={n}
            value={String(n)}
            aria-label={`Select ${n}`}
            className="
              h-7 min-w-[2rem] px-2 text-xs font-medium
              rounded-md border border-border
              bg-transparent text-muted-foreground
              hover:bg-muted/40
              data-[state=on]:bg-primary
              data-[state=on]:text-primary-foreground
              data-[state=on]:border-primary
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
            "
          >
            {n}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}


