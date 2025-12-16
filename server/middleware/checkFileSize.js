const checkFileSize=(req,res,next)=>{
    const user=req.user;
    const file=req.file
    if(!file){
        return next()
    }
   const fileSizeInMb=file.size/(1024*1024)
    if( user.plan==='free' && fileSizeInMb>2){
        return  res.status(413).json({ message: 'Free plan allows max 2MB file uploads.' })
    }
    if ((user.plan === 'pro' || user.plan === 'premium') && fileSizeInMb > 10) {
    return res.status(413).json({ message: 'Max file size for your plan is 10MB.' })
  }
  next()
}

module.exports=checkFileSize