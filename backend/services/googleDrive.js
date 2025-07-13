import { google } from 'googleapis';
import stream from 'stream';

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

if (!FOLDER_ID) {
  console.error('GOOGLE_DRIVE_FOLDER_ID is not set in environment variables.');
  throw new Error('Missing Google Drive folder ID.');
}


// Use credentials from environment variable if present (for Render and similar hosts)
let auth;
if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
  } catch (err) {
    console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON:', err);
    throw err;
  }
} else {
  // Fallback to default (may use GOOGLE_APPLICATION_CREDENTIALS file path)
  auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
}

/**
 * Uploads a file to the designated Google Drive folder.
 * @param {object} fileObject - The file object from Multer (req.file).
 * @returns {Promise<string>} The ID of the uploaded file.
 */
export async function uploadFile(fileObject) {
  if (!fileObject) {
    throw new Error('No file object provided.');
  }

  const bufferStream = new stream.PassThrough();
  bufferStream.end(fileObject.buffer);

  try {
    const authClient = await auth.getClient();
    const drive = google.drive({ version: 'v3', auth: authClient });

    const { data } = await drive.files.create({
      media: {
        mimeType: fileObject.mimetype,
        body: bufferStream,
      },
      requestBody: {
        name: fileObject.originalname,
        parents: [FOLDER_ID],
      },
      fields: 'id',
    });

    const fileId = data.id;

    // Make the file publicly readable
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    return fileId;
  } catch (error) {
    console.error('Error uploading to Google Drive:', error.response?.data || error.message || error);
    throw error;
  }
}

/**
 * Fetches a file from Google Drive by its ID.
 * @param {string} fileId - The ID of the file to fetch.
 * @returns {Promise<import('googleapis').drive_v3.Schema$File>} The file resource.
 */
export async function getFile(fileId) {
  try {
    const authClient = await auth.getClient();
    const drive = google.drive({ version: 'v3', auth: authClient });

    const response = await drive.files.get({
      fileId: fileId,
      alt: 'media', // Important: Use 'media' to get the file content
    }, { responseType: 'stream' }); // Request as a stream

    return response.data;
  } catch (error) {
    console.error('Error fetching from Google Drive:', error.message);
    console.error(error); // Log the full error object
    throw error;
  }
}

/**
 * Fetches metadata for a file from Google Drive by its ID.
 * @param {string} fileId - The ID of the file to fetch metadata for.
 * @returns {Promise<object>} An object containing the file's mimeType and name.
 */
export async function getFileMetadata(fileId) {
  try {
    const authClient = await auth.getClient();
    const drive = google.drive({ version: 'v3', auth: authClient });

    const response = await drive.files.get({
      fileId: fileId,
      fields: 'mimeType, name', // Specify the fields you need
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching file metadata from Google Drive:', error.message);
    console.error(error); // Log the full error object
    throw error;
  }
}

/**
 * Deletes a file from Google Drive by its ID.
 * @param {string} fileId - The ID of the file to delete.
 * @returns {Promise<void>}
 */
export async function deleteFile(fileId) {
  try {
    const authClient = await auth.getClient();
    const drive = google.drive({ version: 'v3', auth: authClient });

    await drive.files.delete({
      fileId: fileId,
    });
    console.log(`File with ID ${fileId} deleted from Google Drive.`);
  } catch (error) {
    console.error('Error deleting file from Google Drive:', error.message);
    console.error(error); // Log the full error object
    throw error;
  }
}