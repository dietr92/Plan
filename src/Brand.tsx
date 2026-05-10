interface AppetiteMarkProps {
  size?: number
  reverse?: boolean
}

export function AppetiteMark({ size = 36, reverse = false }: AppetiteMarkProps) {
  const bg = reverse ? 'rgba(244,241,234,.12)' : '#0B2038'
  const fg = '#F4F1EA'
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden="true" focusable="false">
      <rect width="80" height="80" rx="18" fill={bg} />
      <path d="M12 66 L30 14 H50 L68 66 H54 L50 50 H30 L26 66 Z" fill={fg} />
      <g transform="translate(40 38)">
        <path
          d="M-16 0 C-16 14 -10 24 -4 32 C-2 36 2 36 4 32 C10 24 16 14 16 0 C14 -6 8 -8 0 -8 C-8 -8 -14 -6 -16 0 Z"
          fill="#F2D88B"
        />
        <path d="M-6 4 C-6 12 -3 18 0 22 C3 18 6 12 6 4 C5 0 2 -1 0 -1 C-2 -1 -5 0 -6 4 Z" fill="#fff" opacity=".9" />
      </g>
    </svg>
  )
}

export function PlanWordmark({ compact = false, reverse = false }: { compact?: boolean; reverse?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <AppetiteMark size={compact ? 34 : 42} reverse={reverse} />
      <div className="leading-none">
        <div className={`font-display font-black tracking-normal ${compact ? 'text-lg' : 'text-2xl'} ${reverse ? 'text-app-paper' : 'text-app-navy'}`}>
          Plan
        </div>
        <div className={`mt-1 text-[11px] font-bold uppercase tracking-[0.18em] ${reverse ? 'text-app-paper/70' : 'text-app-muted'}`}>
          by Appetite
        </div>
      </div>
    </div>
  )
}

