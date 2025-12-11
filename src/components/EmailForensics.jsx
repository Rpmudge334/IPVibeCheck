import React, { useState } from 'react';
import { Mail, ArrowDown, Clock, Server, AlertTriangle, ShieldCheck, ShieldAlert, Shield, Search } from 'lucide-react';

const EmailForensics = () => {
    const [input, setInput] = useState('');
    const [hops, setHops] = useState(null);
    const [authResults, setAuthResults] = useState(null);

    const parseHeaders = () => {
        if (!input) return;

        const lines = input.replace(/\r\n/g, '\n').replace(/\n\s+/g, ' ').split('\n'); // Unfold headers

        // --- HOP ANALYSIS (Existing) ---
        const received = lines.filter(l => l.toLowerCase().startsWith('received:'));
        const parsedHops = received.map((line, index) => {
            const parts = line.split(';');
            const dateStr = parts.length > 1 ? parts[parts.length - 1].trim() : null;
            const dateObj = dateStr ? new Date(dateStr) : null;
            const fromMatch = line.match(/from\s+([^\s]+)/i);
            const byMatch = line.match(/by\s+([^\s]+)/i);
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

        const sortedHops = parsedHops.filter(p => p.validDate).sort((a, b) => a.date - b.date);
        const hopsWithDelays = sortedHops.map((hop, i) => {
            let delay = 0;
            if (i > 0) delay = (hop.date - sortedHops[i - 1].date) / 1000;
            return { ...hop, delay };
        });
        setHops(hopsWithDelays);

        // --- SECURITY ANALYSIS (New) ---
        const authHeader = lines.find(l => l.toLowerCase().startsWith('authentication-results:'));
        const security = {
            spf: 'Unknown',
            dkim: 'Unknown',
            dmarc: 'Unknown',
            verdict: 'Neutral',
            score: 50,
            details: []
        };

        if (authHeader) {
            const lowerAuth = authHeader.toLowerCase();

            // SPF Check
            if (lowerAuth.includes('spf=pass')) security.spf = 'Pass';
            else if (lowerAuth.includes('spf=fail')) security.spf = 'Fail';
            else if (lowerAuth.includes('spf=softfail')) security.spf = 'SoftFail';
            else if (lowerAuth.includes('spf=none')) security.spf = 'None';

            // DKIM Check
            if (lowerAuth.includes('dkim=pass')) security.dkim = 'Pass';
            else if (lowerAuth.includes('dkim=fail')) security.dkim = 'Fail';

            // DMARC Check
            if (lowerAuth.includes('dmarc=pass')) security.dmarc = 'Pass';
            else if (lowerAuth.includes('dmarc=fail')) security.dmarc = 'Fail';
            else if (lowerAuth.includes('dmarc=none')) security.dmarc = 'None'; // often 'bestguesspass' or similar
        }

        // Return Path check
        const returnPath = lines.find(l => l.toLowerCase().startsWith('return-path:'));
        const fromHeader = lines.find(l => l.toLowerCase().startsWith('from:'));

        if (returnPath && fromHeader) {
            const returnEmail = returnPath.match(/<([^>]+)>/)?.[1] || returnPath.split(':')[1].trim();
            const fromEmail = fromHeader.match(/<([^>]+)>/)?.[1] || fromHeader.split(':')[1]?.trim();

            // Simple generic comparison (very rough)
            if (returnEmail && fromEmail && !returnEmail.includes(fromEmail.split('@')[1])) {
                security.details.push("Return-Path domain mismatch (Potential Spoofing)");
                security.score -= 20;
            }
        }

        // Scoring
        if (security.spf === 'Pass') security.score += 20;
        if (security.spf === 'Fail') security.score -= 30;
        if (security.dkim === 'Pass') security.score += 20;
        if (security.dkim === 'Fail') security.score -= 30;
        if (security.dmarc === 'Pass') security.score += 20;
        if (security.dmarc === 'Fail') security.score -= 40;

        if (security.score >= 80) security.verdict = 'Legit';
        else if (security.score <= 40) security.verdict = 'Phishing';
        else security.verdict = 'Suspicious';

        setAuthResults(security);
    };

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">

            {/* Input Area */}
            <div className="glass-panel rounded-xl p-6 border border-slate-700 mb-8">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Paste full Email Headers here..."
                    className="w-full h-32 bg-slate-900/50 text-xs text-slate-300 font-mono p-4 rounded-lg border border-slate-700 focus:outline-none focus:border-mithril-500"
                />
                <button
                    onClick={parseHeaders}
                    className="mt-4 w-full bg-mithril-600 hover:bg-mithril-500 text-white font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                    <Search className="w-4 h-4" /> Analyze Headers
                </button>
            </div>

            {/* Verdict Panel */}
            {authResults && (
                <div className={`rounded-xl p-6 border mb-8 flex items-center gap-6 shadow-xl relative overflow-hidden
                    ${authResults.verdict === 'Legit' ? 'bg-green-900/10 border-green-500/30' :
                        authResults.verdict === 'Phishing' ? 'bg-red-900/10 border-red-500/30' :
                            'bg-amber-900/10 border-amber-500/30'}
                `}>
                    <div className={`p-4 rounded-full border-2 
                        ${authResults.verdict === 'Legit' ? 'border-green-500 bg-green-500/20 text-green-400' :
                            authResults.verdict === 'Phishing' ? 'border-red-500 bg-red-500/20 text-red-400' :
                                'border-amber-500 bg-amber-500/20 text-amber-400'}
                    `}>
                        {authResults.verdict === 'Legit' ? <ShieldCheck size={32} /> :
                            authResults.verdict === 'Phishing' ? <ShieldAlert size={32} /> :
                                <AlertTriangle size={32} />}
                    </div>

                    <div className="flex-1">
                        <div className="text-sm font-bold uppercase tracking-widest opacity-60">Security Verdict</div>
                        <div className={`text-3xl font-bold ${authResults.verdict === 'Legit' ? 'text-green-400' : authResults.verdict === 'Phishing' ? 'text-red-400' : 'text-amber-400'}`}>
                            {authResults.verdict.toUpperCase()}
                        </div>
                        {authResults.details.length > 0 && (
                            <div className="mt-2 space-y-1">
                                {authResults.details.map((d, i) => (
                                    <div key={i} className="text-xs text-red-300 flex items-center gap-1">
                                        <AlertTriangle size={10} /> {d}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 text-center">
                        <div>
                            <div className="text-[10px] uppercase font-bold text-slate-500">SPF</div>
                            <div className={`font-mono font-bold ${authResults.spf === 'Pass' ? 'text-green-400' : authResults.spf === 'Fail' ? 'text-red-400' : 'text-slate-400'}`}>{authResults.spf}</div>
                        </div>
                        <div>
                            <div className="text-[10px] uppercase font-bold text-slate-500">DKIM</div>
                            <div className={`font-mono font-bold ${authResults.dkim === 'Pass' ? 'text-green-400' : authResults.dkim === 'Fail' ? 'text-red-400' : 'text-slate-400'}`}>{authResults.dkim}</div>
                        </div>
                        <div>
                            <div className="text-[10px] uppercase font-bold text-slate-500">DMARC</div>
                            <div className={`font-mono font-bold ${authResults.dmarc === 'Pass' ? 'text-green-400' : authResults.dmarc === 'Fail' ? 'text-red-400' : 'text-slate-400'}`}>{authResults.dmarc}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Path Visualization (Existing) */}
            {hops && hops.length > 0 && (
                <div className="space-y-0 relative">
                    <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Server size={14} /> Delivery Path
                    </h3>

                    {/* Vertical Line */}
                    <div className="absolute left-6 top-10 bottom-0 w-0.5 bg-slate-700 z-0"></div>

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
                                    <div className={`text-xs font-bold mb-2 flex items-center gap-2 ${hop.delay > 600 ? 'text-red-400' : hop.delay > 60 ? 'text-amber-400' : 'text-green-500'}`}>
                                        <ArrowDown className="w-3 h-3" />
                                        {hop.delay < 60 ? `${hop.delay.toFixed(1)}s` : `${(hop.delay / 60).toFixed(1)}m`} Transfer
                                    </div>
                                )}

                                <div className="glass-panel p-4 rounded-xl border border-slate-700/50 hover:border-mithril-500/30 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Received From</div>
                                            <div className="text-white font-mono font-bold text-sm md:text-base break-all">{hop.from}</div>
                                            {hop.ip && <div className="text-xs text-mithril-400 font-mono mt-1">{hop.ip}</div>}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Timestamp</div>
                                            <div className="text-slate-300 text-xs font-mono">{hop.date.toLocaleTimeString()}</div>
                                            <div className="text-slate-500 text-[10px]">{hop.date.toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-slate-700/50 text-xs text-slate-400">
                                        <span className="text-slate-600 font-bold uppercase mr-1">BY:</span> {hop.by}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Final */}
                    <div className="relative z-10 flex gap-6">
                        <div className="w-12 h-12 flex-shrink-0 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center z-10 shadow-xl shadow-green-900/20">
                            <Clock className="w-5 h-5 text-green-400" />
                        </div>
                        <div className="pt-3">
                            <div className="text-white font-bold">Delivered</div>
                            <div className="text-xs text-slate-500">Total Transit: {((hops[hops.length - 1].date - hops[0].date) / 1000).toFixed(1)}s</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EmailForensics;
