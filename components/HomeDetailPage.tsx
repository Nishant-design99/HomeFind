import React, { useState } from 'react';
import { Home, MediaFile } from '../types';
import { ArrowLeftIcon } from './icons';

interface HomeDetailPageProps {
  home: Home;
  onClose: () => void;
}

// Helper to construct a URL pointing to your backend endpoint for fetching files
const getBackendFileUrl = (id: string) => `/api/files/${id}`;

const MediaViewer: React.FC<{ mediaFiles: MediaFile[] }> = ({ mediaFiles }) => {
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(mediaFiles[0] || null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (mediaFiles.length === 0) {
    return (
        <div className="bg-slate-100 rounded-lg w-full aspect-video flex items-center justify-center overflow-hidden">
            <div className="text-center text-slate-500">No media available.</div>
        </div>
    );
  }

  if (!selectedMedia) return null;

  const selectedUrl = getBackendFileUrl(selectedMedia.googleDriveId);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentIndex = mediaFiles.findIndex(file => file.googleDriveId === selectedMedia.googleDriveId);
    const nextIndex = (currentIndex + 1) % mediaFiles.length;
    setSelectedMedia(mediaFiles[nextIndex]);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentIndex = mediaFiles.findIndex(file => file.googleDriveId === selectedMedia.googleDriveId);
    const prevIndex = (currentIndex - 1 + mediaFiles.length) % mediaFiles.length;
    setSelectedMedia(mediaFiles[prevIndex]);
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div 
          className="bg-black rounded-lg w-full aspect-video flex items-center justify-center overflow-hidden cursor-pointer"
          onClick={openModal}
        >
          {selectedMedia.mimeType.startsWith('image/') ? (
            <img src={selectedUrl} alt={selectedMedia.fileName} className="max-h-full max-w-full object-contain" />
          ) : (
            <video src={selectedUrl} controls className="max-h-full max-w-full" />
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {mediaFiles.map((file, index) => {
            const thumbnailUrl = file.mimeType.startsWith('image/') ? getBackendFileUrl(file.googleDriveId) : '';
            return (
              <div 
                key={index} 
                onClick={() => setSelectedMedia(file)}
                className={`cursor-pointer rounded-md overflow-hidden flex-shrink-0 w-24 h-16 border-2 ${selectedMedia === file ? 'border-teal-500' : 'border-transparent'}`}
              >
                {file.mimeType.startsWith('image/') ? (
                  <img src={thumbnailUrl} alt={file.fileName} className="w-full h-full object-cover" />
                ) : (
                   <div className="w-full h-full bg-slate-700 flex items-center justify-center text-white text-xs p-1 text-center leading-tight">
                    {file.fileName}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <button 
              onClick={closeModal} 
              className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 z-20"
            >
              &times;
            </button>
            <button 
              onClick={handlePrev} 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2 z-20"
            >
              &#10094;
            </button>
            <button 
              onClick={handleNext} 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2 z-20"
            >
              &#10095;
            </button>
          <div className="relative max-w-4xl max-h-full w-full h-full flex items-center justify-center">
            {selectedMedia.mimeType.startsWith('image/') ? (
              <img src={selectedUrl} alt={selectedMedia.fileName} className="max-h-full max-w-full object-contain" />
            ) : (
              <video src={selectedUrl} controls autoPlay className="max-h-full max-w-full" />
            )}
          </div>
        </div>
      )}
    </>
  );
};

const HomeDetailPage: React.FC<HomeDetailPageProps> = ({ home, onClose }) => {
  const formatPrice = (price?: number) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'INR' }).format(price);
  };
  
  return (
    <div className="max-w-6xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-xl animate-fade-in">
        <button onClick={onClose} className="flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-800 mb-6 transition-colors">
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Listings
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
                <MediaViewer mediaFiles={home.mediaFiles} />
            </div>
            <div className="lg:col-span-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">{home.title}</h1>
                <p className="text-md text-slate-500 mt-1">{home.address}</p>
                
                <div className="mt-6 flex items-baseline gap-4">
                    <span className="text-4xl font-bold text-teal-600">{formatPrice(home.price)}</span>
                    {home.deposit && <span className="text-lg text-slate-600">({formatPrice(home.deposit)} deposit)</span>}
                </div>

                <div className="mt-6 border-t border-slate-200 pt-6">
                    <h2 className="text-lg font-semibold text-slate-800">Details</h2>
                    <dl className="mt-2 space-y-2 text-slate-600">
                        <div className="flex justify-between">
                            <dt>Size</dt>
                            <dd className="font-medium text-slate-900">{home.size}</dd>
                        </div>
                        {home.listingUrl && (
                             <div className="flex justify-between items-center">
                                <dt>Listing</dt>
                                <dd>
                                    <a href={home.listingUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-teal-600 hover:underline">
                                        View Original
                                    </a>
                                </dd>
                             </div>
                        )}
                        {home.googleMapsUrl && (
                             <div className="flex justify-between items-center">
                                <dt>Location</dt>
                                <dd>
                                    <a href={home.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-teal-600 hover:underline">
                                        View on Google Maps
                                    </a>
                                </dd>
                             </div>
                        )}
                         <div className="flex justify-between">
                            <dt>Added</dt>
                            <dd className="font-medium text-slate-900">{new Date(home.createdAt).toLocaleDateString()}</dd>
                        </div>
                    </dl>
                </div>

                 {home.notes && (
                    <div className="mt-6 border-t border-slate-200 pt-6">
                        <h2 className="text-lg font-semibold text-slate-800">Notes</h2>
                        <p className="mt-2 text-slate-600 whitespace-pre-wrap bg-slate-50 p-4 rounded-lg">{home.notes}</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default HomeDetailPage;
