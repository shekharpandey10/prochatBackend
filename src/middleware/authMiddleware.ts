import type { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.ts";
import { verifyToken } from "../utils/genToken.ts";

const REFRESH_TOKEN = process.env.REFRESH_TOKEN
const ACCESSTOKEN = process.env.JWT_SECRET

export const authHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const cookies = req.cookies;
    const authHeader =
        req.headers.authorization;

    if (
        !authHeader ||
        !authHeader.startsWith(
            "Bearer "
        )
    ) {
        throw new Error('Unauthorized')
    }
    const token =
        authHeader.split(" ")[1];

    if (!token) throw new Error('Unauthorized')

    if (!ACCESSTOKEN) {
        throw new Error(
            "JWT secret missing"
        );
    }

    const decoded = verifyToken({ token, secret: ACCESSTOKEN })
    if (!decoded) throw new Error('Unauthorized')
    console.log(decoded)
    next()
})