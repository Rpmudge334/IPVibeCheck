export const WORKER_CODE = `
    self.onmessage = function(e) {
        const { text, isPrivateIPSource } = e.data;
        try {
            const lines = text.replace(/\\r\\n/g, "\\n").replace(/\\r/g, "\\n").split('\\n');
            if (lines.length > 500000) throw new Error("Line limit exceeded (Max 500k lines)");
            
            const parsed = [];
            const IP_REGEX_GLOBAL = /(\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3})/g;
            const PORT_REGEX = /(?:dst_port|dport|port|service)[:=]\\s?(\\d+)/i;

            lines.forEach((line, index) => {
                if (!line.trim()) return;
                IP_REGEX_GLOBAL.lastIndex = 0;
                const ips = line.match(IP_REGEX_GLOBAL);
                const portMatch = line.match(PORT_REGEX);
                if (ips && ips.length >= 2) {
                    parsed.push({ 
                        id: index,
                        src: ips[0], 
                        dst: ips[1], 
                        port: portMatch ? portMatch[1] : 'Unknown',
                        raw: line.substring(0, 200) // Truncate to save memory
                    });
                }
            });

            if (parsed.length === 0) {
                self.postMessage({ error: "No IP addresses found.", debugLines: lines.slice(0, 5) });
                return;
            }

            // Aggregation
            const attackers = {};
            // Re-implement isPrivateIP inside worker as it doesn't have access to main scope imports
            const isPrivate = (ip) => {
                const p = ip.split('.').map(Number);
                if (p[0] === 10) return true;
                if (p[0] === 172 && p[1] >= 16 && p[1] <= 31) return true;
                if (p[0] === 192 && p[1] === 168) return true;
                if (p[0] === 127 || p[0] === 0 || p[0] >= 224) return true;
                return false;
            };

            parsed.forEach(log => {
                if (isPrivate(log.src)) return; 
                if (!attackers[log.src]) attackers[log.src] = { ip: log.src, count: 0, ports: [], destinations: [], riskScore: 0, flags: [] };
                attackers[log.src].count++;
                if(!attackers[log.src].ports.includes(log.port)) attackers[log.src].ports.push(log.port);
                if(!attackers[log.src].destinations.includes(log.dst)) attackers[log.src].destinations.push(log.dst);
            });

            const analyze = Object.values(attackers).map(attacker => {
                let score = 0;
                if (attacker.count > 100) { score += 20; attacker.flags.push("High Vol"); }
                attacker.ports.forEach(p => {
                    const port = parseInt(p);
                    if ([3389, 5900].includes(port)) { score += 50; if(!attacker.flags.includes("RDP/VNC")) attacker.flags.push("RDP/VNC"); }
                    else if ([445, 139].includes(port)) { score += 30; if(!attacker.flags.includes("SMB")) attacker.flags.push("SMB"); }
                });
                if (attacker.destinations.length > 5) { score += 40; attacker.flags.push("Horiz. Scan"); }
                attacker.riskScore = score;
                return attacker;
            }).sort((a, b) => b.riskScore - a.riskScore);

            self.postMessage({ success: true, logs: parsed, analyzedData: analyze });
        } catch (err) {
            self.postMessage({ error: err.message });
        }
    };
`;
