import { useEffect, useId, useRef, useState } from 'react';

const choices = [
  {
    value: false,
    icon: '🌿',
    title: 'No, skip the carton box',
    detail: "I'll help reduce packaging waste.",
    recommended: true,
  },
  {
    value: true,
    icon: '📦',
    title: 'Yes, I need a carton box',
    detail: 'Keep my plants safely packed.',
    recommended: false,
  },
];

function LeafArt() {
  return (
    <svg viewBox="0 0 280 72" className="w-full h-16 text-primary-600/80" aria-hidden="true">
      <g className="carton-leaf" style={{ transformOrigin: '46px 48px' }}>
        <path fill="currentColor" d="M48 58c-18-8-34-28-36-46 20 2 38 16 46 36-4 4-7 8-10 10z" opacity="0.85" />
        <path fill="currentColor" d="M46 56c8-16 22-28 40-34-16 16-28 30-36 40-2-2-3-4-4-6z" opacity="0.55" />
      </g>
      <g className="carton-leaf carton-leaf-delay" style={{ transformOrigin: '230px 46px' }}>
        <path fill="currentColor" d="M232 56c18-8 34-28 36-46-20 2-38 16-46 36 4 4 7 8 10 10z" opacity="0.75" />
        <path fill="currentColor" d="M234 54c-8-16-22-28-40-34 16 16 28 30 36 40 2-2 3-4 4-6z" opacity="0.4" />
      </g>
      <circle cx="140" cy="46" r="16" fill="#CDE8D5" />
      <path d="M140 58V34" stroke="#173F35" strokeWidth="2" strokeLinecap="round" />
      <path d="M140 42c8-8 16-8 20-6-6 2-12 8-20 10z" fill="#287A55" />
      <path d="M140 48c-8-6-16-6-20-4 6 2 12 6 20 8z" fill="#173F35" />
    </svg>
  );
}

export default function CartonBoxDialog({ open, busy, onClose, onConfirm }) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef(null);
  const [choice, setChoice] = useState(null);

  useEffect(() => {
    if (!open) {
      setChoice(null);
      return undefined;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const frame = window.requestAnimationFrame(() => {
      dialogRef.current?.querySelector('[data-recommended="true"]')?.focus();
    });
    const onKey = (event) => {
      if (event.key === 'Escape' && !busy) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKey);
      window.cancelAnimationFrame(frame);
    };
  }, [open, busy, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-[#173F35]/35 backdrop-blur-sm carton-fade"
        aria-label="Close packaging choice"
        onClick={() => { if (!busy) onClose(); }}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative w-full sm:max-w-lg max-h-[94dvh] overflow-y-auto scrollbar-gloss glass-panel rounded-t-[1.8rem] sm:rounded-[1.8rem] p-5 sm:p-7 carton-rise"
      >
        <LeafArt />
        <p className="text-center text-xs font-semibold tracking-[0.16em] uppercase text-primary-600 mt-1">Thottam packaging</p>
        <h2 id={titleId} className="text-center text-2xl sm:text-[1.7rem] text-primary-800 mt-2 text-balance">
          🌱 Reduce Packaging, Save Nature!
        </h2>
        <p id={descriptionId} className="text-center text-sm sm:text-[15px] text-ink/80 mt-3 leading-relaxed">
          Your plants can make the world greener. Let&apos;s reduce unnecessary packaging and protect our environment.
        </p>
        <p className="text-center font-semibold text-primary-800 mt-4 text-sm sm:text-base">
          Do you still need a carton box for your order? 📦
        </p>

        <div className="mt-5 grid grid-cols-1 gap-3">
          {choices.map((option) => {
            const selected = choice === option.value;
            return (
              <button
                key={String(option.value)}
                type="button"
                data-recommended={option.recommended ? 'true' : 'false'}
                aria-pressed={selected}
                onClick={() => setChoice(option.value)}
                className={`text-left rounded-2xl border px-4 py-3.5 transition-all duration-200 min-h-[72px] ${
                  selected
                    ? 'border-primary-700 bg-primary-50 shadow-[0_8px_24px_rgba(23,63,53,0.12)]'
                    : option.recommended
                      ? 'border-primary-300 bg-white/70 hover:border-primary-500'
                      : 'border-white/80 bg-white/45 hover:border-primary-200'
                }`}
              >
                <span className="flex items-start gap-3">
                  <span className="text-2xl leading-none mt-0.5" aria-hidden="true">{option.icon}</span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-primary-800">{option.title}</span>
                      {option.recommended && (
                        <span className="badge-green text-[10px] uppercase tracking-wide">Recommended</span>
                      )}
                    </span>
                    <span className="block text-sm text-muted mt-0.5">{option.detail}</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-xs text-muted mt-4 leading-relaxed">
          Skipping the carton still keeps the wrap and support your plants need for a safe delivery.
        </p>

        <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button type="button" className="btn-ghost w-full sm:w-auto" onClick={onClose} disabled={busy}>
            Not now
          </button>
          <button
            type="button"
            className="btn-primary w-full sm:w-auto"
            disabled={choice === null || busy}
            onClick={() => onConfirm(choice)}
          >
            {busy ? 'Opening payment...' : 'Continue to payment'}
          </button>
        </div>
      </div>
    </div>
  );
}
