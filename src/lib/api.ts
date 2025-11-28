export type AuthTokens = { access_token: string; refresh_token: string; token_type?: string };

// In production on Render, always talk to the deployed backend URL.
// Locally, you can still override with VITE_API_BASE or fall back to 127.0.0.1.
const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (import.meta.env.MODE === "production"
    ? "https://ai-voice-agent-kljd.onrender.com"
    : "http://127.0.0.1:8000");

export function getApiBase() {
  return API_BASE;
}

export function resolveAssetUrl(path?: string | null) {
  if (!path) return null;
  if (/^(https?:)?\/\//.test(path) || path.startsWith("data:")) return path;
  try {
    return new URL(path, API_BASE).toString();
  } catch {
    return path;
  }
}

export function getAccessToken(): string | null {
  return localStorage.getItem("access_token");
}

export function setTokens(tokens: AuthTokens) {
  localStorage.setItem("access_token", tokens.access_token);
  if (tokens.refresh_token) localStorage.setItem("refresh_token", tokens.refresh_token);
}

export function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

export async function apiFetch<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      if (Array.isArray(data?.detail) && data.detail.length) {
        const first = data.detail[0];
        const msg = first?.msg || (typeof first === "string" ? first : null);
        if (msg) throw new Error(msg);
      }
      if (typeof data?.detail === "string") throw new Error(data.detail);
    } catch { }
    throw new Error(text || res.statusText);
  }
  const ct = res.headers.get("content-type");
  if (ct && ct.includes("application/json")) return res.json();
  // @ts-ignore
  return res.text();
}

