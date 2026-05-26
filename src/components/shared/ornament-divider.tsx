import { cn } from "@/lib/utils"

interface OrnamentDividerProps {
  className?: string
  variant?: "leaf" | "lotus" | "dot" | "wheat" | "asterisk" | "enso" | "seed" | "triad"
}

function LeafIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 24"
      fill="none"
      className={cn("h-5 w-10 text-accent/40", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M24 12C18 4 6 2 2 2C2 2 4 10 12 14C4 14 2 22 2 22C6 22 18 20 24 12Z"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M24 12C30 4 42 2 46 2C46 2 44 10 36 14C44 14 46 22 46 22C42 22 30 20 24 12Z"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
      <circle cx="24" cy="12" r="1.5" fill="currentColor" opacity="0.5" />
    </svg>
  )
}

function LotusIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 24"
      fill="none"
      className={cn("h-5 w-8 text-accent/40", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20 2C20 2 12 8 12 16C12 16 16 14 20 14C24 14 28 16 28 16C28 8 20 2 20 2Z" stroke="currentColor" strokeWidth="0.8" fill="none" />
      <path d="M8 10C8 10 4 16 6 22C8 18 12 16 12 16C8 14 8 10 8 10Z" stroke="currentColor" strokeWidth="0.7" fill="none" opacity="0.7" />
      <path d="M32 10C32 10 36 16 34 22C32 18 28 16 28 16C32 14 32 10 32 10Z" stroke="currentColor" strokeWidth="0.7" fill="none" opacity="0.7" />
    </svg>
  )
}

function WheatIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 28"
      fill="none"
      className={cn("h-5 w-10 text-primary/30", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <line x1="24" y1="26" x2="16" y2="4" stroke="currentColor" strokeWidth="0.8" />
      <path d="M16 4L12 8L16 10" stroke="currentColor" strokeWidth="0.7" fill="none" />
      <path d="M16 10L12 14L16 16" stroke="currentColor" strokeWidth="0.7" fill="none" />
      <path d="M17 7L21 4L17 10" stroke="currentColor" strokeWidth="0.7" fill="none" />
      <path d="M18 13L22 10L18 16" stroke="currentColor" strokeWidth="0.7" fill="none" />
      <line x1="24" y1="26" x2="32" y2="4" stroke="currentColor" strokeWidth="0.8" />
      <path d="M32 4L36 8L32 10" stroke="currentColor" strokeWidth="0.7" fill="none" />
      <path d="M32 10L36 14L32 16" stroke="currentColor" strokeWidth="0.7" fill="none" />
      <path d="M31 7L27 4L31 10" stroke="currentColor" strokeWidth="0.7" fill="none" />
      <path d="M30 13L26 10L30 16" stroke="currentColor" strokeWidth="0.7" fill="none" />
    </svg>
  )
}

function DotDivider({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className="h-1 w-1 rounded-full bg-accent/30" />
      <span className="h-1.5 w-1.5 rounded-full bg-accent/40" />
      <span className="h-1 w-1 rounded-full bg-accent/30" />
    </div>
  )
}

function AsteriskIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="-12 -12 24 24"
      fill="none"
      className={cn("h-[18px] w-[18px] text-accent/70", className)}
      aria-hidden
    >
      {[0, 45, 90, 135].map((a) => (
        <line
          key={a}
          x1="-7"
          y1="0"
          x2="7"
          y2="0"
          stroke="currentColor"
          strokeWidth="0.9"
          strokeLinecap="round"
          transform={`rotate(${a})`}
          opacity="0.7"
        />
      ))}
      <circle cx="0" cy="0" r="1.1" fill="currentColor" opacity="0.9" />
    </svg>
  )
}

function EnsoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="-10 -10 20 20"
      fill="none"
      className={cn("h-[18px] w-[18px] text-accent/70", className)}
      aria-hidden
    >
      <path
        d="M 7 -2 A 7 7 0 1 0 5 6"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  )
}

function SeedIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="-11 -7 22 14"
      fill="none"
      className={cn("h-[14px] w-[22px] text-accent/70", className)}
      aria-hidden
    >
      <circle cx="-4" cy="0" r="3.2" stroke="currentColor" strokeWidth="0.7" opacity="0.55" />
      <circle cx="0" cy="0" r="3.2" stroke="currentColor" strokeWidth="0.7" opacity="0.8" />
      <circle cx="4" cy="0" r="3.2" stroke="currentColor" strokeWidth="0.7" opacity="0.55" />
    </svg>
  )
}

function TriadDivider({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className="h-1 w-1 rounded-full bg-amber/40" />
      <span className="h-1.5 w-1.5 rounded-full bg-amber/70" />
      <span className="h-1 w-1 rounded-full bg-amber/40" />
    </div>
  )
}

export function OrnamentDivider({
  className,
  variant = "leaf",
}: OrnamentDividerProps) {
  const icons = {
    leaf: LeafIcon,
    lotus: LotusIcon,
    wheat: WheatIcon,
    dot: DotDivider,
    asterisk: AsteriskIcon,
    enso: EnsoIcon,
    seed: SeedIcon,
    triad: TriadDivider,
  } as const

  const Icon = icons[variant]

  return (
    <div className={cn("flex items-center gap-4 py-6", className)}>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
      <Icon />
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-transparent" />
    </div>
  )
}
