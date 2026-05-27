import 'dotenv/config'
import jwt from "jsonwebtoken";
import type { TokanPayload } from "../types/auth.types.ts";
console.log("Loaded Secret Check:", process.env.JWT_SECRET);
export function generateAccessToken(
  payload: TokanPayload
) {
  console.log(process.env.JWT_SECRET, 'fjldsf')
  if (!process.env.JWT_SECRET) {
    throw new Error(
      "JWT secret missing"
    );
  }

  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    {
      expiresIn: "15m",
    }
  );
}
export function generateRefreshToken(
  payload: TokanPayload
) {

  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error(
      "JWT secret missing"
    );
  }

  return jwt.sign(
    payload,
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "15d",
    }
  );
}


export function verifyToken({ token, secret }: { token: string, secret: string }) {
  try {
    const decodedVal = jwt.verify(token, secret)
    return decodedVal
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) throw new Error('Token expired.')
    return null
  }
}