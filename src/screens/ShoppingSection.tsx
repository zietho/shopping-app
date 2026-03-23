import { useState, useCallback } from 'react';
import { ShoppingCart, ChevronRight, List, ShoppingBag, Trash2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ShoppingList } from '../types';
import ShoppingRunScreen from './ShoppingRunScreen';

type ShoppingState =
  | { view: 'select' }
  | { view: 'run'; list: ShoppingList }
  | { view: 'done'; listName: string; listId: string };

interface ShoppingSectionProps {
  onGoToLists: () => void;
  onOpenSettings: () => void;
}

export default function ShoppingSection({ onGoToLists, onOpenSettings: _onOpenSettings }: ShoppingSectionProps) {
  const [state, setState] = useState<ShoppingState>({ view: 'select' });

  const handleSelectList = useCallback((list: ShoppingList) => {
    setState({ view: 'run', list });
  }, []);

  const handleBack = useCallback(() => {
    setState({ view: 'select' });
  }, []);

  const handleComplete = useCallback((listName: string, listId: string) => {
    setState({ view: 'done', listName, listId });
  }, []);

  if (state.view === 'run') {
    return (
      <ShoppingRunScreen
        list={state.list}
        onBack={handleBack}
        onComplete={handleComplete}
      />
    );
  }

  if (state.view === 'done') {
    return (
      <AllDoneScreen
        listName={state.listName}
        listId={state.listId}
        onGoToLists={onGoToLists}
        onNewSelection={handleBack}
      />
    );
  }

  return (
    <ListSelectScreen onSelectList={handleSelectList} />
  );
}

function ListSelectScreen({ onSelectList }: { onSelectList: (list: ShoppingList) => void }) {
  const { lists, items: allItems } = useApp();
  const { t } = useLanguage();

  function getItemCount(listId: string) {
    return allItems.filter(i => i.list_id === listId).length;
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-4 py-4 shrink-0 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/10 border border-[var(--border)] flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">{t.shopping.title}</h1>
            <p className="text-xs text-text-muted">{t.shopping.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none px-4 py-4">
        {lists.length === 0 ? (
          <EmptyListsState />
        ) : (
          <>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              {t.shopping.availableLists}
            </p>
            <div className="space-y-2">
              {lists.map(list => {
                const count = getItemCount(list.id);
                return (
                  <button
                    key={list.id}
                    onClick={() => onSelectList(list)}
                    className="w-full surface-card p-4 flex items-center gap-4 hover:bg-surface-elevated transition-all active:scale-[0.99] text-left group"
                    aria-label={`${list.name}`}
                  >
                    <div className="w-11 h-11 rounded-xl bg-accent/10 border border-[var(--border)] flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                      <ShoppingBag className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-text-primary truncate">{list.name}</p>
                      <p className="text-sm text-text-muted mt-0.5">
                        {count === 0 ? t.shopping.noItems : `${count} ${t.templates.items}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {count > 0 ? (
                        <span className="px-2 py-0.5 bg-accent/15 rounded-full text-xs text-accent font-semibold">
                          {count}
                        </span>
                      ) : (
                        <span className="text-xs text-text-muted">{t.shopping.empty}</span>
                      )}
                      <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-text-secondary transition-colors" />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 px-1">
              <div className="rounded-card p-4 flex items-start gap-3" style={{ background: 'color-mix(in srgb, var(--primary) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--primary) 70%, transparent)' }}>
                <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                  <List className="w-4 h-4 text-primary" />
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {t.shopping.infoNote}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function EmptyListsState() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-surface-elevated border border-[var(--border)] flex items-center justify-center mb-4">
        <ShoppingCart className="w-8 h-8 text-text-muted" />
      </div>
      <p className="text-base font-semibold text-text-primary mb-1">{t.shopping.noLists}</p>
      <p className="text-sm text-text-muted text-center">
        {t.shopping.noListsHint} <span className="text-accent font-medium">{t.shopping.noListsHintTab}</span> {t.shopping.noListsHintSuffix}
      </p>
    </div>
  );
}

interface AllDoneScreenProps {
  listName: string;
  listId: string;
  onGoToLists: () => void;
  onNewSelection: () => void;
}

function AllDoneScreen({ listName, listId, onGoToLists, onNewSelection }: AllDoneScreenProps) {
  const { deleteList, createList, lists } = useApp();
  const { t } = useLanguage();

  async function handleDeleteList() {
    if (lists.length <= 1) {
      await createList('Meine Liste');
    }
    await deleteList(listId);
    onGoToLists();
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 items-center justify-center px-8 animate-slide-up">
      <div className="relative mb-8">
        <div className="w-28 h-28 rounded-full bg-success/10 border-2 border-success/30 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center">
            <ShoppingCart className="w-10 h-10 text-success" />
          </div>
        </div>
        <div className="absolute -top-1 -right-1 w-9 h-9 rounded-full bg-success border-2 border-bg-primary flex items-center justify-center animate-check-morph">
          <CheckIcon className="w-5 h-5 text-white" strokeWidth={3} />
        </div>
      </div>

      <h1 className="text-3xl font-bold text-text-primary mb-3 text-center">
        {t.shopping.allDone}
      </h1>
      <p className="text-base text-text-secondary text-center mb-10 leading-relaxed">
        {t.shopping.allDoneText}<br />
        <span className="font-semibold text-text-primary">„{listName}"</span><br />
        {t.shopping.allDoneText2}
      </p>

      <div className="w-full max-w-xs space-y-3">
        <button
          onClick={onGoToLists}
          className="w-full h-13 btn-primary flex items-center justify-center gap-2 text-base font-semibold"
        >
          <List className="w-5 h-5" />
          {t.shopping.toLists}
        </button>
        <button
          onClick={onNewSelection}
          className="w-full h-12 bg-surface-card border border-[var(--border)] rounded-card flex items-center justify-center gap-2 text-base font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-all"
        >
          <ShoppingCart className="w-5 h-5" />
          {t.shopping.shopAnother}
        </button>
        <button
          onClick={handleDeleteList}
          className="w-full h-12 bg-danger/10 border border-danger/20 rounded-card flex items-center justify-center gap-2 text-base font-semibold text-danger hover:bg-danger/20 transition-all"
        >
          <Trash2 className="w-5 h-5" />
          {t.shopping.removeList}
        </button>
      </div>

      <p className="mt-8 text-xs text-text-muted text-center px-4">
        {t.shopping.shoppingNote}
      </p>
    </div>
  );
}

function CheckIcon({ className, strokeWidth }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth ?? 2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
