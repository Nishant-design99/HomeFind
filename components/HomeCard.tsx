import React from 'react';
import { Home } from '../types';

interface HomeCardProps {
  home: Home;
  onSelectHome: (id: string) => void;
  onDeleteHome: (id: string) => void; // Add this line
}

// Helper to construct a URL pointing to your backend endpoint for fetching files
const getBackendFileUrl = (id: string) => `/api/files/${id}`;

const HomeCard: React.FC<HomeCardProps> = ({ home, onSelectHome, onDeleteHome }) => {
  const primaryPhoto = home.mediaFiles.find(mf => mf.mimeType.startsWith('image/'));
  // Use the backend URL instead of the direct Google Drive URL
  const photoUrl = primaryPhoto ? getBackendFileUrl(primaryPhoto.googleDriveId) : 'https://picsum.photos/800/600?grayscale';

  console.log('HomeCard image URL:', photoUrl); // Add this line

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div 
      onClick={() => onSelectHome(home._id)}
      className="bg-white rounded-xl shadow-lg overflow-hidden group transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2 cursor-pointer flex flex-col"
    >
      <div className="relative h-56">
        <img src={photoUrl} alt={home.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4">
           <h3 className="text-white text-xl font-bold truncate" title={home.title}>{home.title}</h3>
        </div>
        {/* Add delete button */}
        <button 
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click event
            onDeleteHome(home._id);
          }}
          className="absolute top-2 right-2 text-white bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Delete Home"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
            <p className="text-slate-600 text-sm truncate">{home.address}</p>
            <p className="text-teal-600 text-2xl font-bold mt-1">{formatPrice(home.price)}</p>
        </div>
        <div className="mt-3">
             <p className="text-slate-500 text-sm font-medium">{home.size}</p>
        </div>
      </div>
    </div>
  );
};

export default HomeCard;
