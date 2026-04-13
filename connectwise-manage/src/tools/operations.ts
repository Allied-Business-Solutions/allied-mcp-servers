import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { CWClient, cond } from "../client.js";

// ── Schedule ──────────────────────────────────────────────────────────────────

export const scheduleTools: Tool[] = [
  {
    name: "cw_list_schedule_entries",
    description: "List schedule entries (dispatched work). Filter by member, ticket, or date range.",
    inputSchema: {
      type: "object",
      properties: {
        memberId: { type: "number" },
        memberIdentifier: { type: "string" },
        objectId: { type: "number", description: "Ticket/activity/opportunity ID being scheduled" },
        type: { type: "string", description: "Schedule type name (e.g. 'Service', 'Sales')" },
        dateStart: { type: "string", description: "ISO 8601" },
        dateEnd: { type: "string", description: "ISO 8601" },
        doneFlag: { type: "boolean" },
        orderBy: { type: "string" },
        page: { type: "number" },
        pageSize: { type: "number" },
      },
    },
  },
  {
    name: "cw_create_schedule_entry",
    description: "Create a new schedule entry (dispatch a member to a ticket, meeting, etc.).",
    inputSchema: {
      type: "object",
      required: ["objectId", "type", "member", "dateStart", "dateEnd"],
      properties: {
        objectId: { type: "number", description: "ID of ticket, activity, or opportunity to schedule" },
        type: { type: "string", description: "Schedule type name (e.g. 'Service', 'Sales')" },
        member: { type: "string", description: "Member identifier to schedule" },
        dateStart: { type: "string", description: "ISO 8601" },
        dateEnd: { type: "string", description: "ISO 8601" },
        reminder: { type: "string", description: "Reminder name (e.g. 'None', '15 minutes')" },
        status: { type: "string", description: "Schedule status name" },
        doneFlag: { type: "boolean" },
        acknowledgedFlag: { type: "boolean" },
        allowScheduleConflictsFlag: { type: "boolean" },
      },
    },
  },
  {
    name: "cw_update_schedule_entry",
    description: "Update a schedule entry.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "number" },
        dateStart: { type: "string" },
        dateEnd: { type: "string" },
        doneFlag: { type: "boolean" },
        acknowledgedFlag: { type: "boolean" },
        status: { type: "string" },
      },
    },
  },
  {
    name: "cw_delete_schedule_entry",
    description: "Delete a schedule entry.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "number" } },
    },
  },
];

// ── CRM ───────────────────────────────────────────────────────────────────────

export const crmTools: Tool[] = [
  {
    name: "cw_list_opportunities",
    description: "List sales opportunities. Filter by company, status, stage, or sales rep.",
    inputSchema: {
      type: "object",
      properties: {
        company: { type: "string" },
        status: { type: "string", description: "e.g. 'Open', 'Won', 'Lost'" },
        stage: { type: "string" },
        type: { type: "string" },
        salesRep: { type: "string", description: "Primary sales rep member identifier" },
        name: { type: "string", description: "Partial match" },
        closeDateBefore: { type: "string", description: "ISO 8601" },
        closeDateAfter: { type: "string" },
        orderBy: { type: "string" },
        fields: { type: "string" },
        page: { type: "number" },
        pageSize: { type: "number" },
      },
    },
  },
  {
    name: "cw_get_opportunity",
    description: "Get full details of an opportunity by ID.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "number" } },
    },
  },
  {
    name: "cw_create_opportunity",
    description: "Create a new sales opportunity.",
    inputSchema: {
      type: "object",
      required: ["name", "expectedCloseDate"],
      properties: {
        name: { type: "string" },
        expectedCloseDate: { type: "string", description: "ISO 8601" },
        company: { type: "string" },
        contact: { type: "string" },
        type: { type: "string" },
        stage: { type: "string" },
        status: { type: "string" },
        priority: { type: "string" },
        probability: { type: "string" },
        rating: { type: "string" },
        primarySalesRep: { type: "string", description: "Member identifier" },
        secondarySalesRep: { type: "string" },
        source: { type: "string" },
        notes: { type: "string" },
        customerPO: { type: "string" },
      },
    },
  },
  {
    name: "cw_update_opportunity",
    description: "Update an opportunity.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "number" },
        name: { type: "string" },
        stage: { type: "string" },
        status: { type: "string" },
        expectedCloseDate: { type: "string" },
        primarySalesRep: { type: "string" },
        probability: { type: "string" },
        notes: { type: "string" },
      },
    },
  },
  {
    name: "cw_convert_opportunity",
    description: "Convert an opportunity to an agreement, project, sales order, or service ticket.",
    inputSchema: {
      type: "object",
      required: ["id", "convertTo"],
      properties: {
        id: { type: "number" },
        convertTo: { type: "string", enum: ["agreement", "project", "salesOrder", "serviceTicket"] },
      },
    },
  },
  {
    name: "cw_list_activities",
    description: "List sales/CRM activities. Filter by member, company, or status.",
    inputSchema: {
      type: "object",
      properties: {
        company: { type: "string" },
        memberId: { type: "number" },
        memberIdentifier: { type: "string" },
        status: { type: "string" },
        type: { type: "string" },
        opportunityId: { type: "number" },
        orderBy: { type: "string" },
        page: { type: "number" },
        pageSize: { type: "number" },
      },
    },
  },
  {
    name: "cw_create_activity",
    description: "Create a new CRM activity.",
    inputSchema: {
      type: "object",
      required: ["name", "type", "member"],
      properties: {
        name: { type: "string" },
        type: { type: "string", description: "Activity type name" },
        member: { type: "string", description: "Assigned member identifier" },
        company: { type: "string" },
        contact: { type: "string" },
        opportunityId: { type: "number" },
        ticketId: { type: "number" },
        dateStart: { type: "string", description: "ISO 8601" },
        dateEnd: { type: "string" },
        status: { type: "string" },
        notes: { type: "string" },
        assignedBy: { type: "string", description: "Assigned-by member identifier" },
      },
    },
  },
];

