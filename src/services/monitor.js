import GameDig from 'gamedig';
import { EventEmitter } from 'events';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cron from 'node-cron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class GameMonitor extends EventEmitter {
  constructor() {
    super();
    this.servers = [];
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
    try {
      const state = await GameDig.query({
        type: server.type,
        host: server.host,
        port: server.port,
        timeout: 5000
      });
      
      return {
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
    } catch (err) {
      return {
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
    }
  }

  async refreshAll() {
    const results = await Promise.all(
      this.servers.map(server => this.queryServer(server))
    );
    this.servers = results;
    this.emit('update', {
      servers: this.servers,
      stats: this.getStats()
    });
    return this.servers;
  }

  getServers() {
    return this.servers;
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
