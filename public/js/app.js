const socket = io();

const serversGrid = document.getElementById('serversGrid');
const emptyState = document.getElementById('emptyState');
const refreshBtn = document.getElementById('refreshBtn');

const onlineCountEl = document.getElementById('onlineCount');
const totalPlayersEl = document.getElementById('totalPlayers');
const totalCountEl = document.getElementById('totalCount');
const uptimeEl = document.getElementById('uptime');

function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
}

function updateStats(stats) {
    onlineCountEl.textContent = stats.online || 0;
    totalPlayersEl.textContent = stats.totalPlayers || 0;
    totalCountEl.textContent = stats.total || 0;
    uptimeEl.textContent = formatUptime(stats.uptime || 0);
}

function renderServers(servers) {
    if (!servers || servers.length === 0) {
        serversGrid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    serversGrid.innerHTML = '';
    
    servers.forEach(server => {
        const card = document.createElement('div');
        card.className = 'server-card';
        
        const isOnline = server.status === 'online';
        const statusClass = isOnline ? 'online' : 'offline';
        const statusText = isOnline ? 'Online' : 'Offline';
        
        card.innerHTML = `
            <div class="server-info">
                <div class="server-status ${statusClass}"></div>
                <div class="server-details">
                    <div class="server-name" title="${server.name}">${server.name}</div>
                    <div class="server-game">${server.game || server.type}</div>
                </div>
            </div>
            <div class="server-metric">
                <div class="metric-label">Status</div>
                <div class="metric-value ${statusClass}">${statusText}</div>
            </div>
            <div class="server-metric">
                <div class="metric-label">Players</div>
                <div class="metric-value">${isOnline ? `${server.players || 0}/${server.maxPlayers || 0}` : '-'}</div>
            </div>
            <div class="server-metric">
                <div class="metric-label">Map</div>
                <div class="metric-value" title="${server.map || 'N/A'}">${server.map || 'N/A'}</div>
            </div>
            <div class="server-metric">
                <div class="metric-label">Ping</div>
                <div class="metric-value">${server.ping ? server.ping + 'ms' : '-'}</div>
            </div>
        `;
        
        serversGrid.appendChild(card);
    });
}

socket.on('servers:update', renderServers);
socket.on('stats:update', updateStats);

refreshBtn.addEventListener('click', () => {
    refreshBtn.disabled = true;
    refreshBtn.querySelector('i').classList.add('fa-spin');
    socket.emit('refresh');
    
    setTimeout(() => {
        refreshBtn.disabled = false;
        refreshBtn.querySelector('i').classList.remove('fa-spin');
    }, 2000);
});

fetch('/api/stats')
    .then(res => res.json())
    .then(updateStats)
    .catch(err => console.error('Error fetching stats:', err));
