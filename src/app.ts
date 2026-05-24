import 'dotenv/config'
import express, {type Express,  type Request, type Response } from 'express';
import prisma from './postgress/prisma.js';
const app:Express=express()
const port=process.env.PORT||3000

app.use(express.json())
app.use(express.urlencoded({extended:true}))


app.listen(port, async () => {
  
  try {
    // await prisma.$connect();
    console.log('Database connected successfully.');
      console.log(`Server running on port ${port}`);

  } catch (error) {
    console.error('Database connection failed:', error);
  }
});
