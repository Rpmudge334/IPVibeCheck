import React from 'react';
import { ClipboardCheck, X } from 'lucide-react';

const Toast = ({ message, onClose }) => (
    <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="bg-slate-800 text-white px-4 py-3 rounded-lg shadow-2xl border border-slate-600 flex items-center gap-3">
            <div className="bg-green-500/20 p-1 rounded-full"><ClipboardCheck className="w-4 h-4 text-green-400" /></div>
            <span className="text-sm font-bold">{message}</span>
            <button onClick={onClose} className="ml-2 hover:bg-slate-700 p-1 rounded"><X className="w-3 h-3" /></button>
        </div>
    </div>
);

export default Toast;
