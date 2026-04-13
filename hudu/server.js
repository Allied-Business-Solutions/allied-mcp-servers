/**
 * Hudu MCP Server
 * Connects Claude AI to the Hudu IT documentation platform via the Model Context Protocol.
 *
 * This server runs as an HTTP service. Claude (Team or Code) connects to it and gains
 * the ability to search, read, create, and update documentation in Hudu.
 *
 * Setup: see README.md
 */

import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { z } from 'zod';
import 'dotenv/config';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const HUDU_BASE_URL = process.env.HUDU_BASE_URL || 'https://allied.huducloud.com/api/v1';
const HUDU_API_KEY = process.env.HUDU_API_KEY;
const PORT = parseInt(process.env.PORT || '3000', 10);

if (!HUDU_API_KEY) {
  console.error('ERROR: HUDU_API_KEY is not set. Copy .env.example to .env and add your key.');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Hudu API helper
// ---------------------------------------------------------------------------

async function huduRequest(path, options = {}) {
  const url = `${HUDU_BASE_URL}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'x-api-key': HUDU_API_KEY,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Hudu API error ${response.status} for ${path}: ${text}`);
  }

  // 204 No Content (e.g. after delete)
  if (response.status === 204) return { success: true };

  return response.json();
}

// Build a query string from an object, skipping undefined/null values
function buildQuery(params) {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      q.set(key, String(value));
    }
  }
  const str = q.toString();
  return str ? `?${str}` : '';
}

// ---------------------------------------------------------------------------
// MCP Server factory
// Each SSE connection gets its own McpServer instance
// ---------------------------------------------------------------------------

