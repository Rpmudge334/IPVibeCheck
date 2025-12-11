import React, { useRef, useState } from 'react';
import { Upload, Hexagon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

export default function SmeltingChamber({ onUpload, isSmelting }) {
    const inputRef = useRef(null);
    const containerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    // Magnetic GSAP Effect
    useGSAP(() => {
        const el = containerRef.current;
        if (!el || isSmelting) return;

        const xTo = gsap.quickTo(el, "x", { duration: 0.8, ease: "power3.out" });
        const yTo = gsap.quickTo(el, "y", { duration: 0.8, ease: "power3.out" });

        const handleMove = (e) => {
            const rect = el.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Calculate distance from center
            const x = (e.clientX - centerX) * 0.1; // Magnetic strength
            const y = (e.clientY - centerY) * 0.1;

            xTo(x);
            yTo(y);
        };

        const handleLeave = () => {
            xTo(0);
            yTo(0);
        };

        el.addEventListener('mousemove', handleMove);
        el.addEventListener('mouseleave', handleLeave);

        return () => {
            el.removeEventListener('mousemove', handleMove);
            el.removeEventListener('mouseleave', handleLeave);
        };
    }, [isSmelting]);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragging(true);
        } else if (e.type === "dragleave") {
            setIsDragging(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onUpload(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            onUpload(e.target.files[0]);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto my-12 perspective-1000">
            <motion.div
                ref={containerRef}
                className={`
                    relative group cursor-pointer 
                    h-64 rounded-2xl border-2 border-dashed transition-colors duration-500
                    flex flex-col items-center justify-center overflow-hidden
                    ${isDragging ? 'border-mithril-400 bg-mithril-900/10' : 'border-slate-700 hover:border-mithril-500/50 hover:bg-slate-900/50'}
                    ${isSmelting ? 'border-solid border-mithril-500 shadow-[0_0_50px_rgba(56,189,248,0.2)]' : ''}
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => !isSmelting && inputRef.current?.click()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept=".csv"
                    onChange={handleChange}
                    disabled={isSmelting}
                />

                {/* Elven Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none overflow-hidden">
                    <img src="/tengwar_verse.png" alt="Ash nazg" className="w-[120%] h-auto object-cover opacity-50 invert" />
                </div>

                <AnimatePresence mode="wait">
                    {isSmelting ? (
                        <motion.div
                            key="smelting"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex flex-col items-center gap-6 z-10"
                        >
                            <div className="relative">
                                <Hexagon className="text-mithril-500 animate-spin-slow w-16 h-16" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-display tracking-widest text-mithril-400 animate-pulse">
                                SMELTING DATA...
                            </h2>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-4 z-10 text-slate-400 group-hover:text-mithril-400 transition-colors"
                        >
                            <div className="p-4 rounded-full bg-slate-900/50 ring-1 ring-slate-700 group-hover:ring-mithril-500 duration-500 group-hover:shadow-[0_0_20px_rgba(56,189,248,0.3)]">
                                <Upload className="w-10 h-10" />
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-medium">Drop Zyxel Nebula CSV</p>
                                <p className="text-sm text-slate-500 font-mono mt-1">or click to browse</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
