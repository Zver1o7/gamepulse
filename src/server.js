import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { GameMonitor } from './services/monitor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(join(__dirname, '../public')));

const monitor = new GameMonitor();

app.get('/api/servers', (req, res) => {
  res.json(monitor.getServers());
});

app.get('/api/stats', (req, res) => {
  res.json(monitor.getStats());
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
