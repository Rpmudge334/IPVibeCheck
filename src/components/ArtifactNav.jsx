import React, { useState } from 'react';
import { useWindowManager } from './WindowManager';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Hammer, Map, Eye, Key, Scroll, Search, Flame, Sword, Compass, MapPin, Hourglass } from 'lucide-react';
import { useIsAuthenticated } from "@azure/msal-react";

import { ToolRegistry, getToolsByCategory, TOOL_CATEGORIES } from '../config/ToolRegistry';


// Tool Imports - REMOVED (Handled by Registry)

const Palantir = ({ label, color, icon: Icon, tools, onClick, isActive, activeWindows }) => {
    return (
        <div className="relative flex flex-col items-center group">
            {/* The Orb */}
            <motion.div
                data-testid={`orb-${label.toLowerCase()}`}
                whileHover={{ scale: 1.1, y: -10 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClick}
                className={`
                    w-16 h-16 rounded-full cursor-pointer
                    bg-gradient-to-br ${color}
                    shadow-[0_0_20px_rgba(255,255,255,0.2)]
                    border border-white/20 backdrop-blur-md
                    flex items-center justify-center
                    relative z-50
                `}
            >
                <div className="absolute inset-0 rounded-full bg-black/40 blur-sm" />
                <div className="absolute top-2 left-3 w-4 h-2 bg-white/40 blur-[2px] rounded-full transform -rotate-45" />
                <Icon className="relative z-10 text-white/80 drop-shadow-md" size={24} />
            </motion.div>

            {/* Label */}
            <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                {label}
            </div>

            {/* Tool Menu (The Vision) */}
            <AnimatePresence>
                {isActive && (
                    <motion.div
                        className="absolute bottom-24 flex flex-col gap-2 min-w-[180px]"
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: -20, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.8 }}
                    >
                        {tools.map((tool, i) => {
                            const isRunning = activeWindows.some(w => w.id === tool.id && !w.isMinimized);
                            const isMinimized = activeWindows.some(w => w.id === tool.id && w.isMinimized);

                            return (
                                <motion.button
                                    key={i}
                                    data-testid={`tool-${tool.label.toLowerCase().replace(/\s+/g, '-')}`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        tool.onClick();
                                    }}
                                    className="relative flex items-center justify-between px-4 py-2 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-md hover:bg-white/10 text-slate-300 hover:text-white hover:border-mithril-400/50 transition-all text-sm font-medium group/btn"
                                >
                                    <div className="flex items-center gap-3">
                                        <tool.icon size={14} className="text-mithril-400" />
                                        {tool.label}
                                    </div>

                                    {/* Active Indicator */}
                                    {(isRunning || isMinimized) && (
                                        <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] transition-colors ${isRunning ? 'bg-emerald-400 text-emerald-400' : 'bg-amber-400 text-amber-400'}`} />
                                    )}
                                </motion.button>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function ArtifactNav() {
    const { openWindow, windows } = useWindowManager();
    const isAuthenticated = useIsAuthenticated();
    const [activeOrb, setActiveOrb] = useState(null);
    const containerRef = React.useRef(null);

    // Close on Click Outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setActiveOrb(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLaunch = (id) => {
        openWindow(id);
        setActiveOrb(null); // Auto-close menu
    };

    const toggleOrb = (orb) => setActiveOrb(activeOrb === orb ? null : orb);

    if (!isAuthenticated) return null;

    const utilityTools = getToolsByCategory(TOOL_CATEGORIES.UTILITY).map(t => ({
        ...t,
        onClick: () => handleLaunch(t.id)
    }));

    const securityTools = getToolsByCategory(TOOL_CATEGORIES.SECURITY).map(t => ({
        ...t,
        onClick: () => handleLaunch(t.id)
    }));

    const networkTools = getToolsByCategory(TOOL_CATEGORIES.NETWORK).map(t => ({
        ...t,
        onClick: () => handleLaunch(t.id)
    }));

    return (
        <motion.div
            ref={containerRef}
            className="fixed bottom-8 left-0 right-0 z-40 flex justify-center items-end gap-12 pointer-events-none"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1 }}
        >
            <div className="pointer-events-auto flex items-end gap-12 pb-4">
                <Palantir
                    label="Utility"
                    color="from-slate-700 to-slate-900"
                    icon={Hammer}
                    tools={utilityTools}
                    isActive={activeOrb === 'utility'}
                    onClick={() => toggleOrb('utility')}
                    activeWindows={windows}
                />
                <Palantir
                    label="Security"
                    color="from-amber-700 to-amber-900"
                    icon={Shield}
                    tools={securityTools}
                    isActive={activeOrb === 'security'}
                    onClick={() => toggleOrb('security')}
                    activeWindows={windows}
                />
                <Palantir
                    label="Network"
                    color="from-indigo-800 to-slate-900"
                    icon={Map}
                    tools={networkTools}
                    isActive={activeOrb === 'network'}
                    onClick={() => toggleOrb('network')}
                    activeWindows={windows}
                />
            </div>
        </motion.div>
    );
}
