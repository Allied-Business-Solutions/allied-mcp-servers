import axios, { AxiosInstance } from "axios";

export interface ConnectWiseConfig {
  companyId: string;
  publicKey: string;
  privateKey: string;
  clientId: string;
  siteUrl: string;
}

export function buildConfig(): ConnectWiseConfig {
  const required = ["CW_COMPANY_ID", "CW_PUBLIC_KEY", "CW_PRIVATE_KEY", "CW_CLIENT_ID", "CW_SITE_URL"];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length > 0) throw new Error(`Missing env vars: ${missing.join(", ")}`);
  return {
    companyId: process.env.CW_COMPANY_ID!,
    publicKey: process.env.CW_PUBLIC_KEY!,
    privateKey: process.env.CW_PRIVATE_KEY!,
    clientId: process.env.CW_CLIENT_ID!,
    siteUrl: process.env.CW_SITE_URL!,
  };
}

export interface PatchOp {
  op: "replace" | "add" | "remove";
  path: string;
  value?: unknown;
}

export interface ListParams {
  conditions?: string;
  childConditions?: string;
  orderBy?: string;
  fields?: string;
  page?: number;
  pageSize?: number;
}

export class CWClient {
  private http: AxiosInstance;

  constructor(cfg: ConnectWiseConfig) {
    const token = Buffer.from(`${cfg.companyId}+${cfg.publicKey}:${cfg.privateKey}`).toString("base64");
    this.http = axios.create({
      baseURL: `https://${cfg.siteUrl}/v4_6_release/apis/3.0`,
      headers: {
        Authorization: `Basic ${token}`,
        clientId: cfg.clientId,
        "Content-Type": "application/json",
      },
    });
  }

  async get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    return (await this.http.get<T>(path, { params })).data;
  }

  async post<T>(path: string, data?: unknown): Promise<T> {
    return (await this.http.post<T>(path, data)).data;
  }

  async put<T>(path: string, data: unknown): Promise<T> {
    return (await this.http.put<T>(path, data)).data;
  }

  async patch<T>(path: string, ops: PatchOp[]): Promise<T> {
    return (await this.http.patch<T>(path, ops)).data;
  }

  async delete(path: string): Promise<void> {
    await this.http.delete(path);
  }
}

/** Compact helper: build a patch op array from a plain updates object */
export function patchOps(updates: Record<string, unknown>): PatchOp[] {
  return Object.entries(updates)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => ({ op: "replace" as const, path: `/${k}`, value: v }));
}

/** Build CW conditions string from key/value pairs */
export function cond(parts: string[]): string | undefined {
  const f = parts.filter(Boolean);
  return f.length ? f.join(" AND ") : undefined;
}
