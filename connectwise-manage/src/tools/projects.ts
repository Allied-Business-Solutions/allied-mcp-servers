import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { CWClient, cond } from "../client.js";

export const projectTools: Tool[] = [
  {
    name: "cw_list_projects",
    description: "List projects. Filter by status, company, manager, or name.",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string", description: "e.g. 'Open', 'Closed'" },
        company: { type: "string" },
        manager: { type: "string", description: "Member identifier" },
        name: { type: "string", description: "Partial match" },
        type: { type: "string" },
        orderBy: { type: "string" },
        fields: { type: "string" },
        page: { type: "number" },
        pageSize: { type: "number" },
      },
    },
  },
  {
    name: "cw_get_project",
    description: "Get full details of a project by ID.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "number" } },
    },
  },
  {
    name: "cw_create_project",
    description: "Create a new project.",
    inputSchema: {
      type: "object",
      required: ["name", "company"],
      properties: {
        name: { type: "string" },
        company: { type: "string" },
        manager: { type: "string", description: "Member identifier" },
        status: { type: "string" },
        type: { type: "string" },
        estimatedStart: { type: "string", description: "ISO 8601" },
        estimatedEnd: { type: "string", description: "ISO 8601" },
        description: { type: "string" },
        billingMethod: { type: "string", enum: ["ActualRates", "FixedFee", "NotToExceed", "OverrideRate"] },
        estimatedTimeCost: { type: "number" },
        estimatedExpenseCost: { type: "number" },
        estimatedProductCost: { type: "number" },
        locationId: { type: "number" },
        departmentId: { type: "number" },
        agreement: { type: "string", description: "Agreement name to attach" },
      },
    },
  },
  {
    name: "cw_update_project",
    description: "Update an existing project.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "number" },
        name: { type: "string" },
        status: { type: "string" },
        manager: { type: "string" },
        description: { type: "string" },
        estimatedStart: { type: "string" },
        estimatedEnd: { type: "string" },
        billingMethod: { type: "string" },
      },
    },
  },
  {
    name: "cw_list_project_phases",
    description: "List phases for a project.",
    inputSchema: {
      type: "object",
      required: ["projectId"],
      properties: { projectId: { type: "number" }, page: { type: "number" }, pageSize: { type: "number" } },
    },
  },
  {
    name: "cw_create_project_phase",
    description: "Create a new phase on a project.",
    inputSchema: {
      type: "object",
      required: ["projectId", "description"],
      properties: {
        projectId: { type: "number" },
        description: { type: "string" },
        estimatedHours: { type: "number" },
        scheduledStart: { type: "string" },
        scheduledEnd: { type: "string" },
        billTime: { type: "string", enum: ["Billable", "DoNotBill", "NoCharge", "NoDefault"] },
        notes: { type: "string" },
        parentPhaseId: { type: "number", description: "For creating sub-phases" },
      },
    },
  },
  {
    name: "cw_list_project_tickets",
    description: "List tickets/tasks on a project. Optionally filter by phase.",
    inputSchema: {
      type: "object",
      properties: {
        projectId: { type: "number" },
        phaseId: { type: "number" },
        status: { type: "string" },
        assignedMember: { type: "string" },
        orderBy: { type: "string" },
        page: { type: "number" },
        pageSize: { type: "number" },
      },
    },
  },
  {
    name: "cw_create_project_ticket",
    description: "Create a task/ticket on a project.",
    inputSchema: {
      type: "object",
      required: ["summary", "projectId"],
      properties: {
        summary: { type: "string" },
        projectId: { type: "number" },
        phaseId: { type: "number" },
        status: { type: "string" },
        priority: { type: "string" },
        assignedTo: { type: "string" },
        scheduledStart: { type: "string" },
        scheduledEnd: { type: "string" },
        budgetHours: { type: "number" },
        estimatedProductCost: { type: "number" },
        billTime: { type: "string", enum: ["Billable", "DoNotBill", "NoCharge", "NoDefault"] },
        notes: { type: "string" },
      },
    },
  },
  {
    name: "cw_get_project_workplan",
    description: "Get the full workplan (all phases and tasks) for a project.",
    inputSchema: {
      type: "object",
      required: ["projectId"],
      properties: { projectId: { type: "number" } },
    },
  },
];

