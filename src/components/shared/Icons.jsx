import {
    ShieldAlert, Globe, MapPin, Server, SquareArrowOutUpRight, Copy, Terminal, Wifi,
    TriangleAlert, CloudUpload, OctagonAlert, RefreshCw, Trash2, FileText,
    ClipboardCheck, History, Network, Cpu, List, Activity, Zap, Search
} from 'lucide-react';

// Mapping old names to Lucide exports if names differ slightly, or just re-exporting
// Note: Lucide names are slightly different from the custom SVG components in legacy.html
// I will start by just exporting the ones we need from lucide-react directly in the components.
// But valid requirement is to have a centralized place or stick to lucide imports in files.
// For now, I'll rely on direct imports in components, but I'll create this file just in case I want to build a wrapper later.
// Actually, I'll skip this file and just import directly in components.
// Wait, the "Icon" wrapper in legacy code added some default props. 
// Lucide icons accept className so it's fine.

// Legacy name mapping to Lucide:
// ExternalLink -> SquareArrowOutUpRight
// AlertTriangle -> TriangleAlert
// UploadCloud -> CloudUpload
// AlertOctagon -> OctagonAlert

export {
    ShieldAlert, Globe, MapPin, Server, SquareArrowOutUpRight as ExternalLink, Copy, Terminal, Wifi,
    TriangleAlert as AlertTriangle, CloudUpload as UploadCloud, OctagonAlert as AlertOctagon, RefreshCw, Trash2, FileText,
    ClipboardCheck, History, Network, Cpu, List, Activity, Zap, Search
};
