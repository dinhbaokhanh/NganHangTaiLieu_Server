import { ErrorHandler, TryCatch } from '../../utils/error.js'
import Document from '../../models/document/Document.js'
import extractText from '../../utils/textExtractor.js'
import generateSummary from '../../utils/aiSummary.js'
import { bucket } from '../../helper/firebase.js'
import path from 'path'
import os from 'os'
import fs from 'fs/promises'

const createDocumentSummary = TryCatch(async (req, res, next) => {
  // console.log('[BE Controller] createDocumentSummary called.');
  // console.log('[BE Controller] Request Params:', req.params);
  // console.log('[BE Controller] Request Body:', req.body);

  const { documentId } = req.params
  const { modelName = 'google/gemini-2.0-flash-exp:free' } = req.body
  
  const document = await Document.findById(documentId)
  if (!document) {
    // console.log(`[BE Controller] Document not found for ID: ${documentId}`);
    return next(new ErrorHandler('Không tìm thấy tài liệu', 404))
  }
  
  const fileUrl = document.fileUrl
  // console.log(`[BE Controller] Document fileUrl from DB: ${fileUrl}`);

  const urlPathname = new URL(fileUrl).pathname;
  // console.log(`[BE Controller] URL Pathname: ${urlPathname}`);

  const decodedUrlPathname = decodeURIComponent(urlPathname);
  // console.log(`[BE Controller] Decoded URL Pathname: ${decodedUrlPathname}`);

  const documentsDirIdentifier = '/documents/';
  const documentsDirIndex = decodedUrlPathname.indexOf(documentsDirIdentifier);

  let firebasePath;
  if (documentsDirIndex !== -1) {
    firebasePath = decodedUrlPathname.substring(documentsDirIndex + 1);
  } else {
    // console.error(`[BE Controller] Critical error: '${documentsDirIdentifier}' not found in decoded path: ${decodedUrlPathname}`);
    return next(new ErrorHandler('Lỗi xử lý đường dẫn file, không tìm thấy thư mục documents', 500));
  }
  // console.log(`[BE Controller] Firebase path (inside bucket): ${firebasePath}`);

  const fileRef = bucket.file(firebasePath);
  // console.log(`[BE Controller] Attempting to access Firebase path: ${fileRef.name}`);
  
  const fileName = firebasePath.substring(firebasePath.lastIndexOf('/') + 1);
  // console.log(`[BE Controller] Final fileName for temp/extension: ${fileName}`);

  const fileExtension = path.extname(fileName)
  
  const tempFilePath = path.join(os.tmpdir(), fileName)
  
  try {
    await fs.mkdir(path.dirname(tempFilePath), { recursive: true })
    
    // console.log(`[BE Controller] Checking existence for: ${fileRef.name}`); 
    const [exists] = await fileRef.exists()
    // console.log(`[BE Controller] File exists in Firebase: ${exists}`); 
    
    if (!exists) {
      return next(new ErrorHandler('File không tồn tại trên hệ thống', 404))
    }
    
    await fileRef.download({ destination: tempFilePath })
    
    const textContent = await extractText(tempFilePath, fileExtension)
    
    await fs.unlink(tempFilePath)
    
    if (!textContent || textContent.trim().length === 0) {
      return next(new ErrorHandler('Không thể trích xuất nội dung từ tài liệu', 400))
    }
    
    const maxChars = 100000
    const truncatedContent = textContent.length > maxChars 
      ? textContent.substring(0, maxChars) + "..." 
      : textContent
    
    // console.log('[BE Controller] Calling AI for summary with model:', modelName);
    const result = await generateSummary(truncatedContent, modelName)
    console.log('[BE Controller] AI Summary result:', result);
    
    res.status(200).json({
      success: true,
      summary: result.summary,
      keywords: result.keywords,
      model: result.model,
      documentTitle: document.title
    })
  } catch (error) {
    // console.error("[BE Controller] Error in createDocumentSummary:", error);
    // console.error("[BE Controller] Error message:", error.message);
    // console.error("[BE Controller] Error stack:", error.stack);
    // Đảm bảo xóa file tạm nếu có lỗi
    try {
      await fs.unlink(tempFilePath)
    } catch (unlinkError) {
      // Bỏ qua lỗi xóa file
    }
    return next(new ErrorHandler('Lỗi khi xử lý tài liệu: ' + error.message, 500))
  }
})

export { createDocumentSummary }