// src/lib/api.ts
// ─────────────────────────────────────────────────────────────────────────────
// Thin client wrapper around the Teze backend API.
// All fetch calls go through here – the UI never touches Docker directly.
//
// Configuration: set PUBLIC_API_URL in dashboard/.env
// Example:  PUBLIC_API_URL=http://192.168.1.100:3001
// ─────────────────────────────────────────────────────────────────────────────

if (!import.meta.env.PUBLIC_API_URL) {
  throw new Error(
    '[Teze] PUBLIC_API_URL is not set. ' +
    'Copy dashboard/.env.example to dashboard/.env and fill in your API URL.'
  );
}

export const API_BASE = import.meta.env.PUBLIC_API_URL as string;

async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Container {
  id: string;
  fullId: string;
  name: string;
  image: string;
  status: string;
  state: string;
  created: number;
  ports: { IP?: string; PrivatePort: number; PublicPort?: number; Type: string }[];
  labels: Record<string, string>;
}

export interface SystemInfo {
  cpu: {
    model: string;
    cores: number;
    threads: number;
    speed: number;
    loadPercent: number;
    loadPerCore: number[];
    temp: number | null;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usedPercent: number;
  };
  uptime: { seconds: number; human: string };
  os: {
    distro: string;
    release: string;
    kernel: string;
    arch: string;
    hostname: string;
  };
  disk: { fs: string; mount: string; size: number; used: number; use: number }[];
  network: { iface: string; ip4: string; speed: number; dhcp: boolean; mac: string }[];
  gpu: { vendor: string; model: string; vram: number; temp: number | null }[];
  pingLatency: number | null;
}

export interface LogSource {
  id: string;
  name: string;
  state: string;
}

export interface DiagnosticResult {
  commandId: string;
  command: string;
  output: string;
}

// ── API Methods ───────────────────────────────────────────────────────────────

export const api = {
  containers: {
    list: () => apiFetch<{ containers: Container[] }>('/api/containers'),
    start: (id: string) =>
      apiFetch<{ ok: boolean }>(`/api/containers/${id}/start`, { method: 'POST' }),
    stop: (id: string) =>
      apiFetch<{ ok: boolean }>(`/api/containers/${id}/stop`, { method: 'POST' }),
    restart: (id: string) =>
      apiFetch<{ ok: boolean }>(`/api/containers/${id}/restart`, { method: 'POST' }),
    remove: (id: string) =>
      apiFetch<{ ok: boolean }>(`/api/containers/${id}/remove`, { method: 'POST' }),
    prune: () =>
      apiFetch<{ ok: boolean; pruned: any }>('/api/containers/prune', { method: 'POST' }),
  },
  system: {
    info: () => apiFetch<SystemInfo>('/api/system'),
    diagnostics: (commandId: string) =>
      apiFetch<DiagnosticResult>('/api/system/diagnostics', {
        method: 'POST',
        body: JSON.stringify({ commandId }),
      }),
  },
  logs: {
    sources: () => apiFetch<{ sources: LogSource[] }>('/api/logs'),
    tail: (id: string, tail = 100) =>
      apiFetch<{ id: string; lines: string[] }>(`/api/logs/${id}?tail=${tail}`),
  },
};

