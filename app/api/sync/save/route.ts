import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { initFirebase } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as { entries: Record<string, unknown> };
  const { entries } = body;
  const db = initFirebase();
  const email = session.user.email;

  const batch = db.batch();
  for (const [key, value] of Object.entries(entries)) {
    if (key.startsWith("diary_")) {
      const ref = db.collection("users").doc(email).collection("entries").doc(key);
      batch.set(ref, { data: value, updatedAt: new Date() });
    }
  }
  await batch.commit();

  return NextResponse.json({ ok: true });
}
