"use client";

// ── Sync status ───────────────────────────────────────────────────────────────

export type SyncStatus = "idle" | "syncing" | "error";

let syncStatus: SyncStatus = "idle";
const statusListeners = new Set<(s: SyncStatus) => void>();

function setStatus(s: SyncStatus) {
  syncStatus = s;
  statusListeners.forEach((fn) => fn(s));
}

export function getSyncStatus(): SyncStatus {
  return syncStatus;
}

export function onSyncStatus(listener: (s: SyncStatus) => void): () => void {
  statusListeners.add(listener);
  return () => statusListeners.delete(listener);
}

// ── Dirty queue with debounce ─────────────────────────────────────────────────

const dirtyKeys = new Set<string>();
let flushTimer: ReturnType<typeof setTimeout> | null = null;

/** Call after every localStorage save. relativeKey = "diary_day_2025-01-01" etc */
export function markDirty(relativeKey: string): void {
  if (typeof window === "undefined") return;
  dirtyKeys.add(relativeKey);
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(flushDirty, 2000);
}

async function flushDirty(): Promise<void> {
  if (dirtyKeys.size === 0) return;
  const email = localStorage.getItem("diary_current_user");
  if (!email) return;

  const prefix = `u:${email}:`;
  const keys = [...dirtyKeys];
  dirtyKeys.clear();

  const entries: Record<string, unknown> = {};
  for (const key of keys) {
    const raw = localStorage.getItem(prefix + key);
    if (raw) {
      try { entries[key] = JSON.parse(raw); }
      catch { entries[key] = raw; }
    }
  }
  if (Object.keys(entries).length === 0) return;

  setStatus("syncing");
  try {
    const res = await fetch("/api/sync/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries }),
    });
    if (!res.ok) throw new Error("save failed");
    setStatus("idle");
  } catch {
    // Re-queue failed keys
    keys.forEach((k) => dirtyKeys.add(k));
    setStatus("error");
  }
}

// ── Initial sync from cloud ───────────────────────────────────────────────────

/**
 * Downloads all diary entries from Firestore and writes them to localStorage.
 * Called once after login. Returns number of entries synced.
 */
export async function syncFromCloud(): Promise<number> {
  const email = localStorage.getItem("diary_current_user");
  if (!email) return 0;

  setStatus("syncing");
  try {
    const res = await fetch("/api/sync/load");
    if (!res.ok) throw new Error("load failed");
    const data = (await res.json()) as Record<string, unknown>;
    const prefix = `u:${email}:`;
    let count = 0;
    for (const [key, value] of Object.entries(data)) {
      if (key.startsWith("diary_")) {
        localStorage.setItem(
          prefix + key,
          typeof value === "string" ? value : JSON.stringify(value)
        );
        count++;
      }
    }
    // Remember we already did the initial sync on this device
    localStorage.setItem(`diary_synced_${email}`, "1");
    setStatus("idle");
    return count;
  } catch {
    setStatus("error");
    return 0;
  }
}

/** Returns true if this device has never synced from cloud for this user. */
export function isFirstSync(email: string): boolean {
  return !localStorage.getItem(`diary_synced_${email}`);
}

// ── Upload all local data to cloud ────────────────────────────────────────────

/**
 * Reads ALL diary entries from localStorage and sends them to Firestore.
 * Use this once to push existing local data to the cloud.
 */
export async function uploadAllToCloud(): Promise<number> {
  const email = localStorage.getItem("diary_current_user");
  if (!email) return 0;

  const prefix = `u:${email}:`;
  const entries: Record<string, unknown> = {};

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(prefix + "diary_")) {
      const relativeKey = key.slice(prefix.length);
      const raw = localStorage.getItem(key);
      if (raw) {
        try { entries[relativeKey] = JSON.parse(raw); }
        catch { entries[relativeKey] = raw; }
      }
    }
  }

  const count = Object.keys(entries).length;
  if (count === 0) return 0;

  setStatus("syncing");
  try {
    const res = await fetch("/api/sync/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries }),
    });
    if (!res.ok) throw new Error("upload failed");
    setStatus("idle");
    return count;
  } catch {
    setStatus("error");
    return 0;
  }
}
