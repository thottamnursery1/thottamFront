import { useEffect } from 'react';

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', busy = false, onConfirm, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => { if (event.key === 'Escape' && !busy) onClose?.(); };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, busy, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button type="button" className="absolute inset-0 bg-primary-950/45" aria-label="Close dialog" onClick={() => !busy && onClose?.()} />
      <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-message" className="relative w-full max-w-sm rounded-3xl bg-[#F8F6EF] p-6 shadow-2xl">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">Please confirm</p>
        <h2 id="confirm-title" className="mt-2 font-display text-2xl leading-tight text-primary-800">{title}</h2>
        <p id="confirm-message" className="mt-2 text-sm leading-relaxed text-ink/80">{message}</p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button type="button" className="btn-outline w-full" onClick={onClose} disabled={busy}>{cancelLabel}</button>
          <button type="button" className="btn-danger w-full" onClick={onConfirm} disabled={busy}>{busy ? 'Removing…' : confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
