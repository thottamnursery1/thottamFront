import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircleIcon, ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function ChoiceSelect({
  id,
  value,
  onChange,
  options = [],
  placeholder = 'Choose one',
  error = false,
  className = '',
}) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option === value);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => { if (event.key === 'Escape') setOpen(false); };
    const scroller = document.querySelector('.dashboard-content');
    const previousBody = document.body.style.overflow;
    const previousScroller = scroller?.style.overflow ?? '';
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    if (scroller) scroller.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousBody;
      if (scroller) scroller.style.overflow = previousScroller;
    };
  }, [open]);

  const choose = (next) => {
    onChange?.({ target: { value: next } });
    setOpen(false);
  };

  return (
    <>
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen(true)}
        className={[
          'input flex items-center justify-between gap-3 text-left',
          selected ? 'text-ink' : 'text-gray-400',
          error ? 'input-error' : '',
          className,
        ].join(' ')}
      >
        <span className="truncate">{selected || placeholder}</span>
        <ChevronDownIcon className="h-4 w-4 shrink-0 text-gray-400" />
      </button>

      {open && createPortal(
        <div className="fixed inset-0 z-[80] flex items-end justify-center overflow-hidden overscroll-none sm:items-center sm:p-4">
          <button type="button" className="absolute inset-0 bg-primary-950/45" aria-label="Close choices" onClick={() => setOpen(false)} />
          <div className="relative flex max-h-[min(78dvh,640px)] w-full flex-col overflow-hidden rounded-t-3xl bg-[#F8F6EF] shadow-2xl sm:max-w-md sm:rounded-3xl">
            <div className="flex shrink-0 items-center justify-between px-5 pb-3 pt-5">
              <h3 className="font-display text-2xl text-primary-800">{placeholder}</h3>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 text-muted hover:bg-white" aria-label="Close">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <ul id={listId} role="listbox" className="max-h-[calc(78dvh-4.75rem)] space-y-1 overflow-y-auto overscroll-contain px-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              {options.map((option) => {
                const active = option === value;
                return (
                  <li key={option}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => choose(option)}
                      className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm ${
                        active ? 'bg-white text-primary-800 shadow-sm' : 'text-ink hover:bg-white/70'
                      }`}
                    >
                      <span className="font-medium">{option}</span>
                      {active && <CheckCircleIcon className="h-5 w-5 text-primary-600" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
