import socket
import re

# Try to import nmap; if not present we fallback to TCP socket scanning
try:
    import nmap
    HAVE_NMAP = True
except Exception:
    HAVE_NMAP = False

PORT_RANGE_RE = re.compile(r"^(\d+)-(\d+)$")

# Common port-to-service mapping for better service detection
COMMON_SERVICES = {
    20: 'ftp-data', 21: 'ftp', 22: 'ssh', 23: 'telnet', 25: 'smtp',
    53: 'dns', 80: 'http', 110: 'pop3', 143: 'imap', 443: 'https',
    445: 'smb', 465: 'smtps', 587: 'smtp', 993: 'imaps', 995: 'pop3s',
    1433: 'mssql', 1521: 'oracle', 3306: 'mysql', 3389: 'rdp',
    5432: 'postgresql', 5900: 'vnc', 6379: 'redis', 8080: 'http-proxy',
    8443: 'https-alt', 27017: 'mongodb', 9200: 'elasticsearch',
    9090: 'prometheus', 11211: 'memcached', 50000: 'db2'
}


def parse_ports(ports_str):
    ports = set()
    parts = ports_str.split(',')
    for p in parts:
        p = p.strip()
        m = PORT_RANGE_RE.match(p)
        if m:
            start = int(m.group(1))
            end = int(m.group(2))
            ports.update(range(start, end + 1))
        elif p.isdigit():
            ports.add(int(p))
    return sorted(ports)


def scan_target(target, ports_str="1-1024", scan_type="tcp_connect", timeout=1.0):
    """Scan the given target and return list of {ip, port, service, status}.
    scan_type: 'tcp_connect' (fallback), 'nmap_syn', 'nmap_udp' -- if nmap available those will be used.
    """
    ports = parse_ports(ports_str)
    results = []
    if HAVE_NMAP and scan_type.startswith('nmap'):
        scanner = nmap.PortScanner()
        # build port string
        port_string = ','.join(str(p) for p in ports)
        nm_scan_type = "-sS" if scan_type == 'nmap_syn' else "-sU" if scan_type == 'nmap_udp' else ""
        # run scan
        scanner.scan(hosts=target, ports=port_string, arguments=nm_scan_type + ' -T4')
        for host in scanner.all_hosts():
            for proto in scanner[host].all_protocols():
                lports = scanner[host][proto].keys()
                for p in sorted(lports):
                    info = scanner[host][proto][p]
                    results.append({
                        "ip": host,
                        "port": p,
                        "service": info.get('name', ''),
                        "status": info.get('state', '')
                    })
        return results

    # Fallback simple TCP connect scanner
    try:
        addr = socket.gethostbyname(target)
    except Exception:
        addr = target
    for p in ports:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(timeout)
        try:
            res = s.connect_ex((addr, p))
            # Get service name regardless of port status
            service = COMMON_SERVICES.get(p)
            if not service:
                try:
                    service = socket.getservbyport(p)
                except Exception:
                    service = 'unknown'
            
            if res == 0:
                status = 'open'
            else:
                status = 'closed'
        except Exception:
            status = 'error'
            service = COMMON_SERVICES.get(p, 'unknown')
        finally:
            s.close()
        results.append({"ip": addr, "port": p, "service": service, "status": status})
    return results
