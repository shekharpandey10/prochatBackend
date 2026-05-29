
import express, { type Router } from "express";
import { authHandler } from "../middleware/authMiddleware.ts";
import userController from "../controller/userController.ts";

const router = express.Router()

router.get('/me', authHandler, userController.getme)
router.get('/search', authHandler, userController.searchUser)
router.get('/search/:id', authHandler, userController.SearchbyId)
router.patch('/profile', authHandler, userController.updateProfile)

export default router