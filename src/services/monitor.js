import { GameDig } from 'gamedig';
import { EventEmitter } from 'events';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cron from 'node-cron';
import { Notifier } from './notifier.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class GameMonitor extends EventEmitter {
  constructor() {
    super();
    this.servers = [];
    this.history = new Map();
    this.notifier = new Notifier();
    this.loadConfig();
  }

  loadConfig() {
    const configPath = join(__dirname, '../../config/servers.json');
    const examplePath = join(__dirname, '../../config/servers.example.json');
    
    try {
      if (fs.existsSync(configPath)) {
        this.servers = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      } else if (fs.existsSync(examplePath)) {
        this.servers = JSON.parse(fs.readFileSync(examplePath, 'utf8'));
      } else {
        this.servers = [];
      }
    } catch (err) {
      console.error('Error loading server config:', err);
      this.servers = [];
    }
  }

  async queryServer(server) {
    const key = server.id || `${server.host}:${server.port}`;
    
    try {
      const state = await GameDig.query({
        type: server.type,
        host: server.host,
        port: server.port,
        timeout: 5000
      });
      
      const result = {
        ...server,
        status: 'online',
        lastCheck: new Date().toISOString(),
        players: state.players?.length || state.raw?.numplayers || 0,
        maxPlayers: state.maxplayers || 0,
        map: state.map || 'N/A',
        name: state.name || server.name,
        version: state.version || 'N/A',
        ping: state.ping || null,
        playersList: state.players?.slice(0, 10) || []
      };
      
      await this.notifier.checkAndNotify(result);
      this.updateHistory(key, 'online');
      return result;
    } catch (err) {
      const result = {
        ...server,
        status: 'offline',
        lastCheck: new Date().toISOString(),
        players: 0,
        maxPlayers: 0,
        map: 'N/A',
        name: server.name,
        version: 'N/A',
        ping: null,
        playersList: [],
        error: err.message
      };
      
      await this.notifier.checkAndNotify(result);
      this.updateHistory(key, 'offline');
      return result;
    }
  }

  updateHistory(key, status) {
    if (!this.history.has(key)) {
      this.history.set(key, []);
    }
    const history = this.history.get(key);
    history.push({
      status,
      time: Date.now()
    });
    // Keep last 100 entries
    if (history.length > 100) {
      history.shift();
    }
  }

  getUptime(key) {
    const history = this.history.get(key);
    if (!history || history.length === 0) return 100;
    const online = history.filter(h => h.status === 'online').length;
    return Math.round((online / history.length) * 100);
  }

  getHistory(id) {
    const server = this.servers.find(s => s.id === id);
    if (!server) return [];
    const key = server.id || `${server.host}:${server.port}`;
    return this.history.get(key) || [];
  }

  async refreshAll() {
    const results = await Promise.all(
      this.servers.map(server => this.queryServer(server))
    );
    this.servers = results;
    this.emit('update', {
      servers: this.getServers(),
      stats: this.getStats()
    });
    return this.getServers();
  }

  getServers() {
    return this.servers.map(server => {
      const key = server.id || `${server.host}:${server.port}`;
      return {
        ...server,
        uptime: this.getUptime(key)
      };
    });
  }

  getStats() {
    const online = this.servers.filter(s => s.status === 'online').length;
    const total = this.servers.length;
    const totalPlayers = this.servers
      .filter(s => s.status === 'online')
      .reduce((sum, s) => sum + (s.players || 0), 0);
    
    return {
      online,
      total,
      offline: total - online,
      totalPlayers,
      uptime: Math.floor(process.uptime())
    };
  }

  start() {
    this.refreshAll();
    cron.schedule('*/30 * * * * *', () => {
      this.refreshAll();
    });
  }
}
