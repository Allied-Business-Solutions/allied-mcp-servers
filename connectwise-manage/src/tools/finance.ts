import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { CWClient, cond } from "../client.js";

export const financeTools: Tool[] = [
  {
    name: "cw_list_agreements",
    description: "List agreements. Filter by company, type, status, or date range.",
    inputSchema: {
      type: "object",
      properties: {
        company: { type: "string" },
        type: { type: "string", description: "Agreement type name" },
        cancelled: { type: "boolean" },
        startDateAfter: { type: "string", description: "ISO 8601" },
        endDateBefore: { type: "string", description: "ISO 8601" },
        name: { type: "string", description: "Partial name match" },
        orderBy: { type: "string" },
        fields: { type: "string" },
        page: { type: "number" },
        pageSize: { type: "number" },
      },
    },
  },
  {
    name: "cw_get_agreement",
    description: "Get full details of an agreement by ID.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "number" } },
    },
  },
  {
    name: "cw_create_agreement",
    description: "Create a new agreement.",
    inputSchema: {
      type: "object",
      required: ["name", "type", "company"],
      properties: {
        name: { type: "string" },
        type: { type: "string", description: "Agreement type name" },
        company: { type: "string" },
        contact: { type: "string" },
        startDate: { type: "string", description: "ISO 8601" },
        endDate: { type: "string" },
        noEndingDateFlag: { type: "boolean" },
        customerPO: { type: "string" },
        locationId: { type: "number" },
        departmentId: { type: "number" },
        billCycleId: { type: "number" },
        billOneTimeFlag: { type: "boolean" },
        billTermsId: { type: "number" },
        invoiceDescription: { type: "string" },
        topCommentFlag: { type: "boolean" },
        bottomCommentFlag: { type: "boolean" },
        opportunityId: { type: "number" },
      },
    },
  },
  {
    name: "cw_update_agreement",
    description: "Update fields on an existing agreement.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "number" },
        name: { type: "string" },
        endDate: { type: "string" },
        cancelledFlag: { type: "boolean" },
        customerPO: { type: "string" },
        invoiceDescription: { type: "string" },
      },
    },
  },
  {
    name: "cw_list_agreement_additions",
    description: "List additions (line items) on an agreement.",
    inputSchema: {
      type: "object",
      required: ["agreementId"],
      properties: {
        agreementId: { type: "number" },
        page: { type: "number" },
        pageSize: { type: "number" },
      },
    },
  },
  {
    name: "cw_add_agreement_addition",
    description: "Add a product/service addition to an agreement.",
    inputSchema: {
      type: "object",
      required: ["agreementId", "product"],
      properties: {
        agreementId: { type: "number" },
        product: { type: "string", description: "Product identifier" },
        quantity: { type: "number" },
        unitPrice: { type: "number" },
        unitCost: { type: "number" },
        billCustomer: { type: "string", enum: ["Billable", "DoNotBill", "NoCharge"] },
        effectiveDate: { type: "string", description: "ISO 8601" },
        cancelledDate: { type: "string" },
      },
    },
  },
  {
    name: "cw_list_invoices",
    description: "List invoices. Filter by company, status, date range, or type.",
    inputSchema: {
      type: "object",
      properties: {
        company: { type: "string" },
        status: { type: "string", description: "Invoice status name" },
        invoiceType: { type: "string", description: "e.g. 'Standard', 'Agreement', 'Progress'" },
        dueDateBefore: { type: "string", description: "ISO 8601" },
        dueDateAfter: { type: "string" },
        invoiceNumber: { type: "string" },
        orderBy: { type: "string", description: "e.g. 'dueDate asc'" },
        fields: { type: "string" },
        page: { type: "number" },
        pageSize: { type: "number" },
      },
    },
  },
  {
    name: "cw_get_invoice",
    description: "Get full details of an invoice by ID.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "number" } },
    },
  },
  {
    name: "cw_update_invoice",
    description: "Update an invoice (e.g. add PO number, change due date, mark paid).",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "number" },
        dueDate: { type: "string" },
        customerPO: { type: "string" },
        billingStatus: { type: "string", description: "e.g. 'Sent', 'Paid'" },
        invoiceNumber: { type: "string" },
        taxCode: { type: "string" },
      },
    },
  },
  {
    name: "cw_add_invoice_payment",
    description: "Record a payment against an invoice.",
    inputSchema: {
      type: "object",
      required: ["invoiceId", "amount", "paymentDate"],
      properties: {
        invoiceId: { type: "number" },
        amount: { type: "number" },
        paymentDate: { type: "string", description: "ISO 8601" },
        paymentType: { type: "string", description: "Payment type name (e.g. 'Check', 'Credit Card')" },
        checkNumber: { type: "string" },
      },
    },
  },
];

