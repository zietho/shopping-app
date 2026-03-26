import { useState, useRef, useEffect, FormEvent } from 'react';
import { Check, Trash, Pencil, X } from 'lucide-react';
import { Item } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getItemIcon } from '../../lib/itemIcons';

interface ItemRowProps {
  item: Item;
  selectionMode: boolean;
  selected: boolean;
  onLongPress: () => void;
  onSelect: () => void;
  hideCheckCircle?: boolean;
}

export default function ItemRow({ item, selectionMode, selected, onLongPress, onSelect, hideCheckCircle }: ItemRowProps) {
  const { toggleItem, deleteItem, updateItem, addToast } = useApp();
  const { t } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editQty, setEditQty] = useState(item.quantity);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const mouseStartX = useRef<number | null>(null);
  const isDragging = useRef(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);

  useEffect(() => {
    return () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };
  }, []);
  const [swiping, setSwiping] = useState(false);
  const SWIPE_THRESHOLD = 80;

  async function handleToggle() {
    await toggleItem(item);
  }

  async function handleDelete() {
    const snapshot = { ...item };
    deleteItem(item.id);
    addToast(`${t.itemActions.removed}: ${item.name}`, async () => {
      await updateItem(snapshot.id, snapshot.name, snapshot.quantity);
    });
  }

  function handleEditStart() {
    setEditName(item.name);
    setEditQty(item.quantity);
    setEditing(true);
    setSwipeOffset(0);
  }

  async function handleEditSave(e: FormEvent) {
    e.preventDefault();
    if (editName.trim()) {
      await updateItem(item.id, editName.trim(), editQty.trim());
    }
    setEditing(false);
  }

  function startLongPress() {
    longPressTimer.current = setTimeout(() => {
      onLongPress();
    }, 500);
  }

  function cancelLongPress() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setSwiping(false);
    if (!selectionMode) startLongPress();
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);

    if (dy > 10) {
      cancelLongPress();
      return;
    }

    if (dx < -8 && !selectionMode) {
      cancelLongPress();
      setSwiping(true);
      const clamped = Math.max(-SWIPE_THRESHOLD - 20, Math.min(0, dx));
      setSwipeOffset(clamped);
    }
  }

  function handleTouchEnd() {
    cancelLongPress();
    touchStartX.current = null;
    touchStartY.current = null;
    if (swipeOffset < -(SWIPE_THRESHOLD * 0.6)) {
      handleDelete();
    }
    setSwipeOffset(0);
    setSwiping(false);
  }

  function handleMouseDown(e: React.MouseEvent) {
    if (selectionMode) return;
    mouseStartX.current = e.clientX;
    isDragging.current = false;
    startLongPress();
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (mouseStartX.current === null || selectionMode) return;
    const dx = e.clientX - mouseStartX.current;
    if (dx < -8) {
      cancelLongPress();
      isDragging.current = true;
      setSwiping(true);
      const clamped = Math.max(-SWIPE_THRESHOLD - 20, Math.min(0, dx));
      setSwipeOffset(clamped);
    }
  }

  function handleMouseUp() {
    cancelLongPress();
    if (isDragging.current && swipeOffset < -(SWIPE_THRESHOLD * 0.6)) {
      handleDelete();
    }
    mouseStartX.current = null;
    isDragging.current = false;
    setSwipeOffset(0);
    setSwiping(false);
  }

  function handleMouseLeave() {
    cancelLongPress();
    if (isDragging.current) {
      mouseStartX.current = null;
      isDragging.current = false;
      setSwipeOffset(0);
      setSwiping(false);
    }
  }

  function handleClick() {
    if (selectionMode) {
      onSelect();
    }
  }

  const focusQty = editName.trim() !== '' && editQty.trim() === '';

  if (editing) {
    return (
      <form onSubmit={handleEditSave} className="bg-surface-card border border-[var(--border)] rounded-card px-3 py-3 flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            value={editName}
            onChange={e => setEditName(e.target.value)}
            className="flex-1 min-w-0 h-10 bg-surface-elevated border border-[var(--border)] rounded-xl px-3 text-sm text-text-primary outline-none focus:border-accent transition-colors"
            autoFocus={!focusQty}
            placeholder={t.itemActions.itemName}
            style={{ fontSize: '16px' }}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="next"
          />
          <input
            value={editQty}
            onChange={e => setEditQty(e.target.value)}
            className="w-20 shrink-0 h-10 bg-surface-elevated border border-[var(--border)] rounded-xl px-3 text-sm text-text-secondary outline-none focus:border-accent transition-colors"
            autoFocus={focusQty}
            placeholder={t.itemActions.quantity}
            style={{ fontSize: '16px' }}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="done"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 h-10 flex items-center justify-center gap-1.5 text-sm font-semibold bg-accent text-white rounded-xl hover:brightness-110 active:scale-[0.98] transition-all"
            aria-label={t.itemActions.save}
          >
            <Check className="w-3.5 h-3.5" />
            {t.itemActions.save}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="flex-1 h-10 flex items-center justify-center gap-1.5 text-text-muted text-sm font-medium rounded-xl hover:bg-surface-elevated border border-[var(--border)] transition-colors"
            aria-label={t.itemActions.cancel}
          >
            <X className="w-3.5 h-3.5" />
            {t.itemActions.cancel}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-card">
      <div
        className="absolute inset-y-0 right-0 w-20 bg-danger flex items-center justify-center"
        aria-hidden="true"
        style={{ opacity: swipeOffset < 0 ? 1 : 0 }}
      >
        <Trash className="w-5 h-5 text-white" />
      </div>

      <div
        className={`item-row ${item.checked ? 'checked' : ''} relative z-10 transition-colors ${
          selectionMode && selected ? 'bg-accent/10 border border-accent/30' : ''
        }`}
        role="listitem"
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: swiping ? 'none' : 'transform 0.25s ease',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {selectionMode ? (
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
              selected ? 'bg-accent border-accent' : 'border-text-muted'
            }`}
            aria-hidden="true"
          >
            {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
          </div>
        ) : !hideCheckCircle ? (
          <button
            onClick={e => { e.stopPropagation(); handleToggle(); }}
            className={`check-circle ${item.checked ? 'checked' : ''} shrink-0`}
            aria-label={item.checked ? `${item.name} abhaken rückgängig` : `${item.name} abhaken`}
            aria-pressed={item.checked}
          >
            {item.checked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
          </button>
        ) : null}

        <span className="text-lg shrink-0 w-7 text-center select-none" aria-hidden="true">
          {getItemIcon(item.name)}
        </span>

        <div className="flex-1 min-w-0 py-1">
          <span className={`block text-sm font-medium truncate transition-all ${
            item.checked ? 'line-through text-text-muted' : 'text-text-primary'
          }`}>
            {item.name}
          </span>
          {item.quantity && (
            <span className="block text-xs text-text-muted mt-0.5">{item.quantity}</span>
          )}
        </div>

        {!selectionMode && (
          <button
            onClick={e => { e.stopPropagation(); handleEditStart(); }}
            className="w-9 h-9 flex items-center justify-center text-text-muted hover:text-accent rounded-lg hover:bg-accent/10 transition-colors shrink-0"
            aria-label={`${item.name} bearbeiten`}
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
