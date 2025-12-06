import React from 'react';

const ExternalTool = ({ name, url, color }) => (
    <a href={url} target="_blank" rel="noopener noreferrer" className={`text-xs text-center bg-slate-800 hover:bg-slate-700 py-1 px-3 rounded text-slate-300 border border-slate-700 block transition-colors ${color}`}>{name}</a>
);

export default ExternalTool;
