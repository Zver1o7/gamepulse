<div align="center">

# GamePulse

**Real-time game server monitoring dashboard with a sleek, modern interface**

*By [Zver1o7](https://github.com/Zver1o7)*

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![GitHub Stars](https://img.shields.io/github/stars/Zver1o7/gamepulse?style=social)](https://github.com/Zver1o7/gamepulse)

[Features](#features) • [Quick Start](#quick-start) • [Configuration](#configuration) • [Supported Games](#supported-games) • [Deployment](#deployment)

</div>

## ✨ Features

- **Real-time Monitoring** - Live server status updates via WebSocket every 30 seconds
- **Multi-Game Support** - Works with Minecraft, CS2, FiveM, Garry's Mod, Source engine games, and 100+ more via [GameDig](https://github.com/gamedig/node-gamedig)
- **Beautiful Dashboard** - Modern dark/light theme with smooth animations
- **Search & Filters** - Quickly find servers by name, game, or filter by status
- **Server Groups** - Organize servers by categories
- **At-a-Glance Stats** - Total servers, online count, player count, and uptime
- **Uptime Tracking** - Historical uptime percentage for each server
- **Discord & Telegram Alerts** - Get notified when servers go down or come back up
- **Player Lists** - See who's online on supported servers
- **Map & Version Info** - Track current maps, game versions, and server details
- **Ping Monitoring** - Latency tracking for better insights
- **REST API** - Access server data programmatically
- **Docker Ready** - One command deployment with Docker Compose
- **Lightweight** - Minimal resource usage, perfect for VPS hosting

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 20+ installed
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/Zver1o7/gamepulse.git
cd gamepulse

# Install dependencies
npm install

# Configure your servers
cp config/servers.example.json config/servers.json
# Edit config/servers.json with your server details

# Start the server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## ⚙️ Configuration

Edit `config/servers.json` to add your game servers:

```json
[
  {
    "id": "unique-id",
    "name": "My Awesome Server",
    "type": "minecraft",
    "host": "play.example.com",
    "port": 25565,
    "game": "Minecraft"
  }
]
```

### Notifications (Optional)

Get alerts when servers go offline or come back online:

```bash
# Copy the example config
cp config/notifications.example.json config/notifications.json
```

Edit `config/notifications.json`:

```json
{
  "discord": {
    "enabled": true,
    "webhookUrl": "https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN"
  },
  "telegram": {
    "enabled": false,
    "botToken": "YOUR_BOT_TOKEN",
    "chatId": "YOUR_CHAT_ID"
  },
  "notifyOnDown": true,
  "notifyOnUp": true
}
```

### Finding the correct `type`

GamePulse uses [GameDig](https://github.com/gamedig/node-gamedig). Check their [game list](https://github.com/gamedig/node-gamedig#games-list) for supported game types.

Common types: `minecraft`, `cs2`, `csgo`, `fivem`, `garrysmod`, `tf2`, `rust`, `valheim`, etc.

## 🎮 Supported Games

GamePulse supports any game server that GameDig can query, including:

| Game | Type | Notes |
|---|---|---|
| Minecraft (Java/Bedrock) | `minecraft` / `minecraftbedrock` | Full support |
| Counter-Strike 2 | `cs2` | Player list, map, etc. |
| FiveM | `fivem` | Great for RP servers |
| Garry's Mod | `garrysmod` | Full support |
| Team Fortress 2 | `tf2` | Full support |
| Rust | `rust` | Full support |
| ARK: Survival Evolved | `arkse` | Full support |
| And 100+ more... | See GameDig docs | Universal support |

## 🐳 Deployment

### Docker Compose (Recommended)

```bash
# Clone and configure
git clone https://github.com/Zver1o7/gamepulse.git
cd gamepulse
cp config/servers.example.json config/servers.json
nano config/servers.json

# Start with Docker
docker-compose up -d
```

### Docker

```bash
docker build -t gamepulse .
docker run -d -p 3000:3000 -v $(pwd)/config:/app/config --name gamepulse gamepulse
```

### PM2 (Production)

```bash
npm install -g pm2
pm2 start src/server.js --name gamepulse
pm2 save
pm2 startup
```

## 🛠️ Tech Stack

- **Backend**: [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), [Socket.IO](https://socket.io/)
- **Server Queries**: [GameDig](https://github.com/gamedig/node-gamedig)
- **Scheduling**: [node-cron](https://github.com/node-cron/node-cron)
- **Frontend**: Vanilla JavaScript, CSS3 with modern animations
- **Fonts**: [Inter](https://rsms.me/inter/), [Font Awesome](https://fontawesome.com/)

## 📊 API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/servers` | GET | Get all server statuses |
| `/api/stats` | GET | Get dashboard statistics |

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💡 Ideas for Future

- [x] Discord webhook notifications
- [x] Telegram bot integration
- [x] Server uptime history tracking
- [x] Themes/customization (dark/light)
- [x] RCON integration (API)
- [x] Multi-language support (EN/RU)
- [x] PWA support
- [ ] Server uptime history & graphs (UI)
- [ ] User authentication
- [ ] Advanced charts & analytics

---

<div align="center">

**Made with ❤️ for the game server community**

[Report Bug](https://github.com/Zver1o7/gamepulse/issues) • [Request Feature](https://github.com/Zver1o7/gamepulse/issues)

</div>
