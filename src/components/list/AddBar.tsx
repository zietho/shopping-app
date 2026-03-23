import { useState, useRef, useCallback, FormEvent } from 'react';
import { Plus, Check } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getItemIcon } from '../../lib/itemIcons';

const COMMON_ITEMS_DE = [
  'Milch', 'Semmeln', 'Eier', 'Butter', 'Käse', 'Joghurt',
  'Äpfel', 'Bananen', 'Paradeiser', 'Erdäpfel', 'Gurken', 'Salat',
  'Hühnerfleisch', 'Reis', 'Nudeln', 'Zwiebeln', 'Karotten', 'Knoblauch',
  'Kaffee', 'Tee', 'Wasser', 'Saft', 'Olivenöl', 'Brot',
];

const COMMON_ITEMS_EN = [
  'Milk', 'Bread', 'Eggs', 'Butter', 'Cheese', 'Yogurt',
  'Apples', 'Bananas', 'Tomatoes', 'Potatoes', 'Cucumber', 'Lettuce',
  'Chicken', 'Rice', 'Pasta', 'Onions', 'Carrots', 'Garlic',
  'Coffee', 'Tea', 'Water', 'Juice', 'Olive oil', 'Toast',
];

const COMMON_ITEMS_FR = [
  'Lait', 'Pain', 'Oeufs', 'Beurre', 'Fromage', 'Yaourt',
  'Pommes', 'Bananes', 'Tomates', 'Pommes de terre', 'Concombre', 'Salade',
  'Poulet', 'Riz', 'Pâtes', 'Oignons', 'Carottes', 'Ail',
  'Café', 'Thé', 'Eau', 'Jus', "Huile d'olive", 'Baguette',
];

const COMMON_ITEMS_ES = [
  'Leche', 'Pan', 'Huevos', 'Mantequilla', 'Queso', 'Yogur',
  'Manzanas', 'Plátanos', 'Tomates', 'Patatas', 'Pepino', 'Lechuga',
  'Pollo', 'Arroz', 'Pasta', 'Cebollas', 'Zanahorias', 'Ajo',
  'Café', 'Té', 'Agua', 'Zumo', 'Aceite de oliva', 'Tostadas',
];

const ITEMS_BY_LANG: Record<string, string[]> = {
  de: COMMON_ITEMS_DE,
  en: COMMON_ITEMS_EN,
  fr: COMMON_ITEMS_FR,
  es: COMMON_ITEMS_ES,
};

export default function AddBar() {
  const { addItem, addToast } = useApp();
  const { t, language } = useLanguage();
  const [isAdding, setIsAdding] = useState(false);
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const items = ITEMS_BY_LANG[language] ?? COMMON_ITEMS_EN;

  async function handleChip(name: string) {
    await addItem(name);
    addToast(`${t.lists.added}: ${name}`);
  }

  function openInput() {
    setIsAdding(true);
  }

  const closeInput = useCallback(() => {
    setIsAdding(false);
    setText('');
  }, []);

  async function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    const val = text.trim();
    if (val) {
      const parts = val.split(',').map(p => p.trim()).filter(Boolean);
      for (const part of parts) await addItem(part);
      addToast(parts.length === 1 ? `${t.lists.added}: ${parts[0]}` : `${parts.length} ${t.lists.itemsAdded}`);
    }
    closeInput();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') closeInput();
  }

  return (
    <div className="flex items-center pt-3 pb-2 pr-4 gap-2">
      <div className="flex-1 min-w-0 relative pl-4">
        {isAdding ? (
          <form onSubmit={handleSubmit} className="animate-fade-in">
            <input
              ref={inputRef}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.lists.addItem}
              className="w-full h-10 bg-surface-card border border-[var(--border)] rounded-card pl-4 pr-4 text-text-primary placeholder-text-muted outline-none focus:border-accent transition-colors"
              style={{ fontSize: '16px' }}
              enterKeyHint="done"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              autoFocus
            />
          </form>
        ) : (
          <>
            <div
              className="flex gap-2 overflow-x-auto scrollbar-none animate-fade-in"
              role="list"
              aria-label={t.lists.quickAddLabel}
            >
              {items.map(item => (
                <button
                  key={item}
                  className="chip shrink-0 flex items-center gap-1.5"
                  onClick={() => handleChip(item)}
                  aria-label={`${item} ${t.lists.chipAddLabel}`}
                  role="listitem"
                >
                  <span aria-hidden="true">{getItemIcon(item)}</span>
                  {item}
                </button>
              ))}
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none bg-gradient-to-l from-[var(--bg-primary)] to-transparent" />
          </>
        )}
      </div>

      <button
        onClick={isAdding ? () => handleSubmit() : openInput}
        className="shrink-0 w-10 h-10 rounded-card flex items-center justify-center active:scale-95 transition-all duration-150 bg-accent text-white hover:bg-accent/90"
        aria-label={t.lists.addItemLabel}
      >
        {isAdding
          ? <Check className="w-4 h-4" strokeWidth={2.5} />
          : <Plus className="w-4 h-4" strokeWidth={2.5} />
        }
      </button>
    </div>
  );
}
