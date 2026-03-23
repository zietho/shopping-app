import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LoginScreen from './screens/LoginScreen';
import ListScreen from './screens/ListScreen';
import ShoppingSection from './screens/ShoppingSection';
import SettingsScreen from './screens/SettingsScreen';
import BottomNav from './components/layout/BottomNav';
import ToastContainer from './components/common/Toast';

const PENDING_JOIN_KEY = 'pending_join_code';

type Tab = 'listen' | 'einkaufen';

function AppShell() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('listen');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join');
    if (joinCode) {
      sessionStorage.setItem(PENDING_JOIN_KEY, joinCode.toUpperCase());
      const url = new URL(window.location.href);
      url.searchParams.delete('join');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full bg-bg-primary">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <AppProvider>
      <div className="flex flex-col h-full">
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {showSettings ? (
            <SettingsScreen onClose={() => setShowSettings(false)} />
          ) : (
            <>
              {activeTab === 'listen' && (
                <ListScreen onOpenSettings={() => setShowSettings(true)} />
              )}
              {activeTab === 'einkaufen' && (
                <ShoppingSection
                  onGoToLists={() => setActiveTab('listen')}
                  onOpenSettings={() => setShowSettings(true)}
                />
              )}
            </>
          )}
        </div>
        {!showSettings && (
          <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        )}
      </div>
      <ToastContainer />
    </AppProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <AppShell />
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
