import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { GemProvider } from './context/GemContext'
import './index.css'

import ErrorBoundary from './components/ui/ErrorBoundary'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary>
            <GemProvider>
                <HashRouter>
                    <App />
                </HashRouter>
            </GemProvider>
        </ErrorBoundary>
    </React.StrictMode>,
)
