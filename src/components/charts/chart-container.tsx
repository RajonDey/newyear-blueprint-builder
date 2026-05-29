"use client"

import {
  cloneElement,
  useEffect,
  useRef,
  useState,
  type ReactElement,
} from "react"
import { cn } from "@/lib/utils"

interface ChartContainerProps {
  /** Pixel height of the chart area. */
  height: number
  className?: string
  children: ReactElement<{ width?: number; height?: number }>
}

/**
 * Measures the wrapper and passes explicit pixel width/height to recharts.
 * Avoids ResponsiveContainer, which logs width(-1)/height(-1) during layout.
 */
export function ChartContainer({
  height,
  className,
  children,
}: ChartContainerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<{ width: number; height: number } | null>(
    null,
  )

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const update = () => {
      const rect = el.getBoundingClientRect()
      const width = Math.floor(rect.width)
      const measuredHeight = Math.floor(rect.height)
      if (width > 0 && measuredHeight > 0) {
        setSize((prev) =>
          prev?.width === width && prev?.height === measuredHeight
            ? prev
            : { width, height: measuredHeight },
        )
      }
    }

    update()
    const observer = new ResizeObserver(() => {
      requestAnimationFrame(update)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn("w-full min-w-0", className)}
      style={{ height }}
    >
      {size
        ? cloneElement(children, {
            width: size.width,
            height: size.height,
          })
        : null}
    </div>
  )
}
