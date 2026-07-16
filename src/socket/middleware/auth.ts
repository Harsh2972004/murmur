// src/socket/middleware/auth.ts
import { Socket } from "socket.io";
import { getToken } from "next-auth/jwt";

const parseCookieHeader = (cookieHeader: string | undefined) => {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;

  for (const cookie of cookieHeader.split(";")) {
    const [key, ...rest] = cookie.split("=");
    const name = key?.trim();
    if (!name) continue;
    cookies[name] = decodeURIComponent(rest.join("=").trim());
  }

  return cookies;
};

export const authMiddleware = async (
  socket: Socket,
  next: (err?: Error) => void,
) => {
  try {
    const req = socket.request as any;
    const cookieHeader = req.headers?.cookie || socket.handshake.headers.cookie;
    req.cookies = req.cookies ?? parseCookieHeader(cookieHeader);

    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production",
    });

    if (!token) {
      console.error("Socket auth failed: token is null", {
        cookieHeader,
        parsedCookies: req.cookies,
      });
      return next(new Error("Unauthorized"));
    }

    socket.data.userId = token._id ?? token.sub;

    console.log("Authenticated user:", socket.data.userId);

    next();
  } catch (error) {
    console.error("Socket auth error:", error);
    next(new Error("Unauthorized"));
  }
};
