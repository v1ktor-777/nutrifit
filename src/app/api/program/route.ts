export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db/mongodb";
import Program from "@/models/Program";
import { generateProgram } from "@/lib/programGenerator";

/* ======================
   GET – връща последната програма
   ====================== */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return Response.json(null);
  }

  await connectDB();

  const program = await Program.findOne({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

  return Response.json(program ?? null);
}

/* ======================
   POST – генерира + записва
   ====================== */
  export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const plan = generateProgram({
      goal: body.goal,
      level: body.level,
      daysPerWeek: Number(body.daysPerWeek),
      equipment: body.equipment,
    });

    await connectDB();

    const saved = await Program.findOneAndUpdate(
      { userId: session.user.id },
      {
        userId: session.user.id,
        goal: body.goal,
        level: body.level,
        daysPerWeek: Number(body.daysPerWeek),
        equipment: body.equipment,
        plan,
      },
      {
        upsert: true,   // ← АКО няма → създава
        new: true,      // ← връща новия документ
      }
    ).lean();

    return Response.json({
      _id: String(saved._id),
      plan: saved.plan,
    });
  } catch (err) {
    console.error("POST /api/program error:", err);
    return Response.json(
      { error: "Грешка при генериране." },
      { status: 500 }
    );
  }
}
