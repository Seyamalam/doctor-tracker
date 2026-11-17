export const Logo = ({ className }: { className?: string }) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect className="fill-primary" height="32" rx="8" width="32" />
    <path
      d="M6 18h5l2.5-7 4 12 2.5-5H26"
      stroke="var(--primary-foreground)"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.4"
    />
  </svg>
);
