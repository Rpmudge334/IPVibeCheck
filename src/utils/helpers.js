export const IP_REGEX_GLOBAL = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/g;
export const PORT_REGEX = /(?:dst_port|dport|port)[:=]\s?(\d+)/i;

export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const isIP = (str) => {
    if (!/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(str)) return false;
    return str.split('.').every(octet => {
        const num = parseInt(octet, 10);
        return num >= 0 && num <= 255;
    });
};

export const isPrivateIP = (ip) => {
    const parts = ip.split('.').map(Number);
    if (parts[0] === 10) return true;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;
    if (parts[0] === 127) return true;
    if (parts[0] === 169 && parts[1] === 254) return true;
    if (parts[0] === 100 && (parts[1] >= 64 && parts[1] <= 127)) return true;
    if (parts[0] >= 224) return true;
    if (parts[0] === 0) return true;
    return false;
};

export const copyToClipboard = (text, onCopy) => {
    navigator.clipboard.writeText(text);
    if (onCopy) onCopy("Copied to clipboard!");
};
