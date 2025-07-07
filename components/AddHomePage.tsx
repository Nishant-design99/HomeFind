import React, { useState, useEffect } from 'react';
import { Home } from '../types';
import { api } from '../services/api';
import { LoadingSpinnerIcon, XCircleIcon } from './icons';

interface AddHomePageProps {
  onAddHome: (homeData: Omit<Home, '_id' | 'createdAt'>) => Promise<boolean>;
  onCancel: () => void;
}

// Local state type to hold the raw file and its preview URL
interface FilePreview {
  file: File;
  previewUrl: string;
}

const AddHomePage: React.FC<AddHomePageProps> = ({ onAddHome, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    address: '',
    price: '',
    deposit: '',
    size: '',
    listingUrl: '',
    notes: '',
  });
  const [media, setMedia] = useState<FilePreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<typeof formData>>({});

  // Clean up object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      media.forEach(m => URL.revokeObjectURL(m.previewUrl));
    }
  }, [media]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const files = Array.from(e.target.files);
    const newMedia: FilePreview[] = files.map(file => ({
        file: file,
        previewUrl: URL.createObjectURL(file)
    }));
    
    setMedia(prev => [...prev, ...newMedia]);
    e.target.value = ''; // Reset file input
  };

  const removeMedia = (index: number) => {
    setMedia(prev => {
      const newMedia = [...prev];
      const removed = newMedia.splice(index, 1);
      // Clean up the object URL for the removed file
      if (removed[0]) {
        URL.revokeObjectURL(removed[0].previewUrl);
      }
      return newMedia;
    });
  };
  
  const validateForm = () => {
    const newErrors: Partial<typeof formData> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.price || isNaN(Number(formData.price))) newErrors.price = "A valid price is required";
    if (!formData.size.trim()) newErrors.size = "Size information is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Step 1: Upload media files to the backend
      setIsUploading(true);
      const rawFiles = media.map(m => m.file);
      const uploadedMediaFiles = rawFiles.length > 0 
        ? await api.uploadFiles(rawFiles) 
        : [];
      setIsUploading(false);

      // Step 2: Assemble the final home data and submit it
      const homeData = {
        title: formData.title,
        address: formData.address,
        price: Number(formData.price),
        deposit: formData.deposit ? Number(formData.deposit) : undefined,
        size: formData.size,
        listingUrl: formData.listingUrl,
        notes: formData.notes,
        mediaFiles: uploadedMediaFiles,
      };

      await onAddHome(homeData);
      // On success, the App component will change the view, so no need to change state here.

    } catch (error) {
      console.error("Failed to add home:", error);
      // In a real app, you'd show a specific error message to the user.
      alert("An error occurred. Could not add home. Please check the console for details.");
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl animate-fade-in">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Add New Home</h1>
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form Fields */}
          <div className="md:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium text-slate-700">Title</label>
            <input type="text" name="title" id="title" value={formData.title} onChange={handleInputChange} required className={`mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 ${errors.title ? 'border-red-500' : ''}`} />
            {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
          </div>
          <div className="md:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-slate-700">Address</label>
            <input type="text" name="address" id="address" value={formData.address} onChange={handleInputChange} required className={`mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 ${errors.address ? 'border-red-500' : ''}`} />
             {errors.address && <p className="text-sm text-red-600 mt-1">{errors.address}</p>}
          </div>
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-slate-700">Price (USD)</label>
            <input type="number" name="price" id="price" placeholder="e.g., 500000" value={formData.price} onChange={handleInputChange} required className={`mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 ${errors.price ? 'border-red-500' : ''}`} />
            {errors.price && <p className="text-sm text-red-600 mt-1">{errors.price}</p>}
          </div>
           <div>
            <label htmlFor="deposit" className="block text-sm font-medium text-slate-700">Deposit (USD, Optional)</label>
            <input type="number" name="deposit" id="deposit" placeholder="e.g., 100000" value={formData.deposit} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500" />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="size" className="block text-sm font-medium text-slate-700">Size</label>
            <input type="text" name="size" id="size" placeholder="e.g., 1200 sqft or 3 bed, 2 bath" value={formData.size} onChange={handleInputChange} required className={`mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 ${errors.size ? 'border-red-500' : ''}`} />
             {errors.size && <p className="text-sm text-red-600 mt-1">{errors.size}</p>}
          </div>
           <div className="md:col-span-2">
            <label htmlFor="listingUrl" className="block text-sm font-medium text-slate-700">Original Listing URL (Optional)</label>
            <input type="url" name="listingUrl" id="listingUrl" value={formData.listingUrl} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500" />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700">Notes (Optional)</label>
            <textarea name="notes" id="notes" rows={4} value={formData.notes} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"></textarea>
          </div>
          
           {/* File Upload */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Photos & Videos</label>
            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-slate-900/25 px-6 py-10">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd"></path></svg>
                <div className="mt-4 flex text-sm leading-6 text-gray-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-semibold text-teal-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-teal-600 focus-within:ring-offset-2 hover:text-teal-500">
                    <span>Upload files</span>
                    <input id="file-upload" name="file-upload" type="file" multiple accept="image/*,video/*" onChange={handleFileChange} disabled={isSubmitting} className="sr-only"/>
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF, MP4 up to 10MB</p>
              </div>
            </div>
            
            {media.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {media.map((item, index) => (
                        <div key={index} className="relative group aspect-square">
                           {item.file.type.startsWith('image/') ? (
                             <img src={item.previewUrl} alt={item.file.name} className="w-full h-full object-cover rounded-md" />
                           ) : (
                              <div className="w-full h-full bg-slate-700 flex items-center justify-center text-white text-xs p-1 rounded-md">{item.file.name}</div>
                           )}
                           <button type="button" onClick={() => removeMedia(index)} className="absolute top-0 right-0 -mt-2 -mr-2 bg-white rounded-full text-slate-500 hover:text-red-500 transition-colors">
                                <XCircleIcon className="w-6 h-6"/>
                           </button>
                        </div>
                    ))}
                </div>
            )}
          </div>
        </div>
        <div className="mt-8 flex justify-end gap-4">
          <button type="button" onClick={onCancel} disabled={isSubmitting} className="px-6 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="flex items-center justify-center min-w-[110px] px-6 py-2 text-sm font-semibold text-white bg-teal-600 rounded-lg shadow-sm hover:bg-teal-700 transition-colors disabled:bg-teal-400 disabled:cursor-not-allowed">
            {isUploading ? <><LoadingSpinnerIcon className="w-5 h-5 mr-2"/> Up...</> : isSubmitting ? <><LoadingSpinnerIcon className="w-5 h-5 mr-2"/> Add...</> : 'Add Home'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddHomePage;
