import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { CWClient, cond } from "../client.js";

export const timeTools: Tool[] = [
  {
    name: "cw_list_time_entries",
    description: "List time entries. Filter by member, company, ticket, project, date range, or billable status.",
    inputSchema: {
      type: "object",
      properties: {
        memberId: { type: "number" },
        memberIdentifier: { type: "string" },
        companyId: { type: "number" },
        chargeToId: { type: "number", description: "Ticket or project ID being charged to" },
        chargeToType: { type: "string", enum: ["ServiceTicket", "ProjectTicket", "ChargeCode", "Activity"] },
        dateStart: { type: "string", description: "ISO 8601 date filter start" },
        dateEnd: { type: "string", description: "ISO 8601 date filter end" },
        billableOption: { type: "string", enum: ["Billable", "DoNotBill", "NoCharge", "NoDefault"] },
        workType: { type: "string" },
        workRole: { type: "string" },
        orderBy: { type: "string", description: "e.g. 'timeStart desc'" },
        fields: { type: "string" },
        page: { type: "number" },
        pageSize: { type: "number" },
      },
    },
  },
  {
    name: "cw_get_time_entry",
    description: "Get full details of a time entry by ID.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "number" } },
    },
  },
  {
    name: "cw_create_time_entry",
    description: "Log a new time entry. Must specify chargeToType and chargeToId.",
    inputSchema: {
      type: "object",
      required: ["chargeToType", "chargeToId", "timeStart", "timeEnd"],
      properties: {
        chargeToType: { type: "string", enum: ["ServiceTicket", "ProjectTicket", "ChargeCode", "Activity"] },
        chargeToId: { type: "number" },
        memberId: { type: "number", description: "Member logging time (defaults to API user)" },
        timeStart: { type: "string", description: "ISO 8601" },
        timeEnd: { type: "string", description: "ISO 8601" },
        actualHours: { type: "number", description: "Override calculated hours" },
        hoursDeduct: { type: "number", description: "Hours to deduct (e.g. lunch)" },
        notes: { type: "string" },
        internalNotes: { type: "string" },
        workType: { type: "string" },
        workRole: { type: "string" },
        billableOption: { type: "string", enum: ["Billable", "DoNotBill", "NoCharge", "NoDefault"] },
        agreementId: { type: "number", description: "Agreement to attach time to" },
        addToDetailDescriptionFlag: { type: "boolean", description: "Add notes to ticket detail description" },
        addToInternalAnalysisFlag: { type: "boolean", description: "Add notes to ticket internal analysis" },
        addToResolutionFlag: { type: "boolean" },
      },
    },
  },
  {
    name: "cw_update_time_entry",
    description: "Update an existing time entry.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "number" },
        timeStart: { type: "string" },
        timeEnd: { type: "string" },
        actualHours: { type: "number" },
        notes: { type: "string" },
        internalNotes: { type: "string" },
        billableOption: { type: "string" },
        workType: { type: "string" },
        workRole: { type: "string" },
      },
    },
  },
  {
    name: "cw_delete_time_entry",
    description: "Delete a time entry by ID.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "number" } },
    },
  },
  {
    name: "cw_list_timesheets",
    description: "List timesheets. Filter by member or status.",
    inputSchema: {
      type: "object",
      properties: {
        memberId: { type: "number" },
        memberIdentifier: { type: "string" },
        status: { type: "string", enum: ["Open", "Rejected", "Submitted", "Approved"] },
        page: { type: "number" },
        pageSize: { type: "number" },
      },
    },
  },
  {
    name: "cw_submit_timesheet",
    description: "Submit a timesheet for approval.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "number" } },
    },
  },
  {
    name: "cw_approve_timesheet",
    description: "Approve a submitted timesheet.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "number" } },
    },
  },
  {
    name: "cw_reject_timesheet",
    description: "Reject a submitted timesheet.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "number" } },
    },
  },
];

