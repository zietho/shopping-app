import { useState, FormEvent } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import Modal from '../common/Modal';
import { Template } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface TemplateModalProps {
  template?: Template;
  onClose: () => void;
}

export default function TemplateModal({ template, onClose }: TemplateModalProps) {
  const { createTemplate, updateTemplate } = useApp();
  const { t } = useLanguage();
  const isEdit = !!template;

  const [name, setName] = useState(template?.name ?? '');
  const [items, setItems] = useState<string[]>(
    template?.template_items?.map(i => i.name) ?? ['']
  );
  const [saving, setSaving] = useState(false);

  function addItem() {
    setItems(prev => [...prev, '']);
  }

  function removeItem(idx: number) {
    setItems(prev => prev.filter((_, i) => i !== idx));
  }

  function updateItemName(idx: number, val: string) {
    setItems(prev => prev.map((item, i) => i === idx ? val : item));
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const validItems = items.filter(i => i.trim());
    setSaving(true);
    if (isEdit && template) {
      await updateTemplate(template.id, name.trim(), validItems);
    } else {
      await createTemplate(name.trim(), validItems);
    }
    setSaving(false);
    onClose();
  }

  return (
    <Modal
      title={isEdit ? t.templates.modalTitleEdit : t.templates.modalTitleNew}
      onClose={onClose}
      footer={
        <button
          form="template-form"
          type="submit"
          disabled={saving || !name.trim()}
          className="w-full btn-primary flex items-center justify-center text-base font-semibold disabled:opacity-50"
        >
          {saving ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : isEdit ? t.templates.saveChanges : t.templates.create}
        </button>
      }
    >
      <form id="template-form" onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            {t.templates.templateName}
          </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t.templates.templateNamePlaceholder}
            className="w-full h-11 bg-surface-elevated border border-[var(--border)] rounded-lg px-4 text-text-primary placeholder-text-muted text-sm focus:outline-none focus:border-accent transition-colors"
            autoFocus
            required
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="next"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            {t.templates.items} ({items.filter(i => i.trim()).length})
          </label>
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-text-muted shrink-0" />
                <input
                  value={item}
                  onChange={e => updateItemName(idx, e.target.value)}
                  placeholder={`${t.templates.itemPlaceholder} ${idx + 1}`}
                  className="flex-1 h-10 bg-surface-elevated border border-[var(--border)] rounded-lg px-3 text-text-primary placeholder-text-muted text-sm focus:outline-none focus:border-accent transition-colors"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="next"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItem();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  disabled={items.length === 1}
                  className="w-9 h-9 flex items-center justify-center text-text-muted hover:text-danger rounded-lg hover:bg-danger/10 transition-colors disabled:opacity-30"
                  aria-label={t.templates.removeItem}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addItem}
            className="mt-3 flex items-center gap-2 text-sm text-accent font-medium hover:text-accent/80 transition-colors py-2"
          >
            <Plus className="w-4 h-4" />
            {t.templates.addItem}
          </button>
        </div>
      </form>
    </Modal>
  );
}
