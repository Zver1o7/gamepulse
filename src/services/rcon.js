import { Rcon } from 'rcon-client';

export class RconService {
  constructor() {
    this.connections = new Map();
  }

  async connect(server) {
    if (!server.rcon || !server.rcon.enabled) return null;
    
    const key = server.id || `${server.host}:${server.port}`;
    
    try {
      const rcon = new Rcon({
        host: server.rcon.host || server.host,
        port: server.rcon.port || server.port + 10,
        password: server.rcon.password
      });
      
      await rcon.connect();
      this.connections.set(key, rcon);
      return rcon;
    } catch (err) {
      console.error(`RCON connection failed for ${server.name}:`, err.message);
      return null;
    }
  }

  async command(server, cmd) {
    if (!server.rcon || !server.rcon.enabled) throw new Error('RCON not enabled');
    
    const key = server.id || `${server.host}:${server.port}`;
    let rcon = this.connections.get(key);
    
    if (!rcon) {
      rcon = await this.connect(server);
    }
    
    if (!rcon) throw new Error('RCON connection failed');
    
    try {
      const response = await rcon.send(cmd);
      return response;
    } catch (err) {
      this.connections.delete(key);
      throw err;
    }
  }

  async disconnect(server) {
    const key = server.id || `${server.host}:${server.port}`;
    const rcon = this.connections.get(key);
    if (rcon) {
      await rcon.end();
      this.connections.delete(key);
    }
  }
}
