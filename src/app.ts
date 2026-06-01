import 'dotenv/config'
import express, { type Express, type Request, type Response } from 'express';
import prisma from './postgress/prisma.ts';
import authRouter from './router/authRoute.ts'
import userRoute from './router/userRoute.ts'
import chatRoute from './router/chatRouter.ts'
import cookieParser from 'cookie-parser';
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import socketAuth from './middleware/socketAuth.ts';
const app: Express = express()
const server = http.createServer(app)
const port = process.env.PORT || 3000
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173"

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use('/api', authRouter)
app.use('/api/user', userRoute)
app.use('/api/chat', chatRoute)

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    credentials: true
  }
})

io.use(socketAuth)

io.on('connection', (socket) => {
  console.log('socket connected ', socket.id),
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    })
})

server.listen(port, async () => {

  try {
    await prisma.$connect();
    console.log('Database connected successfully.');
    console.log(`Server running on port ${port}`);

  } catch (error) {
    console.error('Database connection failed:', error);
  }
});


