import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, X, ArrowRight, CornerDownLeft } from 'lucide-react';
import { useWindowManager } from './WindowManager';
import { ToolRegistry, getAllTools } from '../config/ToolRegistry';

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const { openWindow } = useWindowManager();

    // Toggle with Cmd+K / Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Advanced Command Parsing
    const getFilteredItems = () => {
        const q = query.toLowerCase().trim();
        // Return all tools if empty? No, usually empty list or recent.
        // If empty, maybe show all tools? User asked for "tools listed".
        // Let's rely on standard logic: if q empty, return basic list or empty?
        // Current code returns [] if !q.
        if (!q) return getAllTools().map(t => ({ type: 'app', data: t })); // Show all if empty for exploration

        let results = [];
        const parts = q.split(' ');
        const cmd = parts[0];
        const arg = parts.slice(1).join(' ');

        // 1. Direct Tool Matches (Label, Title, Commands)
        // Check if the query *starts* with a command alias, if so, preserve that tool
        const matchedTools = getAllTools().filter(tool => {
            const labelMatch = tool.label.toLowerCase().includes(q) || tool.title.toLowerCase().includes(q);
            const cmdMatch = tool.commands && tool.commands.some(c => c.startsWith(cmd)); // Fuzzy command match
            return labelMatch || cmdMatch;
        });

        results = matchedTools.map(t => ({ type: 'app', data: t }));

        // 2. Argument Parsing (Dynamic CLI Commands)
        if (arg) {
            // SCAN <IP>
            if (['scan', 'nmap', 'ping'].includes(cmd)) {
                results.unshift({
                    type: 'action',
                    label: `Scan Target: ${arg}`,
                    subLabel: `Launch Network Scanner for ${arg}`,
                    icon: Search,
                    action: () => openWindow('scan', { initialIP: arg })
                });
            }
            // DNS <DOMAIN>
            if (['dns', 'dig', 'nslookup'].includes(cmd)) {
                results.unshift({
                    type: 'action',
                    label: `Resolve Domain: ${arg}`,
                    subLabel: `Launch DNS Intel for ${arg}`,
                    icon: Search,
                    action: () => openWindow('dns', { initialDomain: arg })
                });
            }
            // MAC <ADDR>
            if (['mac', 'oui', 'vendor'].includes(cmd)) {
                results.unshift({
                    type: 'action',
                    label: `Lookup MAC: ${arg}`,
                    subLabel: `Launch MAC Lookup for ${arg}`,
                    icon: Search,
                    action: () => openWindow('mac', { initialMac: arg })
                });
            }
            // TICKET <TEXT>
            if (['ticket', 'scribe', 'report'].includes(cmd)) {
                results.unshift({
                    type: 'action',
                    label: `Create Ticket: ${arg}`,
                    subLabel: `Open Ticket Scribe with Title "${arg}"`,
                    icon: Search, // Maybe use Scroll icon if available
                    action: () => openWindow('ticket', { initialTitle: arg })
                });
            }
            // PASS <LENGTH/TEMPLATE>
            if (['pass', 'gen', 'secret'].includes(cmd)) {
                const isNum = /^\d+$/.test(arg); // strictly digits
                if (isNum) {
                    const len = parseInt(arg, 10);
                    results.unshift({
                        type: 'action',
                        label: `Generate Password (${arg} chars)`,
                        subLabel: `Launch Password Gen with length ${arg}`,
                        icon: Search,
                        action: () => openWindow('passgen', { initialLength: len })
                    });
                } else {
                    results.unshift({
                        type: 'action',
                        label: `Generate: ${arg}`,
                        subLabel: `Launch Password Gen with template "${arg}"`,
                        icon: Search,
                        action: () => openWindow('passgen', { initialTemplate: arg })
                    });
                }
            }
            // AGE <DOMAIN>
            if (['age', 'old', 'whois'].includes(cmd)) {
                results.unshift({
                    type: 'action',
                    label: `Check Age: ${arg}`,
                    subLabel: `Launch Domain Age for ${arg}`,
                    icon: Search,
                    action: () => openWindow('age', { initialDomain: arg })
                });
            }

            // HELP <TOPIC>
            if (['help', 'man', 'docs', 'info'].includes(cmd)) {
                results.unshift({
                    type: 'action',
                    label: `Read Docs: ${arg}`,
                    subLabel: `Open Manual for "${arg}"`,
                    icon: Command, // Book icon if available
                    action: () => openWindow('help', { initialTopic: arg })
                });
            }

            // CALC <CIDR>
            if (['calc', 'subnet', 'cidr', 'ip'].includes(cmd)) {
                results.unshift({
                    type: 'action',
                    label: `Calculate: ${arg}`,
                    subLabel: `Subnet Analysis for ${arg}`,
                    icon: Command,
                    action: () => openWindow('calc', { initialNetwork: arg })
                });
            }

            // NOTE <TEXT>
            if (['note', 'write', 'text'].includes(cmd)) {
                results.unshift({
                    type: 'action',
                    label: `Jot Down: "${arg}"`,
                    subLabel: `Create Note with content`,
                    icon: Command,
                    action: () => openWindow('note', { initialContent: arg })
                });
            }

            // LOG <TEXT>
            if (['log', 'syslog', 'analyze'].includes(cmd)) {
                results.unshift({
                    type: 'action',
                    label: `Analyze Log: "${arg}"`,
                    subLabel: `Send text to Log Analyzer`,
                    icon: Command,
                    action: () => openWindow('log', { initialLog: arg })
                });
            }

            // BUILD <SEARCH>
            if (['build', 'cmd', 'ps1', 'construct'].includes(cmd)) {
                results.unshift({
                    type: 'action',
                    label: `Build Command: "${arg}"`,
                    subLabel: `Open Command Builder with search "${arg}"`,
                    icon: Command, // Terminal icon
                    action: () => openWindow('build', { initialSearch: arg })
                });
            }
        }

        return results;
    };

    const filteredItems = getFilteredItems();

    // Reset selection on query change
    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    // Focus input on open
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            setQuery(''); // Clear query on re-open? Or keep it? Clearing feels cleaner.
        }
    }, [isOpen]);

    const handleSelect = (toolId) => {
        setIsOpen(false);
        // Defer opening window to allow palette to close smoothly and avoid render conflict
        setTimeout(() => {
            openWindow(toolId);
        }, 100);
    };

    const handleNavigation = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % filteredItems.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const item = filteredItems[selectedIndex];
            if (item) {
                if (item.type === 'app') {
                    handleSelect(item.data.id);
                } else {
                    setIsOpen(false);
                    setTimeout(item.action, 100);
                }
            }
            if (filteredItems.length === 0 && query.trim() === '') {
                // Wait, if no tools, maybe run a command? future proofing.
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Palette Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="w-full max-w-2xl bg-slate-900/90 border border-mithril-500/30 rounded-xl shadow-2xl shadow-mithril-500/10 overflow-hidden relative z-10 flex flex-col"
                    >
                        {/* Header / Input */}
                        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
                            <Search className="text-slate-400" size={20} />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleNavigation}
                                placeholder="Search for tools..."
                                className="flex-1 bg-transparent border-none outline-none text-lg text-white placeholder-slate-500 font-medium"
                            />
                            <div className="flex items-center gap-2">
                                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs text-slate-400 bg-white/5 rounded border border-white/10 uppercase font-mono">
                                    <span className="text-[10px]">ESC</span>
                                </kbd>
                            </div>
                        </div>

                        {/* Content Area (Split View) */}
                        <div className="flex flex-1 overflow-hidden min-h-[300px]">

                            {/* Left: Results List */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 border-r border-white/5">
                                {filteredItems.length > 0 ? (
                                    <div className="space-y-1">
                                        <div className="px-2 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                            Results
                                        </div>
                                        {filteredItems.map((item, index) => {
                                            const isApp = item.type === 'app';
                                            const data = isApp ? item.data : item;
                                            const isSelected = index === selectedIndex;

                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => {
                                                        if (isApp) handleSelect(data.id);
                                                        else {
                                                            setIsOpen(false);
                                                            setTimeout(item.action, 100);
                                                        }
                                                    }}
                                                    onMouseEnter={() => setSelectedIndex(index)}
                                                    className={`
                                                    w-full flex items-center justify-between px-3 py-3 rounded-lg text-left transition-all
                                                    ${isSelected ? 'bg-mithril-600/20 shadow-lg border border-mithril-500/20' : 'text-slate-400 border border-transparent hover:bg-white/5'}
                                                `}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`
                                                        p-2 rounded-md transition-colors
                                                        ${isSelected ? 'bg-mithril-500/20 text-mithril-300' : 'bg-white/5 text-slate-500'}
                                                    `}>
                                                            {isApp ? <data.icon size={18} /> : <item.icon size={18} />}
                                                        </div>
                                                        <div>
                                                            <div className={`font-medium ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                                                                {isApp ? data.label : item.label}
                                                            </div>
                                                            <div className="text-xs text-slate-500">
                                                                {isApp ? data.title : item.subLabel}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {isSelected && (
                                                        <CornerDownLeft size={16} className="text-mithril-400" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-500">
                                        <Search size={48} className="mb-4 opacity-20" />
                                        <p>No matches found</p>
                                    </div>
                                )}
                            </div>

                            {/* Right: Inspector Panel */}
                            <div className="w-1/3 bg-black/20 p-4 hidden md:flex flex-col">
                                {filteredItems[selectedIndex] ? (
                                    <div className="animate-in fade-in duration-300 slide-in-from-right-4">
                                        {(() => {
                                            const item = filteredItems[selectedIndex];
                                            const isApp = item.type === 'app';
                                            const data = isApp ? item.data : item;
                                            const Icon = isApp ? data.icon : item.icon;

                                            return (
                                                <>
                                                    <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-4">
                                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-mithril-500/20 to-slate-800 flex items-center justify-center border border-mithril-500/30 shadow-inner">
                                                            <Icon size={24} className="text-mithril-300" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-bold text-white">{isApp ? data.label : data.label}</h3>
                                                            <p className="text-xs text-slate-400">{isApp ? data.category?.toUpperCase() : 'ACTION'}</p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-6">
                                                        {isApp && data.commands && (
                                                            <div>
                                                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">CLI Aliases</h4>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {data.commands.map(cmd => (
                                                                        <span key={cmd} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-mithril-200 font-mono">
                                                                            {cmd}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div>
                                                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Description</h4>
                                                            <p className="text-sm text-slate-300 leading-relaxed">
                                                                {isApp ? (
                                                                    data.description || `Launch the ${data.title} module directly. You can use any of the aliases to find this quickly.`
                                                                ) : (
                                                                    `Execute this action immediately with the provided parameters.`
                                                                )}
                                                            </p>
                                                        </div>

                                                        {(data.usage || data.commands) && (
                                                            <div>
                                                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Example Usage</h4>
                                                                <div className="bg-black/40 rounded-lg p-3 text-xs font-mono text-slate-400 border border-white/5">
                                                                    <span className="text-mithril-400">$</span> {data.usage || (data.commands && `${data.commands[0]} [arg]`)}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-600 text-sm">
                                        Select an item to view details
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-2 bg-black/40 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
                            <div className="flex items-center gap-4">
                                <span><strong className="text-slate-400">↑↓</strong> to navigate</span>
                                <span><strong className="text-slate-400">↵</strong> to select</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Command size={12} />
                                <span>+ K</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
