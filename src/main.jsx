import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

// DEBUG: Verify JS Execution
try {
    // window.alert("System Integrity Check: JS is running.");
} catch (e) { }

const DebugApp = () => (
    <div className="p-10 text-white font-mono text-xl">
        <h1 className="text-4xl text-green-400 font-bold mb-4">SYSTEM ONLINE</h1>
        <p>If you can see this, React is working.</p>
        <p>The previous crash was likely inside App.jsx.</p>
    </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <DebugApp />
    </React.StrictMode>,
)
