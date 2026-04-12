const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Configure Multer Storage
 * We use diskStorage so files are saved directly to the 'uploads/' directory.
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/';
    
    // Determine subdirectory based on the form field name
    if (file.fieldname === 'coverImage') {
      folder += 'covers/';
    } else if (file.fieldname === 'profilePicture') {
      folder += 'profiles/';
    }

    // Automatically create directory if it does not exist
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename: fieldname-timestamp-random.extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

/**
 * File filter to only allow certain image extensions.
 */
const multerFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  
  // Check extension
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    // Reject file
    cb(new Error('Not an image! Please upload only JPG, JPEG, PNG, or WEBP formats.'), false);
  }
};

/**
 * Multer Upload Instance Tracker
 * Max file size limit: 5MB
 */
const upload = multer({
  storage: storage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Megabytes
  }
});

module.exports = upload;
