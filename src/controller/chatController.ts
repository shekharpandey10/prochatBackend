
import type { Request, Response } from "express"
import { asyncHandler } from "../utils/asyncHandler.ts"
import prisma from "../postgress/prisma.ts";
import { success } from "zod";


interface MessageParams {
    id: string;
}

const chatController = {
    fetchConversation: asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.userId

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }


        const messages = await prisma.messages.findMany({
            where: {
                OR: [
                    {
                        senderId: userId
                    },
                    {
                        receiverId: userId
                    }
                ]
            }, include: {
                sender: true,

                receiver: true,
            },

            orderBy: {
                createdAt: 'desc'
            }

        })

        return res.status(200).json({
            success: true,
            data: messages
        })
    }),
    fetchUserList: asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.userId;
        const { page, limit } = req.query;


        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }


        const parsedPage = Number(page) || 1;
        const pageSize = Number(limit) || 10;

        const users = await prisma.user.findMany({
            skip: (parsedPage - 1) * pageSize,
            take: pageSize,
            orderBy: { createdAt: 'desc' },
            where: {
                id: {
                    not: userId
                }
            },
            select: { id: true, first_name: true, last_name: true, }
        });

        let totalCount = 0;
        if (parsedPage === 1) {
            totalCount = await prisma.user.count();
        }


        return res.status(200).json({
            success: true,
            data: users,
            pagination: {
                page: parsedPage,
                limit: pageSize,
                total: totalCount,
                totalPages: Math.ceil(
                    totalCount / pageSize
                ),
            }
        })
    }),
    fetchChatById: asyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id as string

        const userId = req.user?.userId as string | undefined;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            })
        }
        if (!id) {
            return res.status(401).json({
                success: false,
                message: "Invalid discover id"
            })
        }


        const chatUser = await prisma.user.findUnique({
            where: {
                id
            },
            select: {
                id: true,
                first_name: true,
                last_name: true
            }
        })

        if (!chatUser) {
            return res.status(404).json({
                success: false,

                message:
                    "User not found",
            });
        }


        const messages = await prisma.messages.findMany({
            where: {
                OR: [{
                    senderId: userId,
                    receiverId: id
                },
                {
                    senderId: id,

                    receiverId: userId,
                }]
            },
            orderBy: {
                createdAt: 'desc'
            }
        })


        return res.status(200).json({
            success: true,
            isNew: messages.length > 0 ? false : true,
            data: { chatUser, messages },

        })



    }),
    fetchConversationUserList: asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.userId as string | undefined;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            })
        }

        const userList = await prisma.messages.findMany({
            where: {

                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ]

            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        email: true
                    },

                },
                receiver: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        email: true
                    }
                },
            }
        })

        return res.status(200).json({
            status: true,
            data: userList
        })
    })
}


export default chatController