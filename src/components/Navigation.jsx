import React from 'react';
import { Terminal, FileText, Globe, Network, Cpu, KeyRound, Calendar, Mail, Phone } from 'lucide-react';

const Navigation = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { id: 'single', label: 'Target', icon: <Terminal className="w-4 h-4" /> },
        { id: 'logs', label: 'Logs', icon: <FileText className="w-4 h-4" /> },
        { id: '3cx', label: '3CX', icon: <Phone className="w-4 h-4" /> },
        { id: 'dns', label: 'DNS', icon: <Globe className="w-4 h-4" /> },
        { id: 'subnet', label: 'Subnet', icon: <Network className="w-4 h-4" /> },
        { id: 'mac', label: 'MAC', icon: <Cpu className="w-4 h-4" /> },
        { id: 'pass', label: 'Pass', icon: <KeyRound className="w-4 h-4" /> },
        { id: 'whois', label: 'Whois', icon: <Calendar className="w-4 h-4" /> },
        { id: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
    ];

    return (
        <div className="bg-slate-900 p-1 rounded-xl border border-slate-700 flex flex-wrap justify-center gap-1 mb-8">
            <div className="hidden md:flex items-center gap-3 px-4 border-r border-slate-700 mr-2">
                <span className="text-[10px] font-bold text-slate-500 tracking-widest">MODULES</span>
            </div>
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                >
                    {tab.icon} {tab.label}
                </button>
            ))}
        </div>
    );
};

export default Navigation;
