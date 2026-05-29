import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.ts";
import { success } from "zod";
import prisma from "../postgress/prisma.ts";
import type { TokanPayload } from "../types/auth.types.ts";


const userController = {
    getme: asyncHandler(async (req: Request, res: Response) => {
        const user = req.user

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }


        const { userId } = user;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "can't resolve userId"
            })
        }


        const userRes = await prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                id: true,
                first_name: true,
                email: true,
                last_name: true,
                bio: true,
            }
        })

        return res.status(200).json({
            success: true,
            data: userRes,
            message: "user resolved successfully"
        })
    }),
    searchUser: asyncHandler(async (req: Request, res: Response) => {
        const user = req.user

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }


        const { userId } = user;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "can't resolve userId"
            })
        }

        const { name } = req.query
        if (!name || typeof name !== 'string') {
            return res.status(401).json({
                success: false,
                message: "no search found"
            })
        }

        const users = await prisma.user.findMany({
            where: {
                first_name: {
                    contains: name,
                    mode: "insensitive",
                },
                last_name: {
                    contains: name,
                    mode: 'insensitive'
                },
                email: {
                    contains: name,
                    mode: 'insensitive'
                },
                NOT: {
                    id: userId
                }
            },
            take: 10,
            select: {
                id: true,
                first_name: true,
                last_name: true
            }

        })

        return res.status(200).json({
            success: true,
            data: users,
            message: "Users found successfully"
        })
    }),
    SearchbyId: asyncHandler(async (req: Request, res: Response) => {
        const user = req.user

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }


        const { userId } = user;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "can't resolve userId"
            })
        }

        const searchId = req.params.id

        if (typeof searchId !== 'string' || !searchId.trim()) {
            return res.status(401).json({
                success: false,
                message: "Invalid searchId"
            })
        }

        const userRes = await prisma.user.findUnique({
            where: {
                id: searchId
            },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                bio: true,

            }
        })
        if (!userRes) {
            return res.status(404).json({
                success: false,
            });
        }

        res.json({
            success: true,
            data: userRes,
        });
    }),
    updateProfile: asyncHandler(async (req: Request, res: Response) => {
        const user = req.user

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }


        const { userId } = user;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "can't resolve userId"
            })
        }

        const u = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!u) {
            return res.status(400).json({ success: false, message: "Invalid user, please try again", })
        }

        const { first_name, last_name, bio } = req.body


        const updatedUser =
            await prisma.user.update({
                where: {
                    id: userId,
                },

                data: {
                    first_name,
                    last_name,
                    bio,
                },
            });
        return res.status(200).json({
            success: true,
            message: "user profile updated",
            data: updatedUser
        })

    })

}

export default userController