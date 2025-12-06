import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { SettingsProvider } from './context/SettingsContext'
import { AudioProvider } from './context/AudioContext'
import { AuthProvider } from './context/AuthContext'
import { ProfileProvider } from './context/ProfileContext'
import { StatsProvider } from './context/StatsContext'
import { JournalProvider } from './context/JournalContext'
import { ClientProvider } from './context/ClientContext'
import { NavigationProvider } from './context/NavigationContext'
import { LayoutProvider } from './context/LayoutContext'
import { ToastProvider } from './context/ToastContext'
import { GuidedJourneyProvider } from './context/GuidedJourneyContext'
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
                        <AudioProvider>
                            <NavigationProvider>
                                <LayoutProvider>
                                    <StatsProvider>
                                        <JournalProvider>
                                            <ClientProvider>
                                                <GuidedJourneyProvider>
                                                    <HashRouter>
                                                        <App />
                                                    </HashRouter>
                                                </GuidedJourneyProvider>
                                            </ClientProvider>
                                        </JournalProvider>
                                    </StatsProvider>
                                </LayoutProvider>
                            </NavigationProvider>
                        </AudioProvider>
                    </ProfileProvider>
                </AuthProvider>
            </SettingsProvider>
        </ToastProvider>
    </GlobalErrorBoundary>,
)
