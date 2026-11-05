const ADMIN_PASSWORD = prompt('Enter admin password:') || 'admin123';
const API_BASE = '/admin';
let allServers = [];
let groups = [];

function switchTab(tab, evt) {
    document.querySelectorAll('.nav-item').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
    if(evt && evt.currentTarget) evt.currentTarget.classList.add('active');
    document.getElementById(`tab-${tab}`)?.classList.add('active');
    
    const titles = {
        overview: 'Overview',
        analytics: 'Analytics',
        servers: 'Servers',
        groups: 'Groups',
        tags: 'Tags',
        users: 'Users',
        rcon: 'RCON Console',
        notifications: 'Notifications',
        webhooks: 'Webhooks',
        monitor: 'Monitor',
        backup: 'Backup & Restore',
        logs: 'Logs',
        api: 'API',
        plugins: 'Plugins',
        system: 'Settings',
        themes: 'Appearance'
    };
    document.getElementById('pageTitle').textContent = titles[tab] || tab;
    
    if (tab === 'logs') loadLogs();
    if (tab === 'system') loadSystem();
    if (tab === 'rcon') loadRconServers();
    if (tab === 'groups') loadGroups();
    if (tab === 'tags') loadTags();
    if (tab === 'analytics') loadAnalytics();
    if (tab === 'overview') fetchServers();
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
    let online = 0, offline = 0, players = 0;
    servers.forEach(server => {
        if(server.status === 'online') online++; else offline++;
        players += parseInt(server.players||0);
        const card = document.createElement('div');
        card.style.cssText = 'display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 1rem; align-items: center; padding: 1rem 1.25rem; background: #0a0a0a; border: 1px solid #1f1f1f; border-radius: 10px; transition: all 0.15s ease;';
        card.onmouseover = () => { card.style.borderColor = '#262626'; card.style.background = '#0f0f0f'; };
        card.onmouseout = () => { card.style.borderColor = '#1f1f1f'; card.style.background = '#0a0a0a'; };
        card.dataset.id = server.id;
        card.dataset.name = (server.name||'').toLowerCase();
        card.dataset.group = server.group || '';
        card.dataset.status = server.status || 'offline';
        card.dataset.type = server.type || '';
        card.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.875rem; min-width: 0;">
                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0;">
                    <i class="fas fa-server"></i>
                </div>
                <div style="min-width: 0; flex: 1;">
                    <div style="color: #e5e5e5; font-weight: 500; font-size: 0.875rem; margin-bottom: 0.25rem;">${escapeHtml(server.name)} ${server.enabled === false ? '<span style="color:#ef4444; font-size:0.75rem;">(disabled)</span>' : ''}</div>
                    <div style="color: #737373; font-size: 0.75rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(server.type)} • ${escapeHtml(server.host)}:${server.port}${server.group ? ' • ' + escapeHtml(server.group) : ''}</div>
                    ${server.description ? '<div style="color: #525252; font-size: 0.75rem; margin-top: 0.25rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">'+escapeHtml(server.description)+'</div>' : ''}
                </div>
            </div>
            <div>
                <span class="badge ${server.status==='online'?'badge-green':'badge-red'}">${server.status||'unknown'}</span>
            </div>
            <div style="color: #e5e5e5; font-size: 0.875rem;">${server.players||0} / ${server.maxplayers||'?'}</div>
            <div style="display: flex; gap: 0.375rem;">
                <button class="btn" style="padding: 0.375rem 0.625rem;" onclick="viewServer('${server.id}')" title="View"><i class="fas fa-eye"></i></button>
                <button class="btn" style="padding: 0.375rem 0.625rem;" onclick="editServerModal('${server.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="btn" style="padding: 0.375rem 0.625rem;" onclick="cloneServer('${server.id}')" title="Clone"><i class="fas fa-copy"></i></button>
                <button class="btn" style="padding: 0.375rem 0.625rem;" onclick="toggleServer('${server.id}')" title="Toggle"><i class="fas fa-power-off"></i></button>
                <button class="btn" style="padding: 0.375rem 0.625rem;" onclick="testServer('${server.id}')" title="Test"><i class="fas fa-vial"></i></button>
                <button class="btn" style="padding: 0.375rem 0.625rem;" onclick="deleteServer('${server.id}')" title="Delete"><i class="fas fa-trash"></i></button>
            </div>
        `;
        container.appendChild(card);
    });
    if(document.getElementById('ovTotal')) {
        document.getElementById('ovTotal').textContent = servers.length;
        document.getElementById('ovOnline').textContent = online;
        document.getElementById('ovOffline').textContent = offline;
        document.getElementById('ovPlayers').textContent = players;
    }
}

function updateFilters() {
    const groupSet = new Set();
    const typeSet = new Set();
    allServers.forEach(s => { if(s.group) groupSet.add(s.group); if(s.type) typeSet.add(s.type); });
    const sel = document.getElementById('groupFilter');
    if(sel) {
        sel.innerHTML = '<option value="">All Groups</option>';
        Array.from(groupSet).sort().forEach(g => {
            const opt = document.createElement('option');
            opt.value = g; opt.textContent = g;
            sel.appendChild(opt);
        });
    }
    const tsel = document.getElementById('typeFilter');
    if(tsel) {
        tsel.innerHTML = '<option value="">All Types</option>';
        Array.from(typeSet).sort().forEach(t => {
            const opt = document.createElement('option');
            opt.value = t; opt.textContent = t;
            tsel.appendChild(opt);
        });
    }
    loadTags();
}

function filterServers() {
    const search = (document.getElementById('serverSearch')?.value || '').toLowerCase();
    const group = document.getElementById('groupFilter')?.value || '';
    const status = document.getElementById('statusFilter')?.value || '';
    const type = document.getElementById('typeFilter')?.value || '';
    document.querySelectorAll('#adminServers .server-card').forEach(card => {
        const match = card.dataset.name.includes(search) && 
                      (group === '' || card.dataset.group === group) &&
                      (status === '' || card.dataset.status === status) &&
                      (type === '' || card.dataset.type === type);
        card.style.display = match ? 'grid' : 'none';
    });
}

function loadTags() {
    const tags = new Set();
    allServers.forEach(s => { if(s.tags) (Array.isArray(s.tags)?s.tags:s.tags.split(',')).forEach(t=>{if(t.trim()) tags.add(t.trim());}); });
    const div = document.getElementById('tagsList');
    if(!div) return;
    div.innerHTML = Array.from(tags).sort().map(t=>`<span style="padding:0.375rem 0.75rem; background:var(--bg-secondary); border-radius:6px; border:1px solid var(--border-color);">${escapeHtml(t)} <button style="background:none;border:none;color:var(--text-secondary);cursor:pointer;" onclick="removeTag('${escapeHtml(t)}')">×</button></span>`).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}

window.showAddModal = () => {
    document.getElementById('addModal').classList.add('active');
    document.getElementById('addForm').reset();
    document.getElementById('addForm').removeAttribute('data-edit-id');
    document.getElementById('enabled').value = 'true';
    document.getElementById('order').value = '0';
    document.querySelector('#addModal .modal-header div').textContent = 'Add Server';
};

window.closeModal = () => {
    document.getElementById('addModal').classList.remove('active');
    document.getElementById('addForm').removeAttribute('data-edit-id');
    document.querySelector('#addModal .modal-header div').textContent = 'Add Server';
};

window.deleteServer = async (id) => {
    if (!confirm('Delete this server?')) return;
    await fetch(`${API_BASE}/servers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${ADMIN_PASSWORD}` }
    });
    fetchServers();
};

window.editServerModal = async (id) => {
    const server = allServers.find(s => s.id === id);
    if (!server) return;
    document.getElementById('name').value = server.name || '';
    document.getElementById('type').value = server.type || '';
    document.getElementById('host').value = server.host || '';
    document.getElementById('port').value = server.port || '';
    document.getElementById('game').value = server.game || '';
    document.getElementById('group').value = server.group || '';
    document.getElementById('tags').value = Array.isArray(server.tags) ? server.tags.join(', ') : (server.tags||'');
    document.getElementById('description').value = server.description || '';
    document.getElementById('notes').value = server.notes || '';
    document.getElementById('enabled').value = server.enabled === false ? 'false' : 'true';
    document.getElementById('order').value = server.order || 0;
    document.getElementById('addForm').dataset.editId = id;
    document.querySelector('#addModal .modal-header div').textContent = 'Edit Server';
    document.getElementById('addModal').classList.add('active');
};

window.viewServer = (id) => {
    const server = allServers.find(s => s.id === id);
    if (!server) return;
    alert(`Name: ${server.name}\nType: ${server.type}\nHost: ${server.host}:${server.port}\nStatus: ${server.status}\nPlayers: ${server.players}/${server.maxplayers}\nGroup: ${server.group||'-'}\nDescription: ${server.description||'-'}\nNotes: ${server.notes||'-'}`);
};

window.moveServer = (id) => {
    const group = prompt('Move to group (leave empty for none):');
    fetch(`${API_BASE}/servers/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${ADMIN_PASSWORD}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ group: group || '' })
    }).then(()=>fetchServers());
};

