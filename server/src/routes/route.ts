import express from 'express'
import { registerUser,loginUser,verifyUser,logoutUser, getHistory } from '../controllers/userController'
import authenticate from '../middleware/authenticate'
import { createCheckOutSession,verifySession,activateFreePlan,cancelSubscription } from '../controllers/paymentController'
const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/logout', authenticate, logoutUser)
router.get('/verify', verifyUser)
router.post('/subscribe', authenticate, createCheckOutSession)
router.post('/payment/verify-session', authenticate, verifySession)
router.post('/activate-free', authenticate, activateFreePlan)
router.get('/cancel', authenticate, cancelSubscription)
router.get('/history',authenticate,getHistory)

export default router
