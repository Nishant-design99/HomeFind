import React, { useState, useEffect, useCallback } from 'react';
import { Home } from './types';
import { api } from './services/api';
import HomeListPage from './components/HomeListPage';
import HomeDetailPage from './components/HomeDetailPage';
import AddHomePage from './components/AddHomePage';
import Header from './components/Header';
import { LoadingSpinnerIcon } from './components/icons';

type ViewState = 
  | { name: 'list' }
  | { name: 'detail'; homeId: string }
  | { name: 'add' };

function App() {
  const [homes, setHomes] = useState<Home[]>([]);
  const [view, setView] = useState<ViewState>({ name: 'list' });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHomes = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedHomes = await api.getHomes();
      setHomes(fetchedHomes);
      setError(null);
    } catch (err) {
      setError('Failed to fetch homes. Is the backend server running?');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchHomes();
  }, [fetchHomes]);

  const handleAddHome = useCallback(async (newHomeData: Omit<Home, '_id' | 'createdAt'>): Promise<boolean> => {
    try {
        const addedHome = await api.addHome(newHomeData);
        // Add the new home to the top of the list for immediate feedback
        setHomes(prevHomes => [addedHome, ...prevHomes]);
        setView({ name: 'list' });
        return true;
    } catch (err) {
        setError('Failed to add the new home. Please try again.');
        console.error(err);
        return false;
    }
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-gray-500">
          <LoadingSpinnerIcon className="w-12 h-12" />
          <p className="mt-4 text-lg">Loading homes...</p>
        </div>
      );
    }

    if (error) {
        return <div className="text-center text-red-500 p-8">{error}</div>;
    }

    switch (view.name) {
      case 'add':
        return <AddHomePage onAddHome={handleAddHome} onCancel={() => setView({ name: 'list' })} />;
      case 'detail':
        const selectedHome = homes.find(h => h._id === view.homeId);
        return selectedHome ? (
          <HomeDetailPage home={selectedHome} onClose={() => setView({ name: 'list' })} />
        ) : (
          <div className="text-center p-8">Home not found. It might have been deleted.</div>
        );
      case 'list':
      default:
        return <HomeListPage homes={homes} onSelectHome={(id) => setView({ name: 'detail', homeId: id })} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Header onAddHomeClick={() => setView({ name: 'add' })} onHomeClick={() => setView({ name: 'list'})} />
      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
