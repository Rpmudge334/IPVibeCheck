import React from 'react';
import { Shield, Hammer, Map, Eye, Key, Scroll, Search, Flame, Sword, Compass, MapPin, Hourglass } from 'lucide-react';

// Lazy Load Components
const Notepad = React.lazy(() => import('../components/Notepad'));
const SmeltingChamber = React.lazy(() => import('../components/SmeltingChamber'));
const SubnetCalculator = React.lazy(() => import('../components/SubnetCalc'));
const MacLookup = React.lazy(() => import('../components/MacLookup'));
const PasswordGen = React.lazy(() => import('../components/PasswordGen'));
const TicketScribe = React.lazy(() => import('../components/TicketScribe'));
const NetworkScanner = React.lazy(() => import('../components/NetworkScanner'));
const DnsIntel = React.lazy(() => import('../components/DnsIntel'));
const EmailForensics = React.lazy(() => import('../components/EmailForensics'));
const DomainAge = React.lazy(() => import('../components/DomainAge'));
const HelpViewer = React.lazy(() => import('../components/HelpViewer'));

export const TOOL_CATEGORIES = {
    UTILITY: 'utility',
    SECURITY: 'security',
    NETWORK: 'network'
};

export const ToolRegistry = {
    // Utility Tools
    help: {
        id: 'help',
        label: 'Help & License',
        title: 'Mithril Documentation',
        icon: Scroll,
        component: HelpViewer,
        category: TOOL_CATEGORIES.UTILITY
    },
    notepad: {
        id: 'notepad',
        label: 'Notepad',
        title: 'Scratchpad',
        icon: Scroll,
        component: Notepad,
        category: TOOL_CATEGORIES.UTILITY
    },
    ticket: {
        id: 'ticket',
        label: 'Ticket Scribe',
        title: 'Ticket Scribe',
        icon: Search,
        component: TicketScribe,
        category: TOOL_CATEGORIES.UTILITY
    },
    passgen: {
        id: 'passgen',
        label: 'Password Gen',
        title: 'Password Forge',
        icon: Key,
        component: PasswordGen,
        category: TOOL_CATEGORIES.UTILITY
    },
    mac: {
        id: 'mac',
        label: 'MAC Lookup',
        title: 'MAC Address Lookup',
        icon: Search,
        component: MacLookup,
        category: TOOL_CATEGORIES.UTILITY
    },

    // Security Tools
    smelter: {
        id: 'smelter',
        label: 'Log Analyzer',
        title: 'Smelting Chamber',
        icon: Flame,
        component: SmeltingChamber,
        category: TOOL_CATEGORIES.SECURITY
    },
    scan: {
        id: 'scan',
        label: 'Target Scanner',
        title: 'Vulnerability Scanner',
        icon: Sword,
        component: NetworkScanner,
        category: TOOL_CATEGORIES.SECURITY
    },
    email: {
        id: 'email',
        label: 'Email Tracer',
        title: 'Header Visualizer',
        icon: Eye,
        component: EmailForensics,
        category: TOOL_CATEGORIES.SECURITY
    },

    // Network Tools
    subnet: {
        id: 'subnet',
        label: 'Subnet Calc',
        title: 'Subnet Calculator',
        icon: Compass,
        component: SubnetCalculator,
        category: TOOL_CATEGORIES.NETWORK
    },
    dns: {
        id: 'dns',
        label: 'DNS Intel',
        title: 'DNS Intelligence',
        icon: MapPin,
        component: DnsIntel,
        category: TOOL_CATEGORIES.NETWORK
    },
    age: {
        id: 'age',
        label: 'Domain Age',
        title: 'Domain Age Recon',
        icon: Hourglass,
        component: DomainAge,
        category: TOOL_CATEGORIES.NETWORK
    }
};

export const getToolById = (id) => ToolRegistry[id];
export const getAllTools = () => Object.values(ToolRegistry);
export const getToolsByCategory = (category) => Object.values(ToolRegistry).filter(t => t.category === category);
