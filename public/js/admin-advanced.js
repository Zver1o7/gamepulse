const ADMIN_PASSWORD = prompt('Enter admin password:') || 'admin123';
const API_BASE = '/admin';
let allServers = [];
let groups = [];

function switchTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById(`tab-${tab}`).classList.add('active');
    
    if (tab === 'logs') loadLogs();
    if (tab === 'system') loadSystem();
    if (tab === 'rcon') loadRconServers();
    if (tab === 'groups') loadGroups();
}

async function fetchServers() {
    try {
        const res = await fetch(`${API_BASE}/servers`, {
            headers: { 'Authorization': `Bearer ${ADMIN_PASSWORD}` }
        });
        if (res.status === 401) {
            alert('Unauthorized');
            return;
        }
        allServers = await res.json();
        renderServers(allServers);
        updateFilters();
        loadRconServers();
        document.getElementById('sysServers').textContent = allServers.length;
    } catch(e) {
        console.error(e);
    }
}

function renderServers(servers) {
    const container = document.getElementById('adminServers');
    container.innerHTML = '';
    servers.forEach(server => {
        const card = document.createElement('div');
        card.className = 'server-card';
        card.dataset.id = server.id;
        card.dataset.name = server.name.toLowerCase();
        card.dataset.group = server.group || '';
        card.dataset.status = server.status || 'offline';
        card.innerHTML = `
            <div class="server-info">
                <div class="server-details">
                    <div class="server-name">${escapeHtml(server.name)} ${server.enabled === false ? '<span style="color:#ef4444">(disabled)</span>' : ''}</div>
                    <div class="server-game">${escapeHtml(server.type)}://${escapeHtml(server.host)}:${server.port} ${server.group ? '| ' + escapeHtml(server.group) : ''}</div>
                </div>
            </div>
            <div class="server-metric"><div class="metric-label">Status</div><div class="metric-value" style="color:${server.status==='online'?'var(--accent-green)':'var(--text-secondary)'}">${server.status||'unknown'}</div></div>
            <div class="server-metric"><div class="metric-label">Players</div><div class="metric-value">${server.players||0}/${server.maxplayers||'?'}</div></div>
            <div class="server-action" style="display:flex; gap:0.375rem; flex-wrap:wrap;">
                <button class="copy-btn" onclick="editServer('${server.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="copy-btn" onclick="cloneServer('${server.id}')" title="Clone"><i class="fas fa-copy"></i></button>
                <button class="copy-btn" onclick="toggleServer('${server.id}')" title="Toggle"><i class="fas fa-power-off"></i></button>
                <button class="copy-btn" onclick="testServer('${server.id}')" title="Test"><i class="fas fa-vial"></i></button>
                <button class="copy-btn" onclick="deleteServer('${server.id}')" title="Delete"><i class="fas fa-trash"></i></button>
            </div>
        `;
        container.appendChild(card);
    });
}

function updateFilters() {
    const groupSet = new Set();
    allServers.forEach(s => { if(s.group) groupSet.add(s.group); });
    const sel = document.getElementById('groupFilter');
    sel.innerHTML = '<option value="">All Groups</option>';
    Array.from(groupSet).sort().forEach(g => {
        const opt = document.createElement('option');
        opt.value = g; opt.textContent = g;
        sel.appendChild(opt);
    });
}

function filterServers() {
    const search = document.getElementById('serverSearch').value.toLowerCase();
    const group = document.getElementById('groupFilter').value;
    const status = document.getElementById('statusFilter').value;
    document.querySelectorAll('#adminServers .server-card').forEach(card => {
        const match = card.dataset.name.includes(search) && 
                      (group === '' || card.dataset.group === group) &&
                      (status === '' || card.dataset.status === status);
        card.style.display = match ? 'grid' : 'none';
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}

window.showAddModal = () => {
    document.getElementById('addModal').classList.add('active');
    document.getElementById('addForm').reset();
};

window.closeModal = () => {
    document.getElementById('addModal').classList.remove('active');
};

window.deleteServer = async (id) => {
    if (!confirm('Delete this server?')) return;
    await fetch(`${API_BASE}/servers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${ADMIN_PASSWORD}` }
    });
    fetchServers();
};

window.editServer = async (id) => {
    const server = allServers.find(s => s.id === id);
    if (!server) return;
    const name = prompt('Server Name:', server.name);
    if (!name) return;
    const host = prompt('Host:', server.host);
    const port = prompt('Port:', server.port);
    const game = prompt('Game:', server.game || '');
    const group = prompt('Group:', server.group || '');
    await fetch(`${API_BASE}/servers/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${ADMIN_PASSWORD}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, host, port: parseInt(port), game, group })
    });
    fetchServers();
};

window.cloneServer = async (id) => {
    const server = allServers.find(s => s.id === id);
    if (!server) return;
    const { id: _, ...clone } = server;
    clone.name = clone.name + ' (Copy)';
    await fetch(`${API_BASE}/servers`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${ADMIN_PASSWORD}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(clone)
    });
    fetchServers();
};

window.toggleServer = async (id) => {
    const server = allServers.find(s => s.id === id);
    if (!server) return;
    await fetch(`${API_BASE}/servers/${id}/toggle`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${ADMIN_PASSWORD}` }
    });
    fetchServers();
};

