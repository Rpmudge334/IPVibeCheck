import React, { useState } from 'react';
import { Globe } from 'lucide-react';

const DnsIntel = () => {
    const [input, setInput] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    const recordTypes = ['A', 'MX', 'TXT', 'NS', 'SOA'];

    const fetchRecords = async (e) => {
        e.preventDefault();
        if (!input) return;
        setLoading(true); setResults(null);

        const domain = input.trim().replace(/(^\w+:|^)\/\//, '');
        const newResults = {};

        for (const type of recordTypes) {
            try {
                const res = await fetch(`https://dns.google/resolve?name=${domain}&type=${type}`);
                const json = await res.json();
                newResults[type] = json.Answer || [];
            } catch (err) {
                newResults[type] = [{ data: 'Error fetching' }];
            }
        }
        setResults(newResults);
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <form onSubmit={fetchRecords} className="relative z-10 max-w-2xl mx-auto mb-8">
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-1000"></div>
                    <div className="relative flex bg-slate-900 rounded-xl p-2 border border-slate-700">
                        <div className="flex items-center pl-4 text-slate-400"><Globe className="w-5 h-5" /></div>
                        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter Domain (e.g., google.com)" className="w-full bg-transparent text-white p-4 focus:outline-none placeholder-slate-500 font-mono" />
                        <button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-500 text-white px-6 rounded-lg font-bold transition-all disabled:opacity-50 flex items-center gap-2">{loading ? '...' : 'Dig'}</button>
                    </div>
                </div>
            </form>

            {results && (
                <div className="grid gap-4">
                    {recordTypes.map(type => (
                        <div key={type} className="glass-panel rounded-xl p-4 border border-slate-700">
                            <div className="flex items-center gap-2 mb-2 border-b border-slate-700 pb-2">
                                <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs font-bold">{type}</span>
                                <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">{type === 'TXT' ? 'SPF / DMARC / Verification' : type === 'MX' ? 'Mail Exchange' : 'Address Record'}</span>
                            </div>
                            {results[type].length > 0 ? (
                                <div className="space-y-1">
                                    {results[type].map((r, i) => (
                                        <div key={i} className="font-mono text-sm text-green-400 break-all bg-slate-900/50 p-2 rounded">{r.data}</div>
                                    ))}
                                </div>
                            ) : <div className="text-slate-500 text-sm italic">No records found</div>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DnsIntel;
