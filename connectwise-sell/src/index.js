#!/usr/bin/env node
/**
 * ConnectWise Sell (Quosal) MCP Server
 * Based on the ConnectWiseSellService API (swagger 2.0)
 * Host: sellapi.quosalsell.com
 *
 * Authentication: Basic Auth
 *   Username: <accessKey>+<sellAPIUsername>
 *   Password: <sellPassword>
 *
 * Required environment variables:
 *   CW_SELL_ACCESS_KEY   – Your Quosal access key (from the URL when logged in)
 *   CW_SELL_USERNAME     – Your Sell API username
 *   CW_SELL_PASSWORD     – Your Sell password
 *
 * Optional environment variables:
 *   CW_SELL_BASE_URL     – Override the base URL (default: https://sellapi.quosalsell.com)
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const BASE_URL =
  process.env.CW_SELL_BASE_URL?.replace(/\/$/, "") ||
  "https://sellapi.quosalsell.com";

function getAuthHeader() {
  const accessKey = process.env.CW_SELL_ACCESS_KEY;
  const username = process.env.CW_SELL_USERNAME;
  const password = process.env.CW_SELL_PASSWORD;

  if (!accessKey || !username || !password) {
    throw new Error(
      "Missing required environment variables: CW_SELL_ACCESS_KEY, CW_SELL_USERNAME, CW_SELL_PASSWORD"
    );
  }

  const credentials = Buffer.from(
    `${accessKey}+${username}:${password}`
  ).toString("base64");
  return `Basic ${credentials}`;
}

// ---------------------------------------------------------------------------
// HTTP helper
// ---------------------------------------------------------------------------
async function apiRequest(method, path, body = null, queryParams = {}) {
  const url = new URL(`${BASE_URL}${path}`);

  // Append query params (skip undefined/null)
  for (const [key, value] of Object.entries(queryParams)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  const headers = {
    Authorization: getAuthHeader(),
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const options = { method, headers };
  if (body !== null) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url.toString(), options);

  let responseBody;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    responseBody = await response.json();
  } else {
    responseBody = await response.text();
  }

  if (!response.ok) {
    throw new Error(
      `API error ${response.status} ${response.statusText}: ${JSON.stringify(responseBody)}`
    );
  }

  return responseBody;
}

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------
const TOOLS = [
  // ── Quotes ────────────────────────────────────────────────────────────────
  {
    name: "cws_get_quotes",
    description:
      "List/search quotes in ConnectWise Sell. Supports pagination, field selection, and condition filtering.",
    inputSchema: {
      type: "object",
      properties: {
        showAllVersions: {
          type: "boolean",
          description: "When true, returns all versions of each quote.",
        },
        includeFields: {
          type: "string",
          description:
            "Comma-separated list of fields to include in the response.",
        },
        conditions: {
          type: "string",
          description:
            'Filter condition string (e.g. "quoteStatus=\'Active\'").',
        },
        page: {
          type: "integer",
          description: "Page number for pagination (1-based).",
        },
        pageSize: {
          type: "integer",
          description: "Number of records per page.",
        },
      },
    },
  },
  {
    name: "cws_get_quote_by_id",
    description: "Retrieve a single quote by its unique ID.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string", description: "The quote's unique identifier." },
      },
    },
  },
  {
    name: "cws_delete_quote_by_id",
    description: "Delete a quote by its unique ID.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string", description: "The quote's unique identifier." },
      },
    },
  },
  {
    name: "cws_patch_quote_by_id",
    description:
      "Partially update a quote using a JSON Patch document (RFC 6902). Each operation has 'op', 'path', and optionally 'value'.",
    inputSchema: {
      type: "object",
      required: ["id", "patch"],
      properties: {
        id: { type: "string", description: "The quote's unique identifier." },
        patch: {
          type: "array",
          description:
            "Array of JSON Patch operations. E.g. [{\"op\":\"replace\",\"path\":\"/quoteStatus\",\"value\":\"Won\"}]",
          items: {
            type: "object",
            required: ["op", "path"],
            properties: {
              op: {
                type: "string",
                enum: ["add", "remove", "replace", "move", "copy", "test"],
              },
              path: { type: "string" },
              value: {},
              from: { type: "string" },
            },
          },
        },
      },
    },
  },
  {
    name: "cws_get_quotes_by_number",
    description: "Get all versions of a quote by its quote number.",
    inputSchema: {
      type: "object",
      required: ["quoteNumber"],
      properties: {
        quoteNumber: {
          type: "integer",
          description: "The quote number (not the UUID).",
        },
      },
    },
  },
  {
    name: "cws_get_latest_quote_version",
    description: "Get the latest version of a quote by its quote number.",
    inputSchema: {
      type: "object",
      required: ["quoteNumber"],
      properties: {
        quoteNumber: { type: "integer", description: "The quote number." },
      },
    },
  },
  {
    name: "cws_get_quote_version",
    description: "Get a specific version of a quote by quote number and version.",
    inputSchema: {
      type: "object",
      required: ["quoteNumber", "quoteVersion"],
      properties: {
        quoteNumber: { type: "integer", description: "The quote number." },
        quoteVersion: {
          type: "integer",
          description: "The quote version number.",
        },
      },
    },
  },
  {
    name: "cws_delete_quote_version",
    description: "Delete a specific version of a quote.",
    inputSchema: {
      type: "object",
      required: ["quoteNumber", "quoteVersion"],
      properties: {
        quoteNumber: { type: "integer", description: "The quote number." },
        quoteVersion: {
          type: "integer",
          description: "The quote version to delete.",
        },
      },
    },
  },
  {
    name: "cws_copy_quote",
    description: "Create a copy of an existing quote by its ID.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: {
          type: "string",
          description: "The unique ID of the quote to copy.",
        },
      },
    },
  },

  // ── Quote Customers ───────────────────────────────────────────────────────
  {
    name: "cws_get_quote_customers",
    description: "Get all customers (billing/shipping contacts) for a quote.",
    inputSchema: {
      type: "object",
      required: ["quoteId"],
      properties: {
        quoteId: { type: "string", description: "The quote's unique ID." },
      },
    },
  },
  {
    name: "cws_put_quote_customer",
    description:
      "Replace (full update) a quote customer record. Provide all CustomerView fields you want to set.",
    inputSchema: {
      type: "object",
      required: ["quoteId", "id", "requestBody"],
      properties: {
        quoteId: { type: "string", description: "The quote's unique ID." },
        id: {
          type: "string",
          description: "The quote customer record's unique ID.",
        },
        requestBody: {
          type: "object",
          description: "CustomerView object with updated fields.",
          properties: {
            accountName: { type: "string" },
            accountNumber: { type: "string" },
            address1: { type: "string" },
            address2: { type: "string" },
            city: { type: "string" },
            companyId: { type: "string" },
            country: { type: "string" },
            customCustomerString1: { type: "string" },
            customCustomerString2: { type: "string" },
            customCustomerString3: { type: "string" },
            customerSource: { type: "string" },
            customerSourceId: { type: "string" },
            dayPhone: { type: "string" },
            description: { type: "string" },
            emailAddress: { type: "string" },
            firstName: { type: "string" },
            integrationId: { type: "string" },
            jobTitle: { type: "string" },
            lastName: { type: "string" },
            locationId: { type: "string" },
            mobilePhone: { type: "string" },
            postalCode: { type: "string" },
            priceLevel: { type: "string" },
            priceLevelName: { type: "string" },
            state: { type: "string" },
            taxExternalReferenceId: { type: "string" },
            title: { type: "string" },
            userId: { type: "string" },
          },
        },
      },
    },
  },
  {
    name: "cws_delete_quote_customer",
    description: "Remove a customer record from a quote.",
    inputSchema: {
      type: "object",
      required: ["quoteId", "id"],
      properties: {
        quoteId: { type: "string", description: "The quote's unique ID." },
        id: { type: "string", description: "The customer record's unique ID." },
      },
    },
  },
  {
    name: "cws_patch_quote_customer",
    description: "Partially update a quote customer using JSON Patch (RFC 6902).",
    inputSchema: {
      type: "object",
      required: ["quoteId", "id", "patch"],
      properties: {
        quoteId: { type: "string", description: "The quote's unique ID." },
        id: { type: "string", description: "The customer record's unique ID." },
        patch: {
          type: "array",
          description: "JSON Patch operations array.",
          items: {
            type: "object",
            required: ["op", "path"],
            properties: {
              op: {
                type: "string",
                enum: ["add", "remove", "replace", "move", "copy", "test"],
              },
              path: { type: "string" },
              value: {},
            },
          },
        },
      },
    },
  },

  // ── Quote Items ───────────────────────────────────────────────────────────
  {
    name: "cws_get_quote_items",
    description:
      "List/search quote line items across all (or filtered) quotes.",
    inputSchema: {
      type: "object",
      properties: {
        showAllVersions: {
          type: "boolean",
          description: "Include items from all quote versions.",
        },
        includeFields: {
          type: "string",
          description: "Comma-separated fields to return.",
        },
        conditions: {
          type: "string",
          description: "Filter condition string.",
        },
        page: { type: "integer" },
        pageSize: { type: "integer" },
      },
    },
  },
  {
    name: "cws_post_quote_item",
    description: "Add a new line item to a quote.",
    inputSchema: {
      type: "object",
      required: ["post"],
      properties: {
        post: {
          type: "object",
          description:
            "QuoteItemView object. At minimum provide idQuote and the product/description fields.",
          required: ["idQuote"],
          properties: {
            idQuote: { type: "string", description: "ID of the parent quote." },
            idQuoteTabs: {
              type: "string",
              description: "ID of the tab this item belongs to.",
            },
            itemNumber: { type: "string" },
            shortDescription: { type: "string" },
            longDescription: { type: "string" },
            quantity: { type: "number" },
            quoteItemPrice: { type: "number" },
            cost: { type: "number" },
            recurringAmount: { type: "number" },
            recurringCost: { type: "number" },
            period: { type: "string" },
            manufacturerPartNumber: { type: "string" },
            vendorPartNumber: { type: "string" },
            productType: { type: "string" },
            productCategory: { type: "string" },
            isOptional: { type: "boolean" },
            isTaxable: { type: "boolean" },
            sortOrder: { type: "integer" },
          },
        },
      },
    },
  },
  {
    name: "cws_get_quote_item_by_id",
    description: "Get a single quote line item by its ID.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string", description: "The quote item's unique ID." },
      },
    },
  },
  {
    name: "cws_delete_quote_item_by_id",
    description: "Delete a quote line item by its ID.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string", description: "The quote item's unique ID." },
      },
    },
  },
  {
    name: "cws_patch_quote_item_by_id",
    description: "Partially update a quote item using JSON Patch (RFC 6902).",
    inputSchema: {
      type: "object",
      required: ["id", "patch"],
      properties: {
        id: { type: "string", description: "The quote item's unique ID." },
        patch: {
          type: "array",
          description: "JSON Patch operations.",
          items: {
            type: "object",
            required: ["op", "path"],
            properties: {
              op: {
                type: "string",
                enum: ["add", "remove", "replace", "move", "copy", "test"],
              },
              path: { type: "string" },
              value: {},
            },
          },
        },
      },
    },
  },

  // ── Quote Tabs ────────────────────────────────────────────────────────────
  {
    name: "cws_get_quote_tabs",
    description: "List quote tabs (sections/groups within a quote).",
    inputSchema: {
      type: "object",
      properties: {
        showAllVersions: { type: "boolean" },
        includeFields: { type: "string" },
        conditions: { type: "string" },
        page: { type: "integer" },
        pageSize: { type: "integer" },
      },
    },
  },
  {
    name: "cws_get_quote_items_by_tab",
    description: "Get all line items belonging to a specific quote tab.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string", description: "The quote tab's unique ID." },
      },
    },
  },

  // ── Quote Terms ───────────────────────────────────────────────────────────
  {
    name: "cws_get_quote_terms",
    description: "Get payment/financing terms attached to a quote.",
    inputSchema: {
      type: "object",
      required: ["quoteId"],
      properties: {
        quoteId: { type: "string" },
        includeFields: { type: "string" },
        conditions: { type: "string" },
        page: { type: "integer" },
        pageSize: { type: "integer" },
      },
    },
  },
  {
    name: "cws_add_quote_term",
    description: "Add a term/financing option to a quote.",
    inputSchema: {
      type: "object",
      required: ["quoteId", "requestBody"],
      properties: {
        quoteId: { type: "string" },
        requestBody: {
          type: "object",
          description: "QuoteTermView object.",
        },
      },
    },
  },
  {
    name: "cws_delete_quote_term",
    description: "Remove a term from a quote.",
    inputSchema: {
      type: "object",
      required: ["quoteId", "id"],
      properties: {
        quoteId: { type: "string" },
        id: { type: "string", description: "The term's unique ID." },
      },
    },
  },
  {
    name: "cws_patch_quote_term",
    description: "Partially update a quote term using JSON Patch.",
    inputSchema: {
      type: "object",
      required: ["quoteId", "id", "patch"],
      properties: {
        quoteId: { type: "string" },
        id: { type: "string" },
        patch: {
          type: "array",
          items: {
            type: "object",
            required: ["op", "path"],
            properties: {
              op: {
                type: "string",
                enum: ["add", "remove", "replace", "move", "copy", "test"],
              },
              path: { type: "string" },
              value: {},
            },
          },
        },
      },
    },
  },

  // ── Reference / Lookup ───────────────────────────────────────────────────
  {
    name: "cws_get_recurring_revenues",
    description:
      "List available recurring revenue profiles (used when pricing recurring items).",
    inputSchema: {
      type: "object",
      properties: {
        includeFields: { type: "string" },
        conditions: { type: "string" },
        page: { type: "integer" },
        pageSize: { type: "integer" },
      },
    },
  },
  {
    name: "cws_get_tax_codes",
    description: "List available tax codes.",
    inputSchema: {
      type: "object",
      properties: {
        includeFields: { type: "string" },
        conditions: { type: "string" },
        page: { type: "integer" },
        pageSize: { type: "integer" },
      },
    },
  },
  {
    name: "cws_get_templates",
    description: "List available quote templates.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },

  // ── User Settings ─────────────────────────────────────────────────────────
  {
    name: "cws_get_user",
    description: "Get the current API user's settings and profile.",
    inputSchema: {
      type: "object",
      properties: {
        includeFields: { type: "string" },
      },
    },
  },
  {
    name: "cws_patch_user",
    description: "Update a user's settings using JSON Patch.",
    inputSchema: {
      type: "object",
      required: ["id", "patch"],
      properties: {
        id: { type: "string", description: "The user's unique ID." },
        patch: {
          type: "array",
          items: {
            type: "object",
            required: ["op", "path"],
            properties: {
              op: {
                type: "string",
                enum: ["add", "remove", "replace", "move", "copy", "test"],
              },
              path: { type: "string" },
              value: {},
            },
          },
        },
      },
    },
  },
];

// ---------------------------------------------------------------------------
// Tool dispatcher
// ---------------------------------------------------------------------------
async function callTool(name, args) {
  switch (name) {
    // ── Quotes ────────────────────────────────────────────────────────────
    case "cws_get_quotes":
      return apiRequest("GET", "/api/quotes", null, {
        showAllVersions: args.showAllVersions,
        includeFields: args.includeFields,
        conditions: args.conditions,
        page: args.page,
        pageSize: args.pageSize,
      });

    case "cws_get_quote_by_id":
      return apiRequest("GET", `/api/quotes/${args.id}`);

    case "cws_delete_quote_by_id":
      return apiRequest("DELETE", `/api/quotes/${args.id}`);

    case "cws_patch_quote_by_id":
      return apiRequest("PATCH", `/api/quotes/${args.id}`, args.patch);

    case "cws_get_quotes_by_number":
      return apiRequest("GET", `/api/quotes/${args.quoteNumber}/versions`);

    case "cws_get_latest_quote_version":
      return apiRequest(
        "GET",
        `/api/quotes/${args.quoteNumber}/versions/latest`
      );

    case "cws_get_quote_version":
      return apiRequest(
        "GET",
        `/api/quotes/${args.quoteNumber}/versions/${args.quoteVersion}`
      );

    case "cws_delete_quote_version":
      return apiRequest(
        "DELETE",
        `/api/quotes/${args.quoteNumber}/versions/${args.quoteVersion}`
      );

    case "cws_copy_quote":
      return apiRequest("POST", `/api/quotes/copyById/${args.id}`);

    // ── Quote Customers ───────────────────────────────────────────────────
    case "cws_get_quote_customers":
      return apiRequest("GET", `/api/quotes/${args.quoteId}/customers`);

    case "cws_put_quote_customer":
      return apiRequest(
        "PUT",
        `/api/quotes/${args.quoteId}/customers/${args.id}`,
        args.requestBody
      );

    case "cws_delete_quote_customer":
      return apiRequest(
        "DELETE",
        `/api/quotes/${args.quoteId}/customers/${args.id}`
      );

    case "cws_patch_quote_customer":
      return apiRequest(
        "PATCH",
        `/api/quotes/${args.quoteId}/customers/${args.id}`,
        args.patch
      );

    // ── Quote Items ───────────────────────────────────────────────────────
    case "cws_get_quote_items":
      return apiRequest("GET", "/api/quoteItems", null, {
        showAllVersions: args.showAllVersions,
        includeFields: args.includeFields,
        conditions: args.conditions,
        page: args.page,
        pageSize: args.pageSize,
      });

    case "cws_post_quote_item":
      return apiRequest("POST", "/api/quoteItems", args.post);

    case "cws_get_quote_item_by_id":
      return apiRequest("GET", `/api/quoteItems/${args.id}`);

    case "cws_delete_quote_item_by_id":
      return apiRequest("DELETE", `/api/quoteItems/${args.id}`);

    case "cws_patch_quote_item_by_id":
      return apiRequest("PATCH", `/api/quoteItems/${args.id}`, args.patch);

    // ── Quote Tabs ────────────────────────────────────────────────────────
    case "cws_get_quote_tabs":
      return apiRequest("GET", "/api/quoteTabs", null, {
        showAllVersions: args.showAllVersions,
        includeFields: args.includeFields,
        conditions: args.conditions,
        page: args.page,
        pageSize: args.pageSize,
      });

    case "cws_get_quote_items_by_tab":
      return apiRequest("GET", `/api/quoteTabs/${args.id}/quoteItems`);

    // ── Quote Terms ───────────────────────────────────────────────────────
    case "cws_get_quote_terms":
      return apiRequest(
        "GET",
        `/api/quotes/${args.quoteId}/quoteTerms`,
        null,
        {
          includeFields: args.includeFields,
          conditions: args.conditions,
          page: args.page,
          pageSize: args.pageSize,
        }
      );

    case "cws_add_quote_term":
      return apiRequest(
        "POST",
        `/api/quotes/${args.quoteId}/quoteTerms`,
        args.requestBody
      );

    case "cws_delete_quote_term":
      return apiRequest(
        "DELETE",
        `/api/quotes/${args.quoteId}/quoteTerms/${args.id}`
      );

    case "cws_patch_quote_term":
      return apiRequest(
        "PATCH",
        `/api/quotes/${args.quoteId}/quoteTerms/${args.id}`,
        args.patch
      );

    // ── Reference / Lookup ────────────────────────────────────────────────
    case "cws_get_recurring_revenues":
      return apiRequest("GET", "/api/recurringRevenues", null, {
        includeFields: args.includeFields,
        conditions: args.conditions,
        page: args.page,
        pageSize: args.pageSize,
      });

    case "cws_get_tax_codes":
      return apiRequest("GET", "/api/taxCodes", null, {
        includeFields: args.includeFields,
        conditions: args.conditions,
        page: args.page,
        pageSize: args.pageSize,
      });

    case "cws_get_templates":
      return apiRequest("GET", "/api/templates");

    // ── User Settings ──────────────────────────────────────────────────────
    case "cws_get_user":
      return apiRequest("GET", "/settings/user", null, {
        includeFields: args.includeFields,
      });

    case "cws_patch_user":
      return apiRequest("PATCH", `/settings/user/${args.id}`, args.patch);

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// ---------------------------------------------------------------------------
// MCP Server setup
// ---------------------------------------------------------------------------
const server = new Server(
  {
    name: "connectwise-sell",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const result = await callTool(name, args ?? {});
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("ConnectWise Sell MCP Server running on stdio");
