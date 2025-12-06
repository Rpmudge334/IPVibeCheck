import React, { useState, useRef } from 'react';
import { UploadCloud, AlertTriangle, Server, Activity, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { WORKER_CODE } from '../utils/workerCode';
import { delay } from '../utils/helpers';

const LogAnalyzer = () => {
    const [logs, setLogs] = useState([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [analyzedData, setAnalyzedData] = useState(null);
    const [enrichmentData, setEnrichmentData] = useState({});
    const [enriching, setEnriching] = useState(false);
    const [parsing, setParsing] = useState(false);
    const [error, setError] = useState(null);
    const [debugLines, setDebugLines] = useState(null);
    const fileInputRef = useRef(null);

    const resetAnalysis = () => { setLogs([]); setAnalyzedData(null); setEnrichmentData({}); setError(null); setDebugLines(null); setParsing(false); if (fileInputRef.current) fileInputRef.current.value = ""; };
    const handleFileSelect = (e) => { const file = e.target.files[0]; if (file) processFile(file); };
    const handleDrop = (e) => { e.preventDefault(); setIsDragOver(false); const file = e.dataTransfer.files[0]; if (file) processFile(file); };

    const processFile = (file) => {
        setError(null);
        setDebugLines(null);
        setParsing(true);
        if (file.size > 50 * 1024 * 1024) { setError("File too large (Max 50MB)."); setParsing(false); return; }
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const blob = new Blob([WORKER_CODE], { type: 'application/javascript' });
                const worker = new Worker(URL.createObjectURL(blob));
                worker.onmessage = (msg) => {
                    const { success, error, logs, analyzedData, debugLines } = msg.data;
                    if (error) {
                        setError(error);
                        if (debugLines) setDebugLines(debugLines);
                    } else if (success) {
                        setLogs(logs);
                        const finalData = analyzedData.map(a => ({
                            ...a,
                            ports: new Set(a.ports),
                            destinations: new Set(a.destinations)
                        }));
                        setAnalyzedData(finalData);
                    }
                    setParsing(false);
                    worker.terminate();
                };
                worker.postMessage({ text: e.target.result });
            } catch (err) { setError("Worker Init Failed: " + err.message); setParsing(false); }
        };
        reader.readAsText(file);
    };

    const enrichTopAttackers = async () => {
        if (!analyzedData) return;
        setEnriching(true);
        const targets = analyzedData.slice(0, 5);
        const results = { ...enrichmentData };
        for (const target of targets) {
            if (results[target.ip]) continue;
            try {
                const res = await fetch(`https://ipwho.is/${target.ip}`);
                const json = await res.json();
                results[target.ip] = { country: json.country_code, isp: json.connection?.isp, flag: json.flag?.img };
            } catch (e) { console.error("Enrich fail", target.ip); }
            await delay(500);
        }
        setEnrichmentData(results);
        setEnriching(false);
    };

    const ChartSection = () => {
        if (!analyzedData || analyzedData.length === 0) return null;

        const topAttackers = analyzedData.slice(0, 8);
        const portCounts = {};
        analyzedData.forEach(d => {
            d.ports.forEach(p => {
                portCounts[p] = (portCounts[p] || 0) + 1;
            });
        });
        const topPorts = Object.entries(portCounts)
            .map(([port, count]) => ({ name: port, value: count }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'];

        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="glass-panel p-4 rounded-xl border border-slate-700">
                    <h3 className="text-white text-sm font-bold mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-purple-400" /> Top Talkers</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topAttackers}>
                                <XAxis dataKey="src" stroke="#94a3b8" fontSize={10} tickFormatter={(val) => val.split('.').slice(0, 2).join('.') + '.xx'} />
                                <YAxis stroke="#94a3b8" fontSize={10} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                    labelStyle={{ color: '#94a3b8' }}
                                />
                                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                                    {topAttackers.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.riskScore > 50 ? '#ef4444' : '#8b5cf6'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-panel p-4 rounded-xl border border-slate-700">
                    <h3 className="text-white text-sm font-bold mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400" /> Targeted Ports</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={topPorts}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {topPorts.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        );
    };

    const exportCSV = () => {
        if (!analyzedData) return;
        const headers = "IP,Count,Risk Score,ISP,Country,Ports,Flags\n";
        const rows = analyzedData.map(a => {
            const enriched = enrichmentData[a.ip] || {};
            return `${a.ip},${a.count},${a.riskScore},"${enriched.isp || ''}","${enriched.country || ''}","${Array.from(a.ports).join('|')}","${a.flags.join('|')}"`;
        }).join("\n");
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vibe_check_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-1 space-y-4">
                <div
                    className={`drop-zone glass-panel rounded-xl p-8 text-center cursor-pointer ${isDragOver ? 'active' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current.click()}
                >
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                    <UploadCloud className={`w-10 h-10 mx-auto mb-3 ${parsing ? 'text-blue-400 animate-pulse' : 'text-slate-500'}`} />
                    <p className="text-sm font-bold text-white">{parsing ? 'Unpacking Logs...' : 'Tap to Upload'}</p>
                    <p className="text-[10px] text-slate-500 mt-1">.csv, .txt (Max 50MB)</p>
                </div>

                {error && (
                    <div className="p-4 bg-red-900/40 border border-red-500/50 rounded-xl">
                        <div className="flex items-center gap-2 text-red-200 text-sm font-bold mb-2">
                            <AlertTriangle className="w-4 h-4" /> Scan Failed
                        </div>
                        <p className="text-xs text-red-300 opacity-90">{error}</p>
                        {debugLines && (
                            <div className="mt-2 bg-black/30 p-2 rounded text-[10px] font-mono text-slate-400 overflow-x-auto">
                                {debugLines.map((l, i) => <div key={i}>{l}</div>)}
                            </div>
                        )}
                    </div>
                )}

                {analyzedData && (
                    <div className="glass-panel rounded-xl p-4 border border-slate-700 animate-in fade-in slide-in-from-left-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-400">Threat Intel</h3>
                            <button onClick={resetAnalysis} className="text-xs text-red-400 hover:text-red-300">Reset</button>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-400">Unique IPs</span>
                                <span className="text-2xl font-bold text-white font-mono">{analyzedData.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-400">Attackers</span>
                                <span className="text-2xl font-bold text-red-400 font-mono">{analyzedData.filter(a => a.riskScore > 20).length}</span>
                            </div>
                            <div className="pt-4 border-t border-slate-700/50 space-y-2">
                                <button onClick={enrichTopAttackers} disabled={enriching} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs py-2 rounded font-bold transition-all">
                                    {enriching ? 'Enriching...' : 'Enrich Top 5 IPs'}
                                </button>
                                <button onClick={exportCSV} className="w-full bg-slate-700 hover:bg-slate-600 text-white text-xs py-2 rounded font-bold transition-all">
                                    Export CSV Report
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Side: Charts & List */}
            <div className="lg:col-span-3">
                {!analyzedData ? (
                    <div className="glass-panel rounded-xl p-12 text-center flex flex-col items-center justify-center h-64 border-dashed border-2 border-slate-700">
                        <Server className="w-12 h-12 text-slate-600 mb-4 opacity-50" />
                        <h3 className="text-xl font-bold text-slate-500">Ready</h3>
                        <p className="text-slate-600 mt-2 text-sm">Select a log file to analyze.</p>
                    </div>
                ) : (
                    <div>
                        <ChartSection />

                        <div className="space-y-3">
                            {analyzedData.map((attacker) => {
                                const enriched = enrichmentData[attacker.ip];
                                const isHighRisk = attacker.riskScore > 40;
                                // Visual Risk Meter Calculation
                                const riskPercent = Math.min(attacker.riskScore, 100);

                                return (
                                    <div key={attacker.ip} className={`glass-panel rounded-lg p-4 border transition-all ${isHighRisk ? 'border-red-500/30 hover:border-red-500/50' : 'border-slate-700 hover:border-blue-500/30'}`}>
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-slate-900 p-2 rounded text-center min-w-[3rem]"><div className="text-[10px] text-slate-500">HITS</div><div className="font-mono font-bold text-white">{attacker.count}</div></div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-lg font-bold text-white">{attacker.ip}</span>
                                                        {enriched && <img src={enriched.flag} className="w-5 h-auto rounded" />}
                                                    </div>
                                                    <div className="text-xs text-slate-400 mt-1">{enriched ? enriched.isp : 'Pending Enrichment...'}</div>
                                                </div>
                                            </div>

                                            <div className="flex-1">
                                                {/* Risk Meter */}
                                                <div className="w-full bg-slate-900 rounded-full h-1.5 mb-3 mt-1 overflow-hidden">
                                                    <div className={`h-1.5 rounded-full ${isHighRisk ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${riskPercent}%` }}></div>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {attacker.flags.map(f => (
                                                        <span key={f} className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">{f}</span>
                                                    ))}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-2">Ports: {Array.from(attacker.ports).slice(0, 5).join(', ')}</div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LogAnalyzer;
