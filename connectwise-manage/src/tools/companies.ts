import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { CWClient, cond } from "../client.js";

export const companyTools: Tool[] = [
  {
    name: "cw_list_companies",
    description: "List companies. Filter by name, type, status, territory, or market.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Partial name match" },
        identifier: { type: "string", description: "Company identifier (short code)" },
        type: { type: "string", description: "Company type name (e.g. 'Client', 'Prospect', 'Vendor')" },
        status: { type: "string", description: "Company status name (e.g. 'Active', 'Inactive')" },
        territory: { type: "string" },
        market: { type: "string" },
        phoneNumber: { type: "string" },
        website: { type: "string" },
        orderBy: { type: "string" },
        fields: { type: "string" },
        page: { type: "number" },
        pageSize: { type: "number" },
      },
    },
  },
  {
    name: "cw_get_company",
    description: "Get full details of a company by ID.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "number" }, fields: { type: "string" } },
    },
  },
  {
    name: "cw_create_company",
    description: "Create a new company.",
    inputSchema: {
      type: "object",
      required: ["name", "identifier"],
      properties: {
        name: { type: "string" },
        identifier: { type: "string", description: "Short unique code, no spaces" },
        phoneNumber: { type: "string" },
        faxNumber: { type: "string" },
        website: { type: "string" },
        type: { type: "string" },
        status: { type: "string" },
        territory: { type: "string" },
        market: { type: "string" },
        addressLine1: { type: "string" },
        addressLine2: { type: "string" },
        city: { type: "string" },
        state: { type: "string" },
        zip: { type: "string" },
        country: { type: "string" },
        billingTerms: { type: "string" },
        taxCode: { type: "string" },
        annualRevenue: { type: "number" },
        numberOfEmployees: { type: "number" },
        leadFlag: { type: "boolean" },
        vendorIdentifier: { type: "string" },
      },
    },
  },
  {
    name: "cw_update_company",
    description: "Update fields on an existing company.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "number" },
        name: { type: "string" },
        phoneNumber: { type: "string" },
        website: { type: "string" },
        type: { type: "string" },
        status: { type: "string" },
        territory: { type: "string" },
        market: { type: "string" },
        addressLine1: { type: "string" },
        city: { type: "string" },
        state: { type: "string" },
        zip: { type: "string" },
        annualRevenue: { type: "number" },
        numberOfEmployees: { type: "number" },
      },
    },
  },
  {
    name: "cw_list_contacts",
    description: "List contacts. Filter by company, name, email, or department.",
    inputSchema: {
      type: "object",
      properties: {
        companyId: { type: "number" },
        firstName: { type: "string" },
        lastName: { type: "string" },
        email: { type: "string" },
        department: { type: "string" },
        title: { type: "string" },
        inactiveFlag: { type: "boolean", description: "Include inactive contacts" },
        orderBy: { type: "string" },
        fields: { type: "string" },
        page: { type: "number" },
        pageSize: { type: "number" },
      },
    },
  },
  {
    name: "cw_get_contact",
    description: "Get full details of a contact by ID.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "number" }, fields: { type: "string" } },
    },
  },
  {
    name: "cw_create_contact",
    description: "Create a new contact.",
    inputSchema: {
      type: "object",
      required: ["firstName", "lastName", "companyId"],
      properties: {
        firstName: { type: "string" },
        lastName: { type: "string" },
        companyId: { type: "number" },
        title: { type: "string" },
        department: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
        mobilePhone: { type: "string" },
        fax: { type: "string" },
        notes: { type: "string" },
        marriedFlag: { type: "boolean" },
        portalSecurityLevel: { type: "number", description: "Portal access level (1-6)" },
      },
    },
  },
  {
    name: "cw_update_contact",
    description: "Update fields on an existing contact.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "number" },
        firstName: { type: "string" },
        lastName: { type: "string" },
        title: { type: "string" },
        department: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
        mobilePhone: { type: "string" },
        notes: { type: "string" },
        inactiveFlag: { type: "boolean" },
      },
    },
  },
  {
    name: "cw_list_configurations",
    description: "List managed configurations (devices). Filter by company, type, status, or name.",
    inputSchema: {
      type: "object",
      properties: {
        companyId: { type: "number" },
        type: { type: "string", description: "Configuration type name" },
        status: { type: "string", description: "Configuration status name" },
        name: { type: "string", description: "Config name (partial match)" },
        activeFlag: { type: "boolean", description: "Filter by active/inactive" },
        orderBy: { type: "string" },
        fields: { type: "string" },
        page: { type: "number" },
        pageSize: { type: "number" },
      },
    },
  },
  {
    name: "cw_get_configuration",
    description: "Get full details of a configuration by ID.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "number" } },
    },
  },
  {
    name: "cw_create_configuration",
    description: "Create a new managed configuration/device.",
    inputSchema: {
      type: "object",
      required: ["name", "type", "companyId"],
      properties: {
        name: { type: "string" },
        type: { type: "string", description: "Configuration type name" },
        companyId: { type: "number" },
        status: { type: "string" },
        contact: { type: "string", description: "Contact name" },
        siteName: { type: "string" },
        serialNumber: { type: "string" },
        modelNumber: { type: "string" },
        tagNumber: { type: "string" },
        ipAddress: { type: "string" },
        macAddress: { type: "string" },
        purchaseDate: { type: "string", description: "ISO 8601 date" },
        installationDate: { type: "string", description: "ISO 8601 date" },
        warrantyExpirationDate: { type: "string" },
        vendorId: { type: "number" },
        notes: { type: "string" },
        activeFlag: { type: "boolean" },
      },
    },
  },
  {
    name: "cw_list_company_sites",
    description: "List sites for a company.",
    inputSchema: {
      type: "object",
      required: ["companyId"],
      properties: {
        companyId: { type: "number" },
        page: { type: "number" },
        pageSize: { type: "number" },
      },
    },
  },
];

