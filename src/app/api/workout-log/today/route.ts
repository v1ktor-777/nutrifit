export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db/mongodb";
import WorkoutLog from "@/models/WorkoutPlanLog";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const logs = await WorkoutLog.find({
    userId: session.user.id,
  }).lean();

  return Response.json({
    days: logs.map((l: any) => l.day),
  });
}
