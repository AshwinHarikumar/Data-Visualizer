import React from 'react';
import { HouseholdData } from '../types';
import { ChartPieIcon, TableIcon, BarChartIcon } from './icons';

type View = 'table' | 'chart';
type ChartType = 'pie' | 'bar';

interface ControlsSidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  chartType: ChartType;
  setChartType: (type: ChartType) => void;
  selectedCategory: keyof HouseholdData;
  setSelectedCategory: (category: keyof HouseholdData) => void;
  dataKeys: Array<keyof HouseholdData>;
  onReset: () => void;
}

const formatHeader = (header: string) => {
    return header
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
};

const ControlsSidebar: React.FC<ControlsSidebarProps> = ({
    activeView, setActiveView, chartType, setChartType,
    selectedCategory, setSelectedCategory, dataKeys, onReset
}) => {
    return (
        <aside className="lg:w-72 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="flex-grow">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Controls</h2>
                
                {/* View Selector */}
                <div className="mb-6">
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
                            <ChartPieIcon className="mr-2 h-5 w-5" />
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
                    <div className="space-y-6">
                        {/* Chart Type Selector */}
                        <div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Chart Type</span>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setChartType('pie')}
                                    className={`w-full flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                                        chartType === 'pie' 
                                        ? 'bg-indigo-500 text-white shadow' 
                                        : 'text-gray-600 dark:text-gray-300 bg-gray-200/50 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <ChartPieIcon className="mr-2 h-5 w-5" />
                                    Pie
                                </button>
                                <button
                                    onClick={() => setChartType('bar')}
                                    className={`w-full flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                                        chartType === 'bar' 
                                        ? 'bg-indigo-500 text-white shadow' 
                                        : 'text-gray-600 dark:text-gray-300 bg-gray-200/50 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <BarChartIcon className="mr-2 h-5 w-5" />
                                    Bar
                                </button>
                            </div>
                        </div>

                        {/* Category Selector */}
                        <div>
                            <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Chart Category
                            </label>
                            <select
                                id="category-select"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value as keyof HouseholdData)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
                            >
                                {dataKeys.map(key => (
                                    <option key={key} value={key}>{formatHeader(key)}</option>
                                ))}
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

export default ControlsSidebar;
