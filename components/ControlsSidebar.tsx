import React from 'react';
import { PieChartIcon, TableIcon, BarChartIcon, UserIcon } from './icons';
import { ChartType } from '../App';
import { GenericDataset, DatasetMetadata } from '../types';
import { cacheService } from '../services/cacheService';
import { getCategoricalColumns, formatColumnName } from '../services/dataAnalysisService';

type View = 'table' | 'chart';
type AnalysisTab = 'column' | 'row';

interface AnalysisControlsProps {
  // Common
  activeAnalysisTab: AnalysisTab;
  setActiveAnalysisTab: (tab: AnalysisTab) => void;
  onReset: () => void;

  // Column Analysis Props
  activeView: View;
  setActiveView: (view: View) => void;
  chartType: ChartType;
  setChartType: (type: ChartType) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  availableKeys: string[];
  datasetMetadata?: DatasetMetadata | null;

  // Row Analysis Props
  tableData: GenericDataset;
  selectedRowIndex: number | null;
  setSelectedRowIndex: (index: number) => void;
  onClearCache?: () => void;
}

const formatCategoryName = (name: string) => {
    return name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}

const AnalysisControls: React.FC<AnalysisControlsProps> = ({
    activeAnalysisTab, setActiveAnalysisTab, onReset,
    activeView, setActiveView, chartType, setChartType, selectedCategory, setSelectedCategory, availableKeys, datasetMetadata,
    tableData, selectedRowIndex, setSelectedRowIndex, onClearCache
}) => {
    const [cacheInfo, setCacheInfo] = React.useState({ 
        totalEntries: 0, 
        totalSize: 0, 
        files: [] as Array<{name: string; records: number; timestamp: Date}>
    });

    React.useEffect(() => {
        const info = cacheService.getCacheInfo();
        setCacheInfo(info);
    }, []);

    const handleClearCache = () => {
        cacheService.clearCache();
        setCacheInfo({ totalEntries: 0, totalSize: 0, files: [] });
        if (onClearCache) onClearCache();
    };

    const formatCacheTimestamp = (timestamp: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - timestamp.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMins / 60);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return timestamp.toLocaleDateString();
    };

    return (
        <aside className="w-full lg:w-80 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md p-3 xs:p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="flex-grow">
                <h2 className="text-base xs:text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Analysis Panel</h2>
                
                {/* Analysis Type Selector */}
                <div className="mb-4 sm:mb-6">
                    <div className={`flex items-center bg-gray-200 dark:bg-gray-900 rounded-md sm:rounded-lg p-0.5 sm:p-1 ${
                        datasetMetadata?.dataType !== 'household' ? 'justify-center' : ''
                    }`}>
                        <button
                            onClick={() => setActiveAnalysisTab('column')}
                            className={`${datasetMetadata?.dataType !== 'household' ? 'w-full' : 'w-full'} flex items-center justify-center px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 text-xs xs:text-sm font-semibold rounded-sm sm:rounded-md transition-all duration-300 ${
                                activeAnalysisTab === 'column' 
                                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow' 
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-800/50'
                            }`}
                        >
                            <BarChartIcon className="mr-1 xs:mr-2 h-3 xs:h-4 sm:h-5 w-3 xs:w-4 sm:w-5" />
                            <span className="truncate">{datasetMetadata?.dataType === 'household' ? 'Column-wise' : 'Data Analysis'}</span>
                        </button>
                        {datasetMetadata?.dataType === 'household' && (
                            <button
                                onClick={() => setActiveAnalysisTab('row')}
                                className={`w-full flex items-center justify-center px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 text-xs xs:text-sm font-semibold rounded-sm sm:rounded-md transition-all duration-300 ${
                                    activeAnalysisTab === 'row' 
                                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow' 
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-800/50'
                                }`}
                            >
                                <UserIcon className="mr-1 xs:mr-2 h-3 xs:h-4 sm:h-5 w-3 xs:w-4 sm:w-5" />
                                <span className="truncate">Row-wise</span>
                            </button>
                        )}
                    </div>
                </div>
                
                {/* Conditional Controls */}
                {activeAnalysisTab === 'column' && (
                  <div className="space-y-4 sm:space-y-6 animate-fade-in">
                    <div>
                      <span className="text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">View Mode</span>
                      <div className="flex items-center space-x-1 xs:space-x-2">
                          <button
                              onClick={() => setActiveView('chart')}
                              className={`w-full flex items-center justify-center px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 text-xs xs:text-sm font-medium rounded-sm sm:rounded-md transition-all duration-200 ${
                                  activeView === 'chart' 
                                  ? 'bg-indigo-600 text-white shadow-md' 
                                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                          >
                              <PieChartIcon className="mr-2 h-5 w-5" />
                              Chart
                          </button>
                          <button
                              onClick={() => setActiveView('table')}
                              className={`w-full flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                                  activeView === 'table' 
                                  ? 'bg-indigo-600 text-white shadow-md' 
                                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                          >
                              <TableIcon className="mr-2 h-5 w-5" />
                              Table
                          </button>
                      </div>
                    </div>
                    
                    {activeView === 'chart' && (
                        <div className="space-y-4 animate-fade-in">
                             <div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Chart Type</span>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setChartType('pie')}
                                        className={`w-full flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                                            chartType === 'pie' 
                                            ? 'bg-indigo-500 text-white shadow-sm' 
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        <PieChartIcon className="mr-2 h-5 w-5" />
                                        Pie
                                    </button>
                                    <button
                                        onClick={() => setChartType('bar')}
                                        className={`w-full flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                                            chartType === 'bar'
                                            ? 'bg-indigo-500 text-white shadow-sm'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        <BarChartIcon className="mr-2 h-5 w-5" />
                                        Bar
                                    </button>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between">
                                    <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Chart Category
                                    </label>
                                    {datasetMetadata && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {getCategoricalColumns(datasetMetadata).length} categorical
                                        </span>
                                    )}
                                </div>
                                <select
                                    id="category-select"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    disabled={availableKeys.length === 0}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm disabled:opacity-50"
                                >
                                    {availableKeys.length > 0 ? (
                                        availableKeys.map(key => {
                                            const columnInfo = datasetMetadata?.columns.find(col => col.name === key);
                                            const isRecommended = columnInfo?.isCategorical;
                                            return (
                                                <option key={key} value={key}>
                                                    {formatColumnName(key)}
                                                </option>
                                            );
                                        })
                                    ) : (
                                        <option>No categories found</option>
                                    )}
                                </select>
                                {datasetMetadata && selectedCategory && (
                                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        {(() => {
                                            const col = datasetMetadata.columns.find(c => c.name === selectedCategory);
                                            if (!col) return null;
                                            return (
                                                <div>
                                                    Type: {col.type} • Unique values: {col.uniqueValues?.length || 0}
                                                    {col.isCategorical ? ' • Good for pie charts' : ' • Consider using a different chart type'}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                  </div>
                )}
                
                {activeAnalysisTab === 'row' && (
                    <div className="space-y-6 animate-fade-in">
                        <div>
                            <label htmlFor="row-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Select Row for Analysis
                            </label>
                            <select
                                id="row-select"
                                value={selectedRowIndex ?? ''}
                                onChange={(e) => setSelectedRowIndex(Number(e.target.value))}
                                disabled={tableData.length === 0}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm disabled:opacity-50"
                            >
                                {tableData.length > 0 ? (
                                    tableData.map((row, index) => {
                                        const identifier = row.name || row.unitName || `Row ${index + 1}`;
                                        const billInfo = row.avgMonthlyBill > 0 ? `Bill: ₹${row.avgMonthlyBill.toLocaleString()}` : '';
                                        const areaInfo = row.totalFloorArea > 0 ? `Area: ${row.totalFloorArea.toLocaleString()} sq.ft.` : '';
                                        const details = [billInfo, areaInfo].filter(Boolean).join(' | ');
            
                                        return (
                                            <option key={index} value={index}>
                                                {identifier}{details ? ` (${details})` : ''}
                                            </option>
                                        );
                                    })
                                ) : (
                                    <option>No data available</option>
                                )}
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Enhanced Cache Info */}
            {/* {cacheInfo.totalEntries > 0 && (
                <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-900/50 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        Cache: {cacheInfo.files.length} file{cacheInfo.files.length !== 1 ? 's' : ''} 
                        ({(cacheInfo.totalSize / 1024).toFixed(1)} KB)
                    </p>
                    {cacheInfo.files.length > 0 && (
                        <div className="space-y-1 max-h-20 overflow-y-auto">
                            {cacheInfo.files.slice(0, 3).map((file, index) => (
                                <div key={index} className="text-xs text-gray-500 dark:text-gray-500">
                                    <div className="truncate" title={file.name}>
                                        {file.name.length > 20 ? `${file.name.substring(0, 20)}...` : file.name}
                                    </div>
                                    <div className="flex justify-between">
                                        <span>{file.records} records</span>
                                        <span>{formatCacheTimestamp(file.timestamp)}</span>
                                    </div>
                                </div>
                            ))}
                            {cacheInfo.files.length > 3 && (
                                <div className="text-xs text-gray-400">
                                    +{cacheInfo.files.length - 3} more...
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )} */}

            <div className="mt-4 space-y-2">
                {cacheInfo.totalEntries > 0 && (
                    <button
                        onClick={handleClearCache}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-yellow-500 text-sm font-medium rounded-md text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
                    >
                        Clear Cache
                    </button>
                )}
                
                <button
                    onClick={onReset}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-red-500 text-sm font-medium rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                    Reset Data
                </button>
            </div>
        </aside>
    );
};

export default AnalysisControls;