export async function handleFinanceTool(name: string, args: Record<string, unknown>, c: CWClient): Promise<unknown> {
  switch (name) {
    case "cw_list_agreements": {
      const conditions: string[] = [];
      if (args.company) conditions.push(`company/name="${args.company}"`);
      if (args.type) conditions.push(`type/name="${args.type}"`);
      if (args.cancelled !== undefined) conditions.push(`cancelledFlag=${args.cancelled}`);
      if (args.startDateAfter) conditions.push(`startDate>=[${args.startDateAfter}]`);
      if (args.endDateBefore) conditions.push(`endDate<=[${args.endDateBefore}]`);
      if (args.name) conditions.push(`name contains "${args.name}"`);
      return c.get("/finance/agreements", { conditions: cond(conditions), orderBy: args.orderBy, fields: args.fields, page: args.page ?? 1, pageSize: args.pageSize ?? 25 });
    }
    case "cw_get_agreement":
      return c.get(`/finance/agreements/${args.id}`);
    case "cw_create_agreement": {
      const body: Record<string, unknown> = { name: args.name, type: { name: args.type }, company: { name: args.company } };
      if (args.contact) body.contact = { name: args.contact };
      if (args.startDate) body.startDate = args.startDate;
      if (args.endDate) body.endDate = args.endDate;
      if (args.noEndingDateFlag !== undefined) body.noEndingDateFlag = args.noEndingDateFlag;
      if (args.customerPO) body.customerPO = args.customerPO;
      if (args.locationId) body.location = { id: args.locationId };
      if (args.departmentId) body.department = { id: args.departmentId };
      if (args.billCycleId) body.billCycle = { id: args.billCycleId };
      if (args.billOneTimeFlag !== undefined) body.billOneTimeFlag = args.billOneTimeFlag;
      if (args.billTermsId) body.billTerms = { id: args.billTermsId };
      if (args.invoiceDescription) body.invoiceDescription = args.invoiceDescription;
      if (args.topCommentFlag !== undefined) body.topCommentFlag = args.topCommentFlag;
      if (args.bottomCommentFlag !== undefined) body.bottomCommentFlag = args.bottomCommentFlag;
      if (args.opportunityId) body.opportunity = { id: args.opportunityId };
      return c.post("/finance/agreements", body);
    }
    case "cw_update_agreement": {
      const { id, ...updates } = args;
      const ops: any[] = [];
      if (updates.name) ops.push({ op: "replace", path: "/name", value: updates.name });
      if (updates.endDate) ops.push({ op: "replace", path: "/endDate", value: updates.endDate });
      if (updates.cancelledFlag !== undefined) ops.push({ op: "replace", path: "/cancelledFlag", value: updates.cancelledFlag });
      if (updates.customerPO) ops.push({ op: "replace", path: "/customerPO", value: updates.customerPO });
      if (updates.invoiceDescription) ops.push({ op: "replace", path: "/invoiceDescription", value: updates.invoiceDescription });
      return c.patch(`/finance/agreements/${id}`, ops);
    }
    case "cw_list_agreement_additions":
      return c.get(`/finance/agreements/${args.agreementId}/additions`, { page: args.page ?? 1, pageSize: args.pageSize ?? 25 });
    case "cw_add_agreement_addition": {
      const body: Record<string, unknown> = { product: { identifier: args.product } };
      if (args.quantity !== undefined) body.quantity = args.quantity;
      if (args.unitPrice !== undefined) body.unitPrice = args.unitPrice;
      if (args.unitCost !== undefined) body.unitCost = args.unitCost;
      if (args.billCustomer) body.billCustomer = args.billCustomer;
      if (args.effectiveDate) body.effectiveDate = args.effectiveDate;
      if (args.cancelledDate) body.cancelledDate = args.cancelledDate;
      return c.post(`/finance/agreements/${args.agreementId}/additions`, body);
    }
    case "cw_list_invoices": {
      const conditions: string[] = [];
      if (args.company) conditions.push(`company/name="${args.company}"`);
      if (args.status) conditions.push(`status/name="${args.status}"`);
      if (args.invoiceType) conditions.push(`type="${args.invoiceType}"`);
      if (args.dueDateBefore) conditions.push(`dueDate<=[${args.dueDateBefore}]`);
      if (args.dueDateAfter) conditions.push(`dueDate>=[${args.dueDateAfter}]`);
      if (args.invoiceNumber) conditions.push(`invoiceNumber="${args.invoiceNumber}"`);
      return c.get("/finance/invoices", { conditions: cond(conditions), orderBy: args.orderBy, fields: args.fields, page: args.page ?? 1, pageSize: args.pageSize ?? 25 });
    }
    case "cw_get_invoice":
      return c.get(`/finance/invoices/${args.id}`);
    case "cw_update_invoice": {
      const { id, ...updates } = args;
      const ops: any[] = [];
      if (updates.dueDate) ops.push({ op: "replace", path: "/dueDate", value: updates.dueDate });
      if (updates.customerPO) ops.push({ op: "replace", path: "/customerPO", value: updates.customerPO });
      if (updates.billingStatus) ops.push({ op: "replace", path: "/status/name", value: updates.billingStatus });
      if (updates.invoiceNumber) ops.push({ op: "replace", path: "/invoiceNumber", value: updates.invoiceNumber });
      if (updates.taxCode) ops.push({ op: "replace", path: "/taxCode/name", value: updates.taxCode });
      return c.patch(`/finance/invoices/${id}`, ops);
    }
    case "cw_add_invoice_payment": {
      const body: Record<string, unknown> = { amount: args.amount, paymentDate: args.paymentDate };
      if (args.paymentType) body.paymentType = { name: args.paymentType };
      if (args.checkNumber) body.checkNumber = args.checkNumber;
      return c.post(`/finance/invoices/${args.invoiceId}/payments`, body);
    }
    default:
      throw new Error(`Unknown finance tool: ${name}`);
  }
}