export async function handleProjectTool(name: string, args: Record<string, unknown>, c: CWClient): Promise<unknown> {
  switch (name) {
    case "cw_list_projects": {
      const conditions: string[] = [];
      if (args.status) conditions.push(`status/name="${args.status}"`);
      if (args.company) conditions.push(`company/name="${args.company}"`);
      if (args.manager) conditions.push(`manager/identifier="${args.manager}"`);
      if (args.name) conditions.push(`name contains "${args.name}"`);
      if (args.type) conditions.push(`type/name="${args.type}"`);
      return c.get("/project/projects", { conditions: cond(conditions), orderBy: args.orderBy, fields: args.fields, page: args.page ?? 1, pageSize: args.pageSize ?? 25 });
    }
    case "cw_get_project":
      return c.get(`/project/projects/${args.id}`);
    case "cw_create_project": {
      const body: Record<string, unknown> = { name: args.name, company: { name: args.company } };
      if (args.manager) body.manager = { identifier: args.manager };
      if (args.status) body.status = { name: args.status };
      if (args.type) body.type = { name: args.type };
      if (args.estimatedStart) body.estimatedStart = args.estimatedStart;
      if (args.estimatedEnd) body.estimatedEnd = args.estimatedEnd;
      if (args.description) body.description = args.description;
      if (args.billingMethod) body.billingMethod = args.billingMethod;
      if (args.estimatedTimeCost !== undefined) body.estimatedTimeCost = args.estimatedTimeCost;
      if (args.estimatedExpenseCost !== undefined) body.estimatedExpenseCost = args.estimatedExpenseCost;
      if (args.estimatedProductCost !== undefined) body.estimatedProductCost = args.estimatedProductCost;
      if (args.locationId) body.location = { id: args.locationId };
      if (args.departmentId) body.department = { id: args.departmentId };
      if (args.agreement) body.agreement = { name: args.agreement };
      return c.post("/project/projects", body);
    }
    case "cw_update_project": {
      const { id, ...updates } = args;
      const ops: any[] = [];
      if (updates.name) ops.push({ op: "replace", path: "/name", value: updates.name });
      if (updates.status) ops.push({ op: "replace", path: "/status/name", value: updates.status });
      if (updates.manager) ops.push({ op: "replace", path: "/manager/identifier", value: updates.manager });
      if (updates.description) ops.push({ op: "replace", path: "/description", value: updates.description });
      if (updates.estimatedStart) ops.push({ op: "replace", path: "/estimatedStart", value: updates.estimatedStart });
      if (updates.estimatedEnd) ops.push({ op: "replace", path: "/estimatedEnd", value: updates.estimatedEnd });
      if (updates.billingMethod) ops.push({ op: "replace", path: "/billingMethod", value: updates.billingMethod });
      return c.patch(`/project/projects/${id}`, ops);
    }
    case "cw_list_project_phases":
      return c.get(`/project/projects/${args.projectId}/phases`, { page: args.page ?? 1, pageSize: args.pageSize ?? 25 });
    case "cw_create_project_phase": {
      const body: Record<string, unknown> = { description: args.description, projectId: args.projectId };
      if (args.estimatedHours !== undefined) body.estimatedHours = args.estimatedHours;
      if (args.scheduledStart) body.scheduledStart = args.scheduledStart;
      if (args.scheduledEnd) body.scheduledEnd = args.scheduledEnd;
      if (args.billTime) body.billTime = args.billTime;
      if (args.notes) body.notes = args.notes;
      if (args.parentPhaseId) body.parentPhase = { id: args.parentPhaseId };
      return c.post(`/project/projects/${args.projectId}/phases`, body);
    }
    case "cw_list_project_tickets": {
      const conditions: string[] = [];
      if (args.projectId) conditions.push(`project/id=${args.projectId}`);
      if (args.phaseId) conditions.push(`phase/id=${args.phaseId}`);
      if (args.status) conditions.push(`status/name="${args.status}"`);
      if (args.assignedMember) conditions.push(`assignedTo="${args.assignedMember}"`);
      return c.get("/project/tickets", { conditions: cond(conditions), orderBy: args.orderBy, page: args.page ?? 1, pageSize: args.pageSize ?? 25 });
    }
    case "cw_create_project_ticket": {
      const body: Record<string, unknown> = { summary: args.summary, project: { id: args.projectId } };
      if (args.phaseId) body.phase = { id: args.phaseId };
      if (args.status) body.status = { name: args.status };
      if (args.priority) body.priority = { name: args.priority };
      if (args.assignedTo) body.assignedTo = args.assignedTo;
      if (args.scheduledStart) body.scheduledStart = args.scheduledStart;
      if (args.scheduledEnd) body.scheduledEnd = args.scheduledEnd;
      if (args.budgetHours !== undefined) body.budgetHours = args.budgetHours;
      if (args.billTime) body.billTime = args.billTime;
      if (args.notes) body.notes = args.notes;
      return c.post("/project/tickets", body);
    }
    case "cw_get_project_workplan":
      return c.get(`/project/projects/${args.projectId}/projectWorkplan`);
    default:
      throw new Error(`Unknown project tool: ${name}`);
  }
}
