import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { GemProvider } from './context/GemContext'
import './index.css'

import ErrorBoundary from './components/ui/ErrorBoundary'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary>
            <GemProvider>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </GemProvider>
        </ErrorBoundary>
    </React.StrictMode>,
)

// Initialize Lucide icons
if (typeof lucide !== 'undefined') {
    const initIcons = () => lucide.createIcons();
    initIcons();
    // Re-initialize on any DOM changes (for dynamic content)
    const observer = new MutationObserver(initIcons);
    observer.observe(document.body, { childList: true, subtree: true });
}
