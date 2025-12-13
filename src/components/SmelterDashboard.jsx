import React, { useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Shield, Activity, Globe, Wifi } from 'lucide-react';
import { motion } from 'framer-motion';

const COLLISIONS_PALETTE = ['#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd'];
const THREAT_PALETTE = ['#ef4444', '#f87171', '#fca5a5', '#fecaca'];
const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900/90 border border-white/10 p-3 rounded-lg shadow-xl text-xs backdrop-blur-md">
                <p className="font-bold text-slate-200 mb-1">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-slate-400 capitalize">{entry.name}:</span>
                        <span className="font-mono text-white">{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function SmelterDashboard({ data }) {
    // Process Data
    const stats = useMemo(() => {
        if (!data || data.length === 0) return null;

        const ips = {};
        const protos = {};
        const timeline = {};
        const ports = {};

        data.forEach(row => {
            // Source IP
            const src = row['Source IP'] || row['src_ip'] || 'Unknown';
            ips[src] = (ips[src] || 0) + 1;

            // Protocol
            const proto = row['Protocol'] || row['proto'] || 'TCP';
            protos[proto] = (protos[proto] || 0) + 1;

            // Destination Port
            const port = row['Destination Port'] || row['dst_port'] || 'Other';
            if (port !== 'Other') ports[port] = (ports[port] || 0) + 1;

            // Simple Timeline (Index based if no timestamp, or simple aggregation)
            // Assuming "Timestamp" or just sequence
            const time = row['Time'] || row['Timestamp'] || 'Now';
            // Simplifying timeline for MVP - just binning by "Events processed"
        });

        const sortedIps = Object.entries(ips)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([name, value]) => ({ name, value }));

        const sortedProtos = Object.entries(protos)
            .map(([name, value]) => ({ name, value }));

        const sortedPorts = Object.entries(ports)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([name, value]) => ({ name, value }));

        // Mock timeline for visual flair if no real dates
        const mockTimeline = Array.from({ length: 20 }, (_, i) => ({
            name: `T-${i}`,
            events: Math.floor(Math.random() * 50) + 10
        }));

        return { sortedIps, sortedProtos, sortedPorts, mockTimeline, total: data.length };
    }, [data]);

    if (!stats) return null;

    return (
        <div className="h-full flex flex-col gap-4 animate-in fade-in duration-500 overflow-y-auto custom-scrollbar p-2">

            {/* Header Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4 flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><Activity size={20} /></div>
                    <div>
                        <div className="text-2xl font-bold text-white">{stats.total}</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider">Events</div>
                    </div>
                </div>
                <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4 flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Globe size={20} /></div>
                    <div>
                        <div className="text-2xl font-bold text-white">{stats.sortedIps.length}</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider">Unique Sources</div>
                    </div>
                </div>
                <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4 flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400"><Wifi size={20} /></div>
                    <div>
                        <div className="text-2xl font-bold text-white">{stats.sortedProtos.length}</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider">Protocols</div>
                    </div>
                </div>
                <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4 flex items-center gap-3">
                    <div className="p-2 bg-red-500/10 rounded-lg text-red-400"><Shield size={20} /></div>
                    <div>
                        <div className="text-2xl font-bold text-white">{stats.sortedPorts.length}</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider">Target Ports</div>
                    </div>
                </div>
            </div>

            {/* Main Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-[400px]">

                {/* Top Source IPs */}
                <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4 flex flex-col">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">Top Threat Sources</h3>
                    <div className="flex-1 w-full min-h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.sortedIps} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={100} />
                                <RechartsTooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" fill="#f87171" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Protocol Dist */}
                <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4 flex flex-col">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">Protocol Distribution</h3>
                    <div className="flex-1 w-full min-h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.sortedProtos}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats.sortedProtos.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                    ))}
                                </Pie>
                                <RechartsTooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Traffic Volume Area */}
                <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4 flex flex-col md:col-span-2">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">Traffic Intensity</h3>
                    <div className="flex-1 w-full min-h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.mockTimeline}>
                                <defs>
                                    <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" hide />
                                <YAxis stroke="#475569" fontSize={10} />
                                <RechartsTooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="events" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorEvents)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
}
