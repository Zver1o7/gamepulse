<div align="center">

# GamePulse

**Clean, professional real-time game server monitoring dashboard**

*By [Zver1o7](https://github.com/Zver1o7)*

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![GitHub Stars](https://img.shields.io/github/stars/Zver1o7/gamepulse?style=social)](https://github.com/Zver1o7/gamepulse)

## 📸 Screenshots

<div align="center">
<img src="assets/screenshot-clean.svg" alt="GamePulse Dashboard" width="100%">
</div>

<details>
<summary>More Screenshots - All Features (20+)</summary>

<div align="center">

**Search & Filters**
<img src="assets/screenshot-filters.svg" alt="Search and Filters" width="100%">

**Light Theme**
<img src="assets/screenshot-light.svg" alt="Light Theme" width="100%">

**Basic Admin Panel**
<img src="assets/screenshot-admin.svg" alt="Admin Panel" width="100%">

**Admin Overview Dashboard**
<img src="assets/screenshot-admin-overview.svg" alt="Admin Overview" width="100%">

**Server Edit with Description & Tags**
<img src="assets/screenshot-admin-edit.svg" alt="Server Edit" width="100%">

**RCON Console**
<img src="assets/screenshot-admin-rcon.svg" alt="RCON Console" width="100%">

**Server Groups**
<img src="assets/screenshot-admin-groups.svg" alt="Server Groups" width="100%">

**Tags Management**
<img src="assets/screenshot-admin-tags.svg" alt="Tags" width="100%">

**Backup & Restore**
<img src="assets/screenshot-admin-backup.svg" alt="Backup" width="100%">

**System Logs**
<img src="assets/screenshot-admin-logs.svg" alt="Logs" width="100%">

**System Info**
<img src="assets/screenshot-admin-system.svg" alt="System" width="100%">

**User Management**
<img src="assets/screenshot-admin-users.svg" alt="Users" width="100%">

**API Documentation**
<img src="assets/screenshot-docs.svg" alt="API Documentation" width="100%">

</div>
</details>

[Features](#-features) • [Quick Start](#-quick-start) • [Configuration](#️-configuration) • [Supported Games](#-supported-games) • [Deployment](#-deployment)

</div>

## ✨ Features

- **Real-time Monitoring** - Live server status updates via WebSocket every 30 seconds
- **Multi-Game Support** - Works with Minecraft, CS2, FiveM, Garry's Mod, Source engine games, and 100+ more via [GameDig](https://github.com/gamedig/node-gamedig)
- **Clean Dashboard** - Professional dark/light theme
- **Search & Filters** - Quickly find servers by name, game, or filter by status
- **Server Groups** - Organize servers by categories
- **User Authentication** - Secure login for admin panel with session tokens
- **Uptime History & Graphs** - Visual charts showing server uptime over time
- **Advanced Analytics** - Charts for server types, groups, status distribution
- **Server Detail View** - Modal with tabs: info, uptime graph, 30-day heatmap, notes
- **30-Day Uptime Heatmap** - GitHub-style daily uptime grid per server
- **Server Comparison** - Side-by-side comparison of selected servers
- **Server Notes** - Per-server note timeline, stored on disk
- **Scheduled Reports** - Auto-generated every 6h with full history
- **Webhook Testing** - Test any webhook URL directly from admin
- **API Rate Limiting** - 120 req/min public, 240 req/min admin per IP
- **Ping / Latency Graphs** - Track network latency per server
- **Players Over Time** - Player count trend chart in analytics
- **Favorites** - Star servers and filter to favorites only
- **CSV Export** - Export the whole server list as CSV in one click
- **Notifications Center** - Live badge + panel for offline servers
- **Keyboard Shortcuts** - A / R / N / T / `/` / `?` / Esc in the admin panel
- **Dark & Light Theme Toggle** - Saved to localStorage
- **Health Check Endpoint** - Public `/health` for uptime monitoring services
- **Modern Admin Panel** - Sleek sidebar design with 150+ functions
- **Reports & Insights** - Generate system reports and statistics
- **Server Descriptions & Tags** - Rich metadata for every server
- **Server Groups & Templates** - Organize servers and quick-add with templates
- **Alert Rules & Maintenance** - Configurable alerts and maintenance scheduling
- **Webhooks & Integrations** - Discord, Telegram, custom webhooks, Slack
- **Status Pages** - Public status page for each server (`/status/:id`)
- **RCON Console** - Built-in remote console in admin panel
- **Audit Log** - Track admin actions and system events
- **Backup & Restore** - Export/import configurations, create backups
- **At-a-Glance Stats** - Total servers, online count, player count, and uptime
- **Uptime Tracking** - Historical uptime percentage for each server
- **Discord & Telegram Alerts** - Get notified when servers go down or come back up
- **RCON Integration** - Remote console API for supported servers
- **Copy IP** - One-click copy server addresses
- **PWA Support** - Install as desktop/mobile app
- **Multi-language** - English and Russian support
- **REST API** - Full API access with documentation
- **Status Badges** - Embeddable SVG badges
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

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/servers` | GET | Get all server statuses |
| `/api/stats` | GET | Get dashboard statistics |
| `/api/history/:id` | GET | Get uptime history for a server |
| `/api/badge/:id.svg` | GET | Get status badge SVG |
| `/api/rcon/:id` | POST | Send RCON command |
| `/api/auth/login` | POST | Admin login |
| `/api/auth/me` | GET | Current session info |
| `/status/:id` | GET | Public status page |
| `/health` | GET | Health/version check (public) |
| `/admin/export.csv` | GET | Export servers as CSV |
| `/admin/favorites` | GET/POST | Toggle favorites |
| `/admin/ping/:id` | GET | Ping history for a server |
| `/admin/notifications` | GET | Notifications center |
| `/admin/server/:id/detail` | GET | Full server detail (history + notes) |
| `/admin/server/:id/heatmap` | GET | 30-day uptime heatmap data |
| `/admin/notes/:id` | GET/POST | Server notes |
| `/admin/compare?ids=` | GET | Compare servers side-by-side |
| `/admin/reports/history` | GET | Report history |
| `/admin/reports/generate` | POST | Generate report now |
| `/admin/webhooks/test` | POST | Test a webhook URL |
| `/admin/*` | GET/POST/PUT/DELETE | Admin API (requires auth) |

See `/docs.html` for more details.

## Admin Panel

- URL: `/admin` (redirects to `/login.html` if not authenticated)
- Default login: `admin` / `admin123`
- Set custom credentials via env vars: `ADMIN_USER`, `ADMIN_PASSWORD`

## Contributing

Contributions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Roadmap

- [x] Discord webhook notifications
- [x] Telegram bot integration
- [x] Server uptime history tracking
- [x] Themes/customization (dark/light)
- [x] RCON integration (API)
- [x] Multi-language support (EN/RU)
- [x] PWA support
- [x] Server uptime history & graphs (UI)
- [x] User authentication
- [x] Advanced charts & analytics
- [x] Public status pages
- [x] Webhooks & integrations
- [x] Alert rules & maintenance
- [x] Ping / latency graphs
- [x] Favorites & CSV export
- [x] Notifications center
- [x] Keyboard shortcuts & theme toggle
- [x] Health check endpoint
- [x] Server detail view with tabs
- [x] 30-day uptime heatmap
- [x] Server comparison tool
- [x] Server notes
- [x] Scheduled reports (6h auto)
- [x] Webhook testing
- [x] API rate limiting
- [ ] Multi-user roles & permissions
- [ ] Scheduled reports & email notifications
- [ ] Mobile app

---

<div align="center">

**Made with care for the game server community**  
**By Zver1o7** — [GitHub](https://github.com/Zver1o7/gamepulse)

[Report Bug](https://github.com/Zver1o7/gamepulse/issues) • [Request Feature](https://github.com/Zver1o7/gamepulse/issues)

</div>