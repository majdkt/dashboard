// src/lib/api.ts
// ─────────────────────────────────────────────────────────────────────────────
// Thin client wrapper around the Teze backend API.
// All fetch calls go through here – the UI never touches Docker directly.
// ─────────────────────────────────────────────────────────────────────────────

export const API_BASE =
  import.meta.env.PUBLIC_API_URL ?? 'http://localhost:3001';

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
}

export interface LogSource {
  id: string;
  name: string;
  state: string;
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
  },
  system: {
    info: () => apiFetch<SystemInfo>('/api/system'),
  },
  logs: {
    sources: () => apiFetch<{ sources: LogSource[] }>('/api/logs'),
    tail: (id: string, tail = 100) =>
      apiFetch<{ id: string; lines: string[] }>(`/api/logs/${id}?tail=${tail}`),
  },
};
