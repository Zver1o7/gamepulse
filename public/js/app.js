import { t, setLanguage, applyTranslations, currentLang } from './i18n.js';

const socket = io();

const serversGrid = document.getElementById('serversGrid');
const emptyState = document.getElementById('emptyState');
const refreshBtn = document.getElementById('refreshBtn');
const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.filter-btn');
const themeToggle = document.getElementById('themeToggle');
const langToggle = document.getElementById('langToggle');
const langLabel = document.getElementById('langLabel');

const onlineCountEl = document.getElementById('onlineCount');
const totalPlayersEl = document.getElementById('totalPlayers');
const totalCountEl = document.getElementById('totalCount');
const uptimeEl = document.getElementById('uptime');

let allServers = [];
let currentFilter = 'all';
let currentSearch = '';

applyTranslations();
if (langLabel) {
    langLabel.textContent = currentLang.toUpperCase();
}

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

function applyFilters() {
    let filtered = [...allServers];
    
    if (currentFilter === 'online') {
        filtered = filtered.filter(s => s.status === 'online');
    } else if (currentFilter === 'offline') {
        filtered = filtered.filter(s => s.status === 'offline');
    }
    
    if (currentSearch) {
        const search = currentSearch.toLowerCase();
        filtered = filtered.filter(s => 
            (s.name && s.name.toLowerCase().includes(search)) ||
            (s.game && s.game.toLowerCase().includes(search)) ||
            (s.group && s.group.toLowerCase().includes(search))
        );
    }
    
    renderFilteredServers(filtered);
}

function renderFilteredServers(servers) {
    if (!servers || servers.length === 0) {
        serversGrid.innerHTML = '';
        emptyState.style.display = 'block';
        const h3 = emptyState.querySelector('h3');
        const p = emptyState.querySelector('p');
        if (h3) h3.textContent = t('noResults');
        if (p) p.textContent = t('noResultsDesc');
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
                    <div class="server-game">${server.game || server.type}${server.group ? ' • ' + server.group : ''}</div>
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
                <div class="metric-label">Uptime</div>
                <div class="metric-value">${server.uptime !== undefined ? server.uptime + '%' : '-'}</div>
            </div>
            <div class="server-metric">
                <div class="metric-label">Ping</div>
                <div class="metric-value">${server.ping ? server.ping + 'ms' : '-'}</div>
            </div>
        `;
        
        serversGrid.appendChild(card);
    });
}

function renderServers(servers) {
    allServers = servers || [];
    if (allServers.length === 0) {
        serversGrid.innerHTML = '';
        emptyState.style.display = 'block';
        const h3 = emptyState.querySelector('h3');
        const p = emptyState.querySelector('p');
        if (h3) h3.textContent = t('noServers');
        if (p) p.textContent = t('noServersDesc');
        return;
    }
    emptyState.style.display = 'none';
    applyFilters();
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

if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value;
        applyFilters();
    });
}

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        applyFilters();
    });
});

if (themeToggle) {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const icon = themeToggle.querySelector('i');
    if (savedTheme === 'light' && icon) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        if (newTheme === 'light' && icon) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else if (icon) {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    });
}

if (langToggle && langLabel) {
    langToggle.addEventListener('click', () => {
        const newLang = currentLang === 'en' ? 'ru' : 'en';
        setLanguage(newLang);
        langLabel.textContent = newLang.toUpperCase();
        applyFilters();
    });
}

fetch('/api/stats')
    .then(res => res.json())
    .then(updateStats)
    .catch(err => console.error('Error fetching stats:', err));
