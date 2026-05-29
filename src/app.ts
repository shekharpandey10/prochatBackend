import 'dotenv/config'
import express, { type Express, type Request, type Response } from 'express';
import prisma from './postgress/prisma.ts';
import authRouter from './router/authRoute.ts'
import userRoute from './router/userRoute.ts'
import cookieParser from 'cookie-parser';
import cors from 'cors'
const app: Express = express()
const port = process.env.PORT || 3000

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use('/api', authRouter)
app.use('/api/user', userRoute)


app.listen(port, async () => {

  try {
    await prisma.$connect();
    console.log('Database connected successfully.');
    console.log(`Server running on port ${port}`);

  } catch (error) {
    console.error('Database connection failed:', error);
  }
});
