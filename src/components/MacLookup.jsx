import React, { useState } from 'react';
import { Cpu } from 'lucide-react';

const MacLookup = () => {
    const [input, setInput] = useState('');
    const [vendor, setVendor] = useState(null);
    const [loading, setLoading] = useState(false);

    const lookup = async (e) => {
        e.preventDefault();
        setLoading(true); setVendor(null);
        try {
            const res = await fetch(`https://api.maclookup.app/v2/macs/${input}`);
            const json = await res.json();
            if (json.success && json.found) setVendor(json.company);
            else setVendor("Unknown / Not Found");
        } catch (err) { setVendor("Error fetching data"); }
        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <form onSubmit={lookup} className="relative z-10 mb-8">
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-amber-500 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-1000"></div>
                    <div className="relative flex bg-slate-900 rounded-xl p-2 border border-slate-700">
                        <div className="flex items-center pl-4 text-slate-400"><Cpu className="w-5 h-5" /></div>
                        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="MAC Address (Any format)" className="w-full bg-transparent text-white p-4 focus:outline-none placeholder-slate-500 font-mono" />
                        <button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-500 text-white px-6 rounded-lg font-bold transition-all">{loading ? '...' : 'Check'}</button>
                    </div>
                </div>
            </form>
            {vendor && (
                <div className="glass-panel rounded-xl p-8 text-center border border-slate-700">
                    <p className="text-slate-400 text-xs uppercase font-bold mb-2">OUI Vendor</p>
                    <h2 className="text-3xl font-bold text-white tracking-tight">{vendor}</h2>
                </div>
            )}
        </div>
    );
};

export default MacLookup;
