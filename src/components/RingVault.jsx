import React from 'react';
import { Circle } from 'lucide-react';

const Ring = ({ type, unlocked }) => {
    // Ring styles
    const styles = {
        iron: unlocked ? "stroke-slate-400 drop-shadow-[0_0_5px_rgba(148,163,184,0.5)]" : "stroke-slate-800",
        gold: unlocked ? "stroke-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" : "stroke-slate-800",
        elven: unlocked ? "stroke-mithril-400 drop-shadow-[0_0_12px_rgba(56,189,248,0.8)]" : "stroke-slate-800"
    };

    return (
        <div className="relative group">
            <Circle
                size={type === 'elven' ? 12 : 8}
                className={`transition-all duration-1000 ${styles[type]} opacity-50 group-hover:opacity-100`}
                strokeWidth={type === 'elven' ? 2 : 2.5}
            />
        </div>
    );
};

export default function RingVault({ totalSmelted = 0 }) {
    // Thresholds:
    // 9 Iron Rings: 1-90 (10 each)
    // 7 Dwarf Rings: 100-240 (20 each)
    // 3 Elven Rings: 300-600 (100 each)

    const ironCount = Math.min(9, Math.floor(totalSmelted / 10));
    const goldCount = Math.min(7, Math.floor((totalSmelted - 90) / 50));
    const elvenCount = Math.min(3, Math.floor((totalSmelted - 440) / 100));

    const ironRings = Array(9).fill(0).map((_, i) => i < ironCount);
    const goldRings = Array(7).fill(0).map((_, i) => goldCount > 0 && i < goldCount);

    return (
        <footer className="fixed bottom-4 left-0 right-0 flex justify-center pointer-events-none opacity-50 hover:opacity-100 transition-opacity duration-1000 z-50">
            <div className="bg-transparent px-8 py-2 flex items-center gap-12 pointer-events-auto">

                <div className="flex items-center gap-4">
                    {/* 9 Men */}
                    <div className="flex gap-1.5">
                        {ironRings.map((active, i) => <Ring key={`iron-${i}`} type="iron" unlocked={active} />)}
                    </div>

                    {/* 7 Dwarves */}
                    <div className="flex gap-1.5">
                        {goldRings.map((active, i) => <Ring key={`gold-${i}`} type="gold" unlocked={active} />)}
                    </div>

                    {/* 3 Elves */}
                    <div className="flex gap-2.5 pl-2">
                        {Array(3).fill(0).map((_, i) => (
                            <Ring key={`elven-${i}`} type="elven" unlocked={elvenCount > 0 && i < elvenCount} />
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
