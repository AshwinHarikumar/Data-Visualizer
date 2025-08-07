import React, { useState } from 'react';
import { UploadIcon } from './icons';

interface InitialViewProps {
  isGeminiLoading: boolean;
  error: string | null;
  onProcessFromPdf: (file: File) => void;
}

const InitialView: React.FC<InitialViewProps> = ({ isGeminiLoading, error, onProcessFromPdf }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
      if (file) {
        alert('Please select a PDF file.');
      }
    }
  };

  const handleProcessClick = () => {
    if (selectedFile) {
      onProcessFromPdf(selectedFile);
    } else {
      alert('Please select a PDF file to process.');
    }
  };

  return (
    <div className="text-center max-w-lg">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Start by Uploading a PDF
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Select a PDF file containing household survey data to begin visualization.
      </p>

      <div className="mb-6">
        <label htmlFor="pdf-upload" className="w-full cursor-pointer bg-gray-100 dark:bg-gray-700/50 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 flex flex-col items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <UploadIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
          <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            {selectedFile ? 'File selected' : 'Click to upload a file'}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {selectedFile ? selectedFile.name : 'PDF only'}
          </span>
        </label>
        <input
          id="pdf-upload"
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <button
        onClick={handleProcessClick}
        disabled={isGeminiLoading || !selectedFile}
        className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all"
      >
        {isGeminiLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
          'Process PDF'
        )}
      </button>

      {error && (
        <div className="mt-4 text-red-500 bg-red-100 dark:bg-red-900/20 p-3 rounded-md">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}
    </div>
  );
};

export default InitialView;