import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function Pagination({ page, pages, onPageChange }) {
  if (!pages || pages <= 1) return null;

  const getPages = () => {
    const arr   = [];
    const delta = 2;
    const start = Math.max(1, page - delta);
    const end   = Math.min(pages, page + delta);
    for (let i = start; i <= end; i++) arr.push(i);
    if (arr[0] > 1) {
      if (arr[0] > 2) arr.unshift('…');
      arr.unshift(1);
    }
    if (arr[arr.length - 1] < pages) {
      if (arr[arr.length - 1] < pages - 1) arr.push('…');
      arr.push(pages);
    }
    return arr;
  };

  const base = 'min-w-[34px] h-[34px] rounded-lg text-sm font-medium transition-all duration-150 flex items-center justify-center';

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">

      {/* Prev */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className={`${base} border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-800 disabled:opacity-35 disabled:cursor-not-allowed`}
      >
        <ChevronLeftIcon className="w-4 h-4" />
      </button>

      {/* Page numbers */}
      {getPages().map((p, i) =>
        p === '…' ? (
          <span key={`ellipsis-${i}`} className="px-1 text-sm text-gray-400 select-none">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            aria-label={`Page ${p}`}
            aria-current={p === page ? 'page' : undefined}
            className={`${base} ${
              p === page
                ? 'bg-primary-700 text-white shadow-sm'
                : 'border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === pages}
        aria-label="Next page"
        className={`${base} border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-800 disabled:opacity-35 disabled:cursor-not-allowed`}
      >
        <ChevronRightIcon className="w-4 h-4" />
      </button>
    </nav>
  );
}
