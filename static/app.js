// Initialize Material Design Components
document.addEventListener('DOMContentLoaded', () => {
  // Initialize all text fields
  document.querySelectorAll('.mdc-text-field').forEach(el => {
    mdc.textField.MDCTextField.attachTo(el);
  });

  // Initialize all select fields
  const selects = [];
  document.querySelectorAll('.mdc-select').forEach(el => {
    const select = new mdc.select.MDCSelect(el);
    selects.push(select);
  });

  // Initialize all buttons
  document.querySelectorAll('.mdc-button').forEach(el => {
    mdc.ripple.MDCRipple.attachTo(el);
  });

  // Set default values for selects
  setTimeout(() => {
    const scanTypeSelect = selects.find(s => s.root.querySelector('#scanType'));
    if (scanTypeSelect) scanTypeSelect.value = 'tcp_connect';
    
    const ruleActionSelect = selects.find(s => s.root.querySelector('#ruleAction'));
    if (ruleActionSelect) ruleActionSelect.value = 'allow';
    
    const ruleProtoSelect = selects.find(s => s.root.querySelector('#ruleProto'));
    if (ruleProtoSelect) ruleProtoSelect.value = 'tcp';
  }, 100);
});

const startScanBtn = document.getElementById('startScan');
const resultsTbody = document.querySelector('#resultsTable tbody');
const targetInput = document.getElementById('target');
const portsInput = document.getElementById('ports');

const addRuleBtn = document.getElementById('addRule');
const ruleListEl = document.getElementById('ruleList');
let rules = [];
let ruleIdCounter = 1;

function getScanType() {
  const select = document.querySelector('.mdc-select');
  return select ? select.querySelector('.mdc-select__selected-text').textContent.includes('SYN') ? 'nmap_syn' : 
                  select.querySelector('.mdc-select__selected-text').textContent.includes('UDP') ? 'nmap_udp' : 'tcp_connect' : 'tcp_connect';
}

function getRuleAction() {
  const actionSelect = document.querySelectorAll('.mdc-select')[1];
  return actionSelect && actionSelect.querySelector('.mdc-select__selected-text').textContent.toLowerCase().includes('deny') ? 'deny' : 'allow';
}

function getRuleProto() {
  const protoSelect = document.querySelectorAll('.mdc-select')[2];
  return protoSelect && protoSelect.querySelector('.mdc-select__selected-text').textContent.toLowerCase().includes('udp') ? 'udp' : 'tcp';
}

startScanBtn.addEventListener('click', async () => {
  const payload = {
    target: targetInput.value,
    scan_type: getScanType(),
    ports: portsInput.value
  };
  resultsTbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:24px;"><i class="material-icons rotating">sync</i> Scanning…</td></tr>';
  try {
    const res = await fetch('/api/scan', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)});
    const data = await res.json();
    renderResults(data.results || []);
  } catch (err) {
    resultsTbody.innerHTML = '<tr><td colspan="4" style="color:#f44336; text-align:center; padding:24px;">Error: '+err.message+'</td></tr>';
  }
});

function renderResults(results){
  resultsTbody.innerHTML = '';
  if (results.length === 0) {
    resultsTbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:24px; color:#9e9e9e;">No results</td></tr>';
    return;
  }
  results.forEach(r => {
    const tr = document.createElement('tr');
    const statusClass = r.status === 'open' ? 'status-open' : r.status === 'closed' ? 'status-closed' : 'status-error';
    tr.innerHTML = `<td>${r.ip}</td><td>${r.port}</td><td>${r.service || '<em>unknown</em>'}</td><td class="${statusClass}">${r.status.toUpperCase()}</td>`;
    resultsTbody.appendChild(tr);
  });
}

addRuleBtn.addEventListener('click', () => {
  const action = getRuleAction();
  const src = document.getElementById('ruleSrc').value || null;
  const dst = document.getElementById('ruleDst').value || null;
  const port = document.getElementById('rulePort').value ? parseInt(document.getElementById('rulePort').value, 10) : null;
  const proto = getRuleProto();
  const priority = parseInt(document.getElementById('rulePriority').value, 10) || 100;
  const rule = {id: ruleIdCounter++, action, src_ip: src, dst_ip: dst, port, protocol: proto, priority};
  rules.push(rule);
  renderRules();
  
  // Clear inputs
  document.getElementById('ruleSrc').value = '';
  document.getElementById('ruleDst').value = '';
  document.getElementById('rulePort').value = '';
  document.getElementById('rulePriority').value = '100';
});

