import axios from 'axios'
import { ErrorHandler, TryCatch } from '../utils/error.js'

const chatReply = TryCatch(async (req, res, next) => {
  const { message } = req.body

  if (!message || typeof message !== 'string') {
    return next(new ErrorHandler('Invalid input message', 400))
  }

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [{ role: 'user', content: message }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const reply = response.data.choices[0].message.content
    res.status(200).json({ reply })
  } catch (err) {
    console.error('[OpenRouter Error]', err.response?.data || err.message)
    return next(new ErrorHandler('Không thể lấy phản hồi từ AI', 500))
  }
})

export { chatReply }
