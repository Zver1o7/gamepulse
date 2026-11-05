import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { GameMonitor } from './services/monitor.js';
import { RconService } from './services/rcon.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(join(__dirname, '../public')));

const monitor = new GameMonitor();
const rconService = new RconService();

app.get('/api/servers', (req, res) => {
  res.json(monitor.getServers());
});

app.get('/api/stats', (req, res) => {
  res.json(monitor.getStats());
});

app.get('/api/history/:id', (req, res) => {
  const history = monitor.getHistory(req.params.id);
  res.json(history);
});

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

app.use('/admin', (req, res, next) => {
  const auth = req.headers.authorization;
  if (req.path === '/login') return next();
  if (!auth || auth !== `Bearer ${ADMIN_PASSWORD}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

app.get('/admin/servers', (req, res) => {
  res.json(monitor.getServers());
});

app.post('/admin/servers', express.json(), (req, res) => {
  const configPath = join(__dirname, '../config/servers.json');
  try {
    let servers = [];
    if (fs.existsSync(configPath)) {
      servers = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    const newServer = {
      id: Date.now().toString(),
      status: 'offline',
      ...req.body
    };
    servers.push(newServer);
    fs.writeFileSync(configPath, JSON.stringify(servers, null, 2));
    monitor.loadConfig();
    res.json(newServer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/admin/servers/:id', (req, res) => {
  const configPath = join(__dirname, '../config/servers.json');
  try {
    let servers = [];
    if (fs.existsSync(configPath)) {
      servers = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    servers = servers.filter(s => s.id !== req.params.id);
    fs.writeFileSync(configPath, JSON.stringify(servers, null, 2));
    monitor.loadConfig();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/admin/servers/:id', express.json(), (req, res) => {
  const configPath = join(__dirname, '../config/servers.json');
  try {
    let servers = [];
    if (fs.existsSync(configPath)) {
      servers = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    servers = servers.map(s => s.id === req.params.id ? { ...s, ...req.body } : s);
    fs.writeFileSync(configPath, JSON.stringify(servers, null, 2));
    monitor.loadConfig();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/admin/servers/:id/toggle', (req, res) => {
  const configPath = join(__dirname, '../config/servers.json');
  try {
    let servers = [];
    if (fs.existsSync(configPath)) {
      servers = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    servers = servers.map(s => s.id === req.params.id ? { ...s, enabled: s.enabled === false ? true : false } : s);
    fs.writeFileSync(configPath, JSON.stringify(servers, null, 2));
    monitor.loadConfig();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/admin/servers/:id/test', async (req, res) => {
  try {
    await monitor.refreshAll();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/admin/servers/bulk/enable', (req, res) => {
  const configPath = join(__dirname, '../config/servers.json');
  try {
    let servers = [];
    if (fs.existsSync(configPath)) {
      servers = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    servers = servers.map(s => ({ ...s, enabled: true }));
    fs.writeFileSync(configPath, JSON.stringify(servers, null, 2));
    monitor.loadConfig();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/admin/servers/bulk/disable', (req, res) => {
  const configPath = join(__dirname, '../config/servers.json');
  try {
    let servers = [];
    if (fs.existsSync(configPath)) {
      servers = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    servers = servers.map(s => ({ ...s, enabled: false }));
    fs.writeFileSync(configPath, JSON.stringify(servers, null, 2));
    monitor.loadConfig();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/admin/refresh', async (req, res) => {
  try {
    await monitor.refreshAll();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/admin/analytics', (req, res) => {
  const servers = monitor.getServers();
  const stats = monitor.getStats();
  res.json({
    ...stats,
    byType: servers.reduce((acc, s) => { acc[s.type] = (acc[s.type]||0)+1; return acc; }, {}),
    byGroup: servers.reduce((acc, s) => { if(s.group) acc[s.group] = (acc[s.group]||0)+1; return acc; }, {}),
    history: servers.map(s => ({ id: s.id, name: s.name, uptime: s.uptime || 0 }))
  });
});

app.get('/admin/logs', (req, res) => {
  res.json({ logs: [
    { time: new Date().toISOString(), level: 'info', message: 'System started' },
    { time: new Date().toISOString(), level: 'info', message: `Monitoring ${monitor.getServers().length} servers` }
  ]});
});

app.post('/admin/webhooks', express.json(), (req, res) => {
  res.json({ success: true, webhook: req.body });
});

app.get('/admin/webhooks', (req, res) => {
  res.json({ webhooks: [] });
});

app.post('/admin/apikeys', express.json(), (req, res) => {
  res.json({ key: 'gp_' + Math.random().toString(36).substring(2, 15), name: req.body.name || 'key' });
});

app.get('/admin/apikeys', (req, res) => {
  res.json({ keys: [{ name: 'default', key: 'gp_****', created: new Date().toISOString() }] });
});

app.get('/admin/templates', (req, res) => {
  res.json({ templates: [
    { id: 'minecraft', name: 'Minecraft Java', type: 'minecraft', port: 25565 },
    { id: 'cs2', name: 'Counter-Strike 2', type: 'cs2', port: 27015 },
    { id: 'fivem', name: 'FiveM', type: 'fivem', port: 30120 },
    { id: 'gmod', name: 'Garry\'s Mod', type: 'garrysmod', port: 27015 },
    { id: 'rust', name: 'Rust', type: 'rust', port: 28015 },
    { id: 'ark', name: 'ARK: Survival Evolved', type: 'arkse', port: 7777 }
  ]});
});

app.get('/admin/audit', (req, res) => {
  res.json({ logs: [
    { time: new Date().toISOString(), user: 'admin', action: 'login', details: 'Admin panel accessed' },
    { time: new Date().toISOString(), user: 'admin', action: 'view', details: 'Viewed server list' }
  ]});
});

app.get('/admin/alerts', (req, res) => {
  res.json({ rules: [
    { id: '1', name: 'Server Offline', condition: 'status == offline', action: 'notify', enabled: true },
    { id: '2', name: 'High Player Count', condition: 'players > 90%', action: 'notify', enabled: false }
  ]});
});

app.post('/admin/alerts', express.json(), (req, res) => {
  res.json({ success: true, rule: req.body });
});

app.get('/admin/maintenance', (req, res) => {
  res.json({ tasks: [] });
});

app.post('/admin/maintenance', express.json(), (req, res) => {
  res.json({ success: true, task: req.body });
});

app.get('/status/:id', (req, res) => {
  const servers = monitor.getServers();
  const server = servers.find(s => s.id === req.params.id);
  if (!server) return res.status(404).send('Not found');
  res.send(`<!DOCTYPE html><html><head><title>${server.name} - Status</title><style>body{font-family:system-ui;background:#0a0a0a;color:#e5e5e5;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}.card{background:#111;border:1px solid #1f1f1f;border-radius:12px;padding:2rem;max-width:400px;width:90%}.status{display:inline-block;padding:0.25rem 0.75rem;border-radius:6px;font-size:0.875rem}.online{background:rgba(34,197,94,0.1);color:#22c55e}.offline{background:rgba(239,68,68,0.1);color:#ef4444}h1{margin:0 0 1rem;font-size:1.25rem}p{color:#737373;margin:0.5rem 0}</style></head><body><div class="card"><h1>${server.name}</h1><span class="status ${server.status}">${server.status}</span><p>${server.type} • ${server.host}:${server.port}</p><p>Players: ${server.players||0}/${server.maxplayers||'?'}</p><p>${server.description||''}</p></div></body></html>`);
});

app.post('/api/refresh', async (req, res) => {
  try {
    await monitor.refreshAll();
    io.emit('servers:update', monitor.getServers());
    io.emit('stats:update', monitor.getStats());
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/admin/import', express.json(), (req, res) => {
  const configPath = join(__dirname, '../config/servers.json');
  try {
    const servers = req.body.servers || [];
    fs.writeFileSync(configPath, JSON.stringify(servers, null, 2));
    monitor.loadConfig();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/badge/:id.svg', (req, res) => {
  const servers = monitor.getServers();
  const server = servers.find(s => s.id === req.params.id);
  
  if (!server) {
    res.setHeader('Content-Type', 'image/svg+xml');
    return res.send(`<svg xmlns="http://www.w3.org/2000/svg" width="90" height="20"><rect width="90" height="20" fill="#555"/><text x="45" y="14" fill="#fff" font-size="11" text-anchor="middle">unknown</text></svg>`);
  }
  
  const isOnline = server.status === 'online';
  const color = isOnline ? '#4c1' : '#e05d44';
  const text = isOnline ? 'online' : 'offline';
  const label = server.name.length > 12 ? server.name.substring(0, 12) + '...' : server.name;
  
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'no-cache');
  res.send(`<svg xmlns="http://www.w3.org/2000/svg" width="${label.length * 6 + 55}" height="20"><linearGradient id="b" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient><clipPath id="a"><rect width="${label.length * 6 + 55}" height="20" rx="3" fill="#fff"/></clipPath><g clip-path="url(#a)"><path fill="#555" d="M0 0h${label.length * 6 + 5}v20H0z"/><path fill="${color}" d="M${label.length * 6 + 5} 0h${50}v20H${label.length * 6 + 5}z"/><path fill="url(#b)" d="M0 0h${label.length * 6 + 55}v20H0z"/></g><g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="110"><text x="${(label.length * 6 + 5) / 2 * 10}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="${(label.length * 6 + 5) - 10}">${label}</text><text x="${(label.length * 6 + 5) / 2 * 10}" y="140" transform="scale(.1)" textLength="${(label.length * 6 + 5) - 10}">${label}</text><text x="${(label.length * 6 + 5 + 25) * 10}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="400">${text}</text><text x="${(label.length * 6 + 5 + 25) * 10}" y="140" transform="scale(.1)" textLength="400">${text}</text></g></svg>`);
});

app.post('/api/rcon/:id', async (req, res) => {
  try {
    const servers = monitor.getServers();
    const server = servers.find(s => s.id === req.params.id);
    if (!server) return res.status(404).json({ error: 'Server not found' });
    if (!server.rcon || !server.rcon.enabled) return res.status(400).json({ error: 'RCON not enabled' });
    
    const { command } = req.body;
    if (!command) return res.status(400).json({ error: 'Command required' });
    
    const response = await rconService.command(server, command);
    res.json({ response });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

io.on('connection', (socket) => {
  socket.emit('servers:update', monitor.getServers());
  socket.emit('stats:update', monitor.getStats());
  
  socket.on('refresh', async () => {
    await monitor.refreshAll();
    io.emit('servers:update', monitor.getServers());
    io.emit('stats:update', monitor.getStats());
  });
});

monitor.on('update', (data) => {
  io.emit('servers:update', data.servers);
  io.emit('stats:update', data.stats);
});

httpServer.listen(PORT, () => {
  console.log(`🎮 GamePulse running on http://localhost:${PORT}`);
  monitor.start();
});
