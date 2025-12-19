import express from 'express'
import authenticate from '../middleware/authenticate'
import checkAndUpdateUsage from '../middleware/usageCheck'
import { getUsage } from '../controllers/userController'
import { chatAI,summarizeAI} from '../controllers/aiController'
import multer from 'multer'

const router = express.Router()

const storage = multer.memoryStorage()
const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    cb(null, true)
  }
})
router.post('/chat',authenticate,checkAndUpdateUsage,chatAI)
router.post('/summarize',authenticate, checkAndUpdateUsage, upload.single('file'),summarizeAI)
router.get('/usage',authenticate,checkAndUpdateUsage, getUsage)



export default router