import { useMemo } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import TopBar from '../components/layout/TopBar';
import AddBar from '../components/list/AddBar';
import ItemRow from '../components/list/ItemRow';

interface ListScreenProps {
  onOpenSettings: () => void;
}

export default function ListScreen({ onOpenSettings }: ListScreenProps) {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <TopBar onOpenSettings={onOpenSettings} />
      <ListView />
    </div>
  );
}

function ListView() {
  const { items, loadingItems } = useApp();
  const sortedItems = useMemo(() => [...items].sort((a, b) => Number(a.checked) - Number(b.checked)), [items]);

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto scrollbar-none">
        <AddBar />

        {loadingItems ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <EmptyListState />
        ) : (
          <div className="px-4 pb-4 space-y-2 pt-2">
            {sortedItems.map(item => (
              <ItemRow
                key={item.id}
                item={item}
                selectionMode={false}
                selected={false}
                onLongPress={() => {}}
                onSelect={() => {}}
                hideCheckCircle
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyListState() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center py-12 px-8 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-surface-elevated border border-[var(--border)] flex items-center justify-center mb-4">
        <ShoppingBag className="w-8 h-8 text-text-muted" />
      </div>
      <p className="text-base font-semibold text-text-primary mb-1">{t.lists.noItems}</p>
      <p className="text-sm text-text-muted text-center mb-2">
        {t.lists.noItemsHint}
      </p>
      <p className="text-xs text-text-muted text-center">
        {t.lists.noItemsHint2} <span className="text-accent font-medium">{t.lists.noItemsHint2Tab}</span> {t.lists.noItemsHint2Suffix}
      </p>
    </div>
  );
}
