import { Server } from 'socket.io'
import socketAuth from '../middleware/socketAuth.ts';
import { onlineUsers } from './onlineUsers.ts';
import prisma from '../postgress/prisma.ts';




export const initSocket = (io: Server) => {
    io.use(socketAuth)
    io.on('connection', (socket) => {
        const userId = socket.user?.userId as string;
        onlineUsers.set(userId, socket.id)
        console.log(onlineUsers)


        //send message

        socket.on('send_message', async (payload) => {
            try {
                console.log(payload)
                const newMessage = await prisma.messages.create({
                    data: {
                        content: payload.messageText,
                        senderId: userId,
                        receiverId: payload.roomId
                    }
                })

                const receiverId = onlineUsers.get(payload.roomId);
                if (receiverId) {
                    io.to(receiverId).emit('receive_message', newMessage)
                }

                socket.emit('message_sent', newMessage)
            } catch (error) {
                socket.emit('error', { message: 'Failed to send message.' });
            }
        })

        socket.on('disconnect', () => {

        })
    })
}