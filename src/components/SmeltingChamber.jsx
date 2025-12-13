import React, { useRef, useState } from 'react';
import { Upload, Hexagon, Loader2, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import SmelterDashboard from './SmelterDashboard';

// Basic CSV Parser
const parseCSV = (text) => {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const row = {};
        // Simple split handles basics, real CSV parser needs to handle quoted commas
        // For this MVP, assuming simple logs
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));

        headers.forEach((h, idx) => {
            row[h] = values[idx] || '';
        });
        data.push(row);
    }
    return data;
};

// Mock Data Generator for "Load Sample"
const generateMockData = () => {
    const data = [];
    const ips = ['192.168.1.105', '10.0.0.55', '45.33.22.11', '1.1.1.1', '172.16.0.4', '192.168.1.200'];
    const protos = ['TCP', 'UDP', 'ICMP', 'TCP', 'TCP'];
    const ports = ['443', '80', '53', '22', '3389', '8080'];

    for (let i = 0; i < 100; i++) {
        data.push({
            'Source IP': ips[Math.floor(Math.random() * ips.length)],
            'Protocol': protos[Math.floor(Math.random() * protos.length)],
            'Destination Port': ports[Math.floor(Math.random() * ports.length)],
            'Time': new Date().toISOString()
        });
    }
    return data;
};

export default function SmeltingChamber({ initialLog }) {
    const inputRef = useRef(null);
    const containerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isSmelting, setIsSmelting] = useState(false);
    const [smeltedData, setSmeltedData] = useState(null);

    // Initial CLI Log handling
    React.useEffect(() => {
        if (initialLog) {
            handleProcess(null, initialLog); // Treat initialLog as raw text content? Or filename? 
            // If it's just a string, we might need to parse it or mock it.
            // Let's assume for CLI demo it triggers mock data for now.
            handleLoadSample();
        }
    }, [initialLog]);

    // Magnetic GSAP Effect (Only when uploading)
    useGSAP(() => {
        const el = containerRef.current;
        if (!el || isSmelting || smeltedData) return;

        const xTo = gsap.quickTo(el, "x", { duration: 0.8, ease: "power3.out" });
        const yTo = gsap.quickTo(el, "y", { duration: 0.8, ease: "power3.out" });

        const handleMove = (e) => {
            const rect = el.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const x = (e.clientX - centerX) * 0.1;
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
    }, [isSmelting, smeltedData]);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true);
        else if (e.type === "dragleave") setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleProcess(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleProcess(e.target.files[0]);
        }
    };

    const handleProcess = (file, textContent = null) => {
        setIsSmelting(true);

        // Simulating processing delay
        setTimeout(() => {
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const parsed = parseCSV(e.target.result);
                    setSmeltedData(parsed);
                    setIsSmelting(false);
                };
                reader.readAsText(file);
            } else if (textContent) {
                // Parse text directly
                // If it's not CSV, maybe it's just a log line
                // For MVP let's assume valid CSV or generate mock
                setSmeltedData(generateMockData());
                setIsSmelting(false);
            }
        }, 2000);
    };

    const handleLoadSample = (e) => {
        if (e) e.stopPropagation();
        setIsSmelting(true);
        setTimeout(() => {
            setSmeltedData(generateMockData());
            setIsSmelting(false);
        }, 1500);
    };

    if (smeltedData) {
        return <SmelterDashboard data={smeltedData} />;
    }

    return (
        <div className="w-full h-full flex items-center justify-center p-8">
            <motion.div
                ref={containerRef}
                className={`
                    relative group cursor-pointer 
                    w-full max-w-2xl h-80 rounded-2xl border-2 border-dashed transition-all duration-500
                    flex flex-col items-center justify-center overflow-hidden
                    ${isDragging ? 'border-mithril-400 bg-mithril-900/10' : 'border-slate-700 hover:border-mithril-500/50 hover:bg-slate-900/50'}
                    ${isSmelting ? 'border-solid border-mithril-500 shadow-[0_0_50px_rgba(56,189,248,0.2)]' : ''}
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => !isSmelting && inputRef.current?.click()}
                whileHover={!isSmelting ? { scale: 1.02 } : {}}
                whileTap={!isSmelting ? { scale: 0.98 } : {}}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept=".csv,.log,.txt"
                    onChange={handleChange}
                    disabled={isSmelting}
                />

                {/* Elven Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none overflow-hidden">
                    <img src="/tengwar_verse.png" alt="" className="w-[120%] h-auto object-cover opacity-50 invert" />
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
                                <Hexagon className="text-mithril-500 animate-spin-slow w-20 h-20" strokeWidth={1} />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="w-10 h-10 text-white animate-spin" />
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
                            className="flex flex-col items-center gap-6 z-10 text-slate-400"
                        >
                            <div className="p-5 rounded-full bg-slate-900/80 ring-1 ring-slate-700 group-hover:ring-mithril-500 duration-500 group-hover:shadow-[0_0_30px_rgba(56,189,248,0.2)]">
                                <Upload className="w-12 h-12 group-hover:text-mithril-400 transition-colors" />
                            </div>
                            <div className="text-center space-y-1">
                                <p className="text-xl font-medium text-slate-200">Drop Log File</p>
                                <p className="text-sm text-slate-500 font-mono">CSV, LOG, TXT supported</p>
                            </div>

                            <div className="flex items-center gap-4 mt-2">
                                <span className="text-xs text-slate-600 uppercase tracking-widest">or</span>
                            </div>

                            <button
                                onClick={(e) => handleLoadSample(e)}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-mono text-mithril-300 flex items-center gap-2 transition-all z-20"
                            >
                                <Play size={12} /> Load Sample Data
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
