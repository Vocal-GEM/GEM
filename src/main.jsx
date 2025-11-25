import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { GemProvider } from './context/GemContext'
import './index.css'

import GlobalErrorBoundary from './components/ui/GlobalErrorBoundary'

ReactDOM.createRoot(document.getElementById('root')).render(
    <GlobalErrorBoundary>
        <GemProvider>
            <HashRouter>
                <App />
            </HashRouter>
        </GemProvider>
    </GlobalErrorBoundary>,
)
