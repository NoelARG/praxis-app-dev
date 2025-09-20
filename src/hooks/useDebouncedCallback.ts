import { useRef, useEffect } from "react"

export function useDebouncedCallback<T extends (...a: any[]) => void>(fn: T, delay: number) {
  const t = useRef<number | null>(null)
  
  useEffect(() => () => {
    if (t.current) window.clearTimeout(t.current)
  }, [])
  
  return (...args: Parameters<T>) => {
    if (t.current) window.clearTimeout(t.current)
    t.current = window.setTimeout(() => fn(...args), delay)
  }
}


