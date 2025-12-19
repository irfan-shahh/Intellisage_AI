import { fromBuffer } from 'pdf2pic'
import Tesseract from 'tesseract.js'
import fs from 'fs-extra'
import path from 'path'

const MAX_OCR_PAGES = 3
export const ocrPdf= async(pdfBuffer:Buffer):Promise<string>=>{
const outputDir=path.join(__dirname,'../../tmp/ocr')
await fs.ensureDir(outputDir)

const converter =  fromBuffer(pdfBuffer,{
    density:200,
    saveFilename:'page',
    savePath:outputDir,
    format:'png'
})
let extractedTexT=''
for(let i=1;i<=MAX_OCR_PAGES;i++){
    try {
         const image=await converter(i)
         const result=await Tesseract.recognize(image.path,'eng')
         const text=result.data.text;
         extractedTexT +='\n'+text
         if (!extractedTexT || extractedTexT.trim().length < 30) {
    throw new Error("OCR_FAILED_EMPTY_TEXT");
  }
         console.log("OCR text length:", extractedTexT.length);
    } catch (error) {
        break;
    }
}
await fs.remove(outputDir)
return extractedTexT;
}