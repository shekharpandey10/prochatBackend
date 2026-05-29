import type { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.ts";
import { verifyToken } from "../utils/genToken.ts";
import type { TokanPayload } from "../types/auth.types.ts";

const ACCESSTOKEN_SECRET = process.env.JWT_SECRET;

interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        email: string;
    };
}

export const authHandler = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const rawHeader = req.headers['authorization'] || req.headers['Authorization'];

        if (!rawHeader || typeof rawHeader !== 'string' || !rawHeader.startsWith('Bearer ')) {
            res.status(401);
            throw new Error("Access Denied: No token provided or invalid format");
        }

        const accessToken = rawHeader.split(' ')[1];

        if (!accessToken) {
            res.status(401);
            throw new Error("Unauthorized: Access token missing from headers");
        }

        if (!ACCESSTOKEN_SECRET) {
            res.status(500);
            throw new Error("Server Error: JWT secret configuration missing on server");
        }

        try {
            const decoded = verifyToken({
                token: accessToken,
                secret: ACCESSTOKEN_SECRET
            }) as TokanPayload;

            if (!decoded || !decoded.userId || !decoded.email) {
                res.status(401);
                return next(new Error("Unauthorized: Invalid token payload"));
            }

            req.user = {
                userId: decoded.userId,
                email: decoded.email
            };

            next();
        } catch (error) {
            res.status(401);
            next(new Error("Unauthorized: Token expired or invalid"));
        }
    }
);

