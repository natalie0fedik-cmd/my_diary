import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { initFirebase } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as { entries: Record<string, unknown> };
  const { entries } = body;
  const db = initFirebase();
  const email = token.email as string;

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
