import React from 'react';

const InfoItem = ({ label, value, icon }) => (
    <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:bg-slate-800 transition-colors">
        <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wider mb-1">{icon}{label}</div>
        <div className="text-white font-medium truncate" title={value}>{value || 'Unknown'}</div>
    </div>
);

export default InfoItem;
