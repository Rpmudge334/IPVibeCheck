import React from 'react';
import { ShieldAlert, ClipboardCheck } from 'lucide-react';

const ConsentModal = ({ onAccept }) => (
    <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl max-w-lg w-full p-8 border border-slate-700 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            <ShieldAlert className="w-16 h-16 text-blue-500 mb-6 mx-auto" />
            <h2 className="text-2xl font-bold text-white text-center mb-4">Authorized Use Only</h2>
            <div className="space-y-4 text-slate-300 text-sm mb-8 bg-slate-900/50 p-6 rounded-xl border border-slate-700/50">
                <p>This system is for <b>Authorized MSP Personnel</b> only.</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>All activities are logged and audited.</li>
                    <li>Unauthorized access is prohibited and may be prosecuted.</li>
                    <li>Use of this tool implies acceptance of the Acceptable Use Policy.</li>
                </ul>
            </div>
            <button onClick={onAccept} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-lg shadow-lg shadow-blue-900/20">
                <ClipboardCheck className="w-5 h-5" /> I Acknowledge & Accept
            </button>
            <div className="mt-4 text-center text-[10px] text-slate-500 font-mono">SOC2 COMPLIANCE CONTROL SET v2025.1</div>
        </div>
    </div>
);

export default ConsentModal;
