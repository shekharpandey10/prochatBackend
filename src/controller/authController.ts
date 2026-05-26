import { type Request, type Response } from "express"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js"
import prisma from "../postgress/prisma.ts"
import type { SignUpBody, TokanPayload } from "../types/auth.types.ts"
import { success } from "zod";
import { generateAccessToken, generateRefreshToken } from "../utils/genToken.ts";
export const authController = {
   loginUser: asyncHandler(async (req: Request, res: Response) => {
      const { email, password } = req.body
      if (!email || !password) throw new Error("Invalid credentails")

      const user = await prisma.user.findUnique({ where: { email: email } })
      if (!user) throw new Error('User not found. please create account')

      const pass = user.password;
      const isPassValid = await bcrypt.compare(password, pass)
      if (!isPassValid) {
         throw new Error("Invalid email or password");
      }

      const tokenPayload: TokanPayload = {
         email,
         userId: user.id
      }

      const accessToken =
         generateAccessToken(
            tokenPayload
         );

      const refreshToken =
         generateRefreshToken(
            tokenPayload
         );
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 15);

      await prisma.refreshToken.deleteMany({
         where: {
            userId: user.id,
            expiresAt: { lt: new Date() }
         }
      });

      await prisma.refreshToken.create(({
         data: {
            token: refreshToken,
            userId: user.id,
            expiresAt: expirationDate
         }
      }))

      res.cookie("refreshToken", refreshToken, {
         httpOnly: true, secure: process.env.NODE_ENV ===
            "production", sameSite: 'strict', maxAge:
            7 *
            24 *
            60 *
            60 *
            1000,

      })
      const { password: _, ...safeUser } = user

      return res.status(200).json({ success: true, data: safeUser, accessToken })
   }),
   signUpUser: asyncHandler(async (req: Request, res: Response) => {
      const { first_name, last_name, email, password }: SignUpBody = req.body

      const user = await prisma.user.findUnique({ where: { email: email } })
      if (user) res.status(400).json({ message: 'User already exists, please login.' })

      const hashedPassword = await bcrypt.hash(password, 5)

      await prisma.user.create({
         data: {
            email,
            first_name,
            last_name,
            password: hashedPassword
         }
      })

      res.status(200).json({
         success: false,
         message: "Account register successfully."
      })
   }),

   logOut: (req: Request, res: Response) => {
      res.status(200).json({
         success: true,
         message: "successfully logout."
      })
   },
   refresh: (req: Request, res: Response) => {

   }
}