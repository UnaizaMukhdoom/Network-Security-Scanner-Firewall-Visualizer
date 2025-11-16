# Network Security Scanner & Firewall Visualizer

This is a lightweight prototype that demonstrates a network port scanner backend and a firewall rule simulator with a simple frontend visualizer.

Quick start (Windows PowerShell):

1. Create a virtual environment and activate it:

```powershell
python -m venv .venv; .\.venv\Scripts\Activate.ps1
```

2. Install dependencies:

```powershell
pip install -r requirements.txt
```

3. Run the app:

```powershell
python main.py
```

4. Open http://localhost:8000 in your browser.

Notes and assumptions:
- The scanner attempts to use `python-nmap` if available (and nmap installed on the system). If not, it falls back to a simple TCP connect scanner limited to the specified ports.
- UDP scanning and low-level SYN scans require `nmap` and appropriate privileges; the prototype uses simple TCP connects as a safe fallback.
- The firewall simulator supports basic allow/deny rules with optional src/dst/port/protocol and priority. Rules are evaluated in priority order.

Next steps you may want to add:
- Real-time updates via WebSocket
- Better UDP scanning using `scapy` or `nmap` when available
- Exporting/importing rule sets
- More advanced visualization (D3.js)
