export interface MediaFile {
  fileName: string;
  // This is the ID of the file stored in Google Drive.
  googleDriveId: string;
  mimeType: string;
}

export interface Home {
  // MongoDB uses _id as the default unique identifier.
  _id: string; 
  title: string;
  address: string;
  price: number;
  deposit?: number;
  size: string;
  listingUrl?: string;
  notes?: string;
  mediaFiles: MediaFile[];
  createdAt: string; // Will be an ISO date string from the backend
}
