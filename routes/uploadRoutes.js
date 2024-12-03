const express = require('express');
const multer = require('multer');
const ftp = require("basic-ftp");
const path = require("path");
const fs = require("fs");
const router = express.Router();

// Define the uploads directory path
const uploadsDir = path.join(__dirname, 'uploads');

// Ensure the uploads directory exists
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer to store files locally
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir); // Use the uploads directory
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

// FTP Upload Function
async function uploadToHostinger(localFilePath, remoteFilePath) {
    const client = new ftp.Client();
    client.ftp.verbose = true;

    try {
        // Connect to Hostinger FTP
        await client.access({
            host: "ftp.oncrmvibeslanka.nodekidos.com", // Hostinger FTP server
            user: "u846329569.vibeslanka",     // FTP username
            password: "Vibes@123456", // FTP password
            secure: false
        });

        console.log("Connected to Hostinger FTP");

        // Navigate to the target directory on Hostinger
        await client.ensureDir("/uploads");
        await client.uploadFrom(localFilePath, remoteFilePath);

        console.log(`File uploaded successfully to: https://oncrmvibeslanka.nodekidos.com/uploads/${path.basename(remoteFilePath)}`);
    } catch (error) {
        console.error("FTP upload error:", error);
    }

    client.close();
}

// Endpoint to handle single image upload and FTP transfer
router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        const localFilePath = path.join(uploadsDir, req.file.filename);
        const remoteFilePath = req.file.filename;

        // Upload the file to Hostinger via FTP
        await uploadToHostinger(localFilePath, remoteFilePath);

        // File URL on Hostinger
        const fileUrl = `https://oncrmvibeslanka.nodekidos.com/uploads/${req.file.filename}`;

        // Clean up the local file after upload
        fs.unlinkSync(localFilePath);

        res.status(200).json({ fileUrl: fileUrl });
    } catch (error) {
        console.error("Error in uploading file:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
