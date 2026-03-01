
import PitchOrb from './components/viz/PitchOrb.jsx';
import React, { useRef, useEffect } from 'react';

const PitchOrbVerification = () => {
  const dataRef = useRef({ pitch: 220 }); // A3, Feminine/Androgynous range

  useEffect(() => {
    let animationFrame;
    const animate = () => {
      // Modulate pitch slightly for the orb pulse effect
      dataRef.current.pitch = 220 + Math.sin(Date.now() / 500) * 10;
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <div style={{ padding: '50px', backgroundColor: '#0f172a', height: '100vh' }}>
      <h2 style={{ color: 'white', marginBottom: '20px' }}>PitchOrb Verification (ResizeObserver + RAF)</h2>
      <div style={{ width: '400px', height: '400px' }}>
        <PitchOrb dataRef={dataRef} settings={{}} />
      </div>
    </div>
  );
};
import React from 'react'
import ReactDOM from 'react-dom/client'
import './i18n';
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { SettingsProvider } from './context/SettingsContext'
import { AudioProvider } from './context/AudioContext'
import { AuthProvider } from './context/AuthContext'
import { ProfileProvider } from './context/ProfileContext'
import { VoiceProfileProvider } from './context/VoiceProfileContext'
import { StatsProvider } from './context/StatsContext'
import { JournalProvider } from './context/JournalContext'
import { ClientProvider } from './context/ClientContext'
import { NavigationProvider } from './context/NavigationContext'
import { LayoutProvider } from './context/LayoutContext'
import { ToastProvider } from './context/ToastContext'
import { GuidedJourneyProvider } from './context/GuidedJourneyContext'
import { PracticeCardsProvider } from './context/PracticeCardsContext'
import GlobalErrorBoundary from './components/ui/GlobalErrorBoundary'

import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
    onNeedRefresh() {
        if (confirm('New content available. Reload?')) {
            updateSW(true)
        }
    },
})

ReactDOM.createRoot(document.getElementById('root')).render(
    <GlobalErrorBoundary>
        <ToastProvider>
            <SettingsProvider>
                <AuthProvider>
                    <ProfileProvider>
                        <VoiceProfileProvider>
                            <AudioProvider>
                                <NavigationProvider>
                                    <LayoutProvider>
                                        <StatsProvider>
                                            <JournalProvider>
                                                <ClientProvider>
                                                    <GuidedJourneyProvider>
                                                        <PracticeCardsProvider>
                                                            <HashRouter>
                                                                <App />
                                                            </HashRouter>
                                                        </PracticeCardsProvider>
                                                    </GuidedJourneyProvider>
                                                </ClientProvider>
                                            </JournalProvider>
                                        </StatsProvider>
                                    </LayoutProvider>
                                </NavigationProvider>
                            </AudioProvider>
                        </VoiceProfileProvider>
                    </ProfileProvider>
                </AuthProvider>
            </SettingsProvider>
        </ToastProvider>
    </GlobalErrorBoundary>,
)
