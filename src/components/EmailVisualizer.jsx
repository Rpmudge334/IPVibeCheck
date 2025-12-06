import React, { useState } from 'react';
import { Mail, ArrowDown, Clock, Server, AlertTriangle } from 'lucide-react';

const EmailVisualizer = () => {
    const [input, setInput] = useState('');
    const [hops, setHops] = useState(null);

    const parseHeaders = () => {
        if (!input) return;

        // Basic parser for "Received" headers
        // Format: Received: from [Server] by [Server] with [Protocol] id [ID] for [Recipient]; [Date]
        // This is complex regex territory, so we'll do best-effort extraction.

        const lines = input.replace(/\r\n/g, '\n').replace(/\n\s+/g, ' ').split('\n'); // Unfold headers
        const received = lines.filter(l => l.toLowerCase().startsWith('received:'));

        const parsed = received.map((line, index) => {
            // Extract Date (usually after semi-colon)
            const parts = line.split(';');
            const dateStr = parts.length > 1 ? parts[parts.length - 1].trim() : null;
            const dateObj = dateStr ? new Date(dateStr) : null;

            // Extract "from" and "by"
            const fromMatch = line.match(/from\s+([^\s]+)/i);
            const byMatch = line.match(/by\s+([^\s]+)/i);

            // Extract IP if present in brackets
            const ipMatch = line.match(/\[(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\]/);

            return {
                id: index,
                raw: line,
                from: fromMatch ? fromMatch[1] : 'Unknown',
                by: byMatch ? byMatch[1] : 'Unknown',
                ip: ipMatch ? ipMatch[1] : null,
                date: dateObj,
                validDate: dateObj && !isNaN(dateObj.getTime())
            };
        });

        // Sort by Date (Earliest first in path theory, but Received headers are usually prepended)
        // Correct Email Path: Bottom Received Header -> Top Received Header
        // So we keep order if we assume standard prepending, but let's reverse to show flow Sender -> Recipient
        // If the input is pasted raw, the top header is the last hop (recipient).
        // To show Sender -> Recipient, we want oldest date first.

        const sorted = parsed.filter(p => p.validDate).sort((a, b) => a.date - b.date);

        // Calculate delays
        const withDelays = sorted.map((hop, i) => {
            let delay = 0;
            if (i > 0) {
                delay = (hop.date - sorted[i - 1].date) / 1000; // seconds
            }
            return { ...hop, delay };
        });

        setHops(withDelays);
    };

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="glass-panel rounded-xl p-6 border border-slate-700 mb-8">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Paste Email Headers here..."
                    className="w-full h-32 bg-slate-900/50 text-xs text-slate-300 font-mono p-4 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500"
                />
                <button
                    onClick={parseHeaders}
                    className="mt-4 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                    <Mail className="w-4 h-4" /> Visualize Path
                </button>
            </div>

            {hops && hops.length > 0 && (
                <div className="space-y-0 relative pb-12">
                    {/* Vertical Line */}
                    <div className="absolute left-6 top-4 bottom-0 w-0.5 bg-slate-700 z-0"></div>

                    {hops.map((hop, i) => (
                        <div key={i} className="relative z-10 flex gap-6 animate-in fade-in slide-in-from-left-4" style={{ animationDelay: `${i * 100}ms` }}>
                            {/* Icon Node */}
                            <div className="w-12 h-12 flex-shrink-0 bg-slate-800 border-2 border-slate-600 rounded-full flex items-center justify-center z-10 shadow-xl">
                                {i === 0 ? <Mail className="w-5 h-5 text-blue-400" /> : <Server className="w-5 h-5 text-slate-400" />}
                            </div>

                            {/* Content Card */}
                            <div className="flex-1 mb-6">
                                {/* Delay indicator */}
                                {i > 0 && (
                                    <div className={`text-xs font-bold mb-2 flex items-center gap-2 ${hop.delay > 600 ? 'text-red-400' : hop.delay > 60 ? 'text-yellow-400' : 'text-green-500'}`}>
                                        <ArrowDown className="w-3 h-3" />
                                        {hop.delay < 60 ? `${hop.delay.toFixed(1)}s` : `${(hop.delay / 60).toFixed(1)}m`} Transfer Time
                                        {hop.delay > 600 && <AlertTriangle className="w-3 h-3" />}
                                    </div>
                                )}

                                <div className="glass-panel p-4 rounded-xl border border-slate-700/50 hover:border-blue-500/30 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Received From</div>
                                            <div className="text-white font-mono font-bold text-sm md:text-base">{hop.from}</div>
                                            {hop.ip && <div className="text-xs text-blue-400 font-mono mt-1">{hop.ip}</div>}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Timestamp</div>
                                            <div className="text-slate-300 text-xs font-mono">{hop.date.toLocaleTimeString()}</div>
                                            <div className="text-slate-500 text-[10px]">{hop.date.toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-slate-700/50 flex gap-4 text-xs text-slate-400">
                                        <div><span className="text-slate-600 font-bold uppercase mr-1">BY:</span> {hop.by}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="relative z-10 flex gap-6">
                        <div className="w-12 h-12 flex-shrink-0 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center z-10 shadow-xl shadow-green-900/20">
                            <Clock className="w-5 h-5 text-green-400" />
                        </div>
                        <div className="pt-3">
                            <div className="text-white font-bold">Delivered to Inbox</div>
                            <div className="text-xs text-slate-500">Total Transit: {((hops[hops.length - 1].date - hops[0].date) / 1000).toFixed(1)}s</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EmailVisualizer;
