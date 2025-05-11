import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()

/**
 * Sử dụng OpenRouter với Gemini 2.5 Pro để tóm tắt nội dung
 * @param {string} text - Nội dung cần tóm tắt
 * @param {string} modelName - Tên model AI muốn sử dụng
 * @param {number} maxLength - Độ dài tối đa của bản tóm tắt (tính bằng từ)
 * @returns {Promise<{summary: string, keywords: string[], model: string}>}
 */
const generateSummary = async (text, modelName = 'google/gemini-2.0-flash-exp:free', maxLength = 200) => {
  try {
    const prompt = `
    Tóm tắt nội dung sau đây trong khoảng ${maxLength} từ, giữ lại những thông tin quan trọng nhất:
    
    ${text}
    
    Hãy trả về kết quả theo định dạng JSON với cấu trúc:
    {
      "summary": "Nội dung tóm tắt ở đây",
      "keywords": ["từ khóa 1", "từ khóa 2", "từ khóa 3", "từ khóa 4", "từ khóa 5"]
    }
    `;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: modelName,
        messages: [
          {
            role: "system",
            content: "Bạn là một trợ lý AI chuyên tóm tắt tài liệu học thuật một cách chính xác và súc tích."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 7000,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:3000',
          'X-Title': 'Document Summarizer'
        }
      }
    );

    let result;
    try {
      let rawContent = response.data.choices[0].message.content;
      
      if (rawContent.startsWith("```json")) {
        const firstNewlineIndex = rawContent.indexOf('\n');
        if (firstNewlineIndex > -1 && firstNewlineIndex < 10) {
            rawContent = rawContent.substring(firstNewlineIndex + 1);
        } else {
            rawContent = rawContent.substring(7);
        }
        
        if (rawContent.endsWith("```")) {
          rawContent = rawContent.substring(0, rawContent.length - 3);
        }
      }
      rawContent = rawContent.trim();

      result = JSON.parse(rawContent);
    } catch (jsonError) {
      console.error("Error parsing JSON response:", jsonError);
      console.error("Original AI response content for debugging:", response.data.choices[0].message.content);
      const originalContent = response.data.choices[0].message.content;
      result = {
        summary: originalContent.substring(0, 15000), 
        keywords: ["tài liệu", "nội dung", "thông tin"] 
      };
    }
    
    return {
      summary: result.summary || "Không thể tạo tóm tắt",
      keywords: Array.isArray(result.keywords) ? result.keywords : ["không có từ khóa"],
      model: modelName
    };
  } catch (error) {
    console.error("Error generating summary:", error.response?.data || error.message);
    throw new Error("Không thể tạo tóm tắt: " + (error.response?.data?.error?.message || error.message));
  }
}

export default generateSummary