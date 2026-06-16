import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const uploadImage = async (filePath) => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: 'findit/items',
    transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
  })
  return { url: result.secure_url, publicId: result.public_id }
}

export const deleteImage = async (publicId) => {
  await cloudinary.uploader.destroy(publicId)
}

export default cloudinary