export async function registerUser(data: { name: string; email: string; password: string }) {
  return apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function loginUser(data: { email: string; password: string }): Promise<AuthTokens> {
  const form = new URLSearchParams();
  form.set("username", data.email);
  form.set("password", data.password);
  return apiFetch<AuthTokens>("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
}

export async function getMe() {
  return apiFetch("/api/auth/me");
}

export async function updateMe(update: Record<string, any>) {
  return apiFetch("/api/auth/me", { method: "PUT", body: JSON.stringify(update) });
}

export async function uploadAvatar(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  return apiFetch("/api/auth/avatar", { method: "POST", body: fd });
}

export async function listWorkspaces() {
  return apiFetch("/api/workspaces");
}

export async function listAgents(workspaceId: number) {
  const params = new URLSearchParams({ workspace_id: String(workspaceId) });
  return apiFetch(`/api/agents?${params.toString()}`);
}

export async function createAgent(payload: Record<string, any>) {
  return apiFetch("/api/agents", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAgent(agentId: number, payload: Record<string, any>) {
  return apiFetch(`/api/agents/${agentId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function getAgent(agentId: number) {
  return apiFetch(`/api/agents/${agentId}`);
}

export async function deleteAgent(agentId: number) {
  const headers = new Headers();
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}/api/agents/${agentId}`, {
    method: "DELETE",
    headers,
  });

  if (res.status === 204) {
    return { success: true };
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }

  const ct = res.headers.get("content-type");
  if (ct && ct.includes("application/json")) return res.json();
  return res.text();
}

export async function deployAgent(agentId: number) {
  return apiFetch(`/api/agents/${agentId}/deploy`, {
    method: "POST",
  });
}

export async function pauseAgent(agentId: number) {
  return apiFetch(`/api/agents/${agentId}/pause`, {
    method: "POST",
  });
}

export async function cloneAgent(agentId: number) {
  return apiFetch(`/api/agents/${agentId}/clone`, {
    method: "POST",
  });
}

export async function chatWithAgent(agentId: number, body: { message: string; history?: { role: string; content: string }[]; temperature?: number; max_tokens?: number }) {
  return apiFetch(`/api/agents/${agentId}/chat`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function voiceChatWithAgent(agentId: number, file: Blob, history: { role: string; content: string }[]) {
  const form = new FormData();
  form.append("file", file, "voice.webm");
  form.append("history", JSON.stringify(history));
  return apiFetch(`/api/agents/${agentId}/voice-chat`, {
    method: "POST",
    body: form,
  });
}

export interface LiveCallSessionPayload {
  agent_id: number;
  caller_name?: string;
  caller_number?: string;
  language?: string;
}

export interface LiveCallSessionResponse {
  session_id: string;
  session_token: string;
  call_id: number;
  agent_id: number;
  workspace_id: number;
  websocket_path: string;
  expires_at: string;
}

export async function createLiveCallSession(payload: LiveCallSessionPayload) {
  return apiFetch<LiveCallSessionResponse>("/api/calls/sessions/live", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Call transcripts
export async function getCallTranscript(callId: number) {
  return apiFetch(`/api/calls/${callId}/transcript`);
}

// Notifications
export interface NotificationItem {
  id: number;
  workspace_id: number;
  user_id?: number | null;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  updated_at: string;
  severity?: string | null;
}

export async function listNotifications(workspaceId: number, read?: boolean) {
  const params = new URLSearchParams({ workspace_id: String(workspaceId) });
  if (read !== undefined) params.set("read", String(read));
  return apiFetch<NotificationItem[]>(`/api/notifications?${params.toString()}`);
}

export async function getUnreadNotificationsCount(workspaceId: number) {
  const params = new URLSearchParams({ workspace_id: String(workspaceId) });
  return apiFetch<{ unread_count: number }>(`/api/notifications/unread-count?${params.toString()}`);
}

export async function markNotificationRead(notificationId: number) {
  return apiFetch(`/api/notifications/${notificationId}/read`, { method: "PUT" });
}

export async function markAllNotificationsRead(workspaceId: number) {
  const params = new URLSearchParams({ workspace_id: String(workspaceId) });
  return apiFetch(`/api/notifications/read-all?${params.toString()}`, { method: "PUT" });
}

// Dashboard
export interface DashboardStats {
  active_agents: number;
  total_calls: number;
  completed_calls: number;
  inbound_calls: number;
  outbound_calls: number;
  minutes_used: number;
  average_call_duration_seconds: number;
  average_handle_time_seconds: number;
}

export interface DashboardCall {
  id: number;
  caller_name?: string | null;
  caller_number?: string | null;
  agent_id?: number | null;
  agent_name?: string | null;
  duration_seconds: number;
  status: string;
  sentiment: string;
  started_at: string;
}

export interface DashboardAgent {
  id: number;
  name: string;
  status: string;
  language: string;
  calls: number;
  average_handle_time?: number | null;
  sentiment_score?: number | null;
}

export interface DashboardOverview {
  workspace_id: number;
  period_days: number;
  stats: DashboardStats;
  recent_calls: DashboardCall[];
  active_agents: DashboardAgent[];
  updated_at: string;
}

export async function getDashboardOverview(workspaceId: number, days = 30) {
  const params = new URLSearchParams({
    workspace_id: String(workspaceId),
    days: String(days),
  });
  return apiFetch<DashboardOverview>(`/api/dashboard/overview?${params.toString()}`);
}

// Calls
export interface CallLog {
  id: number;
  workspace_id: number;
  agent_id?: number | null;
  caller_name?: string | null;
  caller_number?: string | null;
  direction: string;
  status: string;
  duration_seconds: number;
  sentiment: string;
  sentiment_score?: number | null;
  transcript: any[];
  recording_url?: string | null;
  summary?: string | null;
  outcome?: string | null;
  tags?: string[];
  cost_cents: number;
  twilio_call_sid?: string | null;
  started_at: string;
  ended_at?: string | null;
  created_at: string;
}

export async function listCallLogs(params: {
  workspaceId: number;
  agentId?: number;
  status?: string;
  direction?: string;
  skip?: number;
  limit?: number;
}) {
  const search = new URLSearchParams({ workspace_id: String(params.workspaceId) });
  if (params.agentId) search.set("agent_id", String(params.agentId));
  if (params.status) search.set("status", params.status);
  if (params.direction) search.set("direction", params.direction);
  if (params.skip !== undefined) search.set("skip", String(params.skip));
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  return apiFetch<CallLog[]>(`/api/calls?${search.toString()}`);
}

// Billing
export interface Plan {
  id: string;
  name: string;
  price_monthly: number;
  price_annual?: number;
  features: string[];
}

export interface SubscriptionResponse {
  subscription_id: number;
  plan: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  plan_details: Plan;
  available_plans: Plan[];
}

export interface Invoice {
  id: number;
  workspace_id: number;
  billed_to_user_id?: number;
  invoice_number: string;
  period_start: string;
  period_end: string;
  amount_cents: number;
  currency: string;
  status: string;
  description?: string | null;
  pdf_url?: string | null;
  created_at: string;
}

export interface UsageStat {
  id: number;
  workspace_id: number;
  metric: string;
  value: number;
  period: string;
  created_at: string;
}

export interface PaymentMethod {
  id: number;
  workspace_id: number;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  cardholder_name?: string | null;
  billing_email?: string | null;
  provider: string;
  provider_method_id?: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethodPayload {
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  cardholder_name?: string;
  billing_email?: string;
  provider?: string;
  provider_method_id?: string;
  is_default?: boolean;
}

export async function getSubscription(workspaceId: number) {
  return apiFetch<SubscriptionResponse>(`/api/billing/subscription?workspace_id=${workspaceId}`);
}

export async function getPlans() {
  return apiFetch<{ plans: Plan[] }>("/api/billing/plans");
}

export async function upgradeSubscription(workspaceId: number, newPlan: string) {
  return apiFetch(`/api/billing/subscription/upgrade?workspace_id=${workspaceId}`, {
    method: "POST",
    body: JSON.stringify({ new_plan: newPlan }),
  });
}

export async function cancelSubscription(workspaceId: number, immediate = false) {
  return apiFetch(`/api/billing/subscription/cancel?workspace_id=${workspaceId}`, {
    method: "POST",
    body: JSON.stringify({ immediate }),
  });
}

export async function listInvoices(workspaceId: number) {
  return apiFetch<Invoice[]>(`/api/billing/invoices?workspace_id=${workspaceId}`);
}

export async function downloadInvoice(invoiceId: number) {
  const token = getAccessToken();
  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}/api/billing/invoices/${invoiceId}/download`, {
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }

  return res.blob();
}

export async function generateInvoice(workspaceId: number, payload?: { billing_cycle?: "monthly" | "annual"; description?: string }) {
  return apiFetch<Invoice>(`/api/billing/invoices/generate?workspace_id=${workspaceId}`, {
    method: "POST",
    body: JSON.stringify({
      billing_cycle: payload?.billing_cycle || "monthly",
      description: payload?.description,
    }),
  });
}

export async function getUsageStats(workspaceId: number) {
  return apiFetch<UsageStat[]>(`/api/billing/usage?workspace_id=${workspaceId}`);
}

export async function recordUsage(workspaceId: number, payload: { metric: string; value: number; period?: string }) {
  return apiFetch(`/api/billing/usage?workspace_id=${workspaceId}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getPaymentMethod(workspaceId: number) {
  return apiFetch<PaymentMethod | null>(`/api/billing/payment-method?workspace_id=${workspaceId}`);
}

export async function upsertPaymentMethod(workspaceId: number, payload: PaymentMethodPayload) {
  return apiFetch<PaymentMethod>(`/api/billing/payment-method?workspace_id=${workspaceId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// Payment provider credentials
export async function getPaymentProviders(workspaceId: number) {
  return apiFetch<Record<string, any>>(`/api/billing/payment-providers?workspace_id=${workspaceId}`);
}

export async function upsertPaymentProviders(workspaceId: number, payload: {
  paypal?: Record<string, any>;
  applepay?: Record<string, any>;
  gpay?: Record<string, any>;
}) {
  return apiFetch<Record<string, any>>(`/api/billing/payment-providers?workspace_id=${workspaceId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