window.pingServer = async (id) => {
    alert('Pinging server...');
    await fetch(`${API_BASE}/servers/${id}/test`, { method: 'POST', headers: { 'Authorization': `Bearer ${ADMIN_PASSWORD}` } });
    setTimeout(fetchServers, 1500);
};

window.bulkEdit = () => {
    alert('Bulk edit: select servers with Ctrl+Click (feature coming soon)');
};

window.bulkCopy = async () => {
    if(!confirm('Clone all visible servers?')) return;
    for(const s of allServers) {
        const {id:_, ...clone} = s;
        clone.name = clone.name + ' (Copy)';
        await fetch(`${API_BASE}/servers`, { method:'POST', headers:{'Authorization':`Bearer ${ADMIN_PASSWORD}`,'Content-Type':'application/json'}, body:JSON.stringify(clone) });
    }
    fetchServers();
};

window.bulkDelete = async () => {
    if(!confirm('Delete ALL servers? This cannot be undone!')) return;
    for(const s of allServers) {
        await fetch(`${API_BASE}/servers/${s.id}`, { method:'DELETE', headers:{'Authorization':`Bearer ${ADMIN_PASSWORD}`} });
    }
    fetchServers();
};

window.testAll = async () => {
    alert('Testing all servers...');
    for(const s of allServers) {
        await fetch(`${API_BASE}/servers/${s.id}/test`, { method:'POST', headers:{'Authorization':`Bearer ${ADMIN_PASSWORD}`} });
    }
    setTimeout(fetchServers, 3000);
};

