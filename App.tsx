import React, { useState, useCallback } from 'react';
import { HouseholdData } from './types';
import { processOcrData } from './services/geminiService';

// Import Components
import DataTable from './components/DataTable';
import PieChartComponent from './components/PieChartComponent';
import BarChartComponent from './components/BarChartComponent';
import InitialView from './components/InitialView';
import ControlsSidebar from './components/ControlsSidebar';
import { XIcon } from './components/icons';


type View = 'table' | 'chart';
type ChartType = 'pie' | 'bar';

const App: React.FC = () => {
  const [tableData, setTableData] = useState<HouseholdData[] | null>(null);
  const [isGeminiLoading, setIsGeminiLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedCategory, setSelectedCategory] = useState<keyof HouseholdData>('houseType');
  const [activeView, setActiveView] = useState<View>('chart');
  const [chartType, setChartType] = useState<ChartType>('pie');

  const handleSetData = (data: HouseholdData[]) => {
    setTableData(data);
    setError(null);
    if (data && data.length > 0) {
      const keys = Object.keys(data[0]) as Array<keyof HouseholdData>;
      const defaultCategory = keys.includes('houseType') ? 'houseType' : keys[0];
      setSelectedCategory(defaultCategory);
      setChartType('pie');
      setActiveView('chart');
    } else {
        setError("No data could be processed. Please check the source data.");
    }
  };

  const handleProcessData = useCallback(async (file: File) => {
    setIsGeminiLoading(true);
    setError(null);
    try {
      // The first argument to processOcrData is now the file.
      // The second argument is a progress callback, which we can ignore for now.
      const data = await processOcrData();
      handleSetData(data);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
      setTableData(null);
    } finally {
      setIsGeminiLoading(false);
    }
  }, []);
  
  const handleReset = () => {
      setTableData(null);
      setError(null);
  }

  const dataKeys = tableData 
    ? Array.from(tableData.reduce((acc, row) => {
        Object.keys(row).forEach(key => acc.add(key as keyof HouseholdData));
        return acc;
      }, new Set<keyof HouseholdData>()))
    : [];

  const formatHeader = (header: string) => {
    return header
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
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
        dataKeys={dataKeys}
        onReset={handleReset}
      />

      <main className="flex-1 min-w-0">
        {activeView === 'chart' ? (
             <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Distribution by: {formatHeader(selectedCategory)}
                </h3>
                {chartType === 'pie' ? (
                    <PieChartComponent data={tableData!} category={selectedCategory} />
                ) : (
                    <BarChartComponent data={tableData!} category={selectedCategory} />
                )}
            </div>
        ) : (
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Household Survey Data</h3>
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
          Data Visualizer
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Extract structured data from a sample PDF document and visualize it with interactive charts.
        </p>
      </header>
      
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/30 dark:bg-gray-800/30 shadow-2xl rounded-2xl p-6 min-h-[600px] flex items-center justify-center backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50">
            {tableData ? renderDataView() : 
                <InitialView 
                    isGeminiLoading={isGeminiLoading}
                    error={error}
                    onProcessFromPdf={handleProcessData}
                />
            }
        </div>
      </div>
       <footer className="text-center mt-12 text-sm text-gray-500 dark:text-gray-400">
          
        </footer>
    </div>
  );
};

export default App;