// ── Members ───────────────────────────────────────────────────────────────────

export const memberTools: Tool[] = [
  {
    name: "cw_list_members",
    description: "List members (staff/technicians). Filter by name, role, or type.",
    inputSchema: {
      type: "object",
      properties: {
        identifier: { type: "string", description: "Member login identifier (partial match)" },
        firstName: { type: "string" },
        lastName: { type: "string" },
        type: { type: "string", description: "Member type name" },
        licenseClass: { type: "string", enum: ["F", "A", "C"] },
        inactiveFlag: { type: "boolean" },
        fields: { type: "string" },
        page: { type: "number" },
        pageSize: { type: "number" },
      },
    },
  },
  {
    name: "cw_get_member",
    description: "Get full details of a member by ID.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "number" } },
    },
  },
];

// ── Expenses ──────────────────────────────────────────────────────────────────

export const expenseTools: Tool[] = [
  {
    name: "cw_list_expense_entries",
    description: "List expense entries. Filter by member, company, or charge target.",
    inputSchema: {
      type: "object",
      properties: {
        memberId: { type: "number" },
        memberIdentifier: { type: "string" },
        companyId: { type: "number" },
        chargeToId: { type: "number" },
        chargeToType: { type: "string" },
        dateAfter: { type: "string", description: "ISO 8601" },
        dateBefore: { type: "string" },
        billableOption: { type: "string" },
        page: { type: "number" },
        pageSize: { type: "number" },
      },
    },
  },
  {
    name: "cw_create_expense_entry",
    description: "Log a new expense entry.",
    inputSchema: {
      type: "object",
      required: ["type", "amount", "date", "chargeToType", "chargeToId"],
      properties: {
        type: { type: "string", description: "Expense type name (e.g. 'Mileage', 'Lodging')" },
        amount: { type: "number" },
        date: { type: "string", description: "ISO 8601" },
        chargeToType: { type: "string", enum: ["ServiceTicket", "ProjectTicket", "ChargeCode", "Activity"] },
        chargeToId: { type: "number" },
        memberId: { type: "number" },
        company: { type: "string" },
        paymentMethod: { type: "string", description: "Payment method name" },
        billableOption: { type: "string", enum: ["Billable", "DoNotBill", "NoCharge"] },
        notes: { type: "string" },
        mobileGuid: { type: "string" },
      },
    },
  },
  {
    name: "cw_delete_expense_entry",
    description: "Delete an expense entry.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "number" } },
    },
  },
];

// ── Handlers ──────────────────────────────────────────────────────────────────

