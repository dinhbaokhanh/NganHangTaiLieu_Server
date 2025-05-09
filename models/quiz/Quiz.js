import mongoose from 'mongoose'
import { questionSchema } from './Question.js'

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    questions: [questionSchema],
  },
  { timestamps: true }
)

const Quiz = mongoose.model('Quiz', quizSchema)
export default Quiz
