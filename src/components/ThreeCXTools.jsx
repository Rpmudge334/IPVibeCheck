import React, { useState, useEffect, useRef } from 'react';
import { Phone, FileText, Share2, AlertTriangle, CheckCircle, ArrowRight, Play } from 'lucide-react';
import mermaid from 'mermaid';

const ThreeCXTools = () => {
    const [subTab, setSubTab] = useState('logs'); // 'logs' or 'config'
    const [input, setInput] = useState('');
    const [result, setResult] = useState(null);
    const [graphDefinition, setGraphDefinition] = useState('');
    const mermaidRef = useRef(null);

    useEffect(() => {
        mermaid.initialize({
            startOnLoad: true,
            theme: 'dark',
            securityLevel: 'loose',
            flowchart: { curve: 'basis' }
        });
    }, []);

    useEffect(() => {
        if (subTab === 'config' && graphDefinition && mermaidRef.current) {
            mermaid.contentLoaded();
            try {
                mermaid.render('mermaid-svg', graphDefinition).then(({ svg }) => {
                    mermaidRef.current.innerHTML = svg;
                });
            } catch (e) {
                console.error('Mermaid Render Error:', e);
                mermaidRef.current.innerHTML = '<div class="text-red-400 p-4">Error rendering graph. Check syntax.</div>';
            }
        }
    }, [graphDefinition, subTab]);

    const analyzeLogs = () => {
        if (!input.trim()) return;

        const lines = input.split('\n');
        const findings = [];
        let criticalFound = false;

        // Regex patterns for 3CX/SIP
        const sipErrorRegex = /(4[0-9]{2}|5[0-9]{2}|6[0-9]{2})\s+([a-zA-Z\s]+)/;
        const callIDRegex = /Call\(C:(\d+)\)/;

        lines.forEach((line, index) => {
            const sipMatch = line.match(sipErrorRegex);
            const callIDMatch = line.match(callIDRegex);
            const callID = callIDMatch ? `Call ${callIDMatch[1]}` : 'General';

            if (sipMatch) {
                const code = parseInt(sipMatch[1]);
                const msg = sipMatch[2].trim();
                let explanation = '';
                let severity = 'medium';

                // Knowledge Base for SIP Errors
                if (code === 403) { explanation = 'Forbidden. Often means Blocklisted IP or Invalid Auth.'; severity = 'high'; }
                if (code === 404) { explanation = 'Not Found. Destination number does not exist or is unregistered.'; severity = 'medium'; }
                if (code === 408) { explanation = 'Request Timeout. Firewall issue or endpoint offline.'; severity = 'high'; }
                if (code === 486) { explanation = 'Busy Here. Endpoint is DND or on another call.'; severity = 'low'; }
                if (code === 488) { explanation = 'Not Acceptable Here. Codec mismatch (e.g. G711 vs G729).'; severity = 'medium'; }
                if (code === 503) { explanation = 'Service Unavailable. Trunk is down or max simultaneous calls reached.'; severity = 'high'; }

                findings.push({ line: index + 1, code, msg, explanation, severity, callID, raw: line });
                if (severity === 'high') criticalFound = true;
            }

            // Other 3CX specific checks
            if (line.includes("blocked by IP filter")) {
                findings.push({ line: index + 1, code: 'BLK', msg: 'Blocked by IP Filter', explanation: 'IP is explicitly blacklisted in Security > IP Blacklist.', severity: 'high', callID, raw: line });
                criticalFound = true;
            }
        });

        setResult({ type: 'logs', findings, criticalFound });
    };

    const generateConfigFlow = () => {
        if (!input.trim()) return;

        // Naive Parser for 3CX-like XML structure or pseudo-text
        // We will try to extract rules, IVRs, and extensions to build a graph
        let graph = 'graph TD\n';

        // Setup Styles
        graph += '  classDef trunk fill:#b91c1c,stroke:#fff,stroke-width:2px,color:#fff;\n';
        graph += '  classDef ivr fill:#1e40af,stroke:#fff,stroke-width:2px,color:#fff;\n';
        graph += '  classDef queue fill:#eab308,stroke:#fff,stroke-width:2px,color:#000;\n';
        graph += '  classDef ext fill:#15803d,stroke:#fff,stroke-width:2px,color:#fff;\n';

        // Extract "Inbound Rules" (Name, DID -> Dest)
        // Regex is heuristic since we don't know exact format yet
        const rules = [...input.matchAll(/<Rule>.*?<Name>(.*?)<\/Name>.*?<DID>(.*?)<\/DID>.*?<Destination>(.*?)<\/Destination>/gs)];
        // Fallback text parser
        const textLines = input.split('\n');

        // Simple Text Scanner Logic (Mocking what a user might verify)
        // Let's assume user pastes some description like:
        // "Inbound Rule Main -> IVR 800"
        // "IVR 800 -> Press 1 -> Queue Sales"
        // "Queue Sales -> Ext 101, 102"

        // We will enable a "Smart Parse" mode that looks for "->" arrows or standard keywords

        let nodes = new Set();
        let edges = [];

        textLines.forEach(line => {
            if (line.includes('->')) {
                const parts = line.split('->').map(s => s.trim());
                if (parts.length === 2) {
                    const src = parts[0].replace(/\s+/g, '_');
                    const dst = parts[1].replace(/\s+/g, '_');
                    edges.push(`${src} --> ${dst}`);
                    nodes.add(src);
                    nodes.add(dst);
                }
            } else {
                // Heuristic XML-like finding
                // If input looks like XML, we might need a real parser, but for now let's rely on text clues
                if (line.includes('IVR') || line.includes('InboundRule')) {
                    // Try to extract name
                    // Check for "Name" value
                    const nameMatch = line.match(/Name=["'](.*?)["']/);
                    if (nameMatch) nodes.add(nameMatch[1].replace(/\s+/g, '_'));
                }
            }
        });

        if (edges.length === 0) {
            // Fallback Demo Graph if no clear structure found
            graph += '  Start(Start) --> Check{Structure?}\n';
            graph += '  Check -- Yes --> Parse(Parse XML)\n';
            graph += '  Check -- No --> Error(Show Error)\n';
        } else {
            edges.forEach(e => graph += `  ${e}\n`);
        }

        // Assign classes based on keywords
        nodes.forEach(n => {
            if (n.toLowerCase().includes('ivr')) graph += `  class ${n} ivr\n`;
            else if (n.toLowerCase().includes('queue')) graph += `  class ${n} queue\n`;
            else if (n.toLowerCase().includes('trunk') || n.toLowerCase().includes('rule')) graph += `  class ${n} trunk\n`;
            else graph += `  class ${n} ext\n`;
        });

        setGraphDefinition(graph);
        setResult({ type: 'config' });
    };

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Tabs */}
            <div className="flex justify-center gap-4 mb-8">
                <button
                    onClick={() => { setSubTab('logs'); setInput(''); setResult(null); }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl border transition-all font-bold ${subTab === 'logs' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                >
                    <FileText className="w-4 h-4" /> Log Decoder
                </button>
                <button
                    onClick={() => { setSubTab('config'); setInput(''); setResult(null); }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl border transition-all font-bold ${subTab === 'config' ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                >
                    <Share2 className="w-4 h-4" /> Config Flow
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Input Area */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="glass-panel p-4 rounded-xl border border-slate-700">
                        <label className="text-sm font-bold text-slate-300 mb-2 block">
                            {subTab === 'logs' ? 'Paste 3CX Activity Log' : 'Paste Config / Rules (Text)'}
                        </label>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="w-full h-96 bg-slate-950/50 border border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500 resize-none"
                            placeholder={subTab === 'logs' ? "Example:\n05/12/2025 10:00:01 [CM503003]: Call(C:3): Call to '100' has failed; Cause: 486 Busy Here" : "Example:\nMyRule -> IVR_Main\nIVR_Main -> Queue_Sales\nQueue_Sales -> Ext_101"}
                        ></textarea>
                        <div className="mt-4">
                            <button
                                onClick={subTab === 'logs' ? analyzeLogs : generateConfigFlow}
                                className="w-full bg-slate-100 hover:bg-white text-slate-900 font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
                            >
                                <Play className="w-4 h-4" /> {subTab === 'logs' ? 'Analyze Logs' : 'Visualize Flow'}
                            </button>
                        </div>
                    </div>

                    {/* Helper Tips */}
                    <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Pro Tip</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            {subTab === 'logs'
                                ? "Paste the full log chunk including the 'Call(C:x)' ID. We track the flow across lines to find the root error."
                                : "For the visualizer, you can also use simple 'A -> B' syntax if you don't have the raw XML. Example: 'Trunk -> IVR -> Ext'."}
                        </p>
                    </div>
                </div>

                {/* Output Area */}
                <div className="lg:col-span-2">
                    {!result && !graphDefinition ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-xl p-12">
                            <Phone className="w-16 h-16 mb-4 opacity-20" />
                            <p className="text-sm font-bold opacity-50">Waiting for input...</p>
                        </div>
                    ) : (
                        <div className="glass-panel p-6 rounded-xl border border-slate-700 h-full overflow-hidden">

                            {/* LOG RESULTS */}
                            {subTab === 'logs' && result?.findings && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-4">
                                        <h3 className="text-lg font-bold text-white">Analysis Report</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${result.criticalFound ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                            {result.criticalFound ? 'CRITICAL ISSUES FOUND' : 'NO CRITICAL ERRORS'}
                                        </span>
                                    </div>

                                    {result.findings.length === 0 ? (
                                        <div className="text-center text-slate-500 py-8">
                                            <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500/50" />
                                            <p>No obvious SIP errors found in this snippet.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                            {result.findings.map((f, i) => (
                                                <div key={i} className={`p-4 rounded-lg border-l-4 ${f.severity === 'high' ? 'bg-red-950/30 border-red-500' : f.severity === 'medium' ? 'bg-orange-950/30 border-orange-500' : 'bg-blue-950/30 border-blue-500'}`}>
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-xs font-mono text-slate-500 line-through-opacity">Line {f.line} • {f.callID}</span>
                                                        <span className="font-bold font-mono text-sm text-white">{f.code} {f.msg}</span>
                                                    </div>
                                                    <p className="text-sm text-slate-300 font-bold mb-2">{f.explanation}</p>
                                                    <div className="text-[10px] font-mono text-slate-500 bg-black/30 p-2 rounded truncate">{f.raw}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* CONFIG VISUALIZER RESULT */}
                            {subTab === 'config' && (
                                <div className="h-full flex flex-col">
                                    <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-4">
                                        <h3 className="text-lg font-bold text-white">Flow Visualization</h3>
                                        <div className="flex gap-2 text-[10px] font-bold">
                                            <span className="flex items-center gap-1 text-red-400"><div className="w-2 h-2 bg-red-600 rounded-full"></div> Trunk</span>
                                            <span className="flex items-center gap-1 text-blue-400"><div className="w-2 h-2 bg-blue-600 rounded-full"></div> IVR</span>
                                            <span className="flex items-center gap-1 text-yellow-400"><div className="w-2 h-2 bg-yellow-500 rounded-full"></div> Queue</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 bg-slate-900/50 rounded-lg p-4 overflow-auto flex items-center justify-center relative">
                                        <div id="mermaid-svg" ref={mermaidRef} className="w-full h-full flex items-center justify-center"></div>
                                    </div>
                                </div>
                            )}

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ThreeCXTools;
