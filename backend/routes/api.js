import express from 'express';
import multer from 'multer';
import Home from '../models/Home.js';
import { getFile, uploadFile, getFileMetadata, deleteFile } from '../services/googleDrive.js';
import { google } from 'googleapis';

const router = express.Router();

// Configure Multer for in-memory file storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
});

// Google Auth configuration
const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

// @route   POST api/upload
// @desc    Upload media files to Google Drive
// @access  Public
router.post('/upload', upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ msg: 'No files uploaded.' });
    }
    
    const uploadPromises = req.files.map(async (file) => {
      const googleDriveId = await uploadFile(file);
      return {
        fileName: file.originalname,
        googleDriveId,
        mimeType: file.mimetype,
      };
    });

    const uploadedFiles = await Promise.all(uploadPromises);
    res.json(uploadedFiles);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/files/:fileId
// @desc    Fetch a file from Google Drive by ID
// @access  Public
router.get('/files/:fileId', async (req, res) => {
  try {
    const fileId = req.params.fileId;
    
    // Get file metadata to determine the correct MIME type
    const metadata = await getFileMetadata(fileId);

    const driveStream = await getFile(fileId);

    // Set appropriate headers for streaming
    res.setHeader('Content-Type', metadata.mimeType);
    console.log('Setting Content-Type header:', metadata.mimeType);
    // You might also want to set Content-Disposition if you want to suggest a filename
    res.setHeader('Content-Disposition', `inline; filename="${metadata.name}"`);

    driveStream.pipe(res);

    // Add logging for the stream
    driveStream.on('data', (chunk) => {
      console.log('Streaming data chunk of size:', chunk.length);
    });

    driveStream.on('end', () => {
      console.log('Google Drive stream ended.');
    });

    driveStream.on('error', (streamErr) => {
      console.error('Error during Google Drive stream:', streamErr);
      // Ensure response is closed if a stream error occurs after headers are sent
      if (!res.headersSent) {
         res.status(500).send('Stream Error fetching file.');
      } else {
         // If headers were already sent, just end the response
         res.end();
      }
    });

  } catch (err) {
    console.error('Error fetching file from Google Drive via backend:', err.message);
    // Log the full error object for more details
    console.error(err);
    // Check for specific Google API errors, e.g., file not found (404)
    if (err.response && err.response.status === 404) {
        res.status(404).json({ msg: 'File not found in Google Drive.' });
    } else {
        res.status(500).send('Server Error fetching file.');
    }
  }
});

// @route   POST api/homes
// @desc    Create a new home listing
// @access  Public
router.post('/homes', async (req, res) => {
  try {
    const newHome = new Home(req.body);
    const home = await newHome.save();
    res.json(home);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/homes
// @desc    Get all home listings
// @access  Public
router.get('/homes', async (req, res) => {
  try {
    const homes = await Home.find().sort({ createdAt: -1 });
    res.json(homes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/homes/:id
// @desc    Get a single home by ID
// @access  Public
router.get('/homes/:id', async (req, res) => {
  try {
    const home = await Home.findById(req.params.id);
    if (!home) {
      return res.status(404).json({ msg: 'Home not found' });
    }
    res.json(home);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Home not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/homes/:id
// @desc    Delete a home listing by ID and remove associated files from Google Drive
// @access  Public
router.delete('/homes/:id', async (req, res) => {
  try {
    const home = await Home.findById(req.params.id);

    if (!home) {
      return res.status(404).json({ msg: 'Home not found' });
    }

    // Delete associated files from Google Drive
    const deleteFilePromises = home.mediaFiles.map(async (file) => {
      try {
        // Assuming you have a deleteFile function in your googleDrive service
        await deleteFile(file.googleDriveId);
        console.log(`Deleted file from Google Drive: ${file.googleDriveId}`);
      } catch (googleDriveErr) {
        console.error(`Failed to delete file ${file.googleDriveId} from Google Drive:`, googleDriveErr.message);
        // Continue with home deletion even if file deletion fails
      }
    });

    await Promise.all(deleteFilePromises);

    // Remove the home from the database
    const deletedHome = await Home.findByIdAndDelete(req.params.id);

    if (!deletedHome) {
        // This case should ideally not be reached if findById above succeeded,
        // but it's a safeguard.
        return res.status(404).json({ msg: 'Home not found after file deletion attempt' });
    }

    res.json({ msg: 'Home removed' });

  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Home not found' });
    }
    res.status(500).send('Server Error');
  }
});

export default router;
