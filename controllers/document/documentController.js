import Document from '../../models/Document.js'
import { ErrorHandler, TryCatch } from '../../utils/error.js'
import { bucket } from '../../helper/firebase.js'

const allowedMimeTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const uploadDocument = TryCatch(async (req, res, next) => {
  const { title, type, major, author, publishedYear, description } = req.body
  const file = req.file

  if (!file) return next(new ErrorHandler('Vui lòng tải lên một tài liệu', 400))

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return next(new ErrorHandler('Loại tệp không hợp lệ', 400))
  }

  if (!title || !type || !major || !author || !publishedYear || !description) {
    return next(new ErrorHandler('Thiếu Trường Thuộc Tính', 400))
  }

  const fileUpload = bucket.file(`documents/${Date.now()}-${file.originalname}`)

  await fileUpload.save(file.buffer, {
    contentType: file.mimetype,
    public: true,
  })

  const fileUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`

  const newDocument = new Document({
    title,
    type,
    saved: false,
    major,
    author,
    publishedYear,
    description,
    fileUrl,
  })

  await newDocument.save()

  res.status(201).json({
    success: true,
    message: 'Tải tài liệu lên thành công',
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
  const { title, type, major, author, publishedYear, description, thumbnail } =
    req.body

  const document = await Document.findById(id)
  if (!document) return next(new ErrorHandler('Không tìm thấy tài liệu', 404))

  document.title = title || document.title
  document.type = type || document.type
  document.major = major || document.major
  document.author = author || document.author
  document.publishedYear = publishedYear || document.publishedYear
  document.description = description || document.description
  document.thumbnail = thumbnail || document.thumbnail

  await document.save()

  res.status(200).json({
    success: true,
    message: 'Cập nhật tài liệu thành công',
    document,
  })
})

const replaceDocument = TryCatch(async (req, res, next) => {
  const { id } = req.params
  const file = req.file

  if (!file)
    return next(new ErrorHandler('Vui lòng tải lên một tài liệu mới', 400))

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return next(new ErrorHandler('Loại tệp không hợp lệ', 400))
  }

  const document = await Document.findById(id)
  if (!document) return next(new ErrorHandler('Tài liệu không tồn tại', 404))

  try {
    const fileName = new URL(document.fileUrl).pathname.split('/').pop()
    const fileToDelete = bucket.file(`documents/${fileName}`)

    const [exists] = await fileToDelete.exists()
    if (exists) await fileToDelete.delete()
  } catch (err) {
    console.error('Lỗi khi xóa tệp cũ:', err.message)
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
    message: 'Tài liệu đã được thay thế thành công',
    document,
  })
})

const deleteDocument = TryCatch(async (req, res, next) => {
  const { id } = req.params

  const document = await Document.findById(id)
  if (!document) return next(new ErrorHandler('Tài liệu không tồn tại', 404))

  try {
    const fileName = new URL(document.fileUrl).pathname.split('/').pop()
    const fileToDelete = bucket.file(`documents/${fileName}`)

    const [exists] = await fileToDelete.exists()
    if (exists) await fileToDelete.delete()
  } catch (err) {
    console.error('Lỗi khi xóa tệp:', err.message)
  }

  await document.remove()

  res.status(200).json({
    success: true,
    message: 'Tài liệu đã được xóa thành công',
  })
})

export {
  uploadDocument,
  getAllDocuments,
  updateDocument,
  replaceDocument,
  deleteDocument,
}
