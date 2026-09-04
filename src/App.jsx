import React, { useState, useEffect } from 'react';
import Navbar from './components/landing/Navbar';
import IntroExperience from './components/landing/IntroExperience';
import MarketingChannelsSection from './components/landing/MarketingChannelsSection';
import MarketingJourney from './components/landing/MarketingJourney';
import CreativeGiniEndExperience from './components/landing/CreativeGiniEndExperience';
import Footer from './components/landing/Footer';
import GoogleAuthModal from './components/common/GoogleAuthModal';
import Toast from './components/common/Toast';
import Dashboard from './components/dashboard/Dashboard';
import CosmicSpaceCanvas from './components/common/CosmicSpaceCanvas';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState(null); 
  const [toastMessage, setToastMessage] = useState('');
  const [cursorPos, setCursorPos] = useState({ x: -500, y: -500 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setIsModalOpen(false);
    setCurrentView('dashboard');
    showToast(`Signed in as ${userData.name}. Welcome to CreativeGini!`);
  };

  const handleDirectSignInClick = () => {
    const demoUser = {
      name: 'Creative Founder',
      email: 'founder@creativegini.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
    };
    setUser(demoUser);
    setCurrentView('dashboard');
    showToast(`Signed in as ${demoUser.name}. Opening CreativeGini Dashboard...`);
  };

  const [isIntroComplete, setIsIntroComplete] = useState(false);

  const handleLogout = () => {
    setUser(null);
    setCurrentView('landing');
    setIsIntroComplete(false);
    showToast('Signed out successfully');
  };

  return (
    <div className="app-root cosmic-editorial-root">
      {/* 3D Multi-Layer Continuous Parallax Starfield & Nebula Engine */}
      <CosmicSpaceCanvas />
      
      <div
        className="cursor-cosmic-spotlight"
        style={{ left: `${cursorPos.x}px`, top: `${cursorPos.y}px` }}
      />

      {currentView === 'dashboard' ? (
        <Dashboard
          user={user}
          onLogout={handleLogout}
        />
      ) : (
        <>
          <Navbar
            onOpenGoogleModal={handleDirectSignInClick}
            user={user}
            onLogout={handleLogout}
            onGoToDashboard={() => setCurrentView('dashboard')}
          />

          <GoogleAuthModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onLogin={handleLogin}
          />

          <div id="landing-main-scroll-wrapper">
            {/* 1. SCROLL-CONTROLLED 3D ROLLING OPENING TITLE EXPERIENCE (LAYER 1 SUB-SCROLL) */}
            <IntroExperience
              isComplete={isIntroComplete}
              setIsComplete={setIsIntroComplete}
            />

            {/* 2. MAIN PAGE CONTENT FLOW (LAYER 2 UNLOCKED AFTER TITLE 3) */}
            <div id="next-landing-container" className="next-sections-flow">
              {/* Marketing Globe Section */}
              <MarketingChannelsSection
                onExploreChannel={handleDirectSignInClick}
              />

              {/* Horizontal Scroll Journey Section */}
              <MarketingJourney
                onExploreSolution={handleDirectSignInClick}
              />

              {/* 3. SCREEN 1 FINALE & SCALING FOOTER */}
              <CreativeGiniEndExperience
                onOpenAuth={handleDirectSignInClick}
              />
            </div>
          </div>
        </>
      )}

      <Toast message={toastMessage} />
    </div>
  );
}
