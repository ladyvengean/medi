import multer from 'multer'
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits:{
    fileSize: 10* 1024 * 1024
  },
  fileFilter: (req,file,cb) => {
    if(file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')){
      cb(null,true);
    }
    else{
      cb(new Error('Only pdf and images are allowed'),false);
    }
  }
})
export default upload;


// import multer from 'multer';
// import path from 'path';
// import fs from 'fs';

// // Create uploads directory if it doesn't exist
// const uploadsDir = 'uploads';
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true });
// }

// // Configure storage
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, uploadsDir);
//   },
//   filename: function (req, file, cb) {
//     // Generate unique filename with timestamp
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     const fileExtension = path.extname(file.originalname);
//     cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
//   }
// });

// // File filter to accept only PDFs and images
// const fileFilter = (req, file, cb) => {
//   // Check file type
//   const allowedMimeTypes = [
//     'application/pdf',
//     'image/jpeg',
//     'image/jpg',
//     'image/png',
//     'image/gif',
//     'image/webp'
//   ];

//   if (allowedMimeTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error('Only PDF and image files are allowed'), false);
//   }
// };

// // Configure multer
// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 10 * 1024 * 1024, // 10MB limit
//   },
//   fileFilter: fileFilter
// });

// export default upload;