function createMcpServer() {
  const server = new McpServer({
    name: 'hudu-mcp-server',
    version: '1.0.0',
  });

  // -------------------------------------------------------------------------
  // ARTICLES (Knowledge Base)
  // -------------------------------------------------------------------------

  server.tool(
    'list_articles',
    'Search and list Knowledge Base articles in Hudu. Use this to find existing documentation before creating new articles.',
    {
      search: z.string().optional().describe('Full-text search query across article content'),
      name: z.string().optional().describe('Filter by article name (partial match)'),
      company_id: z.number().int().optional().describe('Filter to articles for a specific company'),
      folder_id: z.number().int().optional().describe('Filter to articles in a specific folder'),
      draft: z.boolean().optional().describe('If true, only return draft articles'),
      page: z.number().int().optional().describe('Page number (25 results per page)'),
    },
    async ({ search, name, company_id, folder_id, draft, page }) => {
      const data = await huduRequest(`/articles${buildQuery({ search, name, company_id, folder_id, draft, page })}`);
      const articles = data.articles || [];
      if (articles.length === 0) {
        return { content: [{ type: 'text', text: 'No articles found matching your criteria.' }] };
      }
      // Return a summary list, not the full HTML content of each article
      const summary = articles.map(a => ({
        id: a.id,
        name: a.name,
        company_id: a.company_id,
        folder_id: a.folder_id,
        draft: a.draft,
        updated_at: a.updated_at,
        url: a.url,
      }));
      return { content: [{ type: 'text', text: JSON.stringify(summary, null, 2) }] };
    }
  );

  server.tool(
    'get_article',
    'Get the full content of a specific Knowledge Base article by its ID.',
    {
      id: z.number().int().describe('The article ID (get this from list_articles)'),
    },
    async ({ id }) => {
      const data = await huduRequest(`/articles/${id}`);
      return { content: [{ type: 'text', text: JSON.stringify(data.article, null, 2) }] };
    }
  );

  server.tool(
    'create_article',
    'Create a new Knowledge Base article in Hudu. Content should be HTML.',
    {
      name: z.string().describe('Title of the article'),
      content: z.string().describe('Article body in HTML format (use <h1>, <h2>, <p>, <ul>, <li>, <strong>, <code> etc.)'),
      company_id: z.number().int().optional().describe('Associate with a specific company. Omit for a global article.'),
      folder_id: z.number().int().optional().describe('Place the article in a specific folder'),
      enable_sharing: z.boolean().optional().describe('If true, article gets a public URL for non-authenticated users'),
    },
    async ({ name, content, company_id, folder_id, enable_sharing }) => {
      const data = await huduRequest('/articles', {
        method: 'POST',
        body: JSON.stringify({
          article: { name, content, company_id, folder_id, enable_sharing },
        }),
      });
      return {
        content: [{
          type: 'text',
          text: `Article created successfully!\nID: ${data.article.id}\nName: ${data.article.name}\nURL: ${data.article.url}`,
        }],
      };
    }
  );

  server.tool(
    'update_article',
    'Update an existing Knowledge Base article. You can update the name, content, folder, or company association.',
    {
      id: z.number().int().describe('The article ID to update'),
      name: z.string().optional().describe('New title for the article'),
      content: z.string().optional().describe('New HTML content for the article'),
      company_id: z.number().int().optional().describe('Move to a different company (or set to global)'),
      folder_id: z.number().int().optional().describe('Move to a different folder'),
      enable_sharing: z.boolean().optional().describe('Toggle public sharing'),
    },
    async ({ id, name, content, company_id, folder_id, enable_sharing }) => {
      const data = await huduRequest(`/articles/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          article: { name, content, company_id, folder_id, enable_sharing },
        }),
      });
      return {
        content: [{
          type: 'text',
          text: `Article updated successfully!\nID: ${data.article.id}\nName: ${data.article.name}\nURL: ${data.article.url}`,
        }],
      };
    }
  );

  // -------------------------------------------------------------------------
  // COMPANIES
  // -------------------------------------------------------------------------

  server.tool(
    'list_companies',
    'List companies in Hudu. Use this to find a company ID before creating company-specific articles.',
    {
      name: z.string().optional().describe('Filter by company name'),
      search: z.string().optional().describe('Search across company fields'),
      page: z.number().int().optional().describe('Page number'),
    },
    async ({ name, search, page }) => {
      const data = await huduRequest(`/companies${buildQuery({ name, search, page })}`);
      const companies = data.companies || [];
      if (companies.length === 0) {
        return { content: [{ type: 'text', text: 'No companies found.' }] };
      }
      const summary = companies.map(c => ({
        id: c.id,
        name: c.name,
        city: c.city,
        state: c.state,
        url: c.url,
      }));
      return { content: [{ type: 'text', text: JSON.stringify(summary, null, 2) }] };
    }
  );

  server.tool(
    'get_company',
    'Get details of a specific company by ID.',
    {
      id: z.number().int().describe('The company ID'),
    },
    async ({ id }) => {
      const data = await huduRequest(`/companies/${id}`);
      return { content: [{ type: 'text', text: JSON.stringify(data.company, null, 2) }] };
    }
  );

  // -------------------------------------------------------------------------
  // FOLDERS
  // -------------------------------------------------------------------------

  server.tool(
    'list_folders',
    'List article folders in Hudu. Use this to find a folder ID when organizing articles.',
    {
      name: z.string().optional().describe('Filter by folder name'),
      company_id: z.number().int().optional().describe('Filter to folders for a specific company'),
      page: z.number().int().optional().describe('Page number'),
    },
    async ({ name, company_id, page }) => {
      const data = await huduRequest(`/folders${buildQuery({ name, company_id, page })}`);
      const folders = data.folders || [];
      if (folders.length === 0) {
        return { content: [{ type: 'text', text: 'No folders found.' }] };
      }
      return { content: [{ type: 'text', text: JSON.stringify(folders, null, 2) }] };
    }
  );

  // -------------------------------------------------------------------------
  // ASSETS
  // -------------------------------------------------------------------------

  server.tool(
    'list_assets',
    'Search for assets (hardware, software, devices) in Hudu. Useful for gathering context before writing documentation.',
    {
      search: z.string().optional().describe('Search query'),
      name: z.string().optional().describe('Filter by asset name'),
      company_id: z.number().int().optional().describe('Filter by company'),
      asset_layout_id: z.number().int().optional().describe('Filter by asset type/layout'),
      page: z.number().int().optional().describe('Page number'),
    },
    async ({ search, name, company_id, asset_layout_id, page }) => {
      const data = await huduRequest(`/assets${buildQuery({ search, name, company_id, asset_layout_id, page })}`);
      const assets = data.assets || [];
      if (assets.length === 0) {
        return { content: [{ type: 'text', text: 'No assets found matching your criteria.' }] };
      }
      const summary = assets.map(a => ({
        id: a.id,
        name: a.name,
        company_id: a.company_id,
        company_name: a.company_name,
        asset_type: a.asset_type,
        primary_serial: a.primary_serial,
        url: a.url,
      }));
      return { content: [{ type: 'text', text: JSON.stringify(summary, null, 2) }] };
    }
  );

  server.tool(
    'get_asset',
    'Get full details of a specific asset including all custom fields.',
    {
      company_id: z.number().int().describe('The company ID the asset belongs to'),
      id: z.number().int().describe('The asset ID'),
    },
    async ({ company_id, id }) => {
      const data = await huduRequest(`/companies/${company_id}/assets/${id}`);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );

  // -------------------------------------------------------------------------
  // PROCEDURES (Processes)
  // -------------------------------------------------------------------------

  server.tool(
    'list_procedures',
    'List procedures/processes in Hudu. These are step-by-step task checklists.',
    {
      name: z.string().optional().describe('Filter by procedure name'),
      company_id: z.number().int().optional().describe('Filter by company'),
      page: z.number().int().optional().describe('Page number'),
    },
    async ({ name, company_id, page }) => {
      const data = await huduRequest(`/procedures${buildQuery({ name, company_id, page })}`);
      const procedures = data.procedures || [];
      if (procedures.length === 0) {
        return { content: [{ type: 'text', text: 'No procedures found.' }] };
      }
      const summary = procedures.map(p => ({
        id: p.id,
        name: p.name,
        company_id: p.company_id,
        company_name: p.company_name,
        total_tasks: p.total,
        completed_tasks: p.completed,
        url: p.url,
      }));
      return { content: [{ type: 'text', text: JSON.stringify(summary, null, 2) }] };
    }
  );

  return server;
}

// ---------------------------------------------------------------------------
// Express HTTP server with SSE transport
// ---------------------------------------------------------------------------

const app = express();
app.use(express.json());

// Track active SSE connections
const transports = {};

// Health check endpoint — useful to confirm the server is running
app.get('/health', (req, res) => {
  res.json({ status: 'ok', server: 'hudu-mcp-server', version: '1.0.0' });
});

// SSE endpoint — Claude connects here to establish a session
app.get('/sse', async (req, res) => {
  console.log(`New Claude connection from ${req.ip}`);

  const transport = new SSEServerTransport('/messages', res);
  transports[transport.sessionId] = transport;

  res.on('close', () => {
    console.log(`Connection closed: ${transport.sessionId}`);
    delete transports[transport.sessionId];
  });

  const server = createMcpServer();
  await server.connect(transport);
});

// Message endpoint — Claude sends tool calls here
app.post('/messages', async (req, res) => {
  const sessionId = req.query.sessionId;
  const transport = transports[sessionId];

  if (!transport) {
    res.status(404).json({ error: 'Session not found. Reconnect to /sse first.' });
    return;
  }

  await transport.handlePostMessage(req, res);
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`Hudu MCP Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`SSE endpoint:  http://localhost:${PORT}/sse`);
  console.log(`Hudu instance: ${HUDU_BASE_URL}`);
});
