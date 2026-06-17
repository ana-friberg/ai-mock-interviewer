interface BrandMarkProps {
  size?: number;
}

export function BrandMark({ size = 30 }: BrandMarkProps) {
  return (
    <div
      className="grid place-items-center rounded-lg bg-primary text-primary-foreground shadow-soft"
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.56}
        height={size * 0.56}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 19V7.5a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3V19" />
        <path d="M19 19V7.5a3 3 0 0 0-3-3h0" />
        <path d="M5 13h6" />
      </svg>
    </div>
  );
}

export function Wordmark({ size = 30 }: BrandMarkProps) {
  return (
    <div className="flex items-center gap-2.5">
      <BrandMark size={size} />
      <div className="leading-none">
        <div className="text-[15px] font-semibold tracking-tight">Mock Interviewer</div>
        <div className="mt-0.5 text-[11px] font-medium text-muted-foreground">AI interview practice</div>
      </div>
    </div>
  );
}
