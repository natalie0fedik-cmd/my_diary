import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { initFirebase } from "@/lib/firebaseAdmin";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = initFirebase();
  const email = session.user.email;

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
