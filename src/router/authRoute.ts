import express, { type  Router , type Request,type Response} from "express";
import { authController } from "../controller/authController.js";
import { authHandler } from "../middleware/authMiddleware.ts";

const router:Router=express.Router()

router.get('/',(req:Request,res:Response)=>{
    res.status(200).json({
        message:'hello'
    })
})
router.post('/login',authController.loginUser)
router.post('/signup',authController.signUpUser)
router.put('/logout',authHandler,authController.logOut)

export default router