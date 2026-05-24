import {type Request, type Response } from "express"
import { asyncHandler } from "../utils/asyncHandler.js"
export const authController={
   loginUser:asyncHandler(async(req:Request,res:Response)=>{
    const {email,password}=req.body
    if(!email || !password) throw new Error("Invalid credentails")


    return res.status(200).json({message:'jfsj'})
   }),
   signUpUser:()=>{

   }
}