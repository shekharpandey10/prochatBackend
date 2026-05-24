import type { Request,Response,NextFunction } from "express";



type asyncHandler=(req:Request,res:Response,next:NextFunction)=>Promise<unknown>

export const asyncHandler=(fn:asyncHandler)=>{
    return (req:Request,res:Response,next:NextFunction):void=>{
        Promise.resolve(fn(req,res,next)).catch(next)
    }
}