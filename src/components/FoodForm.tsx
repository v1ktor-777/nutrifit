import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db/mongodb";
import Food from "@/models/Food";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { calories } = await req.json();
  if (!calories) {
    return Response.json({ error: "Calories required" }, { status: 400 });
  }

  await connectDB();

  const food = await Food.create({
    userId: session.user.id,
    date: new Date(),
    calories,
  });

  return Response.json(food);
}
