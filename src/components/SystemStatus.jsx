import React, { useState, useEffect } from 'react';
import { Activity, Wifi, AlertCircle } from 'lucide-react';

export default function SystemStatus() {
    const [status, setStatus] = useState('offline'); // online | offline | error
    const [details, setDetails] = useState(null);

    const checkHealth = async () => {
        try {
            // Assumes backend is proxied via Vite to /api or directly on 8000
            // Since we are running local dev often:
            const res = await fetch('http://localhost:8000/health');
            if (res.ok) {
                const data = await res.json();
                setStatus('online');
                setDetails(data);
            } else {
                setStatus('error');
            }
        } catch (e) {
            setStatus('offline');
        }
    };

    useEffect(() => {
        checkHealth();
        const interval = setInterval(checkHealth, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);

    // Color mapping
    const colors = {
        online: "text-emerald-400",
        offline: "text-red-500",
        error: "text-amber-500"
    };

    const bgColors = {
        online: "bg-emerald-400",
        offline: "bg-red-500",
        error: "bg-amber-500"
    };

    return (
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-slate-900/50 border border-white/10 backdrop-blur-md">
            <div className="relative flex items-center justify-center">
                <div className={`w-2 h-2 rounded-full ${bgColors[status]} animate-pulse`} />
                {status === 'online' && (
                    <div className={`absolute inset-0 w-2 h-2 rounded-full ${bgColors[status]} opacity-50 animate-ping`} />
                )}
            </div>

            <span className={`text-xs font-mono font-medium tracking-wider ${colors[status]}`}>
                {status.toUpperCase()}
            </span>

            {/* Hover Tooltip (Simple browser title for now, or custom popover later) */}
            <div className="hidden group-hover:block absolute top-full mt-2 right-0 bg-black p-2 text-xs rounded border border-white/20">
                {details?.services?.abuseipdb}
            </div>
        </div>
    );
}
