export const SOP_DATA = [
    {
        id: 'incident-response',
        title: 'Incident Response 101',
        content: `# Incident Response Protocol

1. **Identification**: confirm the security event. verify scope.
2. **Containment**: Isolate affected systems (use the Smelting Chamber).
3. **Eradication**: Remove the threat (re-image, delete malware).
4. **Recovery**: Restore systems from clean backups.
5. **Lessons Learned**: Document everything in Ticket Scribe.

### Key Contacts
- SOC Manager: 555-0199
- Network Eng: 555-0123
`
    },
    {
        id: 'phishing',
        title: 'Phishing Analysis',
        content: `# Phishing Analysis Workflow

1. **Header Analysis**: Use 'Email Tracer' to visualize hops.
2. **Sender Verification**: Check SPF/DKIM/DMARC alignment.
3. **URL Analysis**: Scan links (do NOT click).
4. **Attachments**: Detonate in sandbox (not local).
5. **Verdict**: If malicious, purge from all mailboxes.
`
    },
    {
        id: 'vpc',
        title: 'VPC Setup Guide',
        content: `# Virtual Private Cloud Setup

- Use 10.0.0.0/16 for main block.
- Create public/private subnets.
- Use NAT Gateway for private outbound.
- restrictive Security Groups (default deny).
`
    }
];