export async function handleScheduleTool(name: string, args: Record<string, unknown>, c: CWClient): Promise<unknown> {
  switch (name) {
    case "cw_list_schedule_entries": {
      const conditions: string[] = [];
      if (args.memberId) conditions.push(`member/id=${args.memberId}`);
      if (args.memberIdentifier) conditions.push(`member/identifier="${args.memberIdentifier}"`);
      if (args.objectId) conditions.push(`objectId=${args.objectId}`);
      if (args.type) conditions.push(`type/name="${args.type}"`);
      if (args.dateStart) conditions.push(`dateStart>=[${args.dateStart}]`);
      if (args.dateEnd) conditions.push(`dateEnd<=[${args.dateEnd}]`);
      if (args.doneFlag !== undefined) conditions.push(`doneFlag=${args.doneFlag}`);
      return c.get("/schedule/entries", { conditions: cond(conditions), orderBy: args.orderBy, page: args.page ?? 1, pageSize: args.pageSize ?? 25 });
    }
    case "cw_create_schedule_entry": {
      const body: Record<string, unknown> = { objectId: args.objectId, type: { name: args.type }, member: { identifier: args.member }, dateStart: args.dateStart, dateEnd: args.dateEnd };
      if (args.reminder) body.reminder = { name: args.reminder };
      if (args.status) body.status = { name: args.status };
      if (args.doneFlag !== undefined) body.doneFlag = args.doneFlag;
      if (args.acknowledgedFlag !== undefined) body.acknowledgedFlag = args.acknowledgedFlag;
      if (args.allowScheduleConflictsFlag !== undefined) body.allowScheduleConflictsFlag = args.allowScheduleConflictsFlag;
      return c.post("/schedule/entries", body);
    }
    case "cw_update_schedule_entry": {
      const { id, ...updates } = args;
      const ops: any[] = [];
      if (updates.dateStart) ops.push({ op: "replace", path: "/dateStart", value: updates.dateStart });
      if (updates.dateEnd) ops.push({ op: "replace", path: "/dateEnd", value: updates.dateEnd });
      if (updates.doneFlag !== undefined) ops.push({ op: "replace", path: "/doneFlag", value: updates.doneFlag });
      if (updates.acknowledgedFlag !== undefined) ops.push({ op: "replace", path: "/acknowledgedFlag", value: updates.acknowledgedFlag });
      if (updates.status) ops.push({ op: "replace", path: "/status/name", value: updates.status });
      return c.patch(`/schedule/entries/${id}`, ops);
    }
    case "cw_delete_schedule_entry":
      await c.delete(`/schedule/entries/${args.id}`);
      return { success: true };
    default:
      throw new Error(`Unknown schedule tool: ${name}`);
  }
}

export async function handleCrmTool(name: string, args: Record<string, unknown>, c: CWClient): Promise<unknown> {
  switch (name) {
    case "cw_list_opportunities": {
      const conditions: string[] = [];
      if (args.company) conditions.push(`company/name="${args.company}"`);
      if (args.status) conditions.push(`status/name="${args.status}"`);
      if (args.stage) conditions.push(`stage/name="${args.stage}"`);
      if (args.type) conditions.push(`type/name="${args.type}"`);
      if (args.salesRep) conditions.push(`primarySalesRep/identifier="${args.salesRep}"`);
      if (args.name) conditions.push(`name contains "${args.name}"`);
      if (args.closeDateBefore) conditions.push(`expectedCloseDate<=[${args.closeDateBefore}]`);
      if (args.closeDateAfter) conditions.push(`expectedCloseDate>=[${args.closeDateAfter}]`);
      return c.get("/sales/opportunities", { conditions: cond(conditions), orderBy: args.orderBy, fields: args.fields, page: args.page ?? 1, pageSize: args.pageSize ?? 25 });
    }
    case "cw_get_opportunity":
      return c.get(`/sales/opportunities/${args.id}`);
    case "cw_create_opportunity": {
      const body: Record<string, unknown> = { name: args.name, expectedCloseDate: args.expectedCloseDate };
      if (args.company) body.company = { name: args.company };
      if (args.contact) body.contact = { name: args.contact };
      if (args.type) body.type = { name: args.type };
      if (args.stage) body.stage = { name: args.stage };
      if (args.status) body.status = { name: args.status };
      if (args.priority) body.priority = { name: args.priority };
      if (args.probability) body.probability = { name: args.probability };
      if (args.rating) body.rating = { name: args.rating };
      if (args.primarySalesRep) body.primarySalesRep = { identifier: args.primarySalesRep };
      if (args.secondarySalesRep) body.secondarySalesRep = { identifier: args.secondarySalesRep };
      if (args.source) body.source = args.source;
      if (args.notes) body.notes = args.notes;
      if (args.customerPO) body.customerPO = args.customerPO;
      return c.post("/sales/opportunities", body);
    }
    case "cw_update_opportunity": {
      const { id, ...updates } = args;
      const ops: any[] = [];
      if (updates.name) ops.push({ op: "replace", path: "/name", value: updates.name });
      if (updates.stage) ops.push({ op: "replace", path: "/stage/name", value: updates.stage });
      if (updates.status) ops.push({ op: "replace", path: "/status/name", value: updates.status });
      if (updates.expectedCloseDate) ops.push({ op: "replace", path: "/expectedCloseDate", value: updates.expectedCloseDate });
      if (updates.primarySalesRep) ops.push({ op: "replace", path: "/primarySalesRep/identifier", value: updates.primarySalesRep });
      if (updates.probability) ops.push({ op: "replace", path: "/probability/name", value: updates.probability });
      if (updates.notes) ops.push({ op: "replace", path: "/notes", value: updates.notes });
      return c.patch(`/sales/opportunities/${id}`, ops);
    }
    case "cw_convert_opportunity": {
      const map: Record<string, string> = { agreement: "convertToAgreement", project: "convertToProject", salesOrder: "convertToSalesOrder", serviceTicket: "convertToServiceTicket" };
      return c.post(`/sales/opportunities/${args.id}/${map[args.convertTo as string]}`);
    }
    case "cw_list_activities": {
      const conditions: string[] = [];
      if (args.company) conditions.push(`company/name="${args.company}"`);
      if (args.memberId) conditions.push(`member/id=${args.memberId}`);
      if (args.memberIdentifier) conditions.push(`member/identifier="${args.memberIdentifier}"`);
      if (args.status) conditions.push(`status/name="${args.status}"`);
      if (args.type) conditions.push(`type/name="${args.type}"`);
      if (args.opportunityId) conditions.push(`opportunity/id=${args.opportunityId}`);
      return c.get("/sales/activities", { conditions: cond(conditions), orderBy: args.orderBy, page: args.page ?? 1, pageSize: args.pageSize ?? 25 });
    }
    case "cw_create_activity": {
      const body: Record<string, unknown> = { name: args.name, type: { name: args.type }, member: { identifier: args.member } };
      if (args.company) body.company = { name: args.company };
      if (args.contact) body.contact = { name: args.contact };
      if (args.opportunityId) body.opportunity = { id: args.opportunityId };
      if (args.ticketId) body.ticket = { id: args.ticketId };
      if (args.dateStart) body.dateStart = args.dateStart;
      if (args.dateEnd) body.dateEnd = args.dateEnd;
      if (args.status) body.status = { name: args.status };
      if (args.notes) body.notes = args.notes;
      if (args.assignedBy) body.assignedBy = { identifier: args.assignedBy };
      return c.post("/sales/activities", body);
    }
    default:
      throw new Error(`Unknown CRM tool: ${name}`);
  }
}

