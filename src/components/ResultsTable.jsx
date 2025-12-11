import React from 'react';
import { ShieldAlert, ShieldCheck, ShieldQuestion } from 'lucide-react';

const VerdictBadge = ({ severity }) => {
    const styles = {
        CRITICAL: "bg-red-500/10 text-red-400 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]",
        SUSPICIOUS: "bg-amber-500/10 text-amber-400 border-amber-500/50",
        FALSE_POSITIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/50",
        CLEAN: "bg-slate-800 text-slate-400 border-slate-700"
    };

    const icons = {
        CRITICAL: ShieldAlert,
        SUSPICIOUS: ShieldQuestion,
        FALSE_POSITIVE: ShieldCheck,
        CLEAN: ShieldCheck
    };

    const Icon = icons[severity] || ShieldQuestion;

    return (
        <span className={`
            inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wider border
            ${styles[severity] || styles.CLEAN}
        `}>
            <Icon size={14} />
            {severity.replace('_', ' ')}
        </span>
    );
};

export default function ResultsTable({ data }) {
    if (!data || data.length === 0) return null;

    return (
        <div className="w-full max-w-7xl mx-auto mb-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase tracking-widest text-slate-400">
                            <th className="p-4 font-normal">Source IP</th>
                            <th className="p-4 font-normal">Origin</th>
                            <th className="p-4 font-normal">Confidence</th>
                            <th className="p-4 font-normal">Verdict</th>
                            <th className="p-4 font-normal">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 font-mono text-sm">
                        {data.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                                <td className="p-4 font-medium text-slate-200">{row.ip}</td>
                                <td className="p-4 text-slate-400">
                                    <div className="flex flex-col">
                                        <span className="text-white">{row.country}</span>
                                        <span className="text-xs opacity-60 truncate max-w-[200px]">{row.isp}</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${row.score > 50 ? 'bg-red-500' : 'bg-mithril-500'}`}
                                                style={{ width: `${row.score}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-slate-500">{row.score}%</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <VerdictBadge severity={row.severity} />
                                </td>
                                <td className="p-4 text-xs font-bold tracking-widest">
                                    <span className={
                                        row.rec === 'BLOCK IMMEDIATELY' ? 'text-red-500 animate-pulse' :
                                            row.rec === 'WHITELIST' ? 'text-emerald-500' : 'text-slate-500'
                                    }>
                                        {row.rec}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
