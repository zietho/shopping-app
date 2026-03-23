import { useState } from 'react';
import { Plus, Star, StarOff, Pencil, Trash2, LayoutTemplate, ListPlus } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Template } from '../types';
import TemplateModal from '../components/templates/TemplateModal';

export default function TemplatesScreen() {
  const { templates, deleteTemplate, applyTemplate, toggleFavoriteTemplate } = useApp();
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | undefined>();

  const favorites = templates.filter(tmpl => tmpl.is_favorite);
  const others = templates.filter(tmpl => !tmpl.is_favorite);

  function handleEdit(tmpl: Template) {
    setEditingTemplate(tmpl);
    setShowModal(true);
  }

  function handleNew() {
    setEditingTemplate(undefined);
    setShowModal(true);
  }

  function handleClose() {
    setShowModal(false);
    setEditingTemplate(undefined);
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-4 py-4 flex items-center justify-between shrink-0 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/10 border border-[var(--border)] flex items-center justify-center shrink-0">
            <LayoutTemplate className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">{t.templates.title}</h1>
            <p className="text-xs text-text-muted">{t.templates.subtitle}</p>
          </div>
        </div>
        <button
          onClick={handleNew}
          className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white hover:bg-accent/90 active:scale-95 transition-all"
          aria-label={t.templates.newTemplate}
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none px-4 py-4">
        {templates.length === 0 ? (
          <EmptyTemplatesState onNew={handleNew} />
        ) : (
          <>
            {favorites.length > 0 && (
              <section className="mb-6">
                <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                  {t.templates.favorites}
                </h2>
                <div className="space-y-2">
                  {favorites.map(tmpl => (
                    <TemplateCard
                      key={tmpl.id}
                      template={tmpl}
                      onEdit={() => handleEdit(tmpl)}
                      onDelete={() => deleteTemplate(tmpl.id)}
                      onApply={() => applyTemplate(tmpl)}
                      onToggleFavorite={() => toggleFavoriteTemplate(tmpl.id, false)}
                    />
                  ))}
                </div>
              </section>
            )}

            {others.length > 0 && (
              <section>
                {favorites.length > 0 && (
                  <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                    {t.templates.allTemplates}
                  </h2>
                )}
                <div className="space-y-2">
                  {others.map(tmpl => (
                    <TemplateCard
                      key={tmpl.id}
                      template={tmpl}
                      onEdit={() => handleEdit(tmpl)}
                      onDelete={() => deleteTemplate(tmpl.id)}
                      onApply={() => applyTemplate(tmpl)}
                      onToggleFavorite={() => toggleFavoriteTemplate(tmpl.id, true)}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {showModal && (
        <TemplateModal
          template={editingTemplate}
          onClose={handleClose}
        />
      )}
    </div>
  );
}

interface TemplateCardProps {
  template: Template;
  onEdit: () => void;
  onDelete: () => void;
  onApply: () => void;
  onToggleFavorite: () => void;
}

function TemplateCard({ template, onEdit, onDelete, onApply, onToggleFavorite }: TemplateCardProps) {
  const { t } = useLanguage();
  const itemCount = template.template_items?.length ?? 0;

  return (
    <div className="surface-card p-4 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <LayoutTemplate className="w-5 h-5 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-text-primary truncate">{template.name}</h3>
            {template.is_favorite && (
              <Star className="w-3.5 h-3.5 text-accent fill-accent shrink-0" />
            )}
          </div>
          <p className="text-xs text-text-muted">
            {itemCount === 0 ? t.templates.noItems : `${itemCount} ${t.templates.items}`}
          </p>

          {template.template_items && template.template_items.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {template.template_items.slice(0, 4).map(item => (
                <span
                  key={item.id}
                  className="px-2 py-0.5 bg-surface-elevated rounded-full text-xs text-text-muted"
                >
                  {item.name}
                </span>
              ))}
              {template.template_items.length > 4 && (
                <span className="px-2 py-0.5 bg-surface-elevated rounded-full text-xs text-text-muted">
                  +{template.template_items.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onToggleFavorite}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-text-muted hover:text-accent transition-colors hover:bg-accent/10"
            aria-label={template.is_favorite ? t.templates.removeFromFavorites : t.templates.addToFavorites}
          >
            {template.is_favorite
              ? <StarOff className="w-4 h-4" />
              : <Star className="w-4 h-4" />
            }
          </button>
          <button
            onClick={onEdit}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary transition-colors hover:bg-surface-elevated"
            aria-label={`${template.name} ${t.templates.edit}`}
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-text-muted hover:text-danger transition-colors hover:bg-danger/10"
            aria-label={`${template.name} ${t.templates.delete}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <button
        onClick={onApply}
        disabled={itemCount === 0}
        className="mt-3 w-full flex items-center justify-center gap-2 h-10 bg-accent/10 border border-accent/20 rounded-lg text-sm text-accent font-medium hover:bg-accent/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label={`${t.templates.apply} — ${itemCount} ${t.templates.applyLabel}`}
      >
        <ListPlus className="w-4 h-4" />
        {t.templates.apply} — {itemCount} {t.templates.applyLabel}
      </button>
    </div>
  );
}

function EmptyTemplatesState({ onNew }: { onNew: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-surface-elevated border border-[var(--border)] flex items-center justify-center mb-4">
        <LayoutTemplate className="w-8 h-8 text-text-muted" />
      </div>
      <p className="text-base font-semibold text-text-primary mb-1">{t.templates.noTemplates}</p>
      <p className="text-sm text-text-muted text-center mb-6">
        {t.templates.noTemplatesHint}
      </p>
      <button
        onClick={onNew}
        className="btn-primary px-6 flex items-center gap-2 text-sm"
      >
        <Plus className="w-4 h-4" />
        {t.templates.createFirst}
      </button>
    </div>
  );
}
