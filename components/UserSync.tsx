"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { syncFromCloud, onSyncStatus, SyncStatus } from "@/lib/cloudSync";

export default function UserSync() {
  const { data: session } = useSession();
  const [status, setStatus] = useState<SyncStatus>("idle");

  // Subscribe to sync status changes
  useEffect(() => {
    return onSyncStatus(setStatus);
  }, []);

  useEffect(() => {
    if (!session?.user?.email) return;
    const email = session.user.email;

    // Save email so storage.ts can namespace keys per user
    localStorage.setItem("diary_current_user", email);

    // Always sync from cloud on login so all devices stay up to date
    syncFromCloud().then((count) => {
      if (count > 0) {
        window.location.reload();
      }
    });
  }, [session]);

  if (status === "idle") return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        right: 20,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 10px",
        borderRadius: 20,
        fontSize: 12,
        background: status === "error" ? "var(--accent)" : "var(--card)",
        color: "var(--text)",
        opacity: 0.85,
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        pointerEvents: "none",
      }}
    >
      {status === "syncing" ? (
        <>
          <span
            style={{
              display: "inline-block",
              width: 10,
              height: 10,
              border: "2px solid var(--text)",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          Синхронізація...
        </>
      ) : (
        <>⚠ Помилка синхронізації</>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
