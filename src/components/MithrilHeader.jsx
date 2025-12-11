import React from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MithrilHeader() {
    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 4.0, duration: 1.5, type: "spring", stiffness: 50 }}
            className="fixed top-0 left-0 right-0 h-20 z-50 pointer-events-none"
        >
            {/* Glassmorphism Background Banner */}
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md border-b border-white/10 shadow-2xl pointer-events-auto" />

            {/* Content Container (Left Aligned) */}
            <div className="relative h-full px-8 flex items-center justify-between pointer-events-auto">
                {/* Left: Title */}
                <div className="flex flex-col items-start gap-0.5 group cursor-default">
                    <div className="flex items-center gap-3">
                        <Star className="text-mithril-300 drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] group-hover:rotate-45 transition-transform duration-1000" size={24} strokeWidth={1.5} />
                        <h1 className="text-3xl font-tolkien font-bold tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-r from-white via-mithril-100 to-slate-400 drop-shadow-sm pb-1">
                            MITHRIL
                        </h1>
                    </div>
                    <div className="h-[1px] w-full bg-gradient-to-r from-white/30 to-transparent my-0.5" />
                    <p className="text-[10px] text-slate-400 font-serif italic tracking-[0.1em] opacity-80 pl-9">
                        Elen síla lúmenn' omentielvo
                    </p>
                </div>

                {/* Right: Decorative Elven Spacer (Optional) */}
            </div>
        </motion.header>
    );
}
