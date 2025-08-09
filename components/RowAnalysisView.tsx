import React, { useState, useEffect, useMemo } from 'react';
import { getEnergyBreakdown } from '../services/geminiService';
import EnergyBreakdownChart from './EnergyBreakdownChart';
import ExpenseComparisonChart, { ExpenseData } from './ExpenseComparisonChart';
import PeerComparisonChart from './PeerComparisonChart';
import { BoltIcon, HomeIcon, UsersIcon } from './icons';
import { HouseholdData } from '../types';

interface RowAnalysisViewProps {
  dataRow: HouseholdData | null;
  allData: HouseholdData[] | null;
}

interface BreakdownData {
  category: string;
  percentage: number;
}

const formatHeader = (header: string) => {
    return header
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
};

const MetricCard: React.FC<{ icon: React.ReactNode; label: string; value: string; color: string;}> = ({ icon, label, value, color }) => (
    <div className={`p-4 rounded-xl shadow-lg flex items-center bg-gray-800/50 border border-gray-700/50`}>
        <div className={`p-3 rounded-full mr-4 ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-300">{label}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const ChartLoader: React.FC<{ message?: string }> = ({ message = "Loading Chart..."}) => (
    <div className="flex flex-col items-center justify-center h-56 sm:h-72 md:h-80 w-full animate-pulse">
        <div className="h-32 w-32 sm:h-40 sm:w-40 md:h-48 md:w-48 rounded-full bg-gray-700/50 mb-6"></div>
        <div className="flex justify-center w-full">
            <p className="text-gray-400">{message}</p>
        </div>
    </div>
);


const RowAnalysisView: React.FC<RowAnalysisViewProps> = ({ dataRow, allData }) => {
  const [breakdown, setBreakdown] = useState<BreakdownData[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (dataRow) {
      const fetchBreakdown = async () => {
        setIsLoading(true);
        setError(null);
        setBreakdown(null);
        try {
          const result = await getEnergyBreakdown(dataRow);
          setBreakdown(result);
        } catch (err: any) {
          setError(err.message || 'An error occurred.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchBreakdown();
    }
  }, [dataRow]);

  const comparisonData = useMemo(() => {
    if (!allData || allData.length === 0 || !dataRow) return null;

    const totalHouseholds = allData.length;

    const { sum, max } = allData.reduce((acc, row) => {
        const bill = row.avgMonthlyBill;
        const area = row.totalFloorArea;
        const members = row.familyMembers;
        
        acc.sum.bill += bill;
        acc.sum.area += area;
        acc.sum.members += members;
        
        acc.max.bill = Math.max(acc.max.bill, bill);
        acc.max.area = Math.max(acc.max.area, area);
        acc.max.members = Math.max(acc.max.members, members);

        return acc;
    }, { 
        sum: { bill: 0, area: 0, members: 0 },
        max: { bill: 0, area: 0, members: 0 }
    });

    const selected = {
        bill: dataRow.avgMonthlyBill,
        area: dataRow.totalFloorArea,
        members: dataRow.familyMembers,
    };

    const average = {
        bill: sum.bill / totalHouseholds,
        area: sum.area / totalHouseholds,
        members: sum.members / totalHouseholds,
    };

    return { selected, average, max };
  }, [dataRow, allData]);
  
  const expenseData = useMemo(() => {
    if (!dataRow) return [];
    
    const expenses: ExpenseData[] = [
      { name: 'Energy', cost: dataRow.avgMonthlyBill },
      { name: 'Water', cost: dataRow.avgMonthlyWaterBill },
      { name: 'Vehicle', cost: dataRow.avgMonthlyVehicleCost },
    ];

    return expenses.filter(e => e.cost > 0);

  }, [dataRow]);

  if (!dataRow) {
    return (
      <div className="flex items-center justify-center h-64 sm:h-96">
        <p className="text-center text-gray-500 dark:text-white px-4">Select a row to see individual analysis.</p>
      </div>
    );
  }

  const name = dataRow.name || dataRow.unitName || 'Unnamed Row';
  
  const booleanDetails = Object.entries(dataRow)
    .filter(([, value]) => typeof value === 'boolean');

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 px-2 sm:px-0">
            Analysis for: <span className="text-indigo-400 break-words">{name}</span>
        </h3>
        
        {/* Metric Cards - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 px-2 sm:px-0">
            <MetricCard 
                icon={<BoltIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white"/>} 
                label="Avg. Monthly Bill" 
                value={`₹${dataRow.avgMonthlyBill.toLocaleString()}`}
                color="bg-blue-500/70"
            />
            <MetricCard 
                icon={<HomeIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white"/>} 
                label="Total Floor Area" 
                value={`${dataRow.totalFloorArea.toLocaleString()} sq.ft.`}
                color="bg-green-500/70"
            />
            <MetricCard 
                icon={<UsersIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white"/>} 
                label="Family Members" 
                value={String(dataRow.familyMembers)}
                color="bg-purple-500/70"
            />
        </div>

        {/* Main Content - Better Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 px-2 sm:px-0">
            {/* Charts Section - Takes more space */}
            <div className="lg:col-span-2 xl:col-span-3 space-y-4 sm:space-y-6">
                 {comparisonData && (
                    <div className="bg-white/10 dark:bg-gray-800/60 backdrop-blur-md p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200/20 dark:border-gray-700/50">
                        <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Household Peer Comparison</h3>
                        <PeerComparisonChart
                            selectedData={comparisonData.selected}
                            averageData={comparisonData.average}
                            maxData={comparisonData.max}
                        />
                    </div>
                 )}
                
                <div className="bg-white/10 dark:bg-gray-800/60 backdrop-blur-md p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200/20 dark:border-gray-700/50">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Monthly Expense Comparison</h3>
                    <ExpenseComparisonChart data={expenseData} />
                </div>
                
                <div className="bg-white/10 dark:bg-gray-800/60 backdrop-blur-md p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200/20 dark:border-gray-700/50">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Energy Breakdown</h3>
                    {isLoading && <ChartLoader message="Analyzing..."/>}
                    {error && (
                        <div className="flex items-center justify-center h-64 sm:h-80 text-red-400 text-sm sm:text-base px-4 text-center">
                            {error}
                        </div>
                    )}
                    {breakdown && <EnergyBreakdownChart data={breakdown} />}
                </div>
            </div>

            {/* Sidebar Section - Fixed width on larger screens */}
            <div className="lg:col-span-1 xl:col-span-1 bg-white/10 dark:bg-gray-800/60 backdrop-blur-md p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200/20 dark:border-gray-700/50 h-fit">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Practices Checklist</h3>
                {booleanDetails.length > 0 ? (
                    <dl className="space-y-2 sm:space-y-3">
                        {booleanDetails.map(([key, value]) => {
                            const isAdopted = value === true;
                            return (
                                <div key={key} className="flex items-center justify-between py-2 px-2 sm:px-3 bg-gray-50/10 dark:bg-gray-900/50 rounded-lg">
                                    <dt className="text-xs sm:text-sm font-medium text-gray-300 pr-2 flex-1 min-w-0">
                                        <span className="truncate block">{formatHeader(key)}</span>
                                    </dt>
                                    <dd className={`flex items-center text-xs sm:text-sm font-bold flex-shrink-0 ${isAdopted ? 'text-green-400' : 'text-red-400'}`}>
                                        <span className={`mr-1 sm:mr-2 h-2 w-2 rounded-full flex-shrink-0 ${isAdopted ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                        {isAdopted ? 'Yes' : 'No'}
                                    </dd>
                                </div>
                            )
                        })}
                    </dl>
                ) : (
                    <p className="text-gray-400 text-sm">No practice data available.</p>
                )}
            </div>
        </div>
    </div>
  );
};

export default RowAnalysisView;