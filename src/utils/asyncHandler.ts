import type {
    Request,
    Response,
    NextFunction
} from "express";

type asyncHandlerType = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<unknown>;

export const asyncHandler = (
    fn: asyncHandlerType
) => {

    return async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {

        try {

            await fn(req, res, next);

        } catch (error: any) {

            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });

        }

    };

};