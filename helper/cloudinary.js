import { v2 as cloudinary } from 'cloudinary'
import { v4 as uuid } from 'uuid'

const getBase64 = (file) =>
  `data:${file.mimetype};base64,${file.buffer.toString('base64')}`

const uploadFilesToCloudinary = async (files = []) => {
  const uploadPromises = files.map(async (file) => {
    const base64 = await getBase64(file)
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        base64,
        {
          resource_type: 'auto',
          public_id: uuid(),
        },
        (error, result) => {
          if (error) return reject(error)
          resolve(result)
        }
      )
    })
  })

  try {
    const results = await Promise.all(uploadPromises)

    return results.map((result) => ({
      public_id: result.public_id,
      url: result.secure_url,
    }))
  } catch (err) {
    throw new Error(`Error uploading files to cloudinary: ${err.message}`)
  }
}

const deleteFilesFromCloudinary = async (public_ids = []) => {
  const deletePromises = public_ids.map((public_id) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(
        public_id,
        { resource_type: 'auto' },
        (error, result) => {
          if (error) return reject(error)
          resolve(result)
        }
      )
    })
  })

  try {
    const results = await Promise.all(deletePromises)
    return results
  } catch (err) {
    throw new Error('Error deleting files from Cloudinary')
  }
}

export { uploadFilesToCloudinary, deleteFilesFromCloudinary }
