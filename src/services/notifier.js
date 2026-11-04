import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class Notifier {
  constructor() {
    this.config = this.loadConfig();
    this.lastStatus = new Map();
  }

  loadConfig() {
    const configPath = join(__dirname, '../../config/notifications.json');
    const examplePath = join(__dirname, '../../config/notifications.example.json');
    
    try {
      if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
      } else if (fs.existsSync(examplePath)) {
        return JSON.parse(fs.readFileSync(examplePath, 'utf8'));
      }
    } catch (err) {
      console.error('Error loading notification config:', err);
    }
    
    return { discord: { enabled: false }, telegram: { enabled: false }, notifyOnDown: true, notifyOnUp: true };
  }

  async checkAndNotify(server) {
    const key = server.id || `${server.host}:${server.port}`;
    const prevStatus = this.lastStatus.get(key);
    const currentStatus = server.status;
    
    if (prevStatus && prevStatus !== currentStatus) {
      if (currentStatus === 'offline' && this.config.notifyOnDown) {
        await this.sendNotification({
          title: '🔴 Server Down',
          server: server.name,
          message: `${server.name} (${server.host}:${server.port}) is now offline`,
          color: 0xff0000
        });
      } else if (currentStatus === 'online' && this.config.notifyOnUp && prevStatus === 'offline') {
        await this.sendNotification({
          title: '🟢 Server Up',
          server: server.name,
          message: `${server.name} (${server.host}:${server.port}) is back online`,
          color: 0x00ff00
        });
      }
    }
    
    this.lastStatus.set(key, currentStatus);
  }

  async sendNotification({ title, server, message, color }) {
    const promises = [];
    
    if (this.config.discord?.enabled && this.config.discord.webhookUrl) {
      promises.push(this.sendDiscord({ title, server, message, color }));
    }
    
    if (this.config.telegram?.enabled && this.config.telegram.botToken && this.config.telegram.chatId) {
      promises.push(this.sendTelegram(message));
    }
    
    await Promise.allSettled(promises);
  }

  async sendDiscord({ title, message, color }) {
    try {
      const payload = {
        embeds: [{
          title,
          description: message,
          color,
          timestamp: new Date().toISOString(),
          footer: {
            text: 'GamePulse'
          }
        }]
      };
      
      await fetch(this.config.discord.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error('Discord notification error:', err);
    }
  }

  async sendTelegram(message) {
    try {
      const url = `https://api.telegram.org/bot${this.config.telegram.botToken}/sendMessage`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: this.config.telegram.chatId,
          text: message,
          parse_mode: 'HTML'
        })
      });
    } catch (err) {
      console.error('Telegram notification error:', err);
    }
  }
}
