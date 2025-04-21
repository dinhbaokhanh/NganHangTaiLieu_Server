import Document from '../models/Document.js'
import { ErrorHandler, TryCatch } from '../utils/error.js'
import { bucket } from '../helper/firebase.js'

const allowedMimeTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const uploadDocument = TryCatch(async (req, res, next) => {
  const {
    title,
    category,
    major,
    author,
    publishedYear,
    description,
    thumbnail,
  } = req.body
  const file = req.file

  if (!file) return next(new ErrorHandler('Please upload a document file', 400))

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return next(new ErrorHandler('Invalid file type', 400))
  }

  if (
    !title ||
    !category ||
    !major ||
    !author ||
    !publishedYear ||
    !description
  ) {
    return next(new ErrorHandler('Missing required fields', 400))
  }

  const fileUpload = bucket.file(`documents/${Date.now()}-${file.originalname}`)

  await fileUpload.save(file.buffer, {
    contentType: file.mimetype,
    public: true,
  })

  const fileUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`

  const newDocument = new Document({
    title,
    category,
    saved: false,
    thumbnail,
    major,
    author,
    publishedYear,
    description,
    fileUrl,
  })

  await newDocument.save()

  res.status(201).json({
    success: true,
    message: 'Document uploaded successfully',
    document: newDocument,
  })
})

const getAllDocuments = TryCatch(async (req, res, next) => {
  const documents = await Document.find().sort({ createdAt: -1 }) // mới nhất trước

  res.status(200).json({
    success: true,
    count: documents.length,
    documents,
  })
})

const updateDocument = TryCatch(async (req, res, next) => {
  const { id } = req.params
  const {
    title,
    category,
    major,
    author,
    publishedYear,
    description,
    thumbnail,
  } = req.body

  const document = await Document.findById(id)
  if (!document) return next(new ErrorHandler('Document not found', 404))

  document.title = title || document.title
  document.category = category || document.category
  document.major = major || document.major
  document.author = author || document.author
  document.publishedYear = publishedYear || document.publishedYear
  document.description = description || document.description
  document.thumbnail = thumbnail || document.thumbnail

  await document.save()

  res.status(200).json({
    success: true,
    message: 'Document updated successfully',
    document,
  })
})

const replaceDocument = TryCatch(async (req, res, next) => {
  const { id } = req.params
  const file = req.file

  if (!file)
    return next(new ErrorHandler('Please upload a new document file', 400))

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return next(new ErrorHandler('Invalid file type', 400))
  }

  const document = await Document.findById(id)
  if (!document) return next(new ErrorHandler('Document not found', 404))

  try {
    const fileName = new URL(document.fileUrl).pathname.split('/').pop()
    const fileToDelete = bucket.file(`documents/${fileName}`)

    const [exists] = await fileToDelete.exists()
    if (exists) await fileToDelete.delete()
  } catch (err) {
    console.error('Error deleting old file:', err.message)
  }

  const fileUpload = bucket.file(`documents/${Date.now()}-${file.originalname}`)
  await fileUpload.save(file.buffer, {
    contentType: file.mimetype,
    public: true,
  })

  const fileUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`
  document.fileUrl = fileUrl

  await document.save()

  res.status(200).json({
    success: true,
    message: 'Document replaced successfully',
    document,
  })
})

const deleteDocument = TryCatch(async (req, res, next) => {
  const { id } = req.params

  const document = await Document.findById(id)
  if (!document) return next(new ErrorHandler('Document not found', 404))

  try {
    const fileName = new URL(document.fileUrl).pathname.split('/').pop()
    const fileToDelete = bucket.file(`documents/${fileName}`)

    const [exists] = await fileToDelete.exists()
    if (exists) await fileToDelete.delete()
  } catch (err) {
    console.error('Error deleting file:', err.message)
  }

  await document.remove()

  res.status(200).json({
    success: true,
    message: 'Document deleted successfully',
  })
})

export {
  uploadDocument,
  getAllDocuments,
  updateDocument,
  replaceDocument,
  deleteDocument,
}
