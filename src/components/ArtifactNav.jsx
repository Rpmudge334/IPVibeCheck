import React, { useState } from 'react';
import { useWindowManager } from './WindowManager';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Hammer, Map, Eye, Key, Scroll, Search, Flame, Sword, Compass, MapPin, Hourglass } from 'lucide-react';
import { useIsAuthenticated } from "@azure/msal-react";

// Tool Imports
const Notepad = React.lazy(() => import('./Notepad'));
const SmeltingChamber = React.lazy(() => import('./SmeltingChamber'));
const SubnetCalculator = React.lazy(() => import('./SubnetCalc'));
const MacLookup = React.lazy(() => import('./MacLookup'));
const PasswordGen = React.lazy(() => import('./PasswordGen'));
const TicketScribe = React.lazy(() => import('./TicketScribe'));
const NetworkScanner = React.lazy(() => import('./NetworkScanner'));
const DnsIntel = React.lazy(() => import('./DnsIntel'));
const EmailForensics = React.lazy(() => import('./EmailForensics'));
const DomainAge = React.lazy(() => import('./DomainAge'));

const Palantir = ({ label, color, icon: Icon, tools, onClick, isActive }) => {
    return (
        <div className="relative flex flex-col items-center group">
            {/* The Orb */}
            <motion.div
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
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: -20, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.8 }}
                        className="absolute bottom-24 flex flex-col gap-2 min-w-[180px]"
                    >
                        {tools.map((tool, i) => (
                            <motion.button
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    tool.onClick();
                                }}
                                className="flex items-center gap-3 px-4 py-2 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-md hover:bg-white/10 text-slate-300 hover:text-white hover:border-mithril-400/50 transition-all text-sm font-medium"
                            >
                                <tool.icon size={14} className="text-mithril-400" />
                                {tool.label}
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function ArtifactNav() {
    const { openWindow } = useWindowManager();
    const isAuthenticated = useIsAuthenticated();
    const [activeOrb, setActiveOrb] = useState(null);

    const toggleOrb = (orb) => setActiveOrb(activeOrb === orb ? null : orb);

    if (!isAuthenticated) return null;

    const utilityTools = [
        { label: 'Notepad', icon: Scroll, onClick: () => openWindow('notepad', <Notepad />, 'Scratchpad') },
        { label: 'Ticket Scribe', icon: Search, onClick: () => openWindow('ticket', <TicketScribe />, 'Ticket Scribe') },
        { label: 'Password Gen', icon: Key, onClick: () => openWindow('passgen', <PasswordGen />, 'Password Forge') },
        { label: 'MAC Lookup', icon: Search, onClick: () => openWindow('mac', <MacLookup />, 'MAC Address Lookup') },
    ];

    const securityTools = [
        { label: 'Log Analyzer', icon: Flame, onClick: () => openWindow('smelter', <SmeltingChamber />, 'Smelting Chamber') },
        { label: 'Target Scanner', icon: Sword, onClick: () => openWindow('scan', <NetworkScanner />, 'Vulnerability Scanner') },
        { label: 'Email Tracer', icon: Eye, onClick: () => openWindow('email', <EmailForensics />, 'Header Visualizer') },
    ];

    const networkTools = [
        { label: 'Subnet Calc', icon: Compass, onClick: () => openWindow('subnet', <SubnetCalculator />, 'Subnet Calculator') },
        { label: 'DNS Intel', icon: MapPin, onClick: () => openWindow('dns', <DnsIntel />, 'DNS Intelligence') },
        { label: 'Domain Age', icon: Hourglass, onClick: () => openWindow('age', <DomainAge />, 'Domain Age Recon') },
    ];

    return (
        <motion.div
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
                />
                <Palantir
                    label="Security"
                    color="from-amber-700 to-amber-900"
                    icon={Shield}
                    tools={securityTools}
                    isActive={activeOrb === 'security'}
                    onClick={() => toggleOrb('security')}
                />
                <Palantir
                    label="Network"
                    color="from-indigo-800 to-slate-900"
                    icon={Map}
                    tools={networkTools}
                    isActive={activeOrb === 'network'}
                    onClick={() => toggleOrb('network')}
                />
            </div>
        </motion.div>
    );
}
