import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { CWClient, cond, patchOps } from "../client.js";

export const ticketTools: Tool[] = [
  {
    name: "cw_list_tickets",
    description: "List service tickets. Filter by status, board, company, priority, assignee, or free-text summary search. Supports pagination and ordering.",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string", description: "Filter by status name (e.g. 'New', 'In Progress', 'Resolved')" },
        board: { type: "string", description: "Filter by service board name" },
        company: { type: "string", description: "Filter by company name" },
        assignedMember: { type: "string", description: "Filter by assigned member identifier" },
        priority: { type: "string", description: "Filter by priority name" },
        summary: { type: "string", description: "Search tickets containing this text in summary" },
        type: { type: "string", description: "Filter by ticket type name" },
        subType: { type: "string", description: "Filter by ticket subtype name" },
        source: { type: "string", description: "Filter by source name (e.g. 'Phone', 'Email')" },
        severity: { type: "string", description: "Filter by severity (e.g. 'Low', 'Medium', 'High')" },
        impact: { type: "string", description: "Filter by impact (e.g. 'Low', 'Medium', 'High')" },
        contactName: { type: "string", description: "Filter by contact name" },
        siteName: { type: "string", description: "Filter by site name" },
        orderBy: { type: "string", description: "Order results e.g. 'id desc' or '_lastUpdated desc'" },
        fields: { type: "string", description: "Comma-separated fields to return (reduces payload)" },
        page: { type: "number", description: "Page number (default: 1)" },
        pageSize: { type: "number", description: "Results per page (default: 25, max: 1000)" },
      },
    },
  },
  {
    name: "cw_get_ticket",
    description: "Get full details of a single service ticket by ID.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "number", description: "Ticket ID" },
        fields: { type: "string", description: "Comma-separated fields to return" },
      },
    },
  },
  {
    name: "cw_create_ticket",
    description: "Create a new service ticket.",
    inputSchema: {
      type: "object",
      required: ["summary", "board"],
      properties: {
        summary: { type: "string" },
        board: { type: "string", description: "Board name" },
        company: { type: "string", description: "Company name" },
        contact: { type: "string", description: "Contact name" },
        siteName: { type: "string", description: "Site name" },
        status: { type: "string", description: "Status name" },
        priority: { type: "string", description: "Priority name" },
        severity: { type: "string", enum: ["Low", "Medium", "High"] },
        impact: { type: "string", enum: ["Low", "Medium", "High"] },
        source: { type: "string", description: "Source name (Phone, Email, etc.)" },
        type: { type: "string", description: "Ticket type name" },
        subType: { type: "string", description: "Ticket subtype name" },
        item: { type: "string", description: "Ticket item name" },
        assignedTo: { type: "string", description: "Member identifier to assign to" },
        initialDescription: { type: "string", description: "Initial problem description" },
        requiredDate: { type: "string", description: "Required by date (ISO 8601)" },
        budgetHours: { type: "number", description: "Budgeted hours for this ticket" },
        agreement: { type: "string", description: "Agreement name to attach" },
      },
    },
  },
  {
    name: "cw_update_ticket",
    description: "Update fields on an existing service ticket.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "number" },
        summary: { type: "string" },
        status: { type: "string" },
        priority: { type: "string" },
        severity: { type: "string" },
        impact: { type: "string" },
        assignedTo: { type: "string" },
        board: { type: "string" },
        type: { type: "string" },
        subType: { type: "string" },
        item: { type: "string" },
        requiredDate: { type: "string" },
        budgetHours: { type: "number" },
        contactName: { type: "string" },
        siteName: { type: "string" },
      },
    },
  },
  {
    name: "cw_delete_ticket",
    description: "Delete a service ticket by ID.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "number" } },
    },
  },
  {
    name: "cw_list_ticket_notes",
    description: "Get all notes on a service ticket.",
    inputSchema: {
      type: "object",
      required: ["ticketId"],
      properties: {
        ticketId: { type: "number" },
        page: { type: "number" },
        pageSize: { type: "number" },
      },
    },
  },
  {
    name: "cw_add_ticket_note",
    description: "Add a note to a service ticket. Can be internal (analysis) or customer-visible (detail).",
    inputSchema: {
      type: "object",
      required: ["ticketId", "text"],
      properties: {
        ticketId: { type: "number" },
        text: { type: "string" },
        internalAnalysisFlag: { type: "boolean", description: "True = internal note, false = customer-visible detail note" },
        resolutionFlag: { type: "boolean", description: "Mark this note as the resolution" },
        timeStart: { type: "string", description: "ISO 8601 start time" },
        timeEnd: { type: "string", description: "ISO 8601 end time" },
        member: { type: "string", description: "Member identifier who wrote the note" },
      },
    },
  },
  {
    name: "cw_list_ticket_tasks",
    description: "List tasks/checklist items on a service ticket.",
    inputSchema: {
      type: "object",
      required: ["ticketId"],
      properties: {
        ticketId: { type: "number" },
        page: { type: "number" },
        pageSize: { type: "number" },
      },
    },
  },
  {
    name: "cw_add_ticket_task",
    description: "Add a task/checklist item to a service ticket.",
    inputSchema: {
      type: "object",
      required: ["ticketId", "notes"],
      properties: {
        ticketId: { type: "number" },
        notes: { type: "string", description: "Task description" },
        closedFlag: { type: "boolean", description: "Mark task as completed" },
        priority: { type: "number", description: "Sort order/priority" },
      },
    },
  },
  {
    name: "cw_get_ticket_count",
    description: "Get a count of tickets matching filters (no data returned, fast).",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string" },
        board: { type: "string" },
        company: { type: "string" },
        assignedMember: { type: "string" },
        priority: { type: "string" },
      },
    },
  },
];

