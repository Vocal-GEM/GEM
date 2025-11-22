import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { GemProvider } from './context/GemContext'
import './index.css'

import ErrorBoundary from './components/ui/ErrorBoundary'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary>
            <GemProvider>
                <App />
            </GemProvider>
        </ErrorBoundary>
    </React.StrictMode>,
)
