import React, { useState, useCallback } from 'react';
import { processFileWithAI } from './services/geminiService';

// Import Components
import DataTable from './components/DataTable';
import PieChartComponent from './components/PieChartComponent';
import BarChartComponent from './components/BarChartComponent';
import InitialView from './components/InitialView';
import AnalysisControls from './components/ControlsSidebar';
import RowAnalysisView from './components/RowAnalysisView';
import { XIcon } from './components/icons';
import { HouseholdData } from './types';

type View = 'table' | 'chart';
export type ChartType = 'pie' | 'bar';
type AnalysisTab = 'column' | 'row';

const App: React.FC = () => {
  const [tableData, setTableData] = useState<HouseholdData[] | null>(null);
  const [availableKeys, setAvailableKeys] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Column Analysis State
  const [activeView, setActiveView] = useState<View>('chart');
  const [chartType, setChartType] = useState<ChartType>('pie');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // New State for Analysis Type and Row selection
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<AnalysisTab>('column');
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);

  const handleSetData = useCallback((data: HouseholdData[]) => {
    setTableData(data);
    setError(null);
    if (data && data.length > 0) {
      const keys = Object.keys(data[0]);
      setAvailableKeys(keys);
      setSelectedCategory(keys[0] || '');
      setActiveView('chart');
      setChartType('pie');
      setActiveAnalysisTab('column');
      setSelectedRowIndex(0); // Select the first row by default for row analysis
    } else {
      setAvailableKeys([]);
      setSelectedCategory('');
      setSelectedRowIndex(null);
      setError("No data could be extracted. Please check the file content and format.");
    }
  }, []);

  const handleProcessFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await processFileWithAI(file);
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
      setSelectedRowIndex(null);
      setActiveAnalysisTab('column');
  }

  const renderColumnAnalysisChart = () => {
    if (!tableData || !selectedCategory) return <div className="flex items-center justify-center h-full"><p className="text-center text-gray-500 dark:text-white">Select a category to see the chart.</p></div>;

    const chartTitle = selectedCategory
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());

    return (
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 h-full">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{chartTitle} Distribution</h3>
            {chartType === 'pie' && <PieChartComponent data={tableData} category={selectedCategory} />}
            {chartType === 'bar' && <BarChartComponent data={tableData} category={selectedCategory} />}
        </div>
    );
  };
  
  const renderDataView = () => (
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      <AnalysisControls 
        activeAnalysisTab={activeAnalysisTab}
        setActiveAnalysisTab={setActiveAnalysisTab}
        onReset={handleReset}
        // Column props
        activeView={activeView}
        setActiveView={setActiveView}
        chartType={chartType}
        setChartType={setChartType}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        availableKeys={availableKeys}
        // Row props
        tableData={tableData || []}
        selectedRowIndex={selectedRowIndex}
        setSelectedRowIndex={(index) => setSelectedRowIndex(index)}
      />

      <main className="flex-1 min-w-0">
        {activeAnalysisTab === 'column' ? (
          activeView === 'chart' ? (
             renderColumnAnalysisChart()
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
          )
        ) : (
          <RowAnalysisView 
            dataRow={tableData && selectedRowIndex !== null ? tableData[selectedRowIndex] : null}
            allData={tableData}
          />
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
          Upload any PDF or Excel file with tabular data. AI will automatically extract it and generate interactive charts.
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
          <p>Contact : <a href="mailto:ashwinharikumar2003@gmail.com">ashwinharikumar2003@gmail.com</a></p>
        </footer>
    </div>
  );
};

export default App;