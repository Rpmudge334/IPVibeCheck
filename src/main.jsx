import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from './authConfig';

const msalInstance = new PublicClientApplication(msalConfig);

const mount = async () => {
    const root = document.getElementById('root');
    if (!root) {
        document.body.innerHTML += '<div style="color:red;z-index:99999;position:fixed;top:0">FATAL: ROOT NOT FOUND</div>';
        return;
    }

    try {
        await msalInstance.initialize();
        ReactDOM.createRoot(root).render(
            <React.StrictMode>
                <MsalProvider instance={msalInstance}>
                    <App />
                </MsalProvider>
            </React.StrictMode>,
        );
    } catch (err) {
        document.body.innerHTML += `<div style="color:red;background:white;z-index:99999;position:fixed;top:50%">MOUNT ERROR: ${err.message}</div>`;
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
} else {
    mount();
}
