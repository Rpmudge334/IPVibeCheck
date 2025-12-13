import React from 'react';
import {
    Terminal, Search, Shield, Activity, FileText,
    Globe, Database, Server, Key, Calculator,
    Eye, Flame, Compass, Hourglass, Scroll, Sword, MapPin
} from 'lucide-react';

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
const CommandBuilder = React.lazy(() => import('../components/CommandBuilder'));

export const TOOL_CATEGORIES = {
    UTILITY: 'utility',
    SECURITY: 'security',
    NETWORK: 'network'
};

export const ToolRegistry = {
    // Utility Tools
    help: {
        id: 'help',
        label: 'System Manual',
        title: 'Help & Documentation',
        icon: FileText, // Or HelpCircle if imported
        component: HelpViewer,
        category: TOOL_CATEGORIES.UTILITY,
        commands: ['help', 'man', 'docs', 'info', 'faq'],
        usage: 'help <topic>'
    },
    notepad: {
        id: 'notepad',
        label: 'Notepad',
        title: 'Scratchpad',
        icon: Scroll,
        component: Notepad,
        category: TOOL_CATEGORIES.UTILITY,
        commands: ['note', 'write', 'text', 'scratch'],
        usage: 'note <text>'
    },
    ticket: {
        id: 'ticket',
        label: 'Ticket Scribe',
        title: 'Ticket Scribe',
        icon: Search,
        component: TicketScribe,
        category: TOOL_CATEGORIES.UTILITY,
        commands: ['ticket', 'scribe', 'report', 'issue'],
        usage: 'ticket <subject>'
    },
    passgen: {
        id: 'passgen',
        label: 'Password Gen',
        title: 'Password Forge',
        description: 'Template-based generator. Tokens: Wwww/wwww (words), #### (digits), **** (specials), ???? (alphanum). Spaces and other chars are preserved.',
        icon: Key,
        component: PasswordGen,
        category: TOOL_CATEGORIES.UTILITY,
        commands: ['pass', 'gen', 'secret', 'key'],
        usage: 'pass <length> OR <template>'
    },
    mac: {
        id: 'mac',
        label: 'MAC Lookup',
        title: 'MAC Address Lookup',
        icon: Search,
        component: MacLookup,
        category: TOOL_CATEGORIES.UTILITY,
        commands: ['mac', 'oui', 'vendor'],
        usage: 'mac <address>'
    },

    // Security Tools
    smelter: {
        id: 'smelter',
        label: 'Log Analyzer',
        title: 'Smelting Chamber',
        icon: Flame,
        component: SmeltingChamber,
        category: TOOL_CATEGORIES.SECURITY,
        commands: ['log', 'syslog', 'analyze', 'smelt'],
        usage: 'log <text>'
    },
    scan: {
        id: 'scan',
        label: 'Target Scanner',
        title: 'Vulnerability Scanner',
        icon: Sword,
        component: NetworkScanner,
        category: TOOL_CATEGORIES.SECURITY,
        commands: ['scan', 'nmap', 'ping', 'recon'],
        usage: 'scan <ip/domain>'
    },
    email: {
        id: 'email',
        label: 'Email Tracer',
        title: 'Header Visualizer',
        icon: Eye,
        component: EmailForensics,
        category: TOOL_CATEGORIES.SECURITY,
        commands: ['email', 'header', 'trace', 'smtp'],
        usage: 'email <header_text>'
    },

    // Network Tools
    subnet: {
        id: 'subnet',
        label: 'Subnet Calc',
        title: 'Subnet Calculator',
        icon: Compass,
        component: SubnetCalculator,
        category: TOOL_CATEGORIES.NETWORK,
        commands: ['calc', 'subnet', 'cidr', 'ip'],
        usage: 'calc <cidr>'
    },
    dns: {
        id: 'dns',
        label: 'DNS Intel',
        title: 'DNS Intelligence',
        icon: MapPin,
        component: DnsIntel,
        category: TOOL_CATEGORIES.NETWORK,
        commands: ['dns', 'dig', 'nslookup', 'whois'],
        usage: 'dns <domain>'
    },
    age: {
        id: 'age',
        label: 'Domain Age',
        title: 'Domain Age Recon',
        icon: Hourglass,
        component: DomainAge,
        category: TOOL_CATEGORIES.NETWORK,
        commands: ['age', 'old', 'whois', 'created'],
        usage: 'age <domain>'
    },
    build: {
        id: 'build',
        label: 'Concept Builder',
        title: 'Command Construction Kit',
        description: 'Builder for complex PowerShell and CMD commands. Includes templates for AD, Network, and System tasks.',
        icon: Terminal,
        component: CommandBuilder,
        category: TOOL_CATEGORIES.UTILITY,
        commands: ['build', 'cmd', 'ps1', 'construct'],
        usage: 'build <search>'
    },
};

export const getToolById = (id) => ToolRegistry[id];
export const getAllTools = () => Object.values(ToolRegistry);
export const getToolsByCategory = (category) => Object.values(ToolRegistry).filter(t => t.category === category);
