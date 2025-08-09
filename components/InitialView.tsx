import React, { useState, useRef } from 'react';
import { UploadIcon } from './icons';

interface InitialViewProps {
  onProcessFile: (file: File) => void;
  isLoading: boolean;
  error: string | null;
  isCacheLoading?: boolean;
}

const LoadingSpinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);
  
const InitialView: React.FC<InitialViewProps> = ({ 
  onProcessFile, isLoading, error, isCacheLoading = false 
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
        }
    };
    
    const handleProcessUpload = () => {
        if (selectedFile) {
            onProcessFile(selectedFile);
        }
    };

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    const getLoadingText = () => {
        if (isCacheLoading) return 'Checking cache...';
        return 'Processing...';
    };

    return (
        <div className="text-center transition-opacity duration-500 ease-in-out opacity-100 w-full max-w-md">
          <div className="p-4 sm:p-8 bg-gray-50 dark:bg-gray-700/50 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700/80">
            <div className="flex justify-center">
              <UploadIcon className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
            </div>
            <h2 className="mt-6 text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white">Upload Your Document</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Select a PDF or Excel file with tabular data for extraction and visualization.
            </p>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.xlsx,.xls"
              className="hidden"
              aria-label="File upload"
              disabled={isLoading}
            />

            <div className="mt-8 w-full">
                <button
                  onClick={handleBrowseClick}
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center px-4 sm:px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Browse File
                </button>

                {selectedFile && 
                    <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 truncate max-w-full px-2" title={selectedFile.name}>
                        Selected: <strong>{selectedFile.name}</strong>
                    </p>
                }

                <button
                    onClick={handleProcessUpload}
                    disabled={isLoading || !selectedFile}
                    className="mt-4 w-full inline-flex items-center justify-center px-4 sm:px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? <><LoadingSpinner/> {getLoadingText()}</> : 'Process File & Visualize'}
                </button>
            </div>
          </div>
          {error && <p className="mt-6 text-red-500 font-medium">{error}</p>}
        </div>
      );
};

export default InitialView;