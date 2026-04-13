#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

import { buildConfig, CWClient } from "./client.js";
import { ticketTools, handleTicketTool } from "./tools/tickets.js";
import { companyTools, handleCompanyTool } from "./tools/companies.js";
import { timeTools, handleTimeTool } from "./tools/time.js";
import { projectTools, handleProjectTool } from "./tools/projects.js";
import { financeTools, handleFinanceTool } from "./tools/finance.js";
import {
  scheduleTools, handleScheduleTool,
  crmTools, handleCrmTool,
  memberTools, handleMemberTool,
  expenseTools, handleExpenseTool,
} from "./tools/operations.js";

const ALL_TOOLS = [
  ...ticketTools,
  ...companyTools,
  ...timeTools,
  ...projectTools,
  ...financeTools,
  ...scheduleTools,
  ...crmTools,
  ...memberTools,
  ...expenseTools,
];

function getHandler(toolName: string) {
  if (ticketTools.some(t => t.name === toolName)) return handleTicketTool;
  if (companyTools.some(t => t.name === toolName)) return handleCompanyTool;
  if (timeTools.some(t => t.name === toolName)) return handleTimeTool;
  if (projectTools.some(t => t.name === toolName)) return handleProjectTool;
  if (financeTools.some(t => t.name === toolName)) return handleFinanceTool;
  if (scheduleTools.some(t => t.name === toolName)) return handleScheduleTool;
  if (crmTools.some(t => t.name === toolName)) return handleCrmTool;
  if (memberTools.some(t => t.name === toolName)) return handleMemberTool;
  if (expenseTools.some(t => t.name === toolName)) return handleExpenseTool;
  return null;
}

async function main() {
  let client: CWClient;
  try {
    client = new CWClient(buildConfig());
  } catch (err) {
    process.stderr.write(`[cwm-mcp] Config error: ${(err as Error).message}\n`);
    process.exit(1);
  }

  const server = new Server(
    { name: "connectwise-manage-mcp", version: "2.0.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: ALL_TOOLS }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params;
    const handler = getHandler(name);

    if (!handler) {
      return { content: [{ type: "text", text: `Unknown tool: ${name}` }], isError: true };
    }

    try {
      const result = await handler(name, args as Record<string, unknown>, client!);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (err: unknown) {
      let detail = err instanceof Error ? err.message : String(err);
      const axiosData = (err as any)?.response?.data;
      if (axiosData) detail += "\n" + JSON.stringify(axiosData, null, 2);
      return { content: [{ type: "text", text: `Error: ${detail}` }], isError: true };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write(`[cwm-mcp] v2.0.0 running — ${ALL_TOOLS.length} tools ready\n`);
}

main().catch(err => {
  process.stderr.write(`[cwm-mcp] Fatal: ${err.message}\n`);
  process.exit(1);
});