window.testServer = async (id) => {
    alert('Testing server... Check console/logs');
    await fetch(`${API_BASE}/servers/${id}/test`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${ADMIN_PASSWORD}` }
    });
    setTimeout(fetchServers, 2000);
};

window.bulkEnable = async () => {
    if (!confirm('Enable all servers?')) return;
    await fetch(`${API_BASE}/servers/bulk/enable`, { method: 'POST', headers: { 'Authorization': `Bearer ${ADMIN_PASSWORD}` } });
    fetchServers();
};

window.bulkDisable = async () => {
    if (!confirm('Disable all servers?')) return;
    await fetch(`${API_BASE}/servers/bulk/disable`, { method: 'POST', headers: { 'Authorization': `Bearer ${ADMIN_PASSWORD}` } });
    fetchServers();
};

window.refreshAll = async () => {
    await fetch('/api/refresh', { method: 'POST' }).catch(()=>{});
    await fetch(`${API_BASE}/refresh`, { method: 'POST', headers: { 'Authorization': `Bearer ${ADMIN_PASSWORD}` } });
    fetchServers();
};

window.exportConfig = async () => {
    const res = await fetch(`${API_BASE}/servers`, { headers: { 'Authorization': `Bearer ${ADMIN_PASSWORD}` } });
    const servers = await res.json();
    const blob = new Blob([JSON.stringify(servers, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `gamepulse-backup-${Date.now()}.json`; a.click();
};

window.importConfig = async (input) => {
    const file = input.files[0];
    if (!file) return;
    const text = await file.text();
    try {
        const servers = JSON.parse(text);
        await fetch('/admin/import', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${ADMIN_PASSWORD}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ servers })
        });
        alert('Imported successfully');
        fetchServers();
    } catch (err) { alert('Invalid file'); }
    input.value = '';
};

window.addGroup = () => {
    const name = prompt('Group name:');
    if (!name) return;
    groups.push(name);
    document.getElementById('groupsList').innerHTML = groups.map(g => `<div style="padding:0.5rem; background:var(--bg-secondary); margin-bottom:0.5rem; border-radius:6px;">${escapeHtml(g)}</div>`).join('');
};

function loadGroups() {
    const set = new Set();
    allServers.forEach(s => { if(s.group) set.add(s.group); });
    groups = Array.from(set);
    document.getElementById('groupsList').innerHTML = groups.length ? groups.map(g => `<div style="padding:0.75rem; background:var(--bg-secondary); margin-bottom:0.5rem; border-radius:6px; display:flex; justify-content:space-between;"><span>${escapeHtml(g)} (${allServers.filter(s=>s.group===g).length} servers)</span></div>`).join('') : '<p style="color:var(--text-secondary);">No groups</p>';
}

function loadRconServers() {
    const sel = document.getElementById('rconServer');
    if (!sel) return;
    sel.innerHTML = '<option value="">Select server...</option>';
    allServers.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id; opt.textContent = s.name;
        sel.appendChild(opt);
    });
}

window.sendRcon = async () => {
    const id = document.getElementById('rconServer').value;
    const cmd = document.getElementById('rconCmd').value;
    if (!id || !cmd) return alert('Select server and enter command');
    const out = document.getElementById('rconOutput');
    out.innerHTML += `<br>> ${escapeHtml(cmd)}`;
    try {
        const res = await fetch(`/api/rcon/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command: cmd })
        });
        const data = await res.json();
        out.innerHTML += `<br>${escapeHtml(data.response || data.error || 'OK')}`;
    } catch(e) {
        out.innerHTML += `<br>[ERR] ${e.message}`;
    }
    out.scrollTop = out.scrollHeight;
    document.getElementById('rconCmd').value = '';
};

window.createBackup = () => {
    exportConfig();
};

window.restoreBackup = async (input) => {
    importConfig(input);
};

window.loadLogs = () => {
    const out = document.getElementById('logsOutput');
    out.innerHTML = `[${new Date().toISOString()}] [INFO] Admin panel accessed<br>[${new Date().toISOString()}] [INFO] Servers loaded: ${allServers.length}<br>[${new Date().toISOString()}] [INFO] Monitoring active<br>`;
};

window.loadSystem = () => {
    document.getElementById('sysUptime').textContent = Math.floor(process.uptime ? process.uptime() : 3600) + 's';
};

window.saveNotifications = () => {
    alert('Notification settings saved (demo)');
};

document.getElementById('addForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        name: document.getElementById('name').value,
        type: document.getElementById('type').value,
        host: document.getElementById('host').value,
        port: parseInt(document.getElementById('port').value),
        game: document.getElementById('game').value,
        group: document.getElementById('group').value,
        enabled: true
    };
    await fetch(`${API_BASE}/servers`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${ADMIN_PASSWORD}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    closeModal();
    e.target.reset();
    fetchServers();
});

fetchServers();
setInterval(fetchServers, 30000);
loadSystem();
setInterval(loadSystem, 1000);
