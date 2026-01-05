import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // смени пътя ако е различен

export async function requireUser() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    throw Object.assign(new Error("Unauthorized"), { status: 401 });
  }

  return { userId };
}

export function toApiError(err: unknown) {
  // Zod error
  if ((err as any)?.issues) {
    return NextResponse.json(
      { ok: false, error: "Validation failed", details: (err as any).issues },
      { status: 422 }
    );
  }

  const status = (err as any)?.status ?? 400;
  const message = status === 500 ? "Server error" : (err as any)?.message ?? "Error";
  return NextResponse.json({ ok: false, error: message }, { status });
}
