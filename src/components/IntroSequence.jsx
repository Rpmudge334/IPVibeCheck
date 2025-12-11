import React from 'react';
import { motion } from 'framer-motion';

export default function IntroSequence() {
    return (
        <motion.div
            className="fixed inset-0 z-[100] bg-slate-950 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ delay: 3.5, duration: 2, ease: "easeInOut" }}
        >
            <motion.h1
                className="text-2xl md:text-4xl font-tolkien text-mithril-100 tracking-[0.2em] text-center px-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: [0, 1, 1, 0], scale: [0.95, 1, 1, 1.05] }}
                transition={{ duration: 4, times: [0, 0.4, 0.6, 1], ease: "easeInOut" }}
            >
                Speak Friend and Enter
            </motion.h1>
        </motion.div>
    );
}
