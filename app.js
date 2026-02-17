const screens = {
  login: document.getElementById('screen-login'),
  twofa: document.getElementById('screen-2fa'),
  dashboard: document.getElementById('screen-dashboard'),
  create: document.getElementById('screen-create-test'),
  execution: document.getElementById('screen-execution'),
  certificates: document.getElementById('screen-certificates'),
  supervisor: document.getElementById('screen-supervisor')
};

const navItems = [
  ['Login', 'login'], ['2FA', 'twofa'], ['Engineer Dashboard', 'dashboard'],
  ['Create Test', 'create'], ['Test Execution', 'execution'],
  ['Expiring Certificates', 'certificates'], ['Supervisor View', 'supervisor']
];

const state = {
  selectedTask: 0,
  timer: 437,
  timerRunning: true,
  dueDays: 5,
  tasks: [
    { category: 'Electrical', name: 'Insulation resistance measurement', status: 'pending', photo: true, copied: true, required: true },
    { category: 'Mechanical', name: 'Hydraulic seal visual inspection', status: 'pass', photo: false, copied: false, required: true },
    { category: 'Safety', name: 'Emergency stop response validation', status: 'fail', photo: true, copied: false, required: true },
    { category: 'Documentation', name: 'Nameplate and serial verification', status: 'na', photo: false, copied: true, required: false }
  ]
};

