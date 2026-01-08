export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db/mongodb";
import User from "@/models/User";

function toObjId(id: string) {
  return new mongoose.Types.ObjectId(id);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const user = await User.findById(toObjId(session.user.id))
    .select("name email heightCm sex")
    .lean();

  return Response.json({ data: user });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const heightCmRaw = body?.heightCm;
  const sexRaw = body?.sex;

  const heightCm =
    heightCmRaw === null || heightCmRaw === "" || heightCmRaw === undefined
      ? null
      : Number(heightCmRaw);

  if (heightCm !== null && (!Number.isFinite(heightCm) || heightCm < 0)) {
    return Response.json({ error: "heightCm must be 0 or more" }, { status: 400 });
  }

  const sex =
    sexRaw === null || sexRaw === "" || sexRaw === undefined
      ? null
      : String(sexRaw);

  if (sex !== null && sex !== "male" && sex !== "female") {
    return Response.json({ error: "sex must be male or female" }, { status: 400 });
  }

  await connectDB();

  const updated = await User.findByIdAndUpdate(
    toObjId(session.user.id),
    { $set: { heightCm, sex } },
    { new: true }
  )
    .select("name email heightCm sex")
    .lean();

  return Response.json({ ok: true, data: updated });
}
