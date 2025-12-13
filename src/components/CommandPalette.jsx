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

    // Filter tools
    const filteredTools = getAllTools().filter(tool =>
        tool.label.toLowerCase().includes(query.toLowerCase()) ||
        tool.title.toLowerCase().includes(query.toLowerCase())
    );

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
        openWindow(toolId);
        setIsOpen(false);
    };

    const handleNavigation = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % filteredTools.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + filteredTools.length) % filteredTools.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredTools[selectedIndex]) {
                handleSelect(filteredTools[selectedIndex].id);
            }
            if (filteredTools.length === 0 && query.trim() === '') {
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

                        {/* Results List */}
                        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
                            {filteredTools.length > 0 ? (
                                <div className="space-y-1">
                                    <div className="px-2 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Applications
                                    </div>
                                    {filteredTools.map((tool, index) => (
                                        <button
                                            key={tool.id}
                                            onClick={() => handleSelect(tool.id)}
                                            onMouseEnter={() => setSelectedIndex(index)}
                                            className={`
                                                w-full flex items-center justify-between px-3 py-3 rounded-lg text-left transition-colors
                                                ${index === selectedIndex ? 'bg-mithril-500/20 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}
                                            `}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`
                                                    p-2 rounded-md 
                                                    ${index === selectedIndex ? 'bg-mithril-500/20 text-mithril-300' : 'bg-white/5 text-slate-400'}
                                                `}>
                                                    <tool.icon size={18} />
                                                </div>
                                                <div>
                                                    <div className="font-medium">{tool.label}</div>
                                                    <div className="text-xs text-slate-500">{tool.title}</div>
                                                </div>
                                            </div>

                                            {index === selectedIndex && (
                                                <CornerDownLeft size={16} className="text-slate-500" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 flex flex-col items-center justify-center text-slate-500">
                                    <Search size={48} className="mb-4 opacity-20" />
                                    <p>No tools found for "{query}"</p>
                                </div>
                            )}
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
