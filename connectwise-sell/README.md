# ConnectWise Sell MCP Server

An MCP (Model Context Protocol) server that exposes the full **ConnectWise Sell (Quosal)** REST API as tools consumable by Claude Desktop or any MCP-compatible client.

---

## Prerequisites

- **Node.js 18+** – [Download](https://nodejs.org/)
- A ConnectWise Sell account with API access
- Your **Access Key** (visible in the URL when logged into Sell)

---

## Installation

```bash
cd C:\Users\jwilborn\AppData\Local\Programs\ConnectWiseSell
npm install
```

---

## Configuration

The server reads credentials from **environment variables**. Set these before running:

| Variable              | Description                                                          |
|-----------------------|----------------------------------------------------------------------|
| `CW_SELL_ACCESS_KEY`  | Your Quosal access key (from the URL when logged in)                 |
| `CW_SELL_USERNAME`    | Your Sell API username                                               |
| `CW_SELL_PASSWORD`    | Your Sell password                                                   |
| `CW_SELL_BASE_URL`    | *(Optional)* Override the base URL. Default: `https://sellapi.quosalsell.com` |

### How authentication works

The API uses HTTP Basic Auth with a specially formatted credential:

```
Username: <accessKey>+<sellAPIUsername>
Password: <sellPassword>
```

The server builds this automatically from the environment variables above.

---

## Claude Desktop Integration

Add the following to your Claude Desktop config file:

**Location:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "connectwise-sell": {
      "command": "node",
      "args": [
        "C:\\Users\\jwilborn\\AppData\\Local\\Programs\\ConnectWiseSell\\src\\index.js"
      ],
      "env": {
        "CW_SELL_ACCESS_KEY": "your_access_key_here",
        "CW_SELL_USERNAME":   "your_username_here",
        "CW_SELL_PASSWORD":   "your_password_here"
      }
    }
  }
}
```

Restart Claude Desktop after saving. You should see the ConnectWise Sell tools available.

---

## Available Tools

### Quotes
| Tool | Description |
|------|-------------|
| `cws_get_quotes` | List/search quotes with filtering and pagination |
| `cws_get_quote_by_id` | Get a quote by its unique ID |
| `cws_delete_quote_by_id` | Delete a quote by ID |
| `cws_patch_quote_by_id` | Partially update a quote (JSON Patch) |
| `cws_get_quotes_by_number` | Get all versions of a quote by its number |
| `cws_get_latest_quote_version` | Get the latest version of a quote |
| `cws_get_quote_version` | Get a specific version of a quote |
| `cws_delete_quote_version` | Delete a specific quote version |
| `cws_copy_quote` | Copy a quote by ID |

### Quote Customers
| Tool | Description |
|------|-------------|
| `cws_get_quote_customers` | List all customers on a quote |
| `cws_put_quote_customer` | Full replace of a customer record |
| `cws_delete_quote_customer` | Remove a customer from a quote |
| `cws_patch_quote_customer` | Partial update of a customer (JSON Patch) |

### Quote Items (Line Items)
| Tool | Description |
|------|-------------|
| `cws_get_quote_items` | List/search line items |
| `cws_post_quote_item` | Add a line item to a quote |
| `cws_get_quote_item_by_id` | Get a line item by ID |
| `cws_delete_quote_item_by_id` | Delete a line item |
| `cws_patch_quote_item_by_id` | Partial update of a line item (JSON Patch) |

### Quote Tabs
| Tool | Description |
|------|-------------|
| `cws_get_quote_tabs` | List quote tabs/sections |
| `cws_get_quote_items_by_tab` | Get all items within a specific tab |

### Quote Terms
| Tool | Description |
|------|-------------|
| `cws_get_quote_terms` | Get financing/payment terms for a quote |
| `cws_add_quote_term` | Add a term to a quote |
| `cws_delete_quote_term` | Remove a term |
| `cws_patch_quote_term` | Partial update of a term (JSON Patch) |

### Reference Data
| Tool | Description |
|------|-------------|
| `cws_get_recurring_revenues` | List recurring revenue profiles |
| `cws_get_tax_codes` | List available tax codes |
| `cws_get_templates` | List quote templates |

### User Settings
| Tool | Description |
|------|-------------|
| `cws_get_user` | Get current user profile/settings |
| `cws_patch_user` | Update user settings (JSON Patch) |

---

## JSON Patch format

Several tools accept a `patch` array following [RFC 6902](https://www.rfc-editor.org/rfc/rfc6902). Example:

```json
[
  { "op": "replace", "path": "/quoteStatus", "value": "Won" },
  { "op": "replace", "path": "/primaryRep",  "value": "john.doe" }
]
```

---

## Filtering with `conditions`

The `conditions` parameter on list endpoints uses the Quosal filter syntax, e.g.:

```
quoteStatus='Active'
accountName contains 'Acme'
createDate > '2024-01-01'
```

---

## Troubleshooting

- **401 Unauthorized** – Check that `CW_SELL_ACCESS_KEY`, `CW_SELL_USERNAME`, and `CW_SELL_PASSWORD` are all set and correct. The access key is the value of the `cw_accesskey` (or similar) URL parameter when you're logged into Sell.
- **404 Not Found** – Verify the `CW_SELL_BASE_URL` matches your Sell instance. Some on-premise deployments use a different hostname.
- **Node not found** – Make sure Node.js 18+ is installed and on your PATH.
