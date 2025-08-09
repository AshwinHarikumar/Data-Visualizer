import React from 'react';
import { PieChartIcon, TableIcon, BarChartIcon, UserIcon } from './icons';
import { ChartType } from '../App';
import { HouseholdData } from '../types';

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

  // Row Analysis Props
  tableData: HouseholdData[];
  selectedRowIndex: number | null;
  setSelectedRowIndex: (index: number) => void;
}

const formatCategoryName = (name: string) => {
    return name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}

const AnalysisControls: React.FC<AnalysisControlsProps> = ({
    activeAnalysisTab, setActiveAnalysisTab, onReset,
    activeView, setActiveView, chartType, setChartType, selectedCategory, setSelectedCategory, availableKeys,
    tableData, selectedRowIndex, setSelectedRowIndex
}) => {
    return (
        <aside className="lg:w-80 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="flex-grow">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Analysis Panel</h2>
                
                {/* Analysis Type Selector */}
                <div className="mb-6">
                    <div className="flex items-center bg-gray-200 dark:bg-gray-900 rounded-lg p-1">
                        <button
                            onClick={() => setActiveAnalysisTab('column')}
                            className={`w-full flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-md transition-all duration-300 ${
                                activeAnalysisTab === 'column' 
                                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow' 
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-800/50'
                            }`}
                        >
                            <BarChartIcon className="mr-2 h-5 w-5" />
                            Column-wise
                        </button>
                        <button
                            onClick={() => setActiveAnalysisTab('row')}
                            className={`w-full flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-md transition-all duration-300 ${
                                activeAnalysisTab === 'row' 
                                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow' 
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-800/50'
                            }`}
                        >
                            <UserIcon className="mr-2 h-5 w-5" />
                            Row-wise
                        </button>
                    </div>
                </div>
                
                {/* Conditional Controls */}
                {activeAnalysisTab === 'column' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">View Mode</span>
                      <div className="flex items-center space-x-2">
                          <button
                              onClick={() => setActiveView('chart')}
                              className={`w-full flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
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
                                <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Chart Category
                                </label>
                                <select
                                    id="category-select"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    disabled={availableKeys.length === 0}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm disabled:opacity-50"
                                >
                                    {availableKeys.length > 0 ? (
                                        availableKeys.map(key => (
                                            <option key={key} value={key}>{formatCategoryName(key)}</option>
                                        ))
                                    ) : (
                                        <option>No categories found</option>
                                    )}
                                </select>
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

            <button
                onClick={onReset}
                className="mt-8 w-full inline-flex justify-center items-center px-4 py-2 border border-red-500 text-sm font-medium rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
                Reset Data
            </button>
        </aside>
    );
};

export default AnalysisControls;