"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

// Saves the current user's email to localStorage so storage.ts can namespace keys per user
export default function UserSync() {
  const { data: session } = useSession();
  useEffect(() => {
    if (session?.user?.email) {
      localStorage.setItem("diary_current_user", session.user.email);
    }
  }, [session]);
  return null;
}