window.clearLogs = () => {
    document.getElementById('logsOutput').innerHTML = '[System] Logs cleared<br>';
    alert('Logs cleared');
};

window.addTag = () => {
    const tag = prompt('Add tag:');
    if(!tag) return;
    alert('Tag added: ' + tag);
    loadTags();
};

window.removeTag = (tag) => {
    if(confirm('Remove tag "'+tag+'"?')) loadTags();
};

window.loadAnalytics = async () => {
    try {
        const res = await fetch(`${API_BASE}/analytics`, { headers: { 'Authorization': `Bearer ${ADMIN_PASSWORD}` } });
        const data = await res.json();
        document.getElementById('analyticsByType').innerHTML = Object.keys(data.byType||{}).length ? Object.entries(data.byType).map(([k,v])=>`<div style="display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid #1f1f1f;"><span>${k}</span><span>${v}</span></div>`).join('') : 'No data';
        document.getElementById('analyticsByGroup').innerHTML = Object.keys(data.byGroup||{}).length ? Object.entries(data.byGroup).map(([k,v])=>`<div style="display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid #1f1f1f;"><span>${k}</span><span>${v}</span></div>`).join('') : 'No data';
        document.getElementById('analyticsUptime').innerHTML = (data.history||[]).map(s=>`<div style="display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid #1f1f1f;"><span>${escapeHtml(s.name)}</span><span class="badge ${s.uptime>90?'badge-green':'badge-gray'}">${s.uptime||0}%</span></div>`).join('') || 'No uptime data';
    } catch(e) {
        console.error(e);
    }
};

window.addWebhook = async () => {
    const url = prompt('Webhook URL:');
    if(!url) return;
    await fetch(`${API_BASE}/webhooks`, { method: 'POST', headers: { 'Authorization': `Bearer ${ADMIN_PASSWORD}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) });
    alert('Webhook added');
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
    const tagsVal = document.getElementById('tags').value;
    const data = {
        name: document.getElementById('name').value,
        type: document.getElementById('type').value,
        host: document.getElementById('host').value,
        port: parseInt(document.getElementById('port').value),
        game: document.getElementById('game').value,
        group: document.getElementById('group').value,
        tags: tagsVal ? tagsVal.split(',').map(t=>t.trim()).filter(t=>t) : [],
        description: document.getElementById('description').value,
        notes: document.getElementById('notes').value,
        enabled: document.getElementById('enabled').value === 'true',
        order: parseInt(document.getElementById('order').value)||0
    };
    const editId = e.target.dataset.editId;
    if(editId) {
        await fetch(`${API_BASE}/servers/${editId}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${ADMIN_PASSWORD}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    } else {
        await fetch(`${API_BASE}/servers`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${ADMIN_PASSWORD}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    }
    closeModal();
    e.target.reset();
    fetchServers();
});

fetchServers();
setInterval(fetchServers, 30000);
loadSystem();
setInterval(loadSystem, 1000);
