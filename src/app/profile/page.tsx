import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  return (
    <div style={{ padding: "24px" }}>
      <h1>Profile</h1>

      <p>
        <strong>Name:</strong> {session.user.name ?? "Not set"}
      </p>

      <p>
        <strong>Email:</strong> {session.user.email}
      </p>

      <p>
        <strong>User ID:</strong> {session.user.id}
      </p>
    </div>
  );
}
