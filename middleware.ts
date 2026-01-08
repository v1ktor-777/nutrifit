import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware() {
    // тук не ти трябва нищо — withAuth пази маршрутите
  },
  {
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/food/:path*", "/program/:path*", "/progress/:path*"],
};
