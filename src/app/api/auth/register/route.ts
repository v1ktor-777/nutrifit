import { connectDB } from "@/lib/db/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  await connectDB();

  const existing = await User.findOne({ email });
  if (existing) {
    return Response.json({ message: "User exists" }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    password: hashedPassword,
  });

  return Response.json({ message: "User created" }, { status: 201 });
}