export async function handleMemberTool(name: string, args: Record<string, unknown>, c: CWClient): Promise<unknown> {
  switch (name) {
    case "cw_list_members": {
      const conditions: string[] = [];
      if (args.identifier) conditions.push(`identifier contains "${args.identifier}"`);
      if (args.firstName) conditions.push(`firstName contains "${args.firstName}"`);
      if (args.lastName) conditions.push(`lastName contains "${args.lastName}"`);
      if (args.type) conditions.push(`type/name="${args.type}"`);
      if (args.licenseClass) conditions.push(`licenseClass="${args.licenseClass}"`);
      if (args.inactiveFlag !== undefined) conditions.push(`inactiveFlag=${args.inactiveFlag}`);
      return c.get("/system/members", { conditions: cond(conditions), fields: args.fields, page: args.page ?? 1, pageSize: args.pageSize ?? 50 });
    }
    case "cw_get_member":
      return c.get(`/system/members/${args.id}`);
    default:
      throw new Error(`Unknown member tool: ${name}`);
  }
}

export async function handleExpenseTool(name: string, args: Record<string, unknown>, c: CWClient): Promise<unknown> {
  switch (name) {
    case "cw_list_expense_entries": {
      const conditions: string[] = [];
      if (args.memberId) conditions.push(`member/id=${args.memberId}`);
      if (args.memberIdentifier) conditions.push(`member/identifier="${args.memberIdentifier}"`);
      if (args.companyId) conditions.push(`company/id=${args.companyId}`);
      if (args.chargeToId) conditions.push(`chargeToId=${args.chargeToId}`);
      if (args.chargeToType) conditions.push(`chargeToType="${args.chargeToType}"`);
      if (args.dateAfter) conditions.push(`date>=[${args.dateAfter}]`);
      if (args.dateBefore) conditions.push(`date<=[${args.dateBefore}]`);
      if (args.billableOption) conditions.push(`billableOption="${args.billableOption}"`);
      return c.get("/expense/entries", { conditions: cond(conditions), page: args.page ?? 1, pageSize: args.pageSize ?? 25 });
    }
    case "cw_create_expense_entry": {
      const body: Record<string, unknown> = { type: { name: args.type }, amount: args.amount, date: args.date, chargeToType: args.chargeToType, chargeToId: args.chargeToId };
      if (args.memberId) body.member = { id: args.memberId };
      if (args.company) body.company = { name: args.company };
      if (args.paymentMethod) body.paymentMethod = { name: args.paymentMethod };
      if (args.billableOption) body.billableOption = args.billableOption;
      if (args.notes) body.notes = args.notes;
      return c.post("/expense/entries", body);
    }
    case "cw_delete_expense_entry":
      await c.delete(`/expense/entries/${args.id}`);
      return { success: true };
    default:
      throw new Error(`Unknown expense tool: ${name}`);
  }
}
