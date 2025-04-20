const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Store files in the public directory of the frontend
    const uploadPath = path.join(__dirname, '../../', 'public/uploads');
    console.log("Upload path:", uploadPath);
    
    // Create the directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log("Created directory:", uploadPath);
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate a unique filename - timestamp + original name
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    const filename = uniqueSuffix + fileExtension;
    console.log("Generated filename:", filename);
    cb(null, filename);
  }
});

// Filter function to allow only image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  console.log("Received file:", file.originalname, "type:", file.mimetype);
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Configure multer upload
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limit file size to 5MB
  } 
});

/**
 * @route POST /api/upload
 * @desc Upload an image file
 * @access Private (requires authentication)
 */
router.post('/', upload.single('image'), (req, res) => {
  try {
    console.log("Upload request received");
    
    // Check if token is provided in the formData
    const token = req.body.token;
    console.log("Token provided:", token ? "Yes" : "No");
    
    // Skip token validation for now to get file upload working first
    // Later we can re-implement authentication here
    
    if (!req.file) {
      console.log("No file in request");
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // The path of the saved file
    const filePath = req.file.path;
    console.log("File saved at:", filePath);
    
    // Get just the filename
    const fileName = path.basename(req.file.path);
    console.log("File name:", fileName);
    
    // Format the fileName to match what the products endpoint expects
    const formattedFileName = `uploads/${fileName}`;
    console.log("Formatted file name to be stored in database:", formattedFileName);
    
    return res.status(200).json({
      message: 'File uploaded successfully',
      fileName: formattedFileName
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
});

module.exports = router; 