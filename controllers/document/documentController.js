// controllers/documentController.js

import Document from '../../models/document/Document.js'
import { ErrorHandler, TryCatch } from '../../utils/error.js'
import { bucket } from '../../helper/firebase.js'

const allowedMimeTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

// Upload tài liệu mới
const uploadDocument = TryCatch(async (req, res, next) => {
  const { title, type, subject, author, publishedYear, description } = req.body
  const file = req.file

  if (!file) throw new ErrorHandler('Vui lòng tải lên một tài liệu', 400)

  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new ErrorHandler('Loại tệp không hợp lệ', 400)
  }

  if (
    !title ||
    !type ||
    !subject ||
    !author ||
    !publishedYear ||
    !description
  ) {
    throw new ErrorHandler('Thiếu trường thông tin', 400)
  }

  const fileUpload = bucket.file(`documents/${Date.now()}-${file.originalname}`)
  await fileUpload.save(file.buffer, {
    contentType: file.mimetype,
    public: true,
  })

  const fileUrl = `https://storage.googleapis.com/${
    bucket.name
  }/${encodeURIComponent(fileUpload.name)}`

  const newDocument = await Document.create({
    title,
    type,
    subject,
    author,
    publishedYear,
    description,
    fileUrl,
  })

  res.status(201).json({
    success: true,
    message: 'Tải tài liệu lên thành công',
    document: newDocument,
  })
})

// Lấy tất cả tài liệu (populate subject)
const getAllDocuments = TryCatch(async (req, res, next) => {
  const documents = await Document.find()
    .populate('subject', 'name major') // <-- chỉ lấy trường name của subject
    .sort({ createdAt: -1 })

  res.status(200).json({
    success: true,
    count: documents.length,
    documents,
  })
})

// Update metadata (không thay file)
const updateDocument = TryCatch(async (req, res, next) => {
  const { id } = req.params
  const { title, type, subject, author, publishedYear, description } = req.body

  const document = await Document.findById(id)
  if (!document) throw new ErrorHandler('Không tìm thấy tài liệu', 404)

  document.title = title ?? document.title
  document.type = type ?? document.type
  document.subject = subject ?? document.subject
  document.author = author ?? document.author
  document.publishedYear = publishedYear ?? document.publishedYear
  document.description = description ?? document.description

  await document.save()

  res.status(200).json({
    success: true,
    message: 'Cập nhật thông tin tài liệu thành công',
    document,
  })
})

// Thay thế file (không update metadata)
const replaceDocument = TryCatch(async (req, res, next) => {
  const { id } = req.params
  const file = req.file

  if (!file) throw new ErrorHandler('Vui lòng tải lên một tài liệu mới', 400)

  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new ErrorHandler('Loại tệp không hợp lệ', 400)
  }

  const document = await Document.findById(id)
  if (!document) throw new ErrorHandler('Không tìm thấy tài liệu', 404)

  // Xóa file cũ trên Firebase
  const fileName = new URL(document.fileUrl).pathname.split('/').pop()
  const fileToDelete = bucket.file(`documents/${fileName}`)
  const [exists] = await fileToDelete.exists()
  if (exists) await fileToDelete.delete()

  // Upload file mới
  const fileUpload = bucket.file(`documents/${Date.now()}-${file.originalname}`)
  await fileUpload.save(file.buffer, {
    contentType: file.mimetype,
    public: true,
  })

  const fileUrl = `https://storage.googleapis.com/${
    bucket.name
  }/${encodeURIComponent(fileUpload.name)}`
  document.fileUrl = fileUrl

  await document.save()

  res.status(200).json({
    success: true,
    message: 'Thay thế file thành công',
    document,
  })
})

// Lấy chi tiết tài liệu theo ID
const getDocumentById = TryCatch(async (req, res, next) => {
  const { id } = req.params

  const document = await Document.findById(id).populate('subject', 'name major')

  if (!document) {
    throw new ErrorHandler('Không tìm thấy tài liệu', 404)
  }

  res.status(200).json({
    success: true,
    document,
  })
})

// Xóa tài liệu
const deleteDocument = TryCatch(async (req, res, next) => {
  const { id } = req.params

  const document = await Document.findById(id)
  if (!document) throw new ErrorHandler('Không tìm thấy tài liệu', 404)

  // Xóa file trên Firebase
  const fileName = new URL(document.fileUrl).pathname.split('/').pop()
  const fileToDelete = bucket.file(`documents/${fileName}`)
  const [exists] = await fileToDelete.exists()
  if (exists) await fileToDelete.delete()

  // Xóa tài liệu trong database
  await document.deleteOne()

  res.status(200).json({
    success: true,
    message: 'Xóa tài liệu thành công',
  })
})

// Tìm kiếm tài liệu theo từ khóa
const searchDocuments = TryCatch(async (req, res, next) => {
  const { keyword } = req.query

  if (!keyword) {
    throw new ErrorHandler('Thiếu từ khóa tìm kiếm', 400)
  }

  const regex = new RegExp(keyword, 'i') // 'i' là để không phân biệt hoa thường

  const documents = await Document.find({
    $or: [{ title: regex }, { description: regex }, { author: regex }],
  }).populate('subject', 'name major')

  res.status(200).json({
    success: true,
    count: documents.length,
    documents,
  })
})

export {
  uploadDocument,
  getAllDocuments,
  getDocumentById,
  updateDocument,
  replaceDocument,
  deleteDocument,
  searchDocuments,
}
