export default function Logo({ light = false, compact = false }) {
  const leaf = light ? '#CDE8D5' : '#173F35';
  const mark = light ? '#173F35' : '#F8F6EF';
  return (
    <span className={`inline-flex items-center gap-2.5 ${light ? 'text-white' : 'text-primary-700'}`}>
      <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true" className="flex-shrink-0">
        <circle cx="16" cy="16" r="16" fill={leaf} />
        <path d="M16 24V14" stroke={mark} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M16 16c0-4 3.2-6.5 7-6.5-1 4.2-4 6.5-7 6.5Z" fill={mark} />
        <path d="M16 18c0-3.2-2.8-5.4-6.2-5.4 1 3.6 3.4 5.4 6.2 5.4Z" fill={light ? '#287A55' : '#287A55'} />
      </svg>
      {!compact && (
        <span className="font-display text-[1.35rem] leading-none tracking-tight">Thottam</span>
      )}
    </span>
  );
}
