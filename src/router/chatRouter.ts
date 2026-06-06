import express, { Router } from 'express'
import { authHandler } from '../middleware/authMiddleware.ts'
import chatController from '../controller/chatController.ts'

const router: Router = express.Router()



router.get('/conversation', authHandler, chatController.fetchConversation)
router.get('/conversation/userList', authHandler, chatController.fetchConversationUserList)
router.get('/discovery', authHandler, chatController.fetchUserList)
router.get('/discovery/:id', authHandler, chatController.fetchChatById)


export default router