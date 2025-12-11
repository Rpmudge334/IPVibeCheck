import React, { useState } from 'react';
import { Copy, FileText, Check } from 'lucide-react';

const OPTIONS = {
    severities: ['Low', 'Medium', 'High', 'Critical'],
    categories: ['Network Issue', 'Software Bug', 'Hardware Failure', 'Access Request', 'Security Incident', 'Other']
};

export default function TicketScribe() {
    const [form, setForm] = useState({
        subject: '',
        category: 'Network Issue',
        severity: 'Medium',
        description: '',
        steps: '',
        expected: ''
    });

    const [copied, setCopied] = useState(false);

    const generateOutput = () => {
        return `**Subject**: ${form.subject}
**Category**: ${form.category} | **Severity**: ${form.severity}

### Description
${form.description}

### Steps to Reproduce
${form.steps || "N/A"}

### Expected Behavior
${form.expected || "N/A"}`;
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generateOutput());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col h-full bg-slate-950/20 backdrop-blur-2xl text-slate-200 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

                {/* Header Inputs */}
                <div className="space-y-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Subject</label>
                        <input
                            value={form.subject}
                            onChange={e => setForm({ ...form, subject: e.target.value })}
                            className="bg-slate-900/50 border border-slate-700 rounded px-3 py-2 text-sm focus:border-mithril-500 focus:outline-none transition-colors w-full"
                            placeholder="e.g. VPN Connectivity Failure in Section 7"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Category</label>
                            <select
                                value={form.category}
                                onChange={e => setForm({ ...form, category: e.target.value })}
                                className="bg-slate-900/50 border border-slate-700 rounded px-3 py-2 text-sm focus:border-mithril-500 focus:outline-none transition-colors w-full"
                            >
                                {OPTIONS.categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Severity</label>
                            <select
                                value={form.severity}
                                onChange={e => setForm({ ...form, severity: e.target.value })}
                                className="bg-slate-900/50 border border-slate-700 rounded px-3 py-2 text-sm focus:border-mithril-500 focus:outline-none transition-colors w-full"
                            >
                                {OPTIONS.severities.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Text Areas */}
                <div className="space-y-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Description</label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            className="bg-slate-900/50 border border-slate-700 rounded px-3 py-2 text-sm focus:border-mithril-500 focus:outline-none transition-colors w-full h-32 resize-none"
                            placeholder="Detailed description of the issue..."
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Steps to Reproduce</label>
                        <textarea
                            value={form.steps}
                            onChange={e => setForm({ ...form, steps: e.target.value })}
                            className="bg-slate-900/50 border border-slate-700 rounded px-3 py-2 text-sm focus:border-mithril-500 focus:outline-none transition-colors w-full h-24 resize-none"
                            placeholder="1. Log in... 2. Click..."
                        />
                    </div>
                </div>

            </div>

            {/* Footer Action */}
            <div className="p-4 border-t border-white/5 bg-slate-900/40 flex justify-end">
                <button
                    onClick={handleCopy}
                    className="bg-mithril-600 hover:bg-mithril-500 text-white px-6 py-2 rounded flex items-center gap-2 transition-all font-medium text-sm shadow-lg shadow-mithril-500/20 active:scale-95"
                >
                    {copied ? <Check size={18} /> : <FileText size={18} />}
                    {copied ? 'Copied to Clipboard' : 'Copy Ticket'}
                </button>
            </div>
        </div>
    );
}
