import type { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.ts";
import { verifyToken } from "../utils/genToken.ts";
import type { TokanPayload } from "../types/auth.types.ts";

const ACCESSTOKEN_SECRET = process.env.JWT_SECRET;

interface AuthenticatedRequest extends Request {
    user?: any;
}

export const authHandler = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const accessToken = req.cookies?.accessToken;


        if (!accessToken) {
            res.status(401);
            throw new Error("Unauthorized: Access token missing from cookies");
        }


        if (!ACCESSTOKEN_SECRET) {
            res.status(500);
            throw new Error("Server Error: JWT secret missing on server configuration");
        }

        try {
            const decoded = verifyToken({ token: accessToken, secret: ACCESSTOKEN_SECRET }) as TokanPayload;

            if (!decoded) {
                res.status(401);
                throw new Error("Unauthorized: Invalid token");
            }

            req.user = {
                userId: decoded?.userId,
                email: decoded?.email // Fixed: Extracted directly from decoded token
            };

            next();
        } catch (error) {
            // Catch JWT expiration or signature tampering errors
            res.status(401);
            throw new Error("Unauthorized: Token expired or invalid");
        }
    }
);
