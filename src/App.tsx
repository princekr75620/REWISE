import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, onAuthStateChanged, signOut } from './lib/firebase';
import { Scene } from './components/3d/Scene';
import Hero from './components/sections/Hero';
import Scanner from './components/sections/Scanner';
import Generator from './components/sections/Generator';
import UpcyclingStudio from './components/sections/UpcyclingStudio';
import WeatherReport from './components/sections/WeatherReport';
import CompanyDashboard from './components/sections/CompanyDashboard';
import Auth from './components/sections/Auth';
import Vault from './components/sections/Vault';
import VoiceAssistant from './components/sections/VoiceAssistant';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { cn } from './lib/utils';
import { Language } from './components/ui/LanguageSelector';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [language, setLanguage] = useState<Language>('english');
  const [user, setUser] = useState<any>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setActiveTab('home');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Hero language={language} onNavigate={setActiveTab} />;
      case 'scanner': return <Scanner language={language} />;
      case 'generator': return <Generator language={language} />;
      case 'studio': return <UpcyclingStudio language={language} />;
      case 'weather': return <WeatherReport language={language} />;
      case 'company': return <CompanyDashboard />;
      case 'vault': return <Vault />;
      case 'auth': return <Auth onSuccess={() => setActiveTab('home')} />;
      case 'login': return <Auth onSuccess={() => setActiveTab('home')} initialMode="login" />;
      default: return <Hero language={language} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="relative min-h-screen bg-atmos-bg font-sans text-slate-300 selection:bg-emerald-500/30 selection:text-white">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 atmos pointer-events-none z-0" />
      
      {/* Background 3D Scene */}
      <Scene />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isLoggedIn={!!user}
          user={user}
          onLogout={handleLogout}
          language={language}
          onLanguageChange={setLanguage}
        />
        
        <main className="flex-1 container mx-auto px-6 md:px-10 pt-32 pb-20 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="min-h-[70vh] w-full"
            >
              <div className="w-full">
                {renderContent()}
              </div>
            </motion.div>
          </AnimatePresence>
        </main>

        <Footer />
      </div>

      {/* Global AI overlays */}
      <VoiceAssistant onCommand={(cmd) => setActiveTab(cmd)} language={language} />

      {/* Subtle Background Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-emerald-500/5 blur-[120px] pointer-events-none -z-10" />
    </div>
  );
}
