# ConnectWise Manage MCP Server

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server that exposes ConnectWise Manage as tools for Claude and other MCP clients.

## Features

| Area | Tools |
|------|-------|
| **Service Tickets** | List, Get, Create, Update, Add Note, Get Notes |
| **Companies & Contacts** | List/Get/Create Companies, List/Get/Create Contacts |
| **Time Entries** | List, Get, Create, Update, Delete |
| **Projects & Phases** | List/Get/Create Projects, List/Get/Create Phases, List Project Tickets |

## Prerequisites

- Node.js 18+
- A ConnectWise Manage instance with API access
- A ConnectWise Manage API key pair (Public + Private)
- A `clientId` from the [ConnectWise Developer Network](https://developer.connectwise.com)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Build

```bash
npm run build
```

### 3. Configure environment variables

Create a `.env` file (or set these in your shell / Claude Desktop config):

```env
CW_COMPANY_ID=mycompany          # Your ConnectWise company ID
CW_PUBLIC_KEY=your_public_key    # API public key
CW_PRIVATE_KEY=your_private_key  # API private key
CW_CLIENT_ID=your_client_id      # Client ID from CW Developer Network
CW_SITE_URL=na.myconnectwise.net # Your CW Manage host (no https://)
```

### 4. Add to Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or
`%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "connectwise": {
      "command": "node",
      "args": ["/absolute/path/to/connectwise-mcp/dist/index.js"],
      "env": {
        "CW_COMPANY_ID": "mycompany",
        "CW_PUBLIC_KEY": "your_public_key",
        "CW_PRIVATE_KEY": "your_private_key",
        "CW_CLIENT_ID": "your_client_id",
        "CW_SITE_URL": "na.myconnectwise.net"
      }
    }
  }
}
```

Restart Claude Desktop and the ConnectWise tools will be available.

## Available Tools

### Service Tickets
| Tool | Description |
|------|-------------|
| `cw_list_tickets` | List tickets with optional filters (status, board, company, assignee, priority) |
| `cw_get_ticket` | Get a ticket by ID |
| `cw_create_ticket` | Create a new ticket |
| `cw_update_ticket` | Update ticket fields (summary, status, priority, assignee) |
| `cw_add_ticket_note` | Add an internal or customer-visible note |
| `cw_get_ticket_notes` | Get all notes on a ticket |

### Companies & Contacts
| Tool | Description |
|------|-------------|
| `cw_list_companies` | List companies with optional filters |
| `cw_get_company` | Get a company by ID |
| `cw_create_company` | Create a new company |
| `cw_list_contacts` | List contacts with optional filters |
| `cw_get_contact` | Get a contact by ID |
| `cw_create_contact` | Create a new contact |

### Time Entries
| Tool | Description |
|------|-------------|
| `cw_list_time_entries` | List time entries with optional filters |
| `cw_get_time_entry` | Get a time entry by ID |
| `cw_create_time_entry` | Log a new time entry |
| `cw_update_time_entry` | Update a time entry |
| `cw_delete_time_entry` | Delete a time entry |

### Projects & Phases
| Tool | Description |
|------|-------------|
| `cw_list_projects` | List projects with optional filters |
| `cw_get_project` | Get a project by ID |
| `cw_create_project` | Create a new project |
| `cw_list_phases` | List phases for a project |
| `cw_get_phase` | Get a specific phase |
| `cw_create_phase` | Create a new phase on a project |
| `cw_list_project_tickets` | List tickets/tasks in a project |

## Development

```bash
# Run in watch mode (auto-recompile on save)
npm run watch

# Run directly with ts-node (no build step)
npm run dev
```

## Extending

Each area lives in its own file under `src/tools/`. To add a new tool:

1. Add a tool definition to the `*Tools` array in the appropriate file.
2. Add a `case` in the `handle*Tool` function.
3. Register the tool array in `src/index.ts` if you created a new file.
