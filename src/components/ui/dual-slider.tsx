import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"

export interface DualSliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  value: [number, number]
  onValueChange?: (value: [number, number]) => void
  ariaLabelLower?: string
  ariaLabelUpper?: string
}

export const DualSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  DualSliderProps
>(({ className, value, onValueChange, ariaLabelLower = 'lower-thumb', ariaLabelUpper = 'upper-thumb', ...props }, ref) => {
  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn("relative flex w-full touch-none select-none items-center", className)}
      value={value}
      onValueChange={(v) => onValueChange?.(v as [number, number])}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-zinc-700">
        <SliderPrimitive.Range className="absolute h-full bg-emerald-500" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb aria-label={ariaLabelLower} className="block h-5 w-5 rounded-full border-2 border-emerald-500 bg-white ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
      <SliderPrimitive.Thumb aria-label={ariaLabelUpper} className="block h-5 w-5 rounded-full border-2 border-emerald-500 bg-white ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
    </SliderPrimitive.Root>
  )
})
DualSlider.displayName = "DualSlider"