export async function handleTicketTool(name: string, args: Record<string, unknown>, c: CWClient): Promise<unknown> {
  switch (name) {
    case "cw_list_tickets": {
      const conditions: string[] = [];
      if (args.status) conditions.push(`status/name="${args.status}"`);
      if (args.board) conditions.push(`board/name="${args.board}"`);
      if (args.company) conditions.push(`company/name="${args.company}"`);
      if (args.assignedMember) conditions.push(`assignedTo="${args.assignedMember}"`);
      if (args.priority) conditions.push(`priority/name="${args.priority}"`);
      if (args.summary) conditions.push(`summary contains "${args.summary}"`);
      if (args.type) conditions.push(`type/name="${args.type}"`);
      if (args.subType) conditions.push(`subType/name="${args.subType}"`);
      if (args.source) conditions.push(`serviceLocation/name="${args.source}"`);
      if (args.severity) conditions.push(`severity="${args.severity}"`);
      if (args.impact) conditions.push(`impact="${args.impact}"`);
      if (args.contactName) conditions.push(`contactName contains "${args.contactName}"`);
      if (args.siteName) conditions.push(`siteName="${args.siteName}"`);
      return c.get("/service/tickets", {
        conditions: cond(conditions),
        orderBy: args.orderBy,
        fields: args.fields,
        page: args.page ?? 1,
        pageSize: args.pageSize ?? 25,
      });
    }
    case "cw_get_ticket":
      return c.get(`/service/tickets/${args.id}`, { fields: args.fields });
    case "cw_create_ticket": {
      const body: Record<string, unknown> = { summary: args.summary, board: { name: args.board } };
      if (args.company) body.company = { name: args.company };
      if (args.contact) body.contact = { name: args.contact };
      if (args.siteName) body.siteName = args.siteName;
      if (args.status) body.status = { name: args.status };
      if (args.priority) body.priority = { name: args.priority };
      if (args.severity) body.severity = args.severity;
      if (args.impact) body.impact = args.impact;
      if (args.source) body.serviceLocation = { name: args.source };
      if (args.type) body.type = { name: args.type };
      if (args.subType) body.subType = { name: args.subType };
      if (args.item) body.item = { name: args.item };
      if (args.assignedTo) body.assignedTo = args.assignedTo;
      if (args.initialDescription) body.initialDescription = args.initialDescription;
      if (args.requiredDate) body.requiredDate = args.requiredDate;
      if (args.budgetHours) body.budgetHours = args.budgetHours;
      if (args.agreement) body.agreement = { name: args.agreement };
      return c.post("/service/tickets", body);
    }
    case "cw_update_ticket": {
      const { id, ...updates } = args;
      const ops: any[] = [];
      if (updates.summary) ops.push({ op: "replace", path: "/summary", value: updates.summary });
      if (updates.status) ops.push({ op: "replace", path: "/status/name", value: updates.status });
      if (updates.priority) ops.push({ op: "replace", path: "/priority/name", value: updates.priority });
      if (updates.severity) ops.push({ op: "replace", path: "/severity", value: updates.severity });
      if (updates.impact) ops.push({ op: "replace", path: "/impact", value: updates.impact });
      if (updates.assignedTo) ops.push({ op: "replace", path: "/assignedTo", value: updates.assignedTo });
      if (updates.board) ops.push({ op: "replace", path: "/board/name", value: updates.board });
      if (updates.type) ops.push({ op: "replace", path: "/type/name", value: updates.type });
      if (updates.subType) ops.push({ op: "replace", path: "/subType/name", value: updates.subType });
      if (updates.item) ops.push({ op: "replace", path: "/item/name", value: updates.item });
      if (updates.requiredDate) ops.push({ op: "replace", path: "/requiredDate", value: updates.requiredDate });
      if (updates.budgetHours) ops.push({ op: "replace", path: "/budgetHours", value: updates.budgetHours });
      if (updates.contactName) ops.push({ op: "replace", path: "/contactName", value: updates.contactName });
      if (updates.siteName) ops.push({ op: "replace", path: "/siteName", value: updates.siteName });
      return c.patch(`/service/tickets/${id}`, ops);
    }
    case "cw_delete_ticket":
      await c.delete(`/service/tickets/${args.id}`);
      return { success: true, message: `Ticket ${args.id} deleted.` };
    case "cw_list_ticket_notes":
      return c.get(`/service/tickets/${args.ticketId}/notes`, { page: args.page ?? 1, pageSize: args.pageSize ?? 50 });
    case "cw_add_ticket_note":
      return c.post(`/service/tickets/${args.ticketId}/notes`, {
        text: args.text,
        internalAnalysisFlag: args.internalAnalysisFlag ?? false,
        detailDescriptionFlag: !args.internalAnalysisFlag,
        resolutionFlag: args.resolutionFlag ?? false,
        timeStart: args.timeStart,
        timeEnd: args.timeEnd,
        member: args.member ? { identifier: args.member } : undefined,
      });
    case "cw_list_ticket_tasks":
      return c.get(`/service/tickets/${args.ticketId}/tasks`, { page: args.page ?? 1, pageSize: args.pageSize ?? 50 });
    case "cw_add_ticket_task":
      return c.post(`/service/tickets/${args.ticketId}/tasks`, {
        notes: args.notes,
        closedFlag: args.closedFlag ?? false,
        priority: args.priority ?? 0,
      });
    case "cw_get_ticket_count": {
      const conditions: string[] = [];
      if (args.status) conditions.push(`status/name="${args.status}"`);
      if (args.board) conditions.push(`board/name="${args.board}"`);
      if (args.company) conditions.push(`company/name="${args.company}"`);
      if (args.assignedMember) conditions.push(`assignedTo="${args.assignedMember}"`);
      if (args.priority) conditions.push(`priority/name="${args.priority}"`);
      return c.get("/service/tickets/count", { conditions: cond(conditions) });
    }
    default:
      throw new Error(`Unknown ticket tool: ${name}`);
  }
}
