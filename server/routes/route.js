const express=require('express')
const router=express.Router()
const {registerUser,loginUser, verifyUser, logoutUser}=require('../controllers/userController')
const authenticate=require('../middleware/authenticate')
const {createCheckOutSession,verifySession,activateFreePlan,cancelSubscription}=require('../controllers/paymentController')


router.post('/register',registerUser)
router.post('/login',loginUser)
router.post('/logout',authenticate,logoutUser)
router.get('/verify',verifyUser)
router.post('/subscribe',authenticate,createCheckOutSession)
router.post('/payment/verify-session',authenticate,verifySession)
router.post('/activate-free',authenticate,activateFreePlan)
router.get('/cancel',authenticate,cancelSubscription)
module.exports=router