import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET ?? "norep_fallback_secret";

export interface JWTPayload {
  userId: string;
  username: string;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function getTokenFromHeader(
  authorization: string | null | undefined
): string | null {
  if (!authorization) return null;
  const parts = authorization.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;
  return parts[1];
}
