import React from 'react';
import { motion } from 'framer-motion';

export default function DoorIcon({ className, onClick, layoutId }) {
    return (
        <motion.div
            layoutId={layoutId}
            className={`relative cursor-pointer group ${className}`}
            onClick={onClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <svg
                viewBox="0 0 100 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full drop-shadow-[0_0_15px_rgba(94,234,212,0.5)]"
            >
                {/* The Arch */}
                <motion.path
                    d="M10 120 V 40 C 10 10, 90 10, 90 40 V 120"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="text-mithril-200 group-hover:text-white transition-colors duration-500"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                />

                {/* The Two Trees (Stylized) */}
                <motion.path
                    d="M20 120 Q 25 80 15 60 M 80 120 Q 75 80 85 60"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeOpacity="0.6"
                    className="text-mithril-300"
                />

                {/* The Star of Fëanor */}
                <motion.path
                    d="M50 25 L 53 32 L 60 35 L 53 38 L 50 45 L 47 38 L 40 35 L 47 32 Z"
                    fill="currentColor"
                    className="text-white animate-pulse"
                />

                {/* Intricate Filigree (Implied) */}
                <motion.path
                    d="M10 40 Q 20 20 50 20 Q 80 20 90 40"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    className="text-mithril-400/50"
                />
            </svg>

            {/* Glow Effect */}
            <div className="absolute inset-0 bg-mithril-400/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </motion.div>
    );
}
