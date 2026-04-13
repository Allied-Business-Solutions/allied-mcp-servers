# Allied MCP Servers

Internal MCP (Model Context Protocol) servers built by Allied Business Solutions for use with Claude Desktop and Claude.ai.

## Servers

| Server | Description | Auth |
|--------|-------------|------|
| [connectwise-manage](./connectwise-manage/) | ConnectWise Manage (PSA) — tickets, companies, time, projects | API Key (Public/Private) |
| [connectwise-sell](./connectwise-sell/) | ConnectWise Sell (Quosal) — quotes, line items, customers | Basic Auth |
| [hudu](./hudu/) | Hudu Documentation — assets, articles, passwords, companies | API Key |

## Prerequisites

- Node.js 18+
- Claude Desktop (for stdio transport)

## Install All Servers

```bash
cd connectwise-manage && npm install
cd ../connectwise-sell && npm install
cd ../hudu && npm install
```

## Claude Desktop Config

Each server's README has its own `claude_desktop_config.json` snippet. Merge all entries under `"mcpServers"` in:

```
%APPDATA%\Claude\claude_desktop_config.json
```

## Environment Variables

**Never commit credentials.** Each server reads from environment variables set in the Claude Desktop config (the `"env"` block). See each server's README for the required variables.

---

Allied Business Solutions — Internal Use Only
