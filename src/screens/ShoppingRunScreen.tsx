import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Check, ShoppingCart, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Item, ShoppingList } from '../types';
import { getItemIcon } from '../lib/itemIcons';

interface ShoppingRunScreenProps {
  list: ShoppingList;
  onBack: () => void;
  onComplete: (listName: string, listId: string) => void;
}

export default function ShoppingRunScreen({ list, onBack, onComplete }: ShoppingRunScreenProps) {
  const { removeItemsByIds } = useApp();
  const { t } = useLanguage();
  const [items, setItems] = useState<Item[]>([]);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [showExitPrompt, setShowExitPrompt] = useState(false);

  useEffect(() => {
    loadItems();
  }, [list.id]);

  async function loadItems() {
    setLoading(true);
    const { data } = await supabase
      .from('items')
      .select('*')
      .eq('list_id', list.id)
      .order('position', { ascending: true });
    setItems(data ?? []);
    setChecked({});
    setLoading(false);
  }

  const toggleChecked = useCallback((id: string) => {
    setChecked(prev => {
      const next = { ...prev, [id]: !prev[id] };
      const total = items.length;
      const checkedCount = Object.values(next).filter(Boolean).length;
      if (total > 0 && checkedCount === total) {
        setTimeout(() => onComplete(list.name, list.id), 400);
      }
      return next;
    });
  }, [items, list.name, list.id, onComplete]);

  async function handleConfirmExit() {
    const checkedIds = Object.entries(checked)
      .filter(([, v]) => v)
      .map(([id]) => id);
    if (checkedIds.length > 0) {
      await supabase.from('items').delete().in('id', checkedIds);
      removeItemsByIds(checkedIds);
    }
    onBack();
  }

  function handleBack() {
    const checkedCount = Object.values(checked).filter(Boolean).length;
    if (checkedCount > 0) {
      setShowExitPrompt(true);
    } else {
      onBack();
    }
  }

  const total = items.length;
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const pct = total > 0 ? Math.round((checkedCount / total) * 100) : 0;

  const uncheckedItems = items.filter(i => !checked[i.id]);
  const checkedItems = items.filter(i => checked[i.id]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div
        className="shrink-0 px-4 py-3 flex items-center gap-3 border-b border-[var(--border)]"
        style={{ background: 'linear-gradient(180deg, var(--surface-dark) 0%, transparent 100%)' }}
      >
        <button
          onClick={handleBack}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
          aria-label={t.shopping.back}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-text-muted">{t.shopping.shoppingRun}</p>
          <h1 className="text-base font-bold text-text-primary truncate">{list.name}</h1>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-lg font-bold text-accent">{pct}%</p>
          <p className="text-xs text-text-muted">{checkedCount} / {total}</p>
        </div>
      </div>

      <div className="px-4 py-2 shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-semibold text-text-primary">
            {checkedCount} / {total} {t.shopping.bought}
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${pct}%` }}
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${checkedCount} / ${total}`}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none px-4 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <EmptyRunState />
        ) : (
          <div className="space-y-2 pt-2">
            {uncheckedItems.map(item => (
              <RunItemRow
                key={item.id}
                item={item}
                isChecked={false}
                onToggle={() => toggleChecked(item.id)}
              />
            ))}
            {checkedItems.length > 0 && (
              <>
                {uncheckedItems.length > 0 && (
                  <div className="pt-2 pb-1">
                    <div className="flex items-center gap-2">
                      <div className="h-px flex-1 bg-[var(--border)]" />
                      <span className="text-xs text-text-muted px-2">{checkedItems.length} {t.shopping.done}</span>
                      <div className="h-px flex-1 bg-[var(--border)]" />
                    </div>
                  </div>
                )}
                {checkedItems.map(item => (
                  <RunItemRow
                    key={item.id}
                    item={item}
                    isChecked={true}
                    onToggle={() => toggleChecked(item.id)}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {showExitPrompt && (
        <ExitPrompt
          onConfirm={handleConfirmExit}
          onCancel={() => setShowExitPrompt(false)}
        />
      )}
    </div>
  );
}

interface RunItemRowProps {
  item: Item;
  isChecked: boolean;
  onToggle: () => void;
}

function RunItemRow({ item, isChecked, onToggle }: RunItemRowProps) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center gap-4 p-4 rounded-card border transition-all ${
        isChecked
          ? 'bg-surface-card/50 border-[var(--border)] opacity-60'
          : 'bg-surface-card border-[var(--border)] active:scale-[0.98]'
      }`}
      aria-pressed={isChecked}
    >
      <div className={`check-circle shopping shrink-0 ${isChecked ? 'checked animate-check-morph' : ''}`}>
        {isChecked && <Check className="w-5 h-5 text-white" strokeWidth={3} />}
      </div>
      <div className="flex-1 text-left min-w-0">
        <span className={`block text-base font-medium truncate transition-all ${
          isChecked ? 'line-through text-text-muted' : 'text-text-primary'
        }`}>
          <span className="mr-1.5" aria-hidden="true">{getItemIcon(item.name)}</span>{item.name}
        </span>
        {item.quantity && (
          <span className="block text-sm text-text-muted mt-0.5">{item.quantity}</span>
        )}
      </div>
      {isChecked && (
        <Check className="w-5 h-5 text-success shrink-0" />
      )}
    </button>
  );
}

function EmptyRunState() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-surface-elevated border border-[var(--border)] flex items-center justify-center mb-4">
        <ShoppingCart className="w-8 h-8 text-text-muted" />
      </div>
      <p className="text-base font-semibold text-text-primary mb-1">{t.shopping.listEmpty}</p>
      <p className="text-sm text-text-muted text-center">
        {t.shopping.listEmptyHint}
      </p>
    </div>
  );
}

function ExitPrompt({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-[480px] bg-surface-card border border-[var(--border)] rounded-t-2xl animate-slide-up p-6">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" style={{ color: '#F5A623' }} />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-primary mb-1">{t.shopping.exitTitle}</h2>
            <p className="text-sm text-text-secondary">
              {t.shopping.exitText}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-12 bg-surface-elevated border border-[var(--border)] rounded-lg text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors"
          >
            {t.shopping.continueShop}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-12 bg-danger/10 border border-danger/20 rounded-lg text-sm font-semibold text-danger hover:bg-danger/20 transition-colors"
          >
            {t.shopping.endShop}
          </button>
        </div>
      </div>
    </div>
  );
}
