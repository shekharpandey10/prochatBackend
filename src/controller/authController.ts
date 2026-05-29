import { type Request, type Response } from "express"
import bcrypt from "bcrypt";
import { asyncHandler } from "../utils/asyncHandler.js"
import prisma from "../postgress/prisma.ts"
import type { SignUpBody, TokanPayload } from "../types/auth.types.ts"
import { generateAccessToken, generateRefreshToken, verifyToken } from "../utils/genToken.ts";
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
         }
      });

      await prisma.refreshToken.create(({
         data: {
            token: refreshToken,
            userId: user.id,
            expiresAt: expirationDate
         }
      }))



      // 2. Long-lived Refresh Token Cookie (15 Days)
      res.cookie("refreshToken", refreshToken, {
         httpOnly: true,
         secure: process.env.NODE_ENV === "production",
         sameSite: "strict",
         maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days in milliseconds
         path: "/api/auth/refresh",       // Only sent to your refresh route!
      });

      const { password: _, updatedAt: _updatedAt, ...safeUser } = user

      return res.status(200).json({ success: true, data: { ...safeUser, message: "Welcome again!" }, accessToken })
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

   logOut: asyncHandler(async (req: Request, res: Response) => {

      const userId = req.user?.userId;
      if (!userId) {
         res.status(401);
         throw new Error("Unauthorized: Invalid user context");
      }

      const user = await prisma.user.findUnique({
         where: {
            id: userId
         }
      });

      if (!user) {
         res.status(401);
         throw new Error("Unauthorized: Invalid user context");
      }

      await prisma.refreshToken.deleteMany({
         where: {
            userId: userId
         }
      });

      res.clearCookie('accessToken', {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         sameSite: "strict",
         path: '/'
      })
      res.clearCookie('refreshToken', {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         sameSite: "strict",
         path: "/api/auth/refresh",
      })

      res.status(200).json({
         success: true,
         message: "successfully logout."
      })
   }),
   refresh: asyncHandler(async (req: Request, res: Response) => {
      const refreshToken = req.cookies?.refreshToken as string | undefined

      if (!refreshToken) {
         res.status(401)
         throw new Error("Unauthorized: Missing refresh token")
      }

      const refreshSecret = process.env.REFRESH_TOKEN_SECRET
      if (!refreshSecret) {
         res.status(500)
         throw new Error("Server Error: refresh token secret missing")
      }

      const decoded = verifyToken({ token: refreshToken, secret: refreshSecret })

      if (!decoded || typeof decoded === "string" || !decoded.userId) {
         res.status(401)
         throw new Error("Unauthorized: Invalid refresh token")
      }

      const storedToken = await prisma.refreshToken.findUnique({
         where: { token: refreshToken },
      })

      if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
         res.status(401)
         throw new Error("Unauthorized: Refresh token revoked or expired")
      }

      const accessToken = generateAccessToken({
         email: decoded.email,
         userId: decoded.userId,
      })

      return res.status(200).json({
         success: true,
         accessToken,
      })
   })
}