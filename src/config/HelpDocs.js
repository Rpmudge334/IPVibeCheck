export const HELP_DOCS = [
    {
        id: 'license',
        title: 'LICENSE / LEGAL',
        content: `# PROPRIETARY LICENSE

**Copyright © 2025 Ryan Mudge. All Rights Reserved.**

This software, including all source code, binaries, documentation, and design assets ("The Software"), is the exclusive property of Ryan Mudge.

### STRICTLY PROHIBITED ACTIONS
1.  **No Redistribution**: You may not distribute, sub-license, rent, lease, or lend The Software to any third party.
2.  **No Modification**: You may not modify, reverse engineer, decompile, or disassemble The Software.
3.  **No Commercial Use**: This Software is for private, authorized use only.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
`
    },
    {
        id: 'smelter',
        title: 'Smelting Chamber (Log Analyzer)',
        content: `# Smelting Chamber

**Purpose**: High-speed log analysis and threat detection.

### How to Use
1.  Upload a CSV file containing firewall or access logs.
2.  Map the columns (or ensure headers are standard).
3.  The system will process the logs against **AbuseIPDB**.
4.  "Impurities" (Threats) will be flagged red/orange.

### Limitations
- Requires a valid API Key.
- Rate limited to 1000 IPs/day on free tier.
`
    },
    {
        id: 'scanner',
        title: 'Network Scanner',
        content: `# Network Scanner (VibeCheck)

**Purpose**: Active reconnaissance of target subnets.

### How to Use
1.  Enter a Target IP or CIDR (e.g., \`192.168.1.0/24\`).
2.  Select Port Range (Top 100, Full 65k).
3.  Execute Scan.

### Limitations
- **Active Scanning**: This generates noise. Do not use on unauthorized networks.
- Browser-based scans (if applicable) are limited by CORS. Backend scans are preferred.
`
    },
    {
        id: 'email',
        title: 'Email Tracer',
        content: `# Email Tracer

**Purpose**: Visualize email headers and hop paths.

### How to Use
1.  Paste the full raw email headers into the input.
2.  The tool parses \`Received\`, \`X-Originating-IP\`, and DKIM signatures.
3.  A map visualizes the geographical path of the email.

### Limitations
- Cannot verify manual spoofing of Received headers if DKIM is broken.
`
    },
    {
        id: 'utils',
        title: 'Utility Belt',
        content: `# Utility Tools

### Notepad
- **Persistence**: Content is saved automatically to local storage using the \`mithril_state\`.
- **Use Case**: Scratchpad for IPs, quick notes during investigations.

### Password Forge
- **Purpose**: Generate cryptographically strong credentials.
- **Config**: Toggle special chars, numbers, and length.

### MAC Lookup
- **Purpose**: Identify device manufacturer (OUI lookup).
- **Input**: accepts \`:\`, \`-\`, or \`no separator formats.
`
    }
];
