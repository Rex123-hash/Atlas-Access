/** The AtlasAccess mark — a route line climbing to a waypoint on an indigo tile.
 * Matches the favicon (src/app/icon.svg) and the README logo. Inline SVG so it
 * stays crisp at any size. */
export default function AtlasLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label="AtlasAccess logo"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="4" y="4" width="112" height="112" rx="26" fill="#4f46e5" />
      <path d="M34 86 L52 60 L70 74 L88 38" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="34" cy="86" r="8" fill="#ffffff" />
      <circle cx="88" cy="38" r="11" fill="#4f46e5" stroke="#c7d2fe" strokeWidth="7" />
    </svg>
  );
}