export async function handleTimeTool(name: string, args: Record<string, unknown>, c: CWClient): Promise<unknown> {
  switch (name) {
    case "cw_list_time_entries": {
      const conditions: string[] = [];
      if (args.memberId) conditions.push(`member/id=${args.memberId}`);
      if (args.memberIdentifier) conditions.push(`member/identifier="${args.memberIdentifier}"`);
      if (args.companyId) conditions.push(`company/id=${args.companyId}`);
      if (args.chargeToId) conditions.push(`chargeToId=${args.chargeToId}`);
      if (args.chargeToType) conditions.push(`chargeToType="${args.chargeToType}"`);
      if (args.dateStart) conditions.push(`timeStart>=[${args.dateStart}]`);
      if (args.dateEnd) conditions.push(`timeEnd<=[${args.dateEnd}]`);
      if (args.billableOption) conditions.push(`billableOption="${args.billableOption}"`);
      if (args.workType) conditions.push(`workType/name="${args.workType}"`);
      if (args.workRole) conditions.push(`workRole/name="${args.workRole}"`);
      return c.get("/time/entries", { conditions: cond(conditions), orderBy: args.orderBy, fields: args.fields, page: args.page ?? 1, pageSize: args.pageSize ?? 25 });
    }
    case "cw_get_time_entry":
      return c.get(`/time/entries/${args.id}`);
    case "cw_create_time_entry": {
      const body: Record<string, unknown> = { chargeToType: args.chargeToType, chargeToId: args.chargeToId, timeStart: args.timeStart, timeEnd: args.timeEnd };
      if (args.memberId) body.member = { id: args.memberId };
      if (args.actualHours !== undefined) body.actualHours = args.actualHours;
      if (args.hoursDeduct !== undefined) body.hoursDeduct = args.hoursDeduct;
      if (args.notes) body.notes = args.notes;
      if (args.internalNotes) body.internalNotes = args.internalNotes;
      if (args.workType) body.workType = { name: args.workType };
      if (args.workRole) body.workRole = { name: args.workRole };
      if (args.billableOption) body.billableOption = args.billableOption;
      if (args.agreementId) body.agreement = { id: args.agreementId };
      if (args.addToDetailDescriptionFlag !== undefined) body.addToDetailDescriptionFlag = args.addToDetailDescriptionFlag;
      if (args.addToInternalAnalysisFlag !== undefined) body.addToInternalAnalysisFlag = args.addToInternalAnalysisFlag;
      if (args.addToResolutionFlag !== undefined) body.addToResolutionFlag = args.addToResolutionFlag;
      return c.post("/time/entries", body);
    }
    case "cw_update_time_entry": {
      const { id, ...updates } = args;
      const ops: any[] = [];
      if (updates.timeStart) ops.push({ op: "replace", path: "/timeStart", value: updates.timeStart });
      if (updates.timeEnd) ops.push({ op: "replace", path: "/timeEnd", value: updates.timeEnd });
      if (updates.actualHours !== undefined) ops.push({ op: "replace", path: "/actualHours", value: updates.actualHours });
      if (updates.notes) ops.push({ op: "replace", path: "/notes", value: updates.notes });
      if (updates.internalNotes) ops.push({ op: "replace", path: "/internalNotes", value: updates.internalNotes });
      if (updates.billableOption) ops.push({ op: "replace", path: "/billableOption", value: updates.billableOption });
      if (updates.workType) ops.push({ op: "replace", path: "/workType/name", value: updates.workType });
      if (updates.workRole) ops.push({ op: "replace", path: "/workRole/name", value: updates.workRole });
      return c.patch(`/time/entries/${id}`, ops);
    }
    case "cw_delete_time_entry":
      await c.delete(`/time/entries/${args.id}`);
      return { success: true };
    case "cw_list_timesheets": {
      const conditions: string[] = [];
      if (args.memberId) conditions.push(`member/id=${args.memberId}`);
      if (args.memberIdentifier) conditions.push(`member/identifier="${args.memberIdentifier}"`);
      if (args.status) conditions.push(`status/name="${args.status}"`);
      return c.get("/time/sheets", { conditions: cond(conditions), page: args.page ?? 1, pageSize: args.pageSize ?? 25 });
    }
    case "cw_submit_timesheet":
      return c.post(`/time/sheets/${args.id}/submit`);
    case "cw_approve_timesheet":
      return c.post(`/time/sheets/${args.id}/approve`);
    case "cw_reject_timesheet":
      return c.post(`/time/sheets/${args.id}/reject`);
    default:
      throw new Error(`Unknown time tool: ${name}`);
  }
}
