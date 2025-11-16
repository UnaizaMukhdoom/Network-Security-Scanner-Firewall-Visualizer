# Network Security Scanner & Firewall Visualizer
## Project Report

---

## 1. PROJECT OVERVIEW

### 1.1 Project Title
**Network Security Scanner & Firewall Visualizer**

### 1.2 Project Description
A web-based network security tool that enables users to scan networks for open ports, identify running services, and simulate firewall rule behavior with visual traffic flow representation.

### 1.3 Objectives
- Develop a user-friendly network port scanner
- Implement a firewall rule simulation engine
- Create visual representations of network traffic decisions
- Provide both GUI and backend functionality for security analysis

### 1.4 Technologies Used
- **Backend:** Python 3.13, FastAPI, Uvicorn
- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **UI Framework:** Material Design Components (MDC Web)
- **Libraries:** python-nmap, socket, pydantic
- **Testing:** pytest
- **Version Control:** Git, GitHub

---

## 2. SYSTEM ARCHITECTURE

### 2.1 Architecture Overview
The system follows a client-server architecture with a RESTful API design:

```
┌─────────────────┐         HTTP/REST API        ┌─────────────────┐
│                 │ ◄──────────────────────────► │                 │
│  Web Browser    │                               │  FastAPI Server │
│  (Frontend)     │         JSON Responses        │  (Backend)      │
│                 │ ◄──────────────────────────── │                 │
└─────────────────┘                               └─────────────────┘
        │                                                  │
        │                                                  │
        ▼                                                  ▼
┌─────────────────┐                               ┌─────────────────┐
│ Material Design │                               │  Scanner Module │
│   Components    │                               │ Firewall Module │
│   Visualizer    │                               │  Rule Engine    │
└─────────────────┘                               └─────────────────┘
```

### 2.2 Component Breakdown

#### Backend Components
1. **main.py** - FastAPI application server
   - Serves static frontend files
   - Exposes REST API endpoints
   - Handles request routing and validation

2. **scanner.py** - Port scanning engine
   - TCP Connect scanning (fallback)
   - Nmap integration (optional)
   - Service detection for 30+ common ports
   - Configurable timeout and port ranges

3. **firewall.py** - Firewall simulation engine
   - Rule-based traffic filtering
   - Priority-based rule evaluation
   - Support for allow/deny actions
   - IP, port, and protocol filtering

#### Frontend Components
1. **index.html** - Material Design UI structure
   - Responsive layout with cards
   - Form inputs with validation
   - Data tables for results
   - SVG canvas for visualization

2. **style.css** - Modern styling
   - Cyan/teal color scheme
   - Gradient backgrounds
   - Responsive grid layouts
   - Material elevation and shadows

3. **app.js** - Client-side logic
   - API communication via fetch
   - Dynamic UI updates
   - SVG traffic flow visualization
   - Form handling and validation

---

## 3. FEATURES IMPLEMENTATION

### 3.1 Port Scanner

#### Functionality
- Scans specified IP addresses or hostnames
- Supports individual ports or port ranges (e.g., "22,80,443" or "1-1024")
- Three scan types:
  - **TCP Connect:** Standard socket-based scanning
  - **Nmap SYN:** Fast SYN scan (requires Nmap)
  - **Nmap UDP:** UDP port scanning (requires Nmap)

#### Service Detection
Common services automatically identified:
- ssh (22), http (80), https (443)
- mysql (3306), postgresql (5432), mongodb (27017)
- redis (6379), elasticsearch (9200)
- And 20+ more common services

#### API Endpoint
```
POST /api/scan
Body: {
  "target": "127.0.0.1",
  "scan_type": "tcp_connect",
  "ports": "22,80,443"
}
```

### 3.2 Firewall Simulator

#### Functionality
- Create allow/deny rules with priority
- Filter by source IP, destination IP, port, and protocol
- Priority-based rule evaluation (lower number = higher priority)
- Visual traffic flow diagram showing allowed/denied packets

#### Rule Structure
```python
{
  "id": 1,
  "action": "allow|deny",
  "src_ip": "10.0.0.1",
  "dst_ip": "192.168.1.1",
  "port": 80,
  "protocol": "tcp",
  "priority": 100
}
```