function fmtTimer(sec) {
  const h = String(Math.floor(sec / 3600)).padStart(2, '0');
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function urgencyClass(days) {
  if (days < 0) return 'red';
  if (days <= 3) return 'red';
  if (days <= 14) return 'amber';
  return 'green';
}

function showScreen(key) {
  Object.entries(screens).forEach(([k, el]) => el.classList.toggle('active', k === key));
  document.querySelectorAll('nav button').forEach((b) => b.classList.toggle('active', b.dataset.target === key));
  render();
}

function renderNav() {
  const nav = document.getElementById('navList');
  nav.innerHTML = navItems.map(([label, key]) => `<button data-target="${key}">${label}</button>`).join('');
  nav.querySelectorAll('button').forEach((btn) => btn.onclick = () => showScreen(btn.dataset.target));
}

function renderLogin() {
  screens.login.innerHTML = `
    <div class="login-wrap card grid">
      <div style="text-align:center">
        <div class="logo" style="margin:0 auto 8px; width:56px;height:56px;">A</div>
        <h2>Atlas Industrial Asset Platform</h2>
        <p class="small">Operations Access Portal</p>
      </div>
      <label>Username <input placeholder="engineer.name"/></label>
      <label>Password <input type="password"/></label>
      <div class="top-row"><a class="small" href="#">Forgot Password</a><label class="checkbox"><input type="checkbox"/> Use SSO</label></div>
      <button class="action" onclick="showScreen('twofa')">Login</button>
    </div>`;

  screens.twofa.innerHTML = `
    <div class="login-wrap card grid">
      <h2>Two-Factor Verification</h2>
      <p class="small">Enter 6-digit code from your authenticator app.</p>
      <input placeholder="_ _ _ _ _ _" maxlength="6"/>
      <button class="action" onclick="showScreen('dashboard')">Verify & Continue</button>
    </div>`;
}

function renderDashboard() {
  screens.dashboard.innerHTML = `
    <div class="top-row"><h2>Asset Test Dashboard</h2><button class="action" onclick="showScreen('create')">Create New Test</button></div>
    <div class="tile-grid">
      <div class="tile green"><h4>My Open Tests</h4><strong>18</strong></div>
      <div class="tile amber"><h4>Group Open Tests</h4><strong>42</strong></div>
      <div class="tile red"><h4>Urgent (&lt; 3 days)</h4><strong>9</strong></div>
      <div class="tile red"><h4>Overdue</h4><strong>5</strong></div>
      <div class="tile amber"><h4>Expiring Certificates</h4><strong>13</strong></div>
    </div>
    <div class="card">
      <table>
        <thead><tr><th>Asset Number</th><th>Description</th><th>Location</th><th>Test Type</th><th>Due Date</th><th>Urgency</th><th>Assigned To</th><th>Status</th><th>Time Spent</th><th>Actions</th></tr></thead>
        <tbody>
          <tr class="overdue"><td>AST-1142</td><td>Hydraulic Power Unit</td><td>Leeds</td><td>Safety Compliance</td><td>2026-02-10</td><td><span class="pill red">Overdue</span></td><td>Unassigned</td><td><span class="badge open">Open</span></td><td>03:51:10</td><td><button class="action secondary" onclick="showScreen('execution')">Open</button></td></tr>
          <tr><td>AST-2455</td><td>Torque Calibrator</td><td>Bristol</td><td>Calibration</td><td>2026-02-20</td><td><span class="pill amber">3 Days</span></td><td>J. Khan</td><td><span class="badge paused">Paused</span></td><td>01:13:26</td><td><button class="action secondary">Assign to Me</button></td></tr>
          <tr><td>AST-9023</td><td>Pressure Vessel Rig</td><td>Hull</td><td>Visual Inspection</td><td>2026-03-02</td><td><span class="pill green">13 Days</span></td><td>R. Doyle</td><td><span class="badge open">Open</span></td><td>00:42:17</td><td><button class="action secondary">Open</button></td></tr>
        </tbody>
      </table>
    </div>`;
}

function renderCreate() {
  screens.create.innerHTML = `
    <div class="top-row"><h2>Create Test - Scan Asset</h2><button class="action secondary" onclick="showScreen('dashboard')">Back to Dashboard</button></div>
    <div class="grid two-col">
      <div class="card grid">
        <label>Barcode Scan Input<input id="scanInput" placeholder="Scan or type asset barcode e.g. AST-1142"/></label>
        <button class="action" onclick="document.getElementById('assetCard').style.display='block'">Simulate Scan</button>
        <div id="assetCard" class="card" style="display:none; border-style:dashed;">
          <h3>Asset Details</h3>
          <p><strong>ID:</strong> AST-1142</p><p><strong>Description:</strong> Hydraulic Power Unit</p><p><strong>Location:</strong> Leeds</p><p><strong>Last test date:</strong> 2025-12-14</p>
        </div>
      </div>
      <div class="card grid">
        <label>Select Test Template
          <select id="templateSel"><option>Calibration Test</option><option>Visual Inspection</option><option>Safety Compliance Test</option></select>
        </label>
        <div class="card" style="background:#1b3143"><h4>Generated Tasks Summary</h4><p>• Electrical checks (6)</p><p>• Mechanical checks (8)</p><p>• Safety controls (4)</p></div>
        <p class="small">7 tasks copied from previous valid test (within timeframe).</p>
        <button class="action" onclick="showScreen('execution')">Create Test</button>
      </div>
    </div>`;
}

function taskRow(t, i) {
  const dot = t.status === 'pass' ? 'green' : t.status === 'fail' ? 'red' : 'grey';
  return `<div class="task ${t.status === 'fail' ? 'fail' : ''}" data-i="${i}"><div><span class="dot ${dot}"></span> ${t.name}<div class="small">${t.category}${t.copied ? ' • ⧉ Auto-copied' : ''}</div></div><div>${t.photo ? '📷' : ''}</div></div>`;
}

function renderExecution() {
  const selected = state.tasks[state.selectedTask];
  const incompleteReq = state.tasks.filter(t => t.required && t.status === 'pending').length;
  const urgency = urgencyClass(state.dueDays);
  screens.execution.innerHTML = `
    <div class="card">
      <div class="top-row">
        <div>
          <h2>${'AST-1142'} • Hydraulic Power Unit</h2>
          <p class="small">Test Type: Safety Compliance | Due Date: 2026-02-20 <span class="pill ${urgency}">${state.dueDays} days remaining</span></p>
        </div>
        <div class="top-row">
          <span class="badge open">Status: ${state.timerRunning ? 'Open' : 'Paused'}</span>
          <strong id="timer">${fmtTimer(state.timer)}</strong>
          <button class="action secondary" id="pauseBtn">Pause</button>
          <button class="action" id="resumeBtn">Resume</button>
          <button class="action warn" id="completeBtn">Complete Test</button>
        </div>
      </div>
      <p class="small">Required tasks incomplete: <strong style="color:${incompleteReq ? '#d18c1d' : '#2f9e66'}">${incompleteReq}</strong></p>
      <div class="execution-grid">
        <div class="card">
          <h3>Task Checklist</h3>
          ${state.tasks.map(taskRow).join('')}
        </div>
        <div class="card">
          <h3>Task Details</h3>
          <p><strong>${selected.name}</strong></p>
          <p class="small">Verify against operating tolerances and attach evidence where required.</p>
          <div class="check-btns">
            <button class="action" data-status="pass">Pass</button>
            <button class="action warn" data-status="fail">Fail</button>
            <button class="action secondary" data-status="na">N/A</button>
          </div>
          <textarea rows="4" placeholder="Engineer comments"></textarea>
          <div class="top-row">
            <button class="action secondary" id="addPhoto">Add Photo</button>
            <span class="small">${selected.copied ? '⧉ Auto-copied from previous test' : 'Manual result entry'}</span>
          </div>
          <p class="small">Last modified: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>`;

  screens.execution.querySelectorAll('.task').forEach(el => el.onclick = () => { state.selectedTask = Number(el.dataset.i); renderExecution(); });
  screens.execution.querySelectorAll('[data-status]').forEach(btn => btn.onclick = () => {
    state.tasks[state.selectedTask].status = btn.dataset.status;
    state.dueDays -= 1;
    renderExecution();
  });
  document.getElementById('pauseBtn').onclick = () => { state.timerRunning = false; renderExecution(); };
  document.getElementById('resumeBtn').onclick = () => { state.timerRunning = true; renderExecution(); };
  document.getElementById('addPhoto').onclick = renderPhotoModal;
  document.getElementById('completeBtn').onclick = renderCompleteModal;
}

function renderPhotoModal() {
  const modal = document.getElementById('photoModal');
  modal.classList.remove('hidden');
  modal.innerHTML = `<div class="modal-content">
    <h3>Photo Capture</h3>
    <div class="camera-preview">Camera Preview (Tablet)</div>
    <div class="top-row"><button class="action">Capture</button><button class="action secondary">Retake</button></div>
    <label>Caption <input placeholder="e.g. Damaged emergency stop cover"/></label>
    <div class="top-row"><button class="action" onclick="document.getElementById('photoModal').classList.add('hidden')">Save Photo</button><button class="action secondary" onclick="document.getElementById('photoModal').classList.add('hidden')">Cancel</button></div>
  </div>`;
}

function renderCompleteModal() {
  const modal = document.getElementById('completeModal');
  const summary = {
    total: state.tasks.length,
    pass: state.tasks.filter(t => t.status === 'pass').length,
    fail: state.tasks.filter(t => t.status === 'fail').length,
    na: state.tasks.filter(t => t.status === 'na').length
  };
  const incompleteReq = state.tasks.filter(t => t.required && t.status === 'pending').length;
  modal.classList.remove('hidden');
  modal.innerHTML = `<div class="modal-content grid">
    <h3>Complete Test Confirmation</h3>
    <p>Total tasks: ${summary.total} | Passed: ${summary.pass} | Failed: ${summary.fail} | N/A: ${summary.na}</p>
    <p>Total time spent: ${fmtTimer(state.timer)}</p>
    ${incompleteReq ? `<p style="color:#d18c1d">Warning: ${incompleteReq} required tasks incomplete.</p>` : '<p style="color:#2f9e66">All required tasks complete.</p>'}
    <label>Digital Signature (optional)<input placeholder="Sign with stylus"/></label>
    <div class="top-row"><button class="action" id="confirmComp">Confirm Complete</button><button class="action secondary" onclick="document.getElementById('completeModal').classList.add('hidden')">Cancel</button></div>
  </div>`;
  document.getElementById('confirmComp').onclick = () => {
    modal.innerHTML = `<div class="modal-content grid"><h3>Test Completed Successfully</h3><p>Compliance record locked and audit trail generated.</p><div class="top-row"><button class="action">Generate PDF</button><button class="action secondary">View Certificate</button><button class="action" onclick="document.getElementById('completeModal').classList.add('hidden')">Close</button></div></div>`;
  };
}

function renderCertificates() {
  screens.certificates.innerHTML = `
    <div class="top-row"><h2>Upcoming Expiring Certifications</h2><div class="grid" style="grid-template-columns: repeat(3,180px)"><select><option>All Regions</option><option>North</option><option>South</option></select><select><option>All Asset Types</option><option>Hydraulic</option></select><select><option>Within 7 days</option><option>Within 14 days</option><option>Within 30 days</option></select></div></div>
    <div class="card"><table><thead><tr><th>Asset Number</th><th>Test Type</th><th>Expiry Date</th><th>Days Remaining</th><th>Status</th><th>Action</th></tr></thead><tbody>
      <tr class="overdue"><td>AST-9001</td><td>Safety Compliance</td><td>2026-02-19</td><td style="color:#f07676">2</td><td><span class="pill red">Urgent</span></td><td><button class="action">Create Renewal Test</button></td></tr>
      <tr><td>AST-3210</td><td>Calibration</td><td>2026-02-28</td><td>11</td><td><span class="pill amber">Due Soon</span></td><td><button class="action secondary">Create Renewal Test</button></td></tr>
    </tbody></table></div>`;
}

function renderSupervisor() {
  screens.supervisor.innerHTML = `
    <h2>Supervisor Operations Overview</h2>
    <div class="chart-grid">
      <div class="chart-box"><h4>Tests Completed per Region</h4><p class="small">North 83 | South 71 | East 65 | West 59 | Central 77</p></div>
      <div class="chart-box"><h4>Overdue by Region</h4><p class="small">North 2 | South 5 | East 3 | West 4 | Central 1</p></div>
      <div class="chart-box"><h4>Avg Time per Test Type</h4><p class="small">Calibration 1h52m, Visual 58m, Safety 2h14m</p></div>
    </div>
    <div class="grid two-col" style="margin-top:12px;">
      <div class="card"><h3>Unassigned Tests</h3><p>AST-1142, AST-7711, AST-8890</p></div>
      <div class="card"><h3>Long-Running Open Tests</h3><p>AST-4120 (6h 14m), AST-2201 (5h 03m)</p></div>
    </div>`;
}

function render() {
  renderLogin();
  renderDashboard();
  renderCreate();
  renderExecution();
  renderCertificates();
  renderSupervisor();
}

renderNav();
render();
showScreen('login');
setInterval(() => {
  if (state.timerRunning) {
    state.timer += 1;
    const timer = document.getElementById('timer');
    if (timer) timer.textContent = fmtTimer(state.timer);
  }
}, 1000);

window.showScreen = showScreen;
