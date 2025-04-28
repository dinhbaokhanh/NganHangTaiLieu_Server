import mongoose from 'mongoose'

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    major: {
      type: String, // vẫn để major ở đây để biết môn này thuộc chuyên ngành nào
      required: true,
    },
  },
  { timestamps: true }
)

const Subject = mongoose.model('Subject', subjectSchema)

export default Subject
