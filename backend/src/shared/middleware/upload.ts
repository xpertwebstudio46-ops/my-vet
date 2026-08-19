import multer from 'multer'

export const uploadSingle = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 1, fields: 10 },
}).single('image')

export const uploadMultiple = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 10, fields: 10 },
}).array('images', 10)
