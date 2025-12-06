import React, { useState } from 'react';
import {
    LayoutDashboard, FileSearch, Phone,
    Globe, Network, Wifi,
    KeyRound, Globe2, Mail,
    ClipboardPen, ChevronDown
} from 'lucide-react';

const CATEGORIES = {
    ANALYSIS: {
        id: 'analysis',
        label: 'Analysis',
        color: 'blue',
        tools: [
            { id: 'single', label: 'Target', icon: LayoutDashboard },
            { id: 'logs', label: 'Log Analyzer', icon: FileSearch },
            { id: '3cx', label: '3CX Tools', icon: Phone },
        ]
    },
    NETWORK: {
        id: 'network',
        label: 'Network',
        color: 'emerald',
        tools: [
            { id: 'dns', label: 'DNS Tool', icon: Globe },
            { id: 'subnet', label: 'Subnet Calc', icon: Network },
            { id: 'mac', label: 'MAC Lookup', icon: Wifi },
        ]
    },
    SECURITY: {
        id: 'security',
        label: 'Security',
        color: 'purple',
        tools: [
            { id: 'pass', label: 'Password Gen', icon: KeyRound },
            { id: 'whois', label: 'Domain Age', icon: Globe2 },
            { id: 'email', label: 'Email Viz', icon: Mail },
        ]
    },
    MSP: {
        id: 'msp',
        label: 'MSP Tools',
        color: 'amber',
        tools: [
            { id: 'scribe', label: 'Ticket Scribe', icon: ClipboardPen },
        ]
    }
};

const Navigation = ({ activeTab, setActiveTab }) => {
    // Determine active category based on activeTab
    const getActiveCategory = () => {
        for (const [key, cat] of Object.entries(CATEGORIES)) {
            if (cat.tools.find(t => t.id === activeTab)) return key;
        }
        return 'ANALYSIS';
    };

    const [activeCategory, setActiveCategory] = useState(getActiveCategory());

    const handleCategoryClick = (catKey) => {
        setActiveCategory(catKey);
        // Optional: Auto-select first tool in category? 
        // For now, just switch view, user clicks tool. 
        // Actually, UX is better if we switch to the category view for secondary selection.
    };

    const currentTools = CATEGORIES[activeCategory].tools;

    return (
        <div className="w-full max-w-6xl mb-8 space-y-4">
            {/* Level 1: Categories */}
            <div className="flex flex-wrap justify-center gap-2 p-1 bg-slate-900/50 rounded-xl border border-slate-800 backdrop-blur-sm">
                {Object.entries(CATEGORIES).map(([key, cat]) => {
                    const isActive = activeCategory === key;
                    const colorClass = {
                        blue: 'hover:bg-blue-500/10 hover:text-blue-400 border-blue-500/50 text-blue-400',
                        emerald: 'hover:bg-emerald-500/10 hover:text-emerald-400 border-emerald-500/50 text-emerald-400',
                        purple: 'hover:bg-purple-500/10 hover:text-purple-400 border-purple-500/50 text-purple-400',
                        amber: 'hover:bg-amber-500/10 hover:text-amber-400 border-amber-500/50 text-amber-400',
                    }[cat.color];

                    return (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryClick(key)}
                            className={`
                                relative px-6 py-3 rounded-lg text-sm font-bold transition-all duration-300
                                bg-transparent border border-transparent
                                ${isActive
                                    ? `bg-slate-800 border-b-2 ${colorClass} shadow-lg`
                                    : 'text-slate-500 hover:text-slate-300'
                                }
                            `}
                        >
                            {cat.label}
                            {isActive && (
                                <span className="absolute bottom-[-18px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45 border-r border-b border-slate-800"></span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Level 2: Tools (Animated Sub-nav) */}
            <div className="flex flex-wrap justify-center gap-2 animate-in slide-in-from-top-2 fade-in duration-300">
                {currentTools.map((tool) => {
                    const Icon = tool.icon;
                    const isActive = activeTab === tool.id;
                    const catColor = CATEGORIES[activeCategory].color;

                    // Dynamic color classes based on active category
                    const activeClasses = {
                        blue: 'bg-blue-600 text-white shadow-blue-900/20',
                        emerald: 'bg-emerald-600 text-white shadow-emerald-900/20',
                        purple: 'bg-purple-600 text-white shadow-purple-900/20',
                        amber: 'bg-amber-600 text-white shadow-amber-900/20',
                    }[catColor];

                    return (
                        <button
                            key={tool.id}
                            onClick={() => setActiveTab(tool.id)}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border
                                ${isActive
                                    ? `${activeClasses} border-transparent shadow-lg scale-105`
                                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600 hover:text-slate-200 hover:bg-slate-750'
                                }
                            `}
                        >
                            <Icon className="w-4 h-4" />
                            {tool.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default Navigation;
