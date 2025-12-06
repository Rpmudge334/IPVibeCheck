import React, { useState, useEffect, useRef } from 'react';
import { Terminal, History as HistoryIcon, AlertTriangle, Server, Copy, Wifi, MapPin, Globe, ClipboardCheck } from 'lucide-react';
import InfoItem from './shared/InfoItem';
import ExternalTool from './shared/ExternalTool';
import { isIP, copyToClipboard } from '../utils/helpers';

const SingleTarget = ({ privacyMode, toast }) => {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);
    const inputRef = useRef(null);

    useEffect(() => {
        const saved = localStorage.getItem('vibe_history');
        if (saved) {
            try {
                setHistory(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse history", e);
                localStorage.removeItem('vibe_history');
            }
        }
        const handleKey = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (inputRef.current) inputRef.current.focus();
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, []);

    const updateHistory = (item) => {
        const newHistory = [item, ...history.filter(h => h.ip !== item.ip)].slice(0, 5);
        setHistory(newHistory);
        if (!privacyMode) localStorage.setItem('vibe_history', JSON.stringify(newHistory));
    };

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!input) return;
        setLoading(true); setError(null); setData(null);

        let targetIP = input.trim().replace(/[<>"']/g, '');
        let dnsData = null;

        try {
            if (window.location.protocol === 'file:') {
                console.warn("Running in file protocol, some APIs might fail if not proxied.");
            }

            if (!isIP(targetIP)) {
                targetIP = targetIP.replace(/(^\w+:|^)\/\//, '');
                const safeTarget = encodeURIComponent(targetIP);
                const dnsRes = await fetch(`https://dns.google/resolve?name=${safeTarget}&type=A`);
                const dnsJson = await dnsRes.json();

                if (dnsJson.Answer && dnsJson.Answer.length > 0) {
                    const aRecord = dnsJson.Answer.find(r => r.type === 1);
                    if (aRecord) {
                        targetIP = aRecord.data;
                        dnsData = dnsJson.Answer.map(r => r.data).join(', ');
                    } else throw new Error("No A record found.");
                } else throw new Error("DNS resolution failed.");
            }

            const geoRes = await fetch(`https://ipwho.is/${targetIP}`);
            const geoJson = await geoRes.json();
            if (!geoJson.success) throw new Error(geoJson.message || "Fetch failed");

            const result = { originalInput: input, ip: targetIP, isDomain: !isIP(input), dns: dnsData, ...geoJson };
            setData(result);
            updateHistory({ ip: targetIP, date: new Date().toLocaleTimeString() });
        } catch (err) { setError(err.message); } finally { setLoading(false); }
    };

    const copyForTicket = () => {
        if (!data) return;
        const text = `[Security Scan]\nTarget: ${data.ip} (${data.originalInput})\nISP: ${data.connection.isp} (${data.country_code})\nASN: AS${data.connection.asn}\nResolution: ${data.dns || 'Direct IP'}\nScanner: IP Vibe Check`;
        copyToClipboard(text, toast);
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <form onSubmit={handleSearch} className="relative z-10 max-w-2xl mx-auto mb-8">
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-1000"></div>
                    <div className="relative flex bg-slate-900 rounded-xl p-2 border border-slate-700">
                        <div className="flex items-center pl-4 text-slate-400"><Terminal className="w-5 h-5" /></div>
                        <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter IP or Domain (Cmd+K)" className="w-full bg-transparent text-white p-4 focus:outline-none placeholder-slate-500 font-mono" />
                        <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white px-6 md:px-8 rounded-lg font-bold transition-all disabled:opacity-50 flex items-center gap-2">{loading ? '...' : 'Scan'}</button>
                    </div>
                </div>
            </form>
            {history.length > 0 && (
                <div className="max-w-2xl mx-auto mb-8 flex flex-wrap gap-2 justify-center">
                    {history.map((h, i) => <button key={i} onClick={() => { setInput(h.ip); handleSearch(); }} className="flex items-center gap-1 text-xs bg-slate-800 text-slate-400 px-3 py-1 rounded-full hover:bg-slate-700 hover:text-white transition-colors"><HistoryIcon className="w-3 h-3" /> {h.ip}</button>)}
                </div>
            )}
            {error && <div className="max-w-4xl mx-auto mb-8 p-4 bg-red-900/30 border border-red-500/50 rounded-xl flex items-center gap-4 text-red-200"><AlertTriangle className="w-6 h-6 flex-shrink-0" /><div><p className="font-bold">Scan Failed</p><p className="text-sm opacity-80">{error}</p></div></div>}
            {data && (
                <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10"><Server className="w-32 h-32" /></div>
                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <div className="text-xs font-bold text-blue-400 mb-1 uppercase tracking-wider">Target Acquired</div>
                                        <div className="text-3xl font-bold text-white font-mono flex items-center gap-3">{data.ip}<button onClick={() => copyToClipboard(data.ip, toast)} aria-label="Copy IP" className="p-2 hover:bg-slate-700 rounded-lg transition-colors group"><Copy className="w-4 h-4 text-slate-500 group-hover:text-white" /></button></div>
                                        {data.isDomain && <div className="mt-2 text-slate-400 text-sm flex items-center gap-2"><span className="bg-slate-800 px-2 py-1 rounded text-xs border border-slate-700">Resolved from</span>{data.originalInput}</div>}
                                    </div>
                                    <img src={data.flag.img} alt={data.country} className="w-16 h-auto rounded shadow-lg" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <InfoItem label="ISP" value={data.connection.isp} icon={<Wifi className="w-4 h-4" />} />
                                    <InfoItem label="ASN" value={`AS${data.connection.asn}`} icon={<Server className="w-4 h-4" />} />
                                    <InfoItem label="Location" value={`${data.city}, ${data.region}`} icon={<MapPin className="w-4 h-4" />} />
                                    <InfoItem label="Timezone" value={data.timezone.utc} icon={<Globe className="w-4 h-4" />} />
                                </div>
                                <button onClick={copyForTicket} className="mt-6 w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-3 rounded-lg border border-slate-700 flex items-center justify-center gap-2 font-bold transition-all"><ClipboardCheck className="w-4 h-4" /> Copy Summary for Ticket</button>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-1 space-y-4">
                        <div className="p-1 rounded-2xl bg-gradient-to-b from-slate-700 to-slate-800">
                            <div className="bg-slate-900 rounded-xl p-5 h-full">
                                <h3 className="text-lg font-bold text-white mb-1">Vibe Check</h3>
                                <div className="space-y-3 mt-4">
                                    <ExternalTool name="VirusTotal" url={`https://www.virustotal.com/gui/${data.isDomain ? 'domain' : 'ip-address'}/${data.isDomain ? data.originalInput : data.ip}`} color="hover:border-blue-500 hover:text-blue-400" />
                                    <ExternalTool name="AbuseIPDB" url={`https://www.abuseipdb.com/check/${data.ip}`} color="hover:border-orange-500 hover:text-orange-400" />
                                    <ExternalTool name="Talos Intel" url={`https://talosintelligence.com/reputation_center/lookup?search=${data.ip}`} color="hover:border-teal-500 hover:text-teal-400" />
                                    <ExternalTool name="Shodan" url={`https://www.shodan.io/host/${data.ip}`} color="hover:border-red-500 hover:text-red-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SingleTarget;
