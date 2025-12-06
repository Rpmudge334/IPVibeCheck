import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

console.log('VITE: Script Execution Started');
// window.alert('VITE: Script Execution Started'); // Uncomment if console is inaccessible

const mount = () => {
    const root = document.getElementById('root');
    if (!root) {
        document.body.innerHTML += '<div style="color:red;z-index:99999;position:fixed;top:0">FATAL: ROOT NOT FOUND</div>';
        return;
    }

    // Clear static checks
    // document.getElementById('static-loading')?.remove();

    try {
        ReactDOM.createRoot(root).render(
            <React.StrictMode>
                <App />
            </React.StrictMode>,
        );
        // Visual confirmation for user
        // document.body.insertAdjacentHTML('beforeend', '<div id="app-mounted" style="display:none">MOUNTED</div>');
    } catch (err) {
        document.body.innerHTML += `<div style="color:red;background:white;z-index:99999;position:fixed;top:50%">MOUNT ERROR: ${err.message}</div>`;
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
} else {
    mount();
}
