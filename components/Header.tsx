
import React from 'react';
import { PlusIcon, BuildingIcon } from './icons';

interface HeaderProps {
  onAddHomeClick: () => void;
  onHomeClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAddHomeClick, onHomeClick }) => {
  return (
    <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-40 shadow-sm border-b border-slate-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={onHomeClick}
          >
            <BuildingIcon className="w-8 h-8 text-teal-600 transition-transform group-hover:scale-110" />
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">HomeBoard</h1>
          </div>
          <button
            onClick={onAddHomeClick}
            className="flex items-center gap-2 bg-teal-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 ease-in-out transform hover:scale-105"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Home</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
