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
import PitchOrbVerification from './PitchOrbVerification'

import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
    onNeedRefresh() {
        if (confirm('New content available. Reload?')) {
            updateSW(true)
        }
    },
})

// Check for verify param
const params = new URLSearchParams(window.location.search);
const isVerify = params.get('verify') === 'true';

ReactDOM.createRoot(document.getElementById('root')).render(
    isVerify ? <PitchOrbVerification /> :
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
