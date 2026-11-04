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
