import React, { useState } from 'react';
import { Search, Globe, Calendar, AlertTriangle, ShieldCheck, ExternalLink, Server } from 'lucide-react';
import InfoItem from './shared/InfoItem';
import ExternalTool from './shared/ExternalTool';

const DomainAge = () => {
    const [input, setInput] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const checkAge = async (e) => {
        e.preventDefault();
        if (!input) return;
        setLoading(true); setResult(null); setError(null);

        const domain = input.trim().replace(/(^\w+:|^)\/\//, '').split('/')[0];
        let creationDate = null;
        let source = 'Unknown';
        let risk = 'Unknown';
        let soaDate = null;

        try {
            // Strategy 1: Try RDAP (Best Data)
            try {
                const rdapRes = await fetch(`https://rdap.org/domain/${domain}`);
                if (rdapRes.ok) {
                    const rdapJson = await rdapRes.json();

                    // Parse RDAP Events
                    if (rdapJson.events) {
                        const regEvent = rdapJson.events.find(e => e.eventAction === 'registration');
                        if (regEvent) {
                            creationDate = regEvent.eventDate.split('T')[0];
                            source = 'RDAP (Official)';
                        }
                    }
                }
            } catch (rdapErr) {
                console.warn("RDAP lookup failed, falling back to heuristic", rdapErr);
            }

            // Strategy 2: Google DNS SOA Serial Heuristic (Fallback)
            if (!creationDate) {
                const dnsRes = await fetch(`https://dns.google/resolve?name=${domain}&type=SOA`);
                const dnsJson = await dnsRes.json();

                if (dnsJson.Answer && dnsJson.Answer.length > 0) {
                    const soaData = dnsJson.Answer[0].data;
                    const parts = soaData.split(' ');
                    const serial = parts[2];

                    // Check if it looks like YYYYMMDDxx
                    if (/^20\d{6}\d{2}$/.test(serial)) {
                        const year = parseInt(serial.substring(0, 4));
                        const month = parseInt(serial.substring(4, 6)) - 1;
                        const day = parseInt(serial.substring(6, 8));
                        soaDate = new Date(year, month, day);
                        if (!isNaN(soaDate.getTime())) {
                            source = 'SOA Serial (Heuristic)';
                            creationDate = soaDate.toISOString().split('T')[0];
                        }
                    }
                }
            }

            // Analyze Risk (Logic)
            let ageDays = null;
            let refDate = creationDate ? new Date(creationDate) : null;

            if (refDate && !isNaN(refDate.getTime())) {
                const now = new Date();
                const diffTime = Math.abs(now - refDate);
                ageDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (ageDays < 30) risk = 'High';
                else if (ageDays < 90) risk = 'Medium';
                else risk = 'Low';
            }

            setResult({
                domain,
                source,
                creationDate: creationDate || 'Unknown',
                ageDays: ageDays,
                risk
            });

        } catch (err) {
            setError(err.message || "Lookup failed");
            // If we have partial result, show it?
            // For now, simple error.
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <form onSubmit={checkAge} className="relative z-10 max-w-2xl mx-auto mb-8">
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-1000"></div>
                    <div className="relative flex bg-slate-900 rounded-xl p-2 border border-slate-700">
                        <div className="flex items-center pl-4 text-slate-400"><Globe className="w-5 h-5" /></div>
                        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter Domain (e.g. google.com)" className="w-full bg-transparent text-white p-4 focus:outline-none placeholder-slate-500 font-mono" />
                        <button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 rounded-lg font-bold transition-all disabled:opacity-50 flex items-center gap-2">{loading ? '...' : 'Check'}</button>
                    </div>
                </div>
            </form>

            <div className="p-4 bg-orange-900/20 border border-orange-500/30 rounded-lg mb-8 text-xs text-orange-200 flex gap-3 items-start">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <div>
                    <strong>Note on Accuracy:</strong> Client-side domain age checks use heuristics (like SOA records) which update on changes, not just creation. For a 100% confirmed registration date, use the official lookup below.
                </div>
            </div>

            {result && (
                <div className="glass-panel rounded-xl p-6 border border-slate-700 relative overflow-hidden">
                    {result.risk === 'High' && <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">POTENTIAL PHISHING</div>}
                    {result.risk === 'Low' && <div className="absolute top-0 right-0 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">ESTABLISHED DOMAIN</div>}

                    <div className="flex items-center gap-4 mb-6">
                        <div className={`p-4 rounded-full ${result.risk === 'High' ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500' : result.risk === 'Low' ? 'bg-green-500/20 text-green-400 ring-1 ring-green-500' : 'bg-slate-700 text-slate-400'}`}>
                            {result.risk === 'High' ? <AlertTriangle className="w-8 h-8" /> : result.source === 'Unknown' ? <Search className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
                        </div>
                        <div>
                            <div className="text-sm text-slate-400 uppercase tracking-wider font-bold">Inferred Age</div>
                            <div className="text-3xl font-bold text-white font-mono">{result.ageDays ? `${result.ageDays} Days` : 'Unknown'}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <InfoItem label="Reference Date (SOA)" value={result.creationDate} icon={<Calendar className="w-4 h-4" />} />
                        <InfoItem label="Data Source" value={result.source} icon={<Server className="w-4 h-4" />} />
                    </div>

                    <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Official Verification Sources</h4>
                        <div className="flex flex-wrap gap-2">
                            <ExternalTool name="Who.is" url={`https://who.is/whois/${result.domain}`} color="hover:border-blue-500 hover:text-blue-400" />
                            <ExternalTool name="DomainTools" url={`https://whois.domaintools.com/${result.domain}`} color="hover:border-blue-500 hover:text-blue-400" />
                            <ExternalTool name="ICANN Lookup" url={`https://lookup.icann.org/en/lookup?q=${result.domain}`} color="hover:border-blue-500 hover:text-blue-400" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DomainAge;
