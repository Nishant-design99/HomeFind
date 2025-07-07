
import React from 'react';
import { Home } from '../types';
import HomeCard from './HomeCard';

interface HomeListPageProps {
  homes: Home[];
  onSelectHome: (id: string) => void;
}

const HomeListPage: React.FC<HomeListPageProps> = ({ homes, onSelectHome }) => {
  if (homes.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold text-slate-700">No homes yet!</h2>
        <p className="text-slate-500 mt-2">Click "Add Home" to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {homes.map(home => (
        <HomeCard key={home._id} home={home} onSelectHome={onSelectHome} />
      ))}
    </div>
  );
};

export default HomeListPage;
