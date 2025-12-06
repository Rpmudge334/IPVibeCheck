import React, { useState } from 'react';
import { ClipboardPen, Copy, CheckCircle, RefreshCcw } from 'lucide-react';
import { copyToClipboard } from '../utils/helpers';

const TEMPLATES = {
    general: {
        label: 'General Ticket',
        desc: 'Standard issue tracking template',
        fields: [
            { id: 'issue', label: 'Issue Summary', type: 'text', placeholder: 'e.g., User cannot print to HR-PRINTER' },
            { id: 'context', label: 'Background / Context', type: 'textarea', placeholder: 'Who is affected? When did it start?' },
            { id: 'steps', label: 'Troubleshooting Steps', type: 'textarea', placeholder: '- Checked network connectivity\n- Restarted spooler' },
            { id: 'next', label: 'Next Actions', type: 'textarea', placeholder: 'Escalating to Tier 2' }
        ],
        format: (data) => `## Issue Summary
${data.issue || 'N/A'}

## Background
${data.context || 'N/A'}

## Troubleshooting Steps
${data.steps || 'No steps recorded.'}

## Next Actions
${data.next || 'Pending resolution.'}`
    },
    onboarding: {
        label: 'User Onboarding',
        desc: 'New hire setup checklist',
        fields: [
            { id: 'name', label: 'New User Name', type: 'text', placeholder: 'Jane Doe' },
            { id: 'role', label: 'Job Title / Role', type: 'text', placeholder: 'Marketing Manager' },
            { id: 'licenses', label: 'Licenses Assigned', type: 'textarea', placeholder: '- M365 Business Premium\n- Adobe Acrobat Pro' },
            { id: 'access', label: 'Access Rights', type: 'textarea', placeholder: '- Marketing Sharepoint\n- VPN Access' },
            { id: 'hardware', label: 'Hardware Prov.', type: 'textarea', placeholder: 'Dell Latitude 5420 (Asset #1234)' }
        ],
        format: (data) => `**ONBOARDING CHECKLIST**
- **User:** ${data.name || 'Pending'}
- **Role:** ${data.role || 'Pending'}

### Provisioning
**Licenses:**
${data.licenses || '- None'}

**Access:**
${data.access || '- None'}

**Hardware:**
${data.hardware || '- Laptop provisioned'}

*Configured per standard onboarding SOP.*`
    },
    incident: {
        label: 'Security Incident',
        desc: 'Malware/Phishing rapid report',
        fields: [
            { id: 'severity', label: 'Severity Level', type: 'select', options: ['Low', 'Medium', 'High', 'CRITICAL'] },
            { id: 'indicator', label: 'Indicators (IOCs)', type: 'textarea', placeholder: 'Malicious IP, Suspicious sender...' },
            { id: 'containment', label: 'Containment Actions', type: 'textarea', placeholder: 'Device isolated from network' },
            { id: 'remediation', label: 'Remediation', type: 'textarea', placeholder: 'Ran EDR scan, reimaged machine' }
        ],
        format: (data) => `🚨 **SECURITY INCIDENT REPORT** 🚨
**Severity:** ${data.severity || 'Unclassified'}

### Indicators of Compromise
${data.indicator || 'N/A'}

### Containment
${data.containment || 'Pending'}

### Remediation
${data.remediation || 'Pending'}

*Logged for SOC review.*`
    }
};

const TicketScribe = ({ toast, logAction }) => {
    const [activeTemplate, setActiveTemplate] = useState('general');
    const [formData, setFormData] = useState({});
    const [copied, setCopied] = useState(false);

    const handleInput = (id, value) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const currentTemplate = TEMPLATES[activeTemplate];
    const output = currentTemplate.format(formData);

    const handleCopy = () => {
        copyToClipboard(output, toast);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        logAction("SCRIBE_COPY", `Copied ${activeTemplate} template`);
    };

    const handleReset = () => {
        setFormData({});
        toast("Form cleared");
    };

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Input */}
                <div className="space-y-6">
                    <div className="glass-panel p-6 rounded-xl border border-amber-500/30 bg-amber-950/10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-amber-500/20 rounded-lg text-amber-500">
                                <ClipboardPen className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Ticket Scribe</h2>
                                <p className="text-amber-400/60 text-xs">Standardize your HaloPSA notes</p>
                            </div>
                        </div>

                        {/* Template Selector */}
                        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                            {Object.entries(TEMPLATES).map(([key, tpl]) => (
                                <button
                                    key={key}
                                    onClick={() => { setActiveTemplate(key); setFormData({}); }}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${activeTemplate === key
                                            ? 'bg-amber-500 text-black'
                                            : 'bg-slate-800 text-slate-400 hover:text-white'
                                        }`}
                                >
                                    {tpl.label}
                                </button>
                            ))}
                        </div>

                        {/* Dynamic Form */}
                        <div className="space-y-4">
                            {currentTemplate.fields.map(field => (
                                <div key={field.id} className="space-y-1">
                                    <label className="text-xs font-mono text-slate-400 uppercase">{field.label}</label>
                                    {field.type === 'textarea' ? (
                                        <textarea
                                            value={formData[field.id] || ''}
                                            onChange={(e) => handleInput(field.id, e.target.value)}
                                            className="w-full h-24 bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-sm focus:border-amber-500/50 focus:outline-none transition-colors resize-none"
                                            placeholder={field.placeholder}
                                        />
                                    ) : field.type === 'select' ? (
                                        <select
                                            value={formData[field.id] || ''}
                                            onChange={(e) => handleInput(field.id, e.target.value)}
                                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-sm focus:border-amber-500/50 focus:outline-none transition-colors"
                                        >
                                            <option value="">Select...</option>
                                            {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            value={formData[field.id] || ''}
                                            onChange={(e) => handleInput(field.id, e.target.value)}
                                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-sm focus:border-amber-500/50 focus:outline-none transition-colors"
                                            placeholder={field.placeholder}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={handleReset}
                                className="text-xs text-slate-500 flex items-center gap-1 hover:text-white transition-colors"
                            >
                                <RefreshCcw className="w-3 h-3" /> Reset Form
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Preview */}
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent rounded-xl pointer-events-none"></div>
                    <div className="h-full bg-slate-900 rounded-xl border border-slate-700 flex flex-col hidden md:flex">
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50 rounded-t-xl">
                            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Live Preview</span>
                            <button
                                onClick={handleCopy}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${copied ? 'bg-green-500 text-white' : 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/20'
                                    }`}
                            >
                                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Copied to Clipboard' : 'Copy'}
                            </button>
                        </div>
                        <div className="flex-1 p-6 font-mono text-sm text-slate-300 whitespace-pre-wrap overflow-y-auto">
                            {output}
                        </div>
                    </div>

                    {/* Mobile Copy Button (Floating) */}
                    <button
                        onClick={handleCopy}
                        className="md:hidden fixed bottom-6 right-6 z-50 p-4 bg-amber-600 rounded-full shadow-xl shadow-black text-white"
                    >
                        {copied ? <CheckCircle className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TicketScribe;