function renderRules(){
  ruleListEl.innerHTML = '';
  if (rules.length === 0) {
    const li = document.createElement('li');
    li.className = 'mdc-list-item';
    li.style.color = '#9e9e9e';
    li.style.textAlign = 'center';
    li.innerHTML = '<span class="mdc-list-item__text">No rules added yet</span>';
    ruleListEl.appendChild(li);
    return;
  }
  rules.sort((a, b) => a.priority - b.priority).forEach(r=>{
    const li = document.createElement('li');
    li.className = 'mdc-list-item mdc-list-item--with-leading-icon';
    const icon = r.action === 'allow' ? '<i class="material-icons" style="color:#4caf50;">check_circle</i>' : '<i class="material-icons" style="color:#f44336;">block</i>';
    li.innerHTML = `
      ${icon}
      <span class="mdc-list-item__text">
        <span class="mdc-list-item__primary-text">
          <strong>${r.action.toUpperCase()}</strong> ${r.src_ip||'any'} → ${r.dst_ip||'any'} : ${r.port||'any'}/${r.protocol}
        </span>
        <span class="mdc-list-item__secondary-text">Priority: ${r.priority}</span>
      </span>
    `;
    ruleListEl.appendChild(li);
  });
}

// Demo simulation that uses last scan results (if any) or a set of sample flows
const simulateBtn = document.getElementById('simulateDemo');
const svg = document.getElementById('flow');

simulateBtn.addEventListener('click', async () => {
  // create demo traffic flows
  const demoTraffic = [
    {src_ip: '10.0.0.5', dst_ip: targetInput.value || '127.0.0.1', port: 22, protocol: 'tcp'},
    {src_ip: '10.0.0.6', dst_ip: targetInput.value || '127.0.0.1', port: 80, protocol: 'tcp'},
    {src_ip: '10.0.0.7', dst_ip: targetInput.value || '127.0.0.1', port: 12345, protocol: 'tcp'}
  ];
  const payload = {traffic: demoTraffic, rules};
  const res = await fetch('/api/simulate', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)});
  const data = await res.json();
  drawFlow(data.decisions);
});

function drawFlow(decisions){
  // simple left-to-right flow: source -> firewall -> destination with color by allowed/denied
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  const w = svg.viewBox.baseVal.width || svg.clientWidth || 700;
  const h = svg.clientHeight || 200;
  const margin = 20;
  const leftX = 80;
  const rightX = 600;
  decisions.forEach((d, i) => {
    const y = 40 + i * 40;
    // source
    const src = document.createElementNS('http://www.w3.org/2000/svg','rect');
    src.setAttribute('x', leftX - 60);
    src.setAttribute('y', y - 12);
    src.setAttribute('width', 50);
    src.setAttribute('height', 24);
    src.setAttribute('fill', '#ddd');
    svg.appendChild(src);
    const srcText = document.createElementNS('http://www.w3.org/2000/svg','text');
    srcText.setAttribute('x', leftX - 35);
    srcText.setAttribute('y', y + 4);
    srcText.setAttribute('font-size', '10');
    srcText.textContent = d.traffic.src_ip;
    svg.appendChild(srcText);

    // destination
    const dst = document.createElementNS('http://www.w3.org/2000/svg','rect');
    dst.setAttribute('x', rightX + 10);
    dst.setAttribute('y', y - 12);
    dst.setAttribute('width', 50);
    dst.setAttribute('height', 24);
    dst.setAttribute('fill', '#ddd');
    svg.appendChild(dst);
    const dstText = document.createElementNS('http://www.w3.org/2000/svg','text');
    dstText.setAttribute('x', rightX + 25);
    dstText.setAttribute('y', y + 4);
    dstText.setAttribute('font-size', '10');
    dstText.textContent = d.traffic.dst_ip;
    svg.appendChild(dstText);

    // arrow line
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1', leftX);
    line.setAttribute('y1', y);
    line.setAttribute('x2', rightX);
    line.setAttribute('y2', y);
    line.setAttribute('stroke-width', 4);
    line.setAttribute('stroke', d.allowed ? 'green' : 'red');
    svg.appendChild(line);

    const label = document.createElementNS('http://www.w3.org/2000/svg','text');
    label.setAttribute('x', (leftX + rightX)/2 - 20);
    label.setAttribute('y', y - 8);
    label.setAttribute('font-size', '10');
    label.textContent = `${d.traffic.port}/${d.traffic.protocol} - ${d.allowed ? 'ALLOWED' : 'DENIED'}`;
    svg.appendChild(label);
  });
}
