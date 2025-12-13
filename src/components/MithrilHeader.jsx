import React from 'react';
import { motion } from 'framer-motion';
import DoorIcon from './DoorIcon';
import SystemStatus from './SystemStatus';
import { useIsAuthenticated } from "@azure/msal-react";

export default function MithrilHeader() {
    const isAuthenticated = useIsAuthenticated();

    // Only show header if logged in.
    // The "door" morphs from the intro screen to here.
    if (!isAuthenticated) return null;

    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.0, type: "spring", stiffness: 50, damping: 20 }}
            className="fixed top-0 left-0 right-0 h-20 z-50 pointer-events-none"
        >
            {/* Glassmorphism Background Banner */}
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md border-b border-white/10 shadow-2xl pointer-events-auto" />

            {/* Content Container (Left Aligned) */}
            <div className="relative h-full px-8 flex items-center justify-between pointer-events-auto">
                {/* Left: Title */}
                <div className="flex flex-col items-start gap-0.5 group cursor-default">
                    <div className="flex items-center gap-4">
                        {/* The Morphed Door Logo */}
                        <DoorIcon
                            layoutId="durins-gate-icon"
                            className="w-8 h-8 md:w-10 md:h-10 text-mithril-300"
                        />

                        <h1 className="text-3xl font-tolkien font-bold tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-r from-white via-mithril-100 to-slate-400 drop-shadow-sm pb-1">
                            MITHRIL
                        </h1>
                    </div>
                    <div className="h-[1px] w-full bg-gradient-to-r from-white/30 to-transparent my-0.5" />
                    <p className="text-[10px] text-slate-400 font-serif italic tracking-[0.1em] opacity-80 pl-12">
                        Elen síla lúmenn' omentielvo
                    </p>
                </div>

                {/* Right: System Status */}
                <SystemStatus />
            </div>
        </motion.header>
    );
}
