const ADMIN_PASSWORD = prompt('Enter admin password:');
const API_BASE = '/admin';

async function fetchServers() {
    const res = await fetch(`${API_BASE}/servers`, {
        headers: { 'Authorization': `Bearer ${ADMIN_PASSWORD}` }
    });
    if (res.status === 401) {
        alert('Unauthorized');
        return;
    }
    const servers = await res.json();
    renderServers(servers);
}

function renderServers(servers) {
    const container = document.getElementById('adminServers');
    container.innerHTML = '';
    servers.forEach(server => {
        const card = document.createElement('div');
        card.className = 'server-card';
        card.innerHTML = `
            <div class="server-info">
                <div class="server-details">
                    <div class="server-name">${server.name}</div>
                    <div class="server-game">${server.type}://${server.host}:${server.port}</div>
                </div>
            </div>
            <div class="server-metric"><div class="metric-label">Status</div><div class="metric-value">${server.status}</div></div>
            <div class="server-action">
                <button class="copy-btn" onclick="deleteServer('${server.id}')"><i class="fas fa-trash"></i> Delete</button>
            </div>
        `;
        container.appendChild(card);
    });
}

window.deleteServer = async (id) => {
    if (!confirm('Delete this server?')) return;
    await fetch(`${API_BASE}/servers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${ADMIN_PASSWORD}` }
    });
    fetchServers();
};

window.showAddModal = () => {
    document.getElementById('addModal').classList.add('active');
};

window.closeModal = () => {
    document.getElementById('addModal').classList.remove('active');
};

window.exportConfig = async () => {
    const res = await fetch(`${API_BASE}/servers`, {
        headers: { 'Authorization': `Bearer ${ADMIN_PASSWORD}` }
    });
    const servers = await res.json();
    const blob = new Blob([JSON.stringify(servers, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'servers.json';
    a.click();
};

window.importConfig = async (input) => {
    const file = input.files[0];
    if (!file) return;
    const text = await file.text();
    try {
        const servers = JSON.parse(text);
        await fetch('/admin/import', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${ADMIN_PASSWORD}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ servers })
        });
        alert('Imported successfully');
        fetchServers();
    } catch (err) {
        alert('Invalid file');
    }
    input.value = '';
};

document.getElementById('addForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        name: document.getElementById('name').value,
        type: document.getElementById('type').value,
        host: document.getElementById('host').value,
        port: parseInt(document.getElementById('port').value),
        game: document.getElementById('game').value,
        group: document.getElementById('group').value
    };
    await fetch(`${API_BASE}/servers`, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${ADMIN_PASSWORD}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    closeModal();
    e.target.reset();
    fetchServers();
});

fetchServers();
setInterval(fetchServers, 30000);
