import React from 'react';
import { Home } from '../types';

interface HomeCardProps {
  home: Home;
  onSelectHome: (id: string) => void;
}

// Helper to construct a URL pointing to your backend endpoint for fetching files
const getBackendFileUrl = (id: string) => `/api/files/${id}`;

const HomeCard: React.FC<HomeCardProps> = ({ home, onSelectHome }) => {
  const primaryPhoto = home.mediaFiles.find(mf => mf.mimeType.startsWith('image/'));
  // Use the backend URL instead of the direct Google Drive URL
  const photoUrl = primaryPhoto ? getBackendFileUrl(primaryPhoto.googleDriveId) : 'https://picsum.photos/800/600?grayscale';

  console.log('HomeCard image URL:', photoUrl); // Add this line

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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