#### API Endpoint
```
POST /api/simulate
Body: {
  "traffic": [...],
  "rules": [...]
}
```

### 3.3 Traffic Visualizer

#### Visualization Features
- SVG-based flow diagram
- Color-coded traffic (green = allowed, red = denied)
- Source and destination representation
- Port and protocol labeling
- Real-time updates

---

## 4. USER INTERFACE

### 4.1 Design Principles
- **Material Design:** Google's design language for consistency
- **Responsive:** Adapts to different screen sizes
- **Accessibility:** Proper labels and ARIA attributes
- **Modern:** Gradients, shadows, and smooth transitions

### 4.2 Color Scheme
- **Primary:** Cyan (#00bcd4)
- **Secondary:** Orange (#ff6f00)
- **Background:** Light cyan (#e0f7fa)
- **Status Colors:**
  - Open: Green (#00c853)
  - Closed: Blue-gray (#78909c)
  - Error: Orange (#ff6f00)

### 4.3 User Workflow
1. Enter target IP/hostname
2. Select scan type and port range
3. Click "Start Scan" → View results in table
4. Create firewall rules with priority
5. Click "Simulate Demo Traffic" → View visual flow

---

## 5. TESTING

### 5.1 Unit Tests
Located in `tests/test_firewall.py`:

**Test Cases:**
1. `test_allow_rule()` - Verifies allow rule functionality
2. `test_deny_rule_priority()` - Tests priority-based rule evaluation

**Test Results:**
```
======================== test session starts ========================
tests/test_firewall.py::test_allow_rule PASSED                 [ 50%]
tests/test_firewall.py::test_deny_rule_priority PASSED         [100%]
========================= 2 passed in 0.52s =========================
```

### 5.2 Manual Testing
- Localhost scanning (127.0.0.1:8000) - ✅ PASSED
- Service detection for common ports - ✅ PASSED
- Firewall rule creation and evaluation - ✅ PASSED
- Traffic visualization rendering - ✅ PASSED
- Responsive design on mobile/tablet - ✅ PASSED

---

## 6. INSTALLATION & SETUP

### 6.1 Prerequisites
- Python 3.13 or higher
- pip (Python package manager)
- Modern web browser (Chrome, Firefox, Edge)

### 6.2 Installation Steps

1. **Clone the repository:**
```bash
git clone https://github.com/UnaizaMukhdoom/Network-Security-Scanner-Firewall-Visualizer.git
cd Network-Security-Scanner-Firewall-Visualizer
```

2. **Create virtual environment:**
```bash
python -m venv .venv
.\.venv\Scripts\Activate.ps1  # Windows PowerShell
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Run the application:**
```bash
python main.py
```

5. **Access the application:**
Open browser to: http://localhost:8000

### 6.3 Dependencies
```
fastapi==0.121.2
uvicorn==0.38.0
python-nmap==0.7.1
pydantic==2.12.4
pytest==9.0.1
```

---

## 7. USAGE GUIDE

### 7.1 Scanning Networks

**Example 1: Scan localhost**
- Target: `127.0.0.1`
- Ports: `8000,80,443,3306`
- Scan Type: TCP Connect
- Result: Shows which ports are open/closed

**Example 2: Scan external server**
- Target: `scanme.nmap.org`
- Ports: `22,80,443`
- Scan Type: TCP Connect
- Result: Identifies running services

### 7.2 Creating Firewall Rules

**Example Rule 1: Allow SSH from specific IP**
- Action: Allow
- Source IP: 10.0.0.5
- Port: 22
- Protocol: TCP
- Priority: 50

**Example Rule 2: Deny all HTTP**
- Action: Deny
- Port: 80
- Protocol: TCP
- Priority: 100

### 7.3 Simulating Traffic
1. Add multiple firewall rules
2. Click "Simulate Demo Traffic"
3. View visual representation of allowed/denied packets

---

## 8. SECURITY CONSIDERATIONS

### 8.1 Scanning Ethics
- **Only scan authorized networks**
- Unauthorized port scanning may be illegal
- Use `scanme.nmap.org` for testing
- Respect rate limits and terms of service

### 8.2 Application Security
- Input validation on all API endpoints
- Timeout limits on socket connections
- No sensitive data storage
- CORS configuration for production deployment

### 8.3 Limitations
- TCP Connect scanning is detectable (full handshake)
- Closed ports may trigger IDS/IPS alerts
- UDP scanning unreliable without Nmap
- No authentication/authorization (demo only)

---

## 9. FUTURE ENHANCEMENTS

### 9.1 Planned Features
1. **Real-time Updates:** WebSocket integration for live scanning
2. **Advanced Scanning:** OS detection, service version detection
3. **Export Functionality:** PDF reports, CSV exports
4. **Rule Management:** Import/export rule sets
5. **Multi-target Scanning:** Scan multiple IPs simultaneously
6. **Historical Data:** Save and compare scan results
7. **Authentication:** User login and session management
8. **Advanced Visualization:** D3.js charts and graphs

### 9.2 Performance Improvements
- Async scanning with concurrent connections
- Caching mechanism for frequent scans
- Database integration for persistent storage
- Load balancing for high-traffic scenarios

---

## 10. CHALLENGES & SOLUTIONS

### 10.1 Challenge: Service Detection Accuracy
**Problem:** Python's `socket.getservbyport()` only recognizes limited services

**Solution:** Created a comprehensive dictionary mapping 30+ common ports to their services, with fallback to system database

### 10.2 Challenge: Material Design Integration
**Problem:** Complex MDC Web component initialization

**Solution:** Implemented proper initialization sequence in JavaScript with timeout handling for dynamic elements

### 10.3 Challenge: Cross-platform Compatibility
**Problem:** PowerShell execution policy blocking virtual environment activation

**Solution:** Used direct Python executable path instead of activation scripts

---

## 11. LEARNING OUTCOMES

### 11.1 Technical Skills Developed
- FastAPI framework and RESTful API design
- Material Design implementation
- Socket programming and network protocols
- Python type hints with Pydantic
- Git version control and GitHub workflow

### 11.2 Conceptual Understanding
- Network security fundamentals
- Port scanning techniques
- Firewall rule evaluation logic
- Client-server architecture
- Responsive web design principles

---

## 12. CONCLUSION

### 12.1 Project Summary
Successfully developed a full-stack network security tool combining:
- Functional port scanning capabilities
- Intelligent firewall simulation
- Modern, responsive user interface
- Comprehensive testing and documentation

### 12.2 Key Achievements
✅ Complete implementation of all core requirements
✅ Modern Material Design UI with cyan/teal theme
✅ Enhanced service detection for 30+ common ports
✅ Priority-based firewall rule engine
✅ Visual traffic flow representation
✅ Unit tests with 100% pass rate
✅ Successfully deployed to GitHub

### 12.3 Impact
This project demonstrates practical application of:
- Network security concepts
- Full-stack web development
- Modern UI/UX design
- Software testing best practices
- Professional documentation

---

## 13. REFERENCES

### 13.1 Documentation
- FastAPI: https://fastapi.tiangolo.com/
- Material Design: https://material.io/develop/web
- Python Socket Programming: https://docs.python.org/3/library/socket.html
- Nmap: https://nmap.org/book/man.html

### 13.2 Tools & Libraries
- python-nmap: https://pypi.org/project/python-nmap/
- Pydantic: https://docs.pydantic.dev/
- pytest: https://docs.pytest.org/
- Uvicorn: https://www.uvicorn.org/

---

## 14. PROJECT METADATA

**Author:** Unaiza Mukhdoom
**GitHub Repository:** https://github.com/UnaizaMukhdoom/Network-Security-Scanner-Firewall-Visualizer
**Date:** November 2025
**Version:** 1.0.0
**License:** Open Source

**Project Statistics:**
- Total Files: 10
- Lines of Code: ~997
- Python Files: 4
- Frontend Files: 3
- Test Files: 1
- Dependencies: 5

---

*This project was developed as a demonstration of network security tools and web development capabilities.*
