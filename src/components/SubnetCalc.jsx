import React, { useState } from 'react';
import { Network, Wifi, Server, List } from 'lucide-react';
import InfoItem from './shared/InfoItem';

const SubnetCalc = () => {
    const [input, setInput] = useState('');
    const [result, setResult] = useState(null);

    const calculate = (e) => {
        e.preventDefault();
        try {
            const [ip, mask] = input.split('/');
            const octets = ip.split('.').map(Number);
            const maskBits = parseInt(mask, 10);

            if (octets.length !== 4 || octets.some(o => Number.isNaN(o) || o < 0 || o > 255)) {
                throw new Error("IP must have four octets between 0-255");
            }
            if (Number.isNaN(maskBits) || maskBits < 0 || maskBits > 32) {
                throw new Error("Mask must be between 0 and 32");
            }

            const ipInt = octets.reduce((acc, oct) => (acc << 8) + oct, 0) >>> 0;
            const maskInt = maskBits === 0 ? 0 : (~0 << (32 - maskBits)) >>> 0;
            const networkInt = ipInt & maskInt;
            const broadcastInt = networkInt | (~maskInt >>> 0);

            const toDotted = (num) => [24, 16, 8, 0].map(shift => (num >>> shift) & 255).join('.');

            const usableHosts = maskBits >= 31 ? 0 : Math.pow(2, 32 - maskBits) - 2;
            const firstHost = maskBits >= 31 ? 'N/A' : toDotted(networkInt + 1);
            const lastHost = maskBits >= 31 ? 'N/A' : toDotted(broadcastInt - 1);

            const maskDotted = toDotted(maskInt);

            setResult({
                network: toDotted(networkInt),
                broadcast: toDotted(broadcastInt),
                mask: maskDotted,
                hosts: usableHosts,
                range: maskBits === 32 ? 'Single host' : `${firstHost} - ${lastHost}`
            });
        } catch (err) { alert(err.message || "Invalid CIDR format"); }
    };

    return (
        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <form onSubmit={calculate} className="relative z-10 mb-8">
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-teal-500 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-1000"></div>
                    <div className="relative flex bg-slate-900 rounded-xl p-2 border border-slate-700">
                        <div className="flex items-center pl-4 text-slate-400"><Network className="w-5 h-5" /></div>
                        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="CIDR (e.g. 10.0.0.1/24)" className="w-full bg-transparent text-white p-4 focus:outline-none placeholder-slate-500 font-mono" />
                        <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 rounded-lg font-bold transition-all">Calc</button>
                    </div>
                </div>
            </form>
            {result && (
                <div className="glass-panel rounded-xl p-6 border border-slate-700 grid gap-4">
                    <InfoItem label="Network Address" value={result.network} icon={<Network className="w-4 h-4" />} />
                    <InfoItem label="Broadcast" value={result.broadcast} icon={<Wifi className="w-4 h-4" />} />
                    <InfoItem label="Usable Hosts" value={result.hosts.toLocaleString()} icon={<Server className="w-4 h-4" />} />
                    <InfoItem label="Usable Range" value={result.range} icon={<List className="w-4 h-4" />} />
                </div>
            )}
        </div>
    );
};

export default SubnetCalc;
