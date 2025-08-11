import React, { useState, useCallback } from 'react';
import { processFileWithAI, processFileWithAIGeneric } from './services/geminiService';
import { analyzeDataset, getCategoricalColumns } from './services/dataAnalysisService';
import { cacheService } from './services/cacheService';

// Import Components
import DataTable from './components/DataTable';
import PieChartComponent from './components/PieChartComponent';
import BarChartComponent from './components/BarChartComponent';
import InitialView from './components/InitialView';
import AnalysisControls from './components/ControlsSidebar';
import RowAnalysisView from './components/RowAnalysisView';
import { XIcon } from './components/icons';
import { HouseholdData, GenericDataset, DatasetMetadata } from './types';

type View = 'table' | 'chart';
export type ChartType = 'pie' | 'bar';
type AnalysisTab = 'column' | 'row';

const App: React.FC = () => {
  const [tableData, setTableData] = useState<GenericDataset | null>(null);
  const [datasetMetadata, setDatasetMetadata] = useState<DatasetMetadata | null>(null);
  const [availableKeys, setAvailableKeys] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCacheLoading, setIsCacheLoading] = useState(false);
  const [processingMode, setProcessingMode] = useState<'household' | 'generic'>('generic');

  // Column Analysis State
  const [activeView, setActiveView] = useState<View>('chart');
  const [chartType, setChartType] = useState<ChartType>('pie');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // New State for Analysis Type and Row selection
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<AnalysisTab>('column');
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);

  const handleSetData = useCallback((data: GenericDataset, metadata?: DatasetMetadata) => {
    setTableData(data);
    setError(null);
    
    // Analyze dataset if metadata not provided
    const meta = metadata || analyzeDataset(data);
    setDatasetMetadata(meta);
    
    if (data && data.length > 0) {
      const keys = Object.keys(data[0]);
      setAvailableKeys(keys);
      
      // Select first categorical column for pie charts, or first column as fallback
      const categoricalColumns = getCategoricalColumns(meta);
      const defaultCategory = categoricalColumns.length > 0 
        ? categoricalColumns[0].name 
        : keys[0] || '';
      
      setSelectedCategory(defaultCategory);
      setActiveView('chart');
      setChartType('pie');
      setActiveAnalysisTab(meta.dataType === 'household' ? 'column' : 'column');
      setSelectedRowIndex(0); // Select the first row by default for row analysis
    } else {
      setAvailableKeys([]);
      setSelectedCategory('');
      setSelectedRowIndex(null);
      setDatasetMetadata(null);
      setError("No data could be extracted. Please check the file content and format.");
    }
  }, []);

  const handleProcessFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setIsCacheLoading(true);
    setError(null);

    try {
      // Check cache first
      console.log('Checking cache for file:', file.name);
      const cacheResult = await cacheService.getCache(file);
      
      if (cacheResult.data && !cacheResult.shouldUpdate) {
        // Perfect cache hit - use cached data
        console.log('Loading data from cache (exact match)');
        const metadata = analyzeDataset(cacheResult.data);
        handleSetData(cacheResult.data, metadata);
        setProcessingMode(metadata.dataType === 'household' ? 'household' : 'generic');
        setIsCacheLoading(false);
        setIsLoading(false);
        return;
      }
      
      if (cacheResult.data && cacheResult.shouldUpdate) {
        // Partial cache hit - we have some data but should check for more
        console.log(`Cache hit but checking for updates: ${cacheResult.reason}`);
        const metadata = analyzeDataset(cacheResult.data);
        handleSetData(cacheResult.data, metadata); // Show cached data immediately
        setProcessingMode(metadata.dataType === 'household' ? 'household' : 'generic');
        setIsCacheLoading(false);
        
        // Continue processing to check for more complete data
      } else {
        // No cache - continue with full processing
        console.log(`No cache found: ${cacheResult.reason}`);
        setIsCacheLoading(false);
      }
      
      // Process the file with generic processing first
      console.log('Processing file for latest data...');
      let result: GenericDataset;
      let metadata: DatasetMetadata;
      
      try {
        result = await processFileWithAIGeneric(file);
        metadata = analyzeDataset(result);
        setProcessingMode('generic');
        
        // If it looks like household data, try the specific processor for better accuracy
        if (metadata.dataType === 'household') {
          try {
            const householdData = await processFileWithAI(file);
            result = householdData;
            metadata = analyzeDataset(result);
            setProcessingMode('household');
          } catch (householdError) {
            console.log('Household processing failed, using generic data:', householdError);
            // Keep the generic data
          }
        }
      } catch (genericError) {
        console.log('Generic processing failed, trying household-specific:', genericError);
        // Fall back to household-specific processing
        const householdData = await processFileWithAI(file);
        result = householdData;
        metadata = analyzeDataset(result);
        setProcessingMode('household');
      }
      
      // Check if we should update cache and UI
      const wasUpdated = await cacheService.updateCacheIfBetter(file, result, cacheResult.data || undefined);
      
      if (wasUpdated || !cacheResult.data) {
        // Update UI only if we got better data or had no cached data
        handleSetData(result, metadata);
        console.log(`UI updated with ${result.length} records`);
      } else {
        console.log('Using existing cached data as it has equal or more records');
      }
      
    } catch (err: any) {
      setError(err.message || 'An error occurred while processing the file.');
      setTableData(null);
      setDatasetMetadata(null);
      setAvailableKeys([]);
    } finally {
      setIsLoading(false);
      setIsCacheLoading(false);
    }
  }, [handleSetData]);
  
  // Clean up cache on app start
  React.useEffect(() => {
    cacheService.cleanupCache();
  }, []);

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
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md p-3 xs:p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 h-full">
          <br/>
       
            <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between mb-3 sm:mb-4 gap-2">
                <h3 className="text-base xs:text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">{chartTitle} Distribution</h3>
                {datasetMetadata && (
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {datasetMetadata.rowCount} records • {datasetMetadata.dataType} data
                    </div>
                )}
            </div>
            {chartType === 'pie' && <PieChartComponent data={tableData} category={selectedCategory} />}
            {chartType === 'bar' && <BarChartComponent data={tableData} category={selectedCategory} />}
        </div>
    );
  };
  
  const renderDataView = () => (
    <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-6 w-full">
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
        datasetMetadata={datasetMetadata}
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
          datasetMetadata?.dataType === 'household' ? (
            <RowAnalysisView 
              dataRow={tableData && selectedRowIndex !== null ? tableData[selectedRowIndex] as any : null}
              allData={tableData as any}
            />
          ) : (
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 h-full flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Row Analysis Not Available</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Row-by-row analysis is currently only available for household energy data.
                  <br />
                  Please use the column analysis to explore your {datasetMetadata?.dataType || 'generic'} data.
                </p>
                <button
                  onClick={() => setActiveAnalysisTab('column')}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Switch to Column Analysis
                </button>
              </div>
            </div>
          )
        )}
      </main>
    </div>
  );

  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-100 p-2 xs:p-3 sm:p-4 lg:p-6 xl:p-8">
      <header className="text-center mb-6 sm:mb-8 lg:mb-10">
        <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white">
           Data Visualizer
        </h1>
        <p className="mt-2 sm:mt-3 max-w-sm xs:max-w-md sm:max-w-lg lg:max-w-3xl mx-auto text-xs xs:text-sm sm:text-base lg:text-lg xl:text-xl text-gray-500 dark:text-gray-400 px-2">
          Upload any PDF or Excel file with tabular data. AI will automatically extract it and generate interactive charts.
        </p>
      </header>
      
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/30 dark:bg-gray-800/30 shadow-2xl rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-6 min-h-[400px] xs:min-h-[500px] sm:min-h-[600px] flex items-center justify-center backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50">
            {tableData ? renderDataView() : 
                <InitialView 
                    isLoading={isLoading}
                    error={error}
                    onProcessFile={handleProcessFile}
                />
            }
        </div>
      </div>
       <footer className="text-center mt-6 sm:mt-8 lg:mt-12 text-xs sm:text-sm text-gray-500 dark:text-gray-400 px-2">
          <p>Contact : <a href="mailto:ashwinharikumar2003@gmail.com" className="hover:text-indigo-400 transition-colors">ashwinharikumar2003@gmail.com</a></p>
        </footer>
    </div>
  );
};

export default App;