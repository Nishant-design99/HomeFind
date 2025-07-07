import mongoose from 'mongoose';

const MediaFileSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true,
  },
  googleDriveId: {
    type: String,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
});

const HomeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
  },
  deposit: {
    type: Number,
  },
  size: {
    type: String,
    required: true,
  },
  listingUrl: {
    type: String,
    trim: true,
  },
  googleMapsUrl: {
    type: String,
    trim: true,
  },
  notes: {
    type: String,
  },
  mediaFiles: [MediaFileSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


HomeSchema.virtual('image').get(function() {
  if (this.mediaFiles && this.mediaFiles.length > 0) {
    return `http://localhost:5000/api/files/${this.mediaFiles[0].googleDriveId}`;
  }
  return null; 
});

HomeSchema.set('toJSON', { virtuals: true });

const Home = mongoose.model('Home', HomeSchema);

export default Home;
