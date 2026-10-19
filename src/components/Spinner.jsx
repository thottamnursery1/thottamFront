export default function Spinner({ size = 'md', className = '' }) {
  const dims = { sm: 'w-4 h-4 border-2', md: 'w-7 h-7 border-[3px]', lg: 'w-10 h-10 border-[3px]' };
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`${dims[size]} rounded-full animate-spin border-primary-500 border-t-transparent ${className}`}
    />
  );
}

export function PageSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
      <Spinner size="lg" />
      <p className="text-xs text-gray-400 animate-pulse">Loading…</p>
    </div>
  );
}

export function InlineSpinner({ text = 'Loading…' }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <Spinner size="sm" />
      <span>{text}</span>
    </div>
  );
}