export async function handleCompanyTool(name: string, args: Record<string, unknown>, c: CWClient): Promise<unknown> {
  switch (name) {
    case "cw_list_companies": {
      const conditions: string[] = [];
      if (args.name) conditions.push(`name contains "${args.name}"`);
      if (args.identifier) conditions.push(`identifier="${args.identifier}"`);
      if (args.type) conditions.push(`type/name="${args.type}"`);
      if (args.status) conditions.push(`status/name="${args.status}"`);
      if (args.territory) conditions.push(`territory/name="${args.territory}"`);
      if (args.market) conditions.push(`market/name="${args.market}"`);
      if (args.phoneNumber) conditions.push(`phoneNumber contains "${args.phoneNumber}"`);
      if (args.website) conditions.push(`website contains "${args.website}"`);
      return c.get("/company/companies", { conditions: cond(conditions), orderBy: args.orderBy, fields: args.fields, page: args.page ?? 1, pageSize: args.pageSize ?? 25 });
    }
    case "cw_get_company":
      return c.get(`/company/companies/${args.id}`, { fields: args.fields });
    case "cw_create_company": {
      const body: Record<string, unknown> = { name: args.name, identifier: args.identifier };
      if (args.phoneNumber) body.phoneNumber = args.phoneNumber;
      if (args.faxNumber) body.faxNumber = args.faxNumber;
      if (args.website) body.website = args.website;
      if (args.type) body.type = { name: args.type };
      if (args.status) body.status = { name: args.status };
      if (args.territory) body.territory = { name: args.territory };
      if (args.market) body.market = { name: args.market };
      if (args.addressLine1) body.addressLine1 = args.addressLine1;
      if (args.addressLine2) body.addressLine2 = args.addressLine2;
      if (args.city) body.city = args.city;
      if (args.state) body.state = args.state;
      if (args.zip) body.zip = args.zip;
      if (args.country) body.country = { name: args.country };
      if (args.billingTerms) body.billingTerms = { name: args.billingTerms };
      if (args.taxCode) body.taxCode = { name: args.taxCode };
      if (args.annualRevenue !== undefined) body.annualRevenue = args.annualRevenue;
      if (args.numberOfEmployees !== undefined) body.numberOfEmployees = args.numberOfEmployees;
      if (args.leadFlag !== undefined) body.leadFlag = args.leadFlag;
      if (args.vendorIdentifier) body.vendorIdentifier = args.vendorIdentifier;
      return c.post("/company/companies", body);
    }
    case "cw_update_company": {
      const { id, ...updates } = args;
      const ops: any[] = [];
      if (updates.name) ops.push({ op: "replace", path: "/name", value: updates.name });
      if (updates.phoneNumber) ops.push({ op: "replace", path: "/phoneNumber", value: updates.phoneNumber });
      if (updates.website) ops.push({ op: "replace", path: "/website", value: updates.website });
      if (updates.type) ops.push({ op: "replace", path: "/type/name", value: updates.type });
      if (updates.status) ops.push({ op: "replace", path: "/status/name", value: updates.status });
      if (updates.territory) ops.push({ op: "replace", path: "/territory/name", value: updates.territory });
      if (updates.market) ops.push({ op: "replace", path: "/market/name", value: updates.market });
      if (updates.addressLine1) ops.push({ op: "replace", path: "/addressLine1", value: updates.addressLine1 });
      if (updates.city) ops.push({ op: "replace", path: "/city", value: updates.city });
      if (updates.state) ops.push({ op: "replace", path: "/state", value: updates.state });
      if (updates.zip) ops.push({ op: "replace", path: "/zip", value: updates.zip });
      if (updates.annualRevenue !== undefined) ops.push({ op: "replace", path: "/annualRevenue", value: updates.annualRevenue });
      if (updates.numberOfEmployees !== undefined) ops.push({ op: "replace", path: "/numberOfEmployees", value: updates.numberOfEmployees });
      return c.patch(`/company/companies/${id}`, ops);
    }
    case "cw_list_contacts": {
      const conditions: string[] = [];
      if (args.companyId) conditions.push(`company/id=${args.companyId}`);
      if (args.firstName) conditions.push(`firstName contains "${args.firstName}"`);
      if (args.lastName) conditions.push(`lastName contains "${args.lastName}"`);
      if (args.email) conditions.push(`communicationItems/value="${args.email}"`);
      if (args.department) conditions.push(`department/name="${args.department}"`);
      if (args.title) conditions.push(`title contains "${args.title}"`);
      if (args.inactiveFlag !== undefined) conditions.push(`inactiveFlag=${args.inactiveFlag}`);
      return c.get("/company/contacts", { conditions: cond(conditions), orderBy: args.orderBy, fields: args.fields, page: args.page ?? 1, pageSize: args.pageSize ?? 25 });
    }
    case "cw_get_contact":
      return c.get(`/company/contacts/${args.id}`, { fields: args.fields });
    case "cw_create_contact": {
      const body: Record<string, unknown> = { firstName: args.firstName, lastName: args.lastName, company: { id: args.companyId } };
      if (args.title) body.title = args.title;
      if (args.department) body.department = { name: args.department };
      if (args.notes) body.notes = args.notes;
      const comms: any[] = [];
      if (args.email) comms.push({ type: { name: "Email" }, value: args.email, defaultFlag: true });
      if (args.phone) comms.push({ type: { name: "Direct" }, value: args.phone, defaultFlag: comms.length === 0 });
      if (args.mobilePhone) comms.push({ type: { name: "Cell" }, value: args.mobilePhone });
      if (args.fax) comms.push({ type: { name: "Fax" }, value: args.fax });
      if (comms.length) body.communicationItems = comms;
      if (args.portalSecurityLevel !== undefined) body.portalSecurityLevel = args.portalSecurityLevel;
      return c.post("/company/contacts", body);
    }
    case "cw_update_contact": {
      const { id, ...updates } = args;
      const ops: any[] = [];
      if (updates.firstName) ops.push({ op: "replace", path: "/firstName", value: updates.firstName });
      if (updates.lastName) ops.push({ op: "replace", path: "/lastName", value: updates.lastName });
      if (updates.title) ops.push({ op: "replace", path: "/title", value: updates.title });
      if (updates.department) ops.push({ op: "replace", path: "/department/name", value: updates.department });
      if (updates.notes) ops.push({ op: "replace", path: "/notes", value: updates.notes });
      if (updates.inactiveFlag !== undefined) ops.push({ op: "replace", path: "/inactiveFlag", value: updates.inactiveFlag });
      return c.patch(`/company/contacts/${id}`, ops);
    }
    case "cw_list_configurations": {
      const conditions: string[] = [];
      if (args.companyId) conditions.push(`company/id=${args.companyId}`);
      if (args.type) conditions.push(`type/name="${args.type}"`);
      if (args.status) conditions.push(`status/name="${args.status}"`);
      if (args.name) conditions.push(`name contains "${args.name}"`);
      if (args.activeFlag !== undefined) conditions.push(`activeFlag=${args.activeFlag}`);
      return c.get("/company/configurations", { conditions: cond(conditions), orderBy: args.orderBy, fields: args.fields, page: args.page ?? 1, pageSize: args.pageSize ?? 25 });
    }
    case "cw_get_configuration":
      return c.get(`/company/configurations/${args.id}`);
    case "cw_create_configuration": {
      const body: Record<string, unknown> = { name: args.name, type: { name: args.type }, company: { id: args.companyId } };
      if (args.status) body.status = { name: args.status };
      if (args.contact) body.contact = { name: args.contact };
      if (args.siteName) body.siteName = args.siteName;
      if (args.serialNumber) body.serialNumber = args.serialNumber;
      if (args.modelNumber) body.modelNumber = args.modelNumber;
      if (args.tagNumber) body.tagNumber = args.tagNumber;
      if (args.ipAddress) body.ipAddress = args.ipAddress;
      if (args.macAddress) body.macAddress = args.macAddress;
      if (args.purchaseDate) body.purchaseDate = args.purchaseDate;
      if (args.installationDate) body.installationDate = args.installationDate;
      if (args.warrantyExpirationDate) body.warrantyExpirationDate = args.warrantyExpirationDate;
      if (args.vendorId) body.vendor = { id: args.vendorId };
      if (args.notes) body.notes = args.notes;
      if (args.activeFlag !== undefined) body.activeFlag = args.activeFlag;
      return c.post("/company/configurations", body);
    }
    case "cw_list_company_sites":
      return c.get(`/company/companies/${args.companyId}/sites`, { page: args.page ?? 1, pageSize: args.pageSize ?? 25 });
    default:
      throw new Error(`Unknown company tool: ${name}`);
  }
}
