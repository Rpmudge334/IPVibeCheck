import React, { useRef, useEffect, useState } from 'react';
import { useWindowManager } from './WindowManager';
import { Shield, Globe, Cpu, Wrench, Search, Terminal, FileText, Key, Activity, Fingerprint, History, Hammer, Scroll, Feather, Flame, Sword, Eye, Map, Compass, MapPin, Hourglass } from 'lucide-react';
import { gsap } from 'gsap';

// Tool Imports (Lazy Loaded)
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

import { motion } from 'framer-motion';

// Reusable Tool Button UI
const ToolButton = ({ label, icon: Icon, onClick }) => (
    <button
        onClick={(e) => {
            e.stopPropagation();
            onClick();
        }}
        className="flex items-center gap-3 w-full px-4 py-3 text-left text-slate-400 hover:text-mithril-100 hover:bg-white/5 transition-colors group rounded-md border border-transparent hover:border-mithril-500/20"
    >
        <Icon size={16} className="group-hover:text-mithril-300 transition-colors" />
        <span className="text-sm font-medium tracking-wide">{label}</span>
    </button>
);

// The Floating Gem Menu Component
const GemMenu = ({ color, label, icon: Icon, delay, tools, isOpen, onToggle }) => {
    const gemRef = useRef(null);
    const menuRef = useRef(null);

    // Floating Animation
    useEffect(() => {
        gsap.to(gemRef.current, {
            y: -15,
            duration: 2.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: delay
        });
    }, [delay]);

    // Menu Open/Close Animation
    useEffect(() => {
        if (isOpen && menuRef.current) {
            gsap.fromTo(menuRef.current,
                { opacity: 0, y: -10, display: 'none' },
                { opacity: 1, y: 0, display: 'block', duration: 0.3, ease: 'power2.out' }
            );
        } else if (menuRef.current) {
            gsap.to(menuRef.current,
                { opacity: 0, y: -10, display: 'none', duration: 0.2, ease: 'power2.in' }
            );
        }
    }, [isOpen]);

    const handleEnter = () => {
        if (!isOpen) gsap.to(gemRef.current, { scale: 1.1, duration: 0.4, ease: "back.out(1.7)" });
    };

    const handleLeave = () => {
        if (!isOpen) gsap.to(gemRef.current, { scale: 1, duration: 0.4, ease: "power2.out" });
    };

    return (
        <div className="relative flex flex-col items-center group pointer-events-auto">
            {/* The Silmaril */}
            <div
                ref={gemRef}
                onClick={onToggle}
                onMouseEnter={handleEnter}
                onMouseLeave={handleLeave}
                className={`
                    relative w-20 h-20 rounded-full flex items-center justify-center cursor-pointer
                    bg-gradient-to-b ${color}
                    shadow-[0_0_20px_rgba(255,255,255,0.1)]
                    border ${isOpen ? 'border-white/40 shadow-[0_0_60px_rgba(255,255,255,0.5)]' : 'border-white/10'} backdrop-blur-sm
                    transition-all duration-700
                    z-50
                `}
            >
                <div className={`absolute inset-0 rounded-full bg-white/20 transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                <Icon className="text-white/80 drop-shadow-lg transition-colors duration-500" size={32} strokeWidth={1} />
            </div>

            {/* Label - Hidden until hover or Open */}
            <span className={`
                absolute top-24 text-xs font-bold uppercase tracking-[0.2em] text-mithril-100 font-tolkien 
                transition-all duration-500 transform whitespace-nowrap
                ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'}
            `}>
                {label}
            </span>

            {/* Submenu */}
            <div
                ref={menuRef}
                className="absolute top-32 w-56 bg-slate-950/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl py-2 hidden z-40"
            >
                {/* Decorative beam connector */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-[1px] h-4 bg-gradient-to-b from-transparent to-white/20" />

                <div className="flex flex-col gap-1 p-2">
                    {tools.map((tool, i) => (
                        <ToolButton key={i} {...tool} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default function SilmarilNav() {
    const { openWindow } = useWindowManager();
    const [openMenu, setOpenMenu] = useState(null);

    const toggleMenu = (menu) => {
        const newState = openMenu === menu ? null : menu;
        setOpenMenu(newState);

        // Dispatch event for Doors of Durin "Keyhole Light"
        window.dispatchEvent(new CustomEvent('mithril-keyhole', {
            detail: { open: !!newState }
        }));
    };

    // Tool Configurations
    const utilityTools = [
        { label: 'Notepad', icon: Scroll, onClick: () => openWindow('notepad', <Notepad />, 'Scratchpad') },
        { label: 'Ticket Scribe', icon: Feather, onClick: () => openWindow('ticket', <TicketScribe />, 'Ticket Scribe') },
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
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 4.5, duration: 1.5 }}
            className="fixed top-32 left-0 right-0 z-40 flex justify-center items-start gap-32 md:gap-48 pointer-events-none h-[500px]"
        >

            <GemMenu
                label="Utility"
                color="from-slate-700 to-slate-900" // Grey/Blue
                icon={Hammer}
                delay={0}
                tools={utilityTools}
                isOpen={openMenu === 'utility'}
                onToggle={() => toggleMenu('utility')}
            />

            <GemMenu
                label="Security"
                color="from-amber-200/20 to-amber-600/40" // Gold
                icon={Shield}
                delay={0.5}
                tools={securityTools}
                isOpen={openMenu === 'security'}
                onToggle={() => toggleMenu('security')}
            />

            <GemMenu
                label="Network"
                color="from-sky-800 to-indigo-900" // Deep Blue
                icon={Map}
                delay={1.0}
                tools={networkTools}
                isOpen={openMenu === 'network'}
                onToggle={() => toggleMenu('network')}
            />

        </motion.div>
    );
}
