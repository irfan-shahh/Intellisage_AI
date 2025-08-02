const express=require('express')
const router=express.Router()
const {chatAI,summarizeAI}=require('../controllers/aiController')
const authenticate=require('../middleware/authenticate')
const checkAndUpdateUsage=require('../middleware/usageCheck')
const {getUsage}=require('../controllers/userController')
const checkFileSize=require('../middleware/checkFileSize')

const multer=require('multer')
const storage=multer.memoryStorage()
const upload =multer({
    storage:storage,
    fileFilter:function(req,file,cb){
        cb(null,true)
    }

})

router.post('/chat',authenticate,checkAndUpdateUsage,chatAI)
router.post('/summarize',authenticate, checkAndUpdateUsage, upload.single('file'), checkFileSize,summarizeAI)
router.get('/usage',authenticate,checkAndUpdateUsage, getUsage)


module.exports=router