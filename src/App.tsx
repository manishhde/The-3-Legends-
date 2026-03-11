import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from './components/Sidebar';
import { ParticlesBackground } from './components/ParticlesBackground';
import { Dashboard } from './pages/Dashboard';
import { TaskManager } from './pages/TaskManager';
import { Settings } from './pages/Settings';
import { AuthProvider, useAuth } from './AuthContext';
import { LogIn, Target } from 'lucide-react';

function AppContent() {
  const [activePage, setActivePage] = useState('dashboard');
  const { user, loading, theme } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="w-12 h-12 border-4 border-neon-blue border-t-transparent rounded-full animate-spin neon-glow-blue" />
      </div>
    );
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'tasks': return <TaskManager />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen flex bg-dark-bg text-white relative overflow-hidden">
      <ParticlesBackground />
      
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      <main className="flex-1 h-screen overflow-y-auto p-8 relative z-10 custom-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Background Glows */}
      <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-blue/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-gold/10 blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
