import React, { useState, useCallback } from 'react';
import { processPdfFile } from './services/geminiService';

// Import Components
import DataTable from './components/DataTable';
import PieChartComponent from './components/PieChartComponent';
import BarChartComponent from './components/BarChartComponent';
import InitialView from './components/InitialView';
import ControlsSidebar from './components/ControlsSidebar';
import { XIcon } from './components/icons';

type View = 'table' | 'chart';
export type ChartType = 'pie' | 'bar';

const App: React.FC = () => {
  const [tableData, setTableData] = useState<Record<string, any>[] | null>(null);
  const [availableKeys, setAvailableKeys] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [activeView, setActiveView] = useState<View>('chart');
  const [chartType, setChartType] = useState<ChartType>('pie');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const handleSetData = useCallback((data: Record<string, any>[]) => {
    setTableData(data);
    setError(null);
    if (data && data.length > 0) {
      const keys = Object.keys(data[0]);
      setAvailableKeys(keys);
      // Select the first key as the default category, or an empty string if no keys exist
      setSelectedCategory(keys[0] || '');
      setActiveView('chart');
      setChartType('pie');
    } else {
      setAvailableKeys([]);
      setSelectedCategory('');
      setError("No data could be extracted. Please check the file content and format.");
    }
  }, []);

  const handleProcessFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const fileName = file.name.toLowerCase();

      if (!fileName.endsWith('.pdf')) {
        throw new Error("Unsupported file type. Please upload a PDF file.");
      }
      const data = await processPdfFile(file);
      handleSetData(data);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred while processing the file.');
      setTableData(null);
      setAvailableKeys([]);
    } finally {
      setIsLoading(false);
    }
  }, [handleSetData]);
  
  const handleReset = () => {
      setTableData(null);
      setError(null);
      setAvailableKeys([]);
      setSelectedCategory('');
  }

  const renderAnalysisChart = () => {
    if (!tableData || !selectedCategory) return <p className="text-center text-gray-500 dark:text-white">Select a category to see the chart.</p>;

    const chartTitle = selectedCategory
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());

    return (
        <>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{chartTitle} Distribution</h3>
            {chartType === 'pie' && <PieChartComponent data={tableData} category={selectedCategory} />}
            {chartType === 'bar' && <BarChartComponent data={tableData} category={selectedCategory} />}
        </>
    );
  };
  
  const renderDataView = () => (
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      <ControlsSidebar 
        activeView={activeView}
        setActiveView={setActiveView}
        chartType={chartType}
        setChartType={setChartType}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        availableKeys={availableKeys}
        onReset={handleReset}
      />

      <main className="flex-1 min-w-0">
        {activeView === 'chart' ? (
             <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                {renderAnalysisChart()}
            </div>
        ) : (
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Extracted Data</h3>
                    <button
                        onClick={() => setActiveView('chart')}
                        className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        aria-label="Close table view"
                    >
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>
                <DataTable data={tableData!} />
            </div>
        )}
      </main>
    </div>
  );

  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
          Dynamic PDF Data Visualizer
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Upload any PDF with tabular data. AI will automatically extract it and generate interactive charts.
        </p>
      </header>
      
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/30 dark:bg-gray-800/30 shadow-2xl rounded-2xl p-6 min-h-[600px] flex items-center justify-center backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50">
            {tableData ? renderDataView() : 
                <InitialView 
                    isLoading={isLoading}
                    error={error}
                    onProcessFile={handleProcessFile}
                />
            }
        </div>
      </div>
       <footer className="text-center mt-12 text-sm text-gray-500 dark:text-gray-400">
          <p>contact: <a href="mailto:ashwinharikumar2003@gmail.com">ashwinharikumar2003@gmail.com</a></p>
        </footer>
    </div>
  );
};

export default App;