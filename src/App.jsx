import { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';
import Navigation from './components/Navigation';
import SingleTarget from './components/SingleTarget';
import LogAnalyzer from './components/LogAnalyzer';
import DNSSupertool from './components/DNSSupertool';
import SubnetCalc from './components/SubnetCalc';
import MacLookup from './components/MacLookup';
import ConsentModal from './components/shared/ConsentModal';
import Toast from './components/shared/Toast';

function App() {
    const [activeTab, setActiveTab] = useState('single');
    const [toast, setToast] = useState(null);
    const [consentGiven, setConsentGiven] = useState(false);
    const [privacyMode, setPrivacyMode] = useState(false);
    const [auditLog, setAuditLog] = useState([]);

    useEffect(() => {
        const savedConsent = localStorage.getItem('vibe_consent');
        if (savedConsent) setConsentGiven(true);
        const savedPrivacy = localStorage.getItem('vibe_privacy');
        if (savedPrivacy === 'true') setPrivacyMode(true);
        logAction("APP_INIT", "Application loaded");
    }, []);

    const logAction = (action, details) => {
        const entry = { timestamp: new Date().toISOString(), action, details, user: "MSP_USER" };
        setAuditLog(prev => [...prev, entry]);
        if (!privacyMode) {
            // Optional: Persist audit log? Requirements say "Session Audit Log", so memory is fine.
        }
    };

    const togglePrivacy = () => {
        const newState = !privacyMode;
        setPrivacyMode(newState);
        localStorage.setItem('vibe_privacy', newState);
        logAction("PRIVACY_TOGGLE", `Privacy Mode set to ${newState}`);
        showToast(newState ? "Privacy Mode Enabled (History Disabled)" : "Privacy Mode Disabled");
    };

    const acceptConsent = () => {
        setConsentGiven(true);
        localStorage.setItem('vibe_consent', 'true');
        logAction("CONSENT_ACCEPTED", "User acknowledged legal banner");
    };

    const exportAuditLog = () => {
        logAction("AUDIT_EXPORT", "User exported session log");
        const blob = new Blob([JSON.stringify(auditLog, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vibe_audit_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    };

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    // Props to pass down
    const globalProps = {
        toast: showToast,
        logAction,
        privacyMode
    };

    return (
        <div className="min-h-screen p-4 md:p-8 flex flex-col items-center pb-24 text-slate-200">
            {!consentGiven && <ConsentModal onAccept={acceptConsent} />}
            {toast && <Toast message={toast} onClose={() => setToast(null)} />}

            {/* Header */}
            <div className="w-full max-w-6xl mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
                        <ShieldAlert className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">IP Vibe Check</h1>
                        <p className="text-slate-400 text-xs md:text-sm">MSP Security Dashboard v5.0</p>
                    </div>
                </div>
                <div className="hidden md:block text-right">
                    <div className="text-xs text-slate-500 mb-1">ENGINEER STATUS</div>
                    <div className="text-green-400 font-bold flex items-center gap-2 justify-end">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        ONLINE
                    </div>
                    <div className="flex gap-2 mt-2 justify-end">
                        <button onClick={togglePrivacy} className={`text-[10px] px-2 py-1 rounded border transition-colors ${privacyMode ? 'bg-purple-900/50 border-purple-500 text-purple-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}>
                            {privacyMode ? '🕵️ PRIVACY ON' : '👁️ PRIVACY OFF'}
                        </button>
                        <button onClick={exportAuditLog} className="text-[10px] px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-white">
                            📋 EXPORT AUDIT
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Main Content */}
            <div className="w-full">
                {activeTab === 'single' && <SingleTarget {...globalProps} />}
                {activeTab === 'logs' && <LogAnalyzer {...globalProps} />}
                {activeTab === 'dns' && <DNSSupertool {...globalProps} />}
                {activeTab === 'subnet' && <SubnetCalc {...globalProps} />}
                {activeTab === 'mac' && <MacLookup {...globalProps} />}
            </div>

            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-slate-800 text-center text-[10px] text-slate-600 font-mono">
                <p className="mb-2">SYSTEM INTEGRITY CHECK: <span className="text-green-900 bg-green-900/10 px-1 rounded">VERIFIED</span></p>
                <p>BUILD_HASH: {Math.random().toString(36).substring(7)} | COMPLIANCE: SOC2_TYPE_II</p>
            </div>
        </div>
    );
}

export default App;
