import fs from 'fs/promises'
import mammoth from 'mammoth'

/**
 * Trích xuất text từ file
 * @param {string} filePath - Đường dẫn đến file
 * @param {string} fileExtension - Phần mở rộng của file (.pdf, .docx, v.v.)
 * @returns {Promise<string>} - Nội dung văn bản
 */
const extractText = async (filePath, fileExtension) => {
  // console.log(`[TextExtractor] Attempting to extract text from: ${filePath}, extension: ${fileExtension}`);
  try {
    const fileBuffer = await fs.readFile(filePath);
    // console.log(`[TextExtractor] Successfully read file into buffer. Size: ${fileBuffer.length} bytes.`);
    
    switch (fileExtension.toLowerCase()) {
      case '.pdf':
        // console.log('[TextExtractor] Processing PDF...');
        try {
          // Lazy-load pdf-parse để tránh lỗi khi khởi động
          const pdfParse = (await import('pdf-parse')).default;
          // console.log('[TextExtractor] pdf-parse imported. Parsing buffer...');
          const pdfData = await pdfParse(fileBuffer);
          console.log(`[TextExtractor] PDF parsed successfully. Extracted text length: ${pdfData.text?.length || 0}. Number of pages: ${pdfData.numpages}.`);
          return pdfData.text;
        } catch (pdfError) {
          // console.error(`[TextExtractor] Error parsing PDF file: ${filePath}`);
          // console.error('[TextExtractor] PDF Parsing Error Object:', pdfError); 
          // console.error('[TextExtractor] PDF Parsing Error Message:', pdfError.message);
          // if (pdfError.stack) {
          //   console.error('[TextExtractor] PDF Parsing Error Stack:', pdfError.stack);
          // }
          throw new Error(`Không thể phân tích file PDF "${filePath}": ${pdfError.message}`);
        }
        
      case '.docx':
        // console.log('[TextExtractor] Processing DOCX...');
        const docxResult = await mammoth.extractRawText({ buffer: fileBuffer });
        console.log(`[TextExtractor] DOCX parsed successfully. Extracted text length: ${docxResult.value?.length || 0}.`);
        return docxResult.value;
        
      case '.txt':
        // console.log('[TextExtractor] Processing TXT...');
        const txtContent = fileBuffer.toString('utf-8');
        console.log(`[TextExtractor] TXT parsed successfully. Extracted text length: ${txtContent.length}.`);
        return txtContent;
        
      default:
        // console.warn(`[TextExtractor] Unsupported file type for extraction: ${fileExtension} at path ${filePath}`);
        throw new Error(`Không hỗ trợ trích xuất text từ file ${fileExtension}`);
    }
  } catch (error) {
    // console.error(`[TextExtractor] General error during text extraction for file: ${filePath}, extension: ${fileExtension}`);
    // console.error('[TextExtractor] General Error Object:', error); 
    // console.error('[TextExtractor] General Error Message:', error.message);
    // if (error.stack) {
    //   console.error('[TextExtractor] General Error Stack:', error.stack);
    // }
    throw error; 
  }
}

export default extractText