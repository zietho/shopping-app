import { useState } from 'react';
import { ChevronDown, Plus, X, Pencil, Trash2, Check, ListPlus, LayoutTemplate, BookmarkPlus, ClipboardList, Share2, LogIn } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { ShoppingList } from '../../types';
import ShareModal from '../sharing/ShareModal';
import JoinListModal from '../sharing/JoinListModal';

interface TopBarProps {
  onOpenSettings: () => void;
}

export default function TopBar({ onOpenSettings }: TopBarProps) {
  const {
    activeList, lists, items,
    setActiveList, createList, deleteList, renameList,
    templates, applyTemplate, createTemplate, deleteTemplate,
    isOwnerOfList,
  } = useApp();
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNewList, setShowNewList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [savingTemplateForId, setSavingTemplateForId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [applyTooltipId, setApplyTooltipId] = useState<string | null>(null);
  const [shareListId, setShareListId] = useState<string | null>(null);
  const [showJoin, setShowJoin] = useState(false);

  async function handleCreateList() {
    if (!newListName.trim()) return;
    await createList(newListName.trim());
    setNewListName('');
    setShowNewList(false);
    setShowDropdown(false);
  }

  async function handleRename(list: ShoppingList) {
    if (!editName.trim() || editName === list.name) {
      setEditingId(null);
      return;
    }
    await renameList(list.id, editName.trim());
    setEditingId(null);
  }

  async function handleApplyTemplate(templateId: string) {
    const tmpl = templates.find(tmpl => tmpl.id === templateId);
    if (!tmpl) return;
    await applyTemplate(tmpl);
    setShowDropdown(false);
  }

  function startSaveAsTemplate(list: ShoppingList) {
    setSavingTemplateForId(list.id);
    setTemplateName(list.name);
  }

  async function handleSaveAsTemplate(list: ShoppingList) {
    if (!templateName.trim()) return;
    const sourceItems = list.id === activeList?.id ? items : [];
    const itemNames = sourceItems.map(i => i.name);
    await createTemplate(templateName.trim(), itemNames);
    setTemplateName('');
    setSavingTemplateForId(null);
  }

  const shareList = shareListId ? lists.find(l => l.id === shareListId) : null;

  return (
    <div className="relative">
      <div className="px-4 py-4 border-b border-[var(--border)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-accent/10 border border-[var(--border)] flex items-center justify-center shrink-0">
              <ClipboardList className="w-5 h-5 text-accent" />
            </div>
            <div className="min-w-0">
              <button
                onClick={() => setShowDropdown(v => !v)}
                className="flex items-center gap-1 min-w-0 group"
                aria-label={t.lists.switchList}
              >
                <h1 className="text-xl font-bold text-text-primary truncate">
                  {activeList?.name ?? t.lists.noList}
                </h1>
                <ChevronDown
                  className={`w-5 h-5 text-text-secondary shrink-0 transition-transform duration-150 ${showDropdown ? 'rotate-180' : ''}`}
                />
              </button>
              <p className="text-xs text-text-muted">{t.lists.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onOpenSettings}
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 border-[var(--border)] text-text-secondary hover:brightness-110 transition-all shrink-0"
            style={{ backgroundColor: 'var(--surface-card)' }}
            title={profile?.username}
            aria-label="Settings"
          >
            {profile?.username?.[0].toUpperCase()}
          </button>
        </div>
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 z-40 mx-4 mt-1 bg-surface-card border border-[var(--border)] rounded-card shadow-xl animate-slide-up overflow-hidden">
          <div className="max-h-64 overflow-y-auto">
            {lists.map(list => (
              <div key={list.id}>
                {savingTemplateForId === list.id ? (
                  <form
                    onSubmit={e => { e.preventDefault(); handleSaveAsTemplate(list); }}
                    className={`flex items-center gap-2 px-4 py-3 ${
                      list.id === activeList?.id ? 'bg-accent/5 border-l-2 border-accent' : ''
                    }`}
                  >
                    <input
                      value={templateName}
                      onChange={e => setTemplateName(e.target.value)}
                      placeholder={t.lists.templateNamePlaceholder}
                      className="flex-1 bg-surface-elevated border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
                      autoFocus
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                      enterKeyHint="done"
                    />
                    <button
                      type="submit"
                      disabled={!templateName.trim()}
                      className="w-8 h-8 flex items-center justify-center text-accent rounded-lg hover:bg-accent/10 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSavingTemplateForId(null)}
                      className="w-8 h-8 flex items-center justify-center text-text-muted rounded-lg hover:bg-surface-elevated"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </form>
                ) : editingId === list.id ? (
                  <form
                    onSubmit={e => { e.preventDefault(); handleRename(list); }}
                    className={`flex items-center gap-2 px-4 py-3 ${
                      list.id === activeList?.id ? 'bg-accent/5 border-l-2 border-accent' : ''
                    }`}
                  >
                    <input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="flex-1 bg-surface-elevated border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent"
                      autoFocus
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                      enterKeyHint="done"
                      onBlur={() => handleRename(list)}
                    />
                    <button type="submit" className="w-8 h-8 flex items-center justify-center text-accent rounded-lg hover:bg-accent/10">
                      <Check className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <div
                    className={`flex items-center gap-1 px-4 py-3 hover:bg-surface-elevated transition-colors ${
                      list.id === activeList?.id ? 'bg-accent/5 border-l-2 border-accent' : ''
                    }`}
                  >
                    <button
                      className="flex-1 text-left text-sm font-medium text-text-primary min-w-0 truncate"
                      onClick={() => { setActiveList(list); setShowDropdown(false); }}
                    >
                      {list.name}
                      {list.id === activeList?.id && (
                        <span className="ml-2 text-xs text-accent">{t.lists.active}</span>
                      )}
                    </button>
                    <button
                      onClick={() => { setShareListId(list.id); setShowDropdown(false); }}
                      className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-accent rounded-lg hover:bg-accent/10 shrink-0"
                      aria-label={t.lists.shareList}
                      title={t.lists.shareList}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => startSaveAsTemplate(list)}
                      className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text-primary rounded-lg hover:bg-surface-elevated shrink-0"
                      aria-label={`${list.name} ${t.lists.saveAsTemplate}`}
                      title={t.lists.saveAsTemplate}
                    >
                      <BookmarkPlus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => { setEditingId(list.id); setEditName(list.name); }}
                      className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text-primary rounded-lg hover:bg-surface-elevated shrink-0"
                      aria-label={`${list.name} ${t.lists.renameList}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {isOwnerOfList(list.id) && lists.length > 1 && (
                      <button
                        onClick={() => deleteList(list.id)}
                        className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-danger rounded-lg hover:bg-danger/10 shrink-0"
                        aria-label={`${list.name} ${t.lists.deleteList}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {showNewList ? (
            <form
              onSubmit={e => { e.preventDefault(); handleCreateList(); }}
              className="flex items-center gap-2 px-4 py-3 border-t border-[var(--border)]"
            >
              <input
                value={newListName}
                onChange={e => setNewListName(e.target.value)}
                placeholder={t.lists.newListPlaceholder}
                className="flex-1 bg-surface-elevated border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="done"
              />
              <button type="submit" className="w-8 h-8 flex items-center justify-center text-accent rounded-lg hover:bg-accent/10">
                <Check className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => setShowNewList(false)} className="w-8 h-8 flex items-center justify-center text-text-muted rounded-lg hover:bg-surface-elevated">
                <X className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="border-t border-[var(--border)]">
              <button
                onClick={() => setShowNewList(true)}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-accent font-medium hover:bg-surface-elevated transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t.lists.newList}
              </button>
              <button
                onClick={() => { setShowJoin(true); setShowDropdown(false); }}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-text-secondary font-medium hover:bg-surface-elevated transition-colors border-t border-[var(--border)]"
              >
                <LogIn className="w-4 h-4" />
                {t.lists.joinWithCode}
              </button>
            </div>
          )}

          {templates.length > 0 && (
            <div className="border-t border-[var(--border)]">
              <div className="flex items-center gap-2 px-4 py-2">
                <LayoutTemplate className="w-3.5 h-3.5 text-text-muted" />
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">{t.lists.templates}</span>
              </div>
              {templates.map(tmpl => {
                const itemCount = tmpl.template_items?.length ?? 0;
                return (
                  <div key={tmpl.id} className="relative flex items-center gap-2 px-4 py-2.5 hover:bg-surface-elevated transition-colors">
                    <span className="flex-1 text-sm text-text-secondary truncate">{tmpl.name}</span>
                    <span className="text-xs text-text-muted shrink-0">{itemCount} {t.templates.items}</span>
                    <button
                      onClick={() => handleApplyTemplate(tmpl.id)}
                      disabled={itemCount === 0}
                      onMouseEnter={() => setApplyTooltipId(`apply-${tmpl.id}`)}
                      onMouseLeave={() => setApplyTooltipId(null)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-accent hover:bg-accent/15 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                      aria-label={`${tmpl.name} ${t.templates.apply}`}
                    >
                      <ListPlus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTemplate(tmpl.id)}
                      onMouseEnter={() => setApplyTooltipId(`delete-${tmpl.id}`)}
                      onMouseLeave={() => setApplyTooltipId(null)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors shrink-0"
                      aria-label={`${tmpl.name} ${t.templates.delete}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {applyTooltipId === `apply-${tmpl.id}` && (
                      <div className="absolute right-[64px] top-1/2 -translate-y-1/2 z-50 pointer-events-none">
                        <div className="bg-surface-dark border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-xs text-text-secondary whitespace-nowrap shadow-lg">
                          {t.lists.addToList}
                        </div>
                      </div>
                    )}
                    {applyTooltipId === `delete-${tmpl.id}` && (
                      <div className="absolute right-[32px] top-1/2 -translate-y-1/2 z-50 pointer-events-none">
                        <div className="bg-surface-dark border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-xs text-text-secondary whitespace-nowrap shadow-lg">
                          {t.lists.deleteTemplate}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {shareList && (
        <ShareModal
          listId={shareList.id}
          listName={shareList.name}
          onClose={() => setShareListId(null)}
        />
      )}

      {showJoin && (
        <JoinListModal onClose={() => setShowJoin(false)} />
      )}
    </div>
  );
}
