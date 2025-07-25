# HomeBoard - Collaborative Home Search

This is a collaborative web application for tracking potential new homes. It uses a MERN stack (MongoDB, Express, React, Node.js) with Google Drive for media storage. Sample hosted on https://homefind-eb8m.onrender.com/

## Project Structure

- **`/`**: Contains the React frontend application (Vite, Tailwind CSS).
- **`/backend`**: Contains the Node.js & Express backend server.

---

## Backend Setup

The backend handles the API, database interactions, and file uploads to Google Drive.

### 1. Prerequisites

- [Node.js and npm](https://nodejs.org/en/)
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account and a connection string URI.
- A [Google Cloud Platform](https://cloud.google.com/) account.

### 2. Installation

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install
```

### 3. Google Drive API Setup

You need to create a Service Account and a specific Google Drive folder.

**Step A: Configure Google Cloud Project**
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., "HomeBoard-API").
3. Go to **APIs & Services > Library**.
4. Search for and **enable** the **Google Drive API**.

**Step B: Create a Service Account**
1. Go to **APIs & Services > Credentials**.
2. Click **+ CREATE CREDENTIALS** and select **Service account**.
3. Give it a name (e.g., "homeboard-drive-uploader") and click **CREATE AND CONTINUE**.
4. Grant it the **Editor** role to allow it to manage files. Click **CONTINUE**, then **DONE**.
5. Find the newly created service account in the list. Click on it.
6. Go to the **KEYS** tab. Click **ADD KEY > Create new key**.
7. Select **JSON** as the key type and click **CREATE**. A `credentials.json` file will be downloaded.

**Step C: Create Google Drive Folder**
1. Go to your [Google Drive](https://drive.google.com/).
2. Create a new folder (e.g., "HomeBoard Media").
3. **Important:** Share this folder with the `client_email` found inside your downloaded `credentials.json` file. Give it **Editor** permissions.
4. Open the folder. The URL will look like `https://drive.google.com/drive/folders/xxxxxxxxxxxxxxxxx`. The string of characters at the end is your **Folder ID**.

### 4. Environment Variables

1. Move the downloaded `credentials.json` file into the `/backend` directory.
2. In the `/backend` directory, create a new file named `.env`.
3. Copy the contents of `.env.example` into your new `.env` file and fill in the values:

```
# backend/.env

# Your MongoDB connection string
MONGODB_URI="mongodb+srv://<user>:<password>@cluster.mongodb.net/yourDatabaseName?retryWrites=true&w=majority"

# The ID of the Google Drive folder you created and shared
GOOGLE_DRIVE_FOLDER_ID="xxxxxxxxxxxxxxxxx"

# The port for the backend server to run on
PORT=5000

# Path to your service account credentials file
GOOGLE_APPLICATION_CREDENTIALS="./credentials.json"
```

### 5. Running the Backend Server

```bash
# From the /backend directory
npm run dev
```
The server will start on `http://localhost:5000`.

---

## Frontend Setup

The frontend is a React application built with Vite.

### 1. Prerequisites

- A running backend server (see above).

### 2. Running the Frontend

No installation is needed if you are using a web-based development environment that automatically installs dependencies from `index.html`. Simply open the application in your browser.

The frontend will automatically connect to the backend API running at `http://localhost:5000`.
