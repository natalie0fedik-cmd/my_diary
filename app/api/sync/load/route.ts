import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { initFirebase } from "@/lib/firebaseAdmin";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = initFirebase();
  const email = token.email as string;

  const snapshot = await db
    .collection("users")
    .doc(email)
    .collection("entries")
    .get();

  const result: Record<string, unknown> = {};
  snapshot.forEach((doc) => {
    result[doc.id] = doc.data().data;
  });

  return NextResponse.json(result);
}
