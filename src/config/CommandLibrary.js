export const CMD_CATEGORIES = {
    AD: 'Active Directory',
    NET: 'Network',
    SYS: 'System',
    FILE: 'Filesystem',
    SEC: 'Security',
    PRN: 'Printers'
};

export const COMMAND_LIBRARY = [
    // --- Active Directory ---
    {
        id: 'ad-user-add',
        title: 'New AD User',
        platform: 'powershell',
        category: CMD_CATEGORIES.AD,
        description: 'Creates a new Active Directory user with standard parameters.',
        template: 'New-ADUser -Name "{name}" -GivenName "{first}" -Surname "{last}" -SamAccountName "{sam}" -UserPrincipalName "{sam}@{domain}" -Path "{ou}" -AccountPassword (ConvertTo-SecureString "{password}" -AsPlainText -Force) -Enabled ${enabled}',
        args: [
            { id: 'name', label: 'Display Name', type: 'text', placeholder: 'John Doe' },
            { id: 'first', label: 'First Name', type: 'text', placeholder: 'John' },
            { id: 'last', label: 'Last Name', type: 'text', placeholder: 'Doe' },
            { id: 'sam', label: 'SamAccountName', type: 'text', placeholder: 'jdoe' },
            { id: 'domain', label: 'Domain', type: 'text', placeholder: 'contoso.com' },
            { id: 'ou', label: 'OU Path', type: 'text', placeholder: 'OU=Users,DC=contoso,DC=com' },
            { id: 'password', label: 'Password', type: 'password', placeholder: 'Start123!' },
            { id: 'enabled', label: 'Enabled', type: 'select', options: ['$true', '$false'], default: '$true' }
        ]
    },
    {
        id: 'ad-group-add',
        title: 'New AD Group',
        platform: 'powershell',
        category: CMD_CATEGORIES.AD,
        description: 'Creates a new Security or Distribution group.',
        template: 'New-ADGroup -Name "{name}" -GroupScope {scope} -GroupCategory {category} -Path "{ou}" -Description "{desc}"',
        args: [
            { id: 'name', label: 'Group Name', type: 'text', placeholder: 'SG-Finance' },
            { id: 'scope', label: 'Scope', type: 'select', options: ['Global', 'Universal', 'DomainLocal'], default: 'Global' },
            { id: 'category', label: 'Type', type: 'select', options: ['Security', 'Distribution'], default: 'Security' },
            { id: 'ou', label: 'OU Path', type: 'text', placeholder: 'OU=Groups,DC=contoso,DC=com' },
            { id: 'desc', label: 'Description', type: 'text', placeholder: 'Finance Dept Users' }
        ]
    },

    // --- Network ---
    {
        id: 'net-firewall-rule',
        title: 'New Firewall Rule',
        platform: 'powershell',
        category: CMD_CATEGORIES.NET,
        description: 'Creates a new inbound or outbound firewall rule.',
        template: 'New-NetFirewallRule -DisplayName "{name}" -Direction {direction} -Action {action} -Protocol {protocol} -LocalPort {port}',
        args: [
            { id: 'name', label: 'Rule Name', type: 'text', placeholder: 'Allow Web 8080' },
            { id: 'direction', label: 'Direction', type: 'select', options: ['Inbound', 'Outbound'], default: 'Inbound' },
            { id: 'action', label: 'Action', type: 'select', options: ['Allow', 'Block'], default: 'Allow' },
            { id: 'protocol', label: 'Protocol', type: 'select', options: ['TCP', 'UDP', 'ICMPv4'], default: 'TCP' },
            { id: 'port', label: 'Port', type: 'text', placeholder: '8080' }
        ]
    },
    {
        id: 'net-test-conn',
        title: 'Test Port (TNC)',
        platform: 'powershell',
        category: CMD_CATEGORIES.NET,
        description: 'Tests a TCP connection to a remote server on a specific port.',
        template: 'Test-NetConnection -ComputerName {target} -Port {port} -InformationLevel Detailed',
        args: [
            { id: 'target', label: 'Hostname/IP', type: 'text', placeholder: '192.168.1.1' },
            { id: 'port', label: 'Port', type: 'number', placeholder: '443', default: '443' }
        ]
    },
    {
        id: 'ip-flush',
        title: 'Flush DNS',
        platform: 'cmd',
        category: CMD_CATEGORIES.NET,
        description: 'Clears the DNS resolver cache.',
        template: 'ipconfig /flushdns',
        args: []
    },

    // --- System ---
    {
        id: 'sys-service-restart',
        title: 'Restart Service',
        platform: 'powershell',
        category: CMD_CATEGORIES.SYS,
        description: 'Restarts a local or remote service.',
        template: 'Restart-Service -Name "{service}" -Force -Verbose',
        args: [
            { id: 'service', label: 'Service Name', type: 'text', placeholder: 'Spooler' }
        ]
    },
    {
        id: 'sys-process-kill',
        title: 'Kill Process',
        platform: 'powershell',
        category: CMD_CATEGORIES.SYS,
        description: 'Stops a process by name or ID.',
        template: 'Stop-Process -Name "{name}" -Force',
        args: [
            { id: 'name', label: 'Process Name', type: 'text', placeholder: 'notepad' }
        ]
    },
    {
        id: 'sys-sfc',
        title: 'SFC Scan',
        platform: 'cmd',
        category: CMD_CATEGORIES.SYS,
        description: 'Scans integrity of all protected system files and repairs files with problems.',
        template: 'sfc /scannow',
        args: []
    },
    {
        id: 'sys-dism',
        title: 'DISM Repair',
        platform: 'cmd',
        category: CMD_CATEGORIES.SYS,
        description: 'Fixes Windows Update and system image corruption.',
        template: 'DISM /Online /Cleanup-Image /{action}',
        args: [
            { id: 'action', label: 'Action', type: 'select', options: ['RestoreHealth', 'ScanHealth', 'CheckHealth', 'StartComponentCleanup'], default: 'RestoreHealth' }
        ]
    },
    {
        id: 'sys-shutdown',
        title: 'Remote Shutdown',
        platform: 'cmd',
        category: CMD_CATEGORIES.SYS,
        description: 'Initiates a shutdown/restart on a remote machine.',
        template: 'shutdown /m \\\\{computer} /{action} /t {time} /f /c "{comment}"',
        args: [
            { id: 'computer', label: 'Computer Name', type: 'text', placeholder: 'WORKSTATION-01' },
            { id: 'action', label: 'Action', type: 'select', options: ['r', 's'], default: 'r' },
            { id: 'time', label: 'Delay (sec)', type: 'number', placeholder: '60', default: '0' },
            { id: 'comment', label: 'Message', type: 'text', placeholder: 'Maintenance restart' }
        ]
    },

    // --- Security ---
    {
        id: 'sec-net-user',
        title: 'Create Local User',
        platform: 'cmd',
        category: CMD_CATEGORIES.SEC,
        description: 'Creates a local user account.',
        template: 'net user {username} {password} /add /active:yes /expires:{expires}',
        args: [
            { id: 'username', label: 'Username', type: 'text', placeholder: 'jdoe' },
            { id: 'password', label: 'Password', type: 'password', placeholder: 'SecurePass123!' },
            { id: 'expires', label: 'Expires', type: 'select', options: ['never', 'date'], default: 'never' }
        ]
    },
    {
        id: 'sec-local-group',
        title: 'Add to Local Admin',
        platform: 'cmd',
        category: CMD_CATEGORIES.SEC,
        description: 'Adds a user to the local Administrators group.',
        template: 'net localgroup Administrators {username} /add',
        args: [
            { id: 'username', label: 'Username', type: 'text', placeholder: 'domain\\jdoe' }
        ]
    },
    {
        id: 'sec-local-pass',
        title: 'Reset Local Password',
        platform: 'cmd',
        category: CMD_CATEGORIES.SEC,
        description: 'Resets a local user password.',
        template: 'net user {username} {password}',
        args: [
            { id: 'username', label: 'Username', type: 'text', placeholder: 'Administrator' },
            { id: 'password', label: 'New Password', type: 'password', placeholder: 'NewPass123!' }
        ]
    },
    {
        id: 'sec-bitlocker-get',
        title: 'Get BitLocker Key (PS)',
        platform: 'powershell',
        category: CMD_CATEGORIES.SEC,
        description: 'Retrieves the BitLocker recovery password for a specific mount point.',
        template: 'Get-BitLockerVolume -MountPoint "{drive}" | Select-Object -ExpandProperty KeyProtector | Where-Object { $_.KeyProtectorType -eq "RecoveryPassword" }',
        args: [
            { id: 'drive', label: 'Drive Letter', type: 'text', placeholder: 'C:', default: 'C:' }
        ]
    },
    {
        id: 'sec-bde-protectors',
        title: 'Get BitLocker Key (CMD)',
        platform: 'cmd',
        category: CMD_CATEGORIES.SEC,
        description: 'Retrieves BitLocker recovery keys using manage-bde.',
        template: 'manage-bde -protectors -get {drive}',
        args: [
            { id: 'drive', label: 'Drive Letter', type: 'text', placeholder: 'C:', default: 'C:' }
        ]
    },
    {
        id: 'sec-tscon-hijack',
        title: 'TSCON Session Swap',
        platform: 'cmd',
        category: CMD_CATEGORIES.SEC,
        description: 'Connects a specific session to the console or another session (requires SYSTEM).',
        template: 'tscon {id} /dest:{dest}',
        args: [
            { id: 'id', label: 'Session ID', type: 'number', placeholder: '1' },
            { id: 'dest', label: 'Destination', type: 'text', placeholder: 'console', default: 'console' }
        ]
    },

    // --- Networking (Expanded) ---
    {
        id: 'net-stat-find',
        title: 'Netstat Port Find',
        platform: 'cmd',
        category: CMD_CATEGORIES.NET,
        description: 'Finds active connections on a specific port.',
        template: 'netstat -ano | findstr :{port}',
        args: [
            { id: 'port', label: 'Port Number', type: 'number', placeholder: '443' }
        ]
    },
    {
        id: 'net-ip-full',
        title: 'IP Config All',
        platform: 'cmd',
        category: CMD_CATEGORIES.NET,
        description: 'Displays full TCP/IP configuration.',
        template: 'ipconfig /all',
        args: []
    },
    {
        id: 'net-ssh',
        title: 'SSH Connect',
        platform: 'cmd',
        category: CMD_CATEGORIES.NET,
        description: 'Initiates a Secure Shell connection.',
        template: 'ssh {user}@{host} -p {port}',
        args: [
            { id: 'user', label: 'Username', type: 'text', placeholder: 'root' },
            { id: 'host', label: 'Hostname/IP', type: 'text', placeholder: '192.168.1.10' },
            { id: 'port', label: 'Port', type: 'number', placeholder: '22', default: '22' }
        ]
    },

    // --- Disk / Filesystem ---
    {
        id: 'fs-robocopy',
        title: 'Robocopy Mirror',
        platform: 'cmd',
        category: CMD_CATEGORIES.FILE,
        description: 'Robust File Copy in Mirror mode (Exact replica).',
        template: 'robocopy "{source}" "{dest}" /MIR /MT:32 /R:3 /W:1 /LOG:"{log}"',
        args: [
            { id: 'source', label: 'Source Path', type: 'text', placeholder: 'C:\\Source' },
            { id: 'dest', label: 'Destination Path', type: 'text', placeholder: 'D:\\Backup' },
            { id: 'log', label: 'Log File', type: 'text', placeholder: 'C:\\logs\\robo.log' }
        ]
    },
    {
        id: 'fs-get-disk',
        title: 'Get Disk Info',
        platform: 'powershell',
        category: CMD_CATEGORIES.FILE,
        description: 'Lists all visible disks and their operational status.',
        template: 'Get-Disk | Format-Table -AutoSize',
        args: []
    },
    // --- Network Drives ---
    {
        id: 'net-use-map',
        title: 'Map Network Drive',
        platform: 'cmd',
        category: CMD_CATEGORIES.NET,
        description: 'Maps a network share to a drive letter.',
        template: 'net use {drive} {path} /user:{user} {password} /persistent:{persistent}',
        args: [
            { id: 'drive', label: 'Drive', type: 'text', placeholder: 'Z:', default: 'Z:' },
            { id: 'path', label: 'UNC Path', type: 'text', placeholder: '\\\\server\\share' },
            { id: 'user', label: 'Username', type: 'text', placeholder: 'domain\\user' },
            { id: 'password', label: 'Password', type: 'password', placeholder: 'Input password or *' },
            { id: 'persistent', label: 'Persistent', type: 'select', options: ['yes', 'no'], default: 'yes' }
        ]
    },
    {
        id: 'net-use-delete',
        title: 'Unmap Drive',
        platform: 'cmd',
        category: CMD_CATEGORIES.NET,
        description: 'Disconnects a mapped network drive.',
        template: 'net use {drive} /delete',
        args: [
            { id: 'drive', label: 'Drive', type: 'text', placeholder: 'Z:', default: 'Z:' }
        ]
    },

    // --- Networking (Advanced) ---
    {
        id: 'net-dns-set',
        title: 'Set Static DNS',
        platform: 'powershell',
        category: CMD_CATEGORIES.NET,
        description: 'Configures specific DNS servers for a network adapter.',
        template: 'Set-DnsClientServerAddress -InterfaceAlias "{alias}" -ServerAddresses ("{primary}","{secondary}")',
        args: [
            { id: 'alias', label: 'Interface Name', type: 'text', placeholder: 'Ethernet' },
            { id: 'primary', label: 'Primary DNS', type: 'text', placeholder: '8.8.8.8' },
            { id: 'secondary', label: 'Secondary DNS', type: 'text', placeholder: '8.8.4.4' }
        ]
    },
    {
        id: 'net-ip-renew',
        title: 'Renew IP',
        platform: 'cmd',
        category: CMD_CATEGORIES.NET,
        description: 'Releases and renews the IP address.',
        template: 'ipconfig /release & ipconfig /renew',
        args: []
    },

    // --- Printers ---
    {
        id: 'prn-add-net',
        title: 'Add Network Printer',
        platform: 'powershell',
        category: CMD_CATEGORIES.PRN,
        description: 'Adds a shared network printer.',
        template: 'Add-Printer -ConnectionName "{path}"',
        args: [
            { id: 'path', label: 'Printer Path', type: 'text', placeholder: '\\\\printserver\\HPLaserJet' }
        ]
    },
    {
        id: 'prn-list',
        title: 'List Printers',
        platform: 'powershell',
        category: CMD_CATEGORIES.PRN,
        description: 'Lists all installed printers.',
        template: 'Get-Printer | Format-Table Name,DriverName,PortName -AutoSize',
        args: []
    },
    {
        id: 'prn-ui-server',
        title: 'Print Server Props',
        platform: 'cmd',
        category: CMD_CATEGORIES.PRN,
        description: 'Opens Print Server Properties (legacy UI).',
        template: 'rundll32 printui.dll,PrintUIEntry /s /t2 /n "{server}"',
        args: [
            { id: 'server', label: 'Server (Optional)', type: 'text', placeholder: '\\\\PrintServer' }
        ]
    }
];
