# Hudu MCP Server

Connects Claude AI to your Hudu IT documentation platform. Once running, Claude can search, read, create, and update Knowledge Base articles directly in Hudu.

---

## What This Does

When your team uses Claude (via Claude.ai Team or Claude Code), Claude gains these capabilities:

| Tool | What it does |
|------|-------------|
| `list_articles` | Search existing KB articles |
| `get_article` | Read a specific article's full content |
| `create_article` | Write and publish a new article |
| `update_article` | Edit an existing article |
| `list_companies` | Find companies and their IDs |
| `list_folders` | Find folders to organize articles |
| `list_assets` | Search assets for context |
| `get_asset` | Read full asset details |
| `list_procedures` | Browse procedures/processes |

---

## Prerequisites

- **Node.js 18 or newer** — download from https://nodejs.org (choose LTS)
- **A Hudu API key** — get one from Hudu Admin → Basic Information → API Keys
- A server or always-on machine to host this (for team use)

---

## Setup (One-Time)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_ORG/hudu-mcp-server.git
cd hudu-mcp-server
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create your config file

```bash
cp .env.example .env
```

Open `.env` in Notepad and fill in:

```
HUDU_BASE_URL=https://allied.huducloud.com/api/v1
HUDU_API_KEY=paste_your_api_key_here
PORT=3000
```

**Important:** Never commit `.env` to GitHub. It contains your secret API key. The `.gitignore` file already prevents this.

### 4. Start the server

```bash
npm start
```

You should see:
```
Hudu MCP Server running on port 3000
Health check: http://localhost:3000/health
SSE endpoint:  http://localhost:3000/sse
```

Visit `http://localhost:3000/health` in a browser to confirm it's working.

---

## Running as a Windows Service (So It Starts Automatically)

For a server that should always be running, use `node-windows` or Task Scheduler. The simplest option is PM2:

```bash
npm install -g pm2
pm2 start server.js --name hudu-mcp
pm2 startup   # follow the instructions it prints to auto-start on boot
pm2 save
```

---

## Configuring Claude Team (Recommended — One Setup for Everyone)

1. Go to **Claude.ai → Admin → Settings → Integrations**
2. Add a new MCP server with these settings:
   - **Name:** Hudu Documentation
   - **URL:** `https://your-server-address:3000/sse`
     (replace with your server's actual IP/hostname)
3. Save — all team members now have Hudu access in Claude automatically

**If your server is only on the internal network**, team members must be on the network or VPN.

---

## Configuring Claude Code (Individual Use)

Add to your `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "hudu": {
      "type": "sse",
      "url": "http://YOUR_SERVER_IP:3000/sse"
    }
  }
}
```

---

## Example Conversations with Claude

Once connected, your team can say things like:

> "Search Hudu for any articles about VPN setup and summarize what we have"

> "Create a new article in Hudu called 'Windows 11 Autopilot Enrollment' under the Allied IT company and write it based on this process: [paste steps]"

> "Find the article about printer setup and update it to include the new IP address 192.168.1.50"

> "Look up what assets we have documented for Contoso Corp and draft a network overview article"

---

## Troubleshooting

**"HUDU_API_KEY is not set"** — Make sure `.env` exists and has your key. Restart the server after editing.

**401 Unauthorized from Hudu** — Your API key is wrong or expired. Generate a new one in Hudu Admin.

**Claude can't connect** — Check that the server is running (`npm start`) and the URL in Claude's settings matches your server's address and port.

**Firewall issues** — Make sure port 3000 (or your chosen PORT) is open on the server's firewall for inbound connections.

---

## Adding More Capabilities

The server is built to be extended. Each tool is a self-contained function in `server.js`. To add a new tool, copy an existing `server.tool(...)` block and adapt it. The Hudu API documentation (swagger JSON) describes all available endpoints.

---

## File Structure

```
hudu-mcp-server/
├── server.js        ← Main server code (edit this to add tools)
├── package.json     ← Dependencies
├── .env             ← Your secrets (NOT in GitHub)
├── .env.example     ← Template showing required variables
├── .gitignore       ← Prevents secrets from being committed
└── README.md        ← This file
```
