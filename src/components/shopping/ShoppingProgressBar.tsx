import { CheckCircle2 } from 'lucide-react';
import { Item } from '../../types';

interface ShoppingProgressBarProps {
  items: Item[];
}

export default function ShoppingProgressBar({ items }: ShoppingProgressBarProps) {
  const total = items.length;
  const checked = items.filter(i => i.checked).length;
  const pct = total > 0 ? Math.round((checked / total) * 100) : 0;
  const done = total > 0 && checked === total;

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {done ? (
            <CheckCircle2 className="w-4 h-4 text-success" />
          ) : null}
          <span className="text-sm font-semibold text-text-primary">
            {done ? 'Alles erledigt!' : `${checked} / ${total} Artikel`}
          </span>
        </div>
        <span className="text-sm font-bold text-accent">{pct}%</span>
      </div>
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${checked} von ${total} Artikeln erledigt`}
        />
      </div>
    </div>
  );
}
