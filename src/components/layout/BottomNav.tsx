import { List, ShoppingCart } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

type Tab = 'listen' | 'einkaufen';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { t } = useLanguage();

  const tabs = [
    { id: 'listen' as Tab, label: t.nav.lists, icon: List },
    { id: 'einkaufen' as Tab, label: t.nav.shopping, icon: ShoppingCart },
  ];

  return (
    <nav
      className="shrink-0 flex items-center bg-surface-dark border-t border-[var(--border)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      role="tablist"
    >
      {tabs.map(tab => {
        const Icon = tab.icon;
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active}
            aria-label={tab.label}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 min-h-[56px] transition-all ${
              active ? 'text-accent' : 'text-text-muted'
            }`}
          >
            <Icon className={`w-5 h-5 transition-transform ${active ? 'scale-110' : ''}`} />
            <span className={`text-[11px] font-medium transition-colors ${active ? 'text-accent' : 'text-text-muted'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
