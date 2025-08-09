import React, { useEffect, useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { HouseholdData } from '../types';

interface ScatterPlotComponentProps {
  data: HouseholdData[];
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="p-3 sm:p-4 bg-gray-800/90 backdrop-blur-sm text-white rounded-lg shadow-lg border border-gray-700 max-w-xs">
                <p className="font-bold text-sm sm:text-lg truncate">{data.name}</p>
                <p className="text-xs sm:text-sm">Bill: ₹{data.avgMonthlyBill.toLocaleString()}</p>
                <p className="text-xs sm:text-sm">Floor Area: {data.totalFloorArea.toLocaleString()} sq.ft.</p>
                <p className="text-xs sm:text-sm">Family Members: {data.familyMembers}</p>
            </div>
        );
    }
    return null;
};

const ScatterPlotComponent: React.FC<ScatterPlotComponentProps> = ({ data }) => {
  const [screenSize, setScreenSize] = useState<'xs' | 'sm' | 'md' | 'lg'>('lg');

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width < 480) setScreenSize('xs');
      else if (width < 640) setScreenSize('sm');
      else if (width < 1024) setScreenSize('md');
      else setScreenSize('lg');
    };
    
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500 dark:text-white p-4">No data available for this analysis.</p>;
  }

  const getMargins = () => {
    switch (screenSize) {
      case 'xs': return { top: 5, right: 5, bottom: 25, left: 25 };
      case 'sm': return { top: 10, right: 10, bottom: 30, left: 30 };
      case 'md': return { top: 15, right: 15, bottom: 35, left: 35 };
      default: return { top: 20, right: 20, bottom: 40, left: 40 };
    }
  };

  const getFontSize = () => {
    switch (screenSize) {
      case 'xs': return 8;
      case 'sm': return 10;
      case 'md': return 11;
      default: return 12;
    }
  };

  const getZAxisRange = () => {
    switch (screenSize) {
      case 'xs': return [30, 120];
      case 'sm': return [40, 180];
      case 'md': return [50, 250];
      default: return [60, 400];
    }
  };

  return (
    <div className="w-full h-48 xs:h-56 sm:h-64 md:h-80 lg:h-96 xl:h-[28rem]">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={getMargins()}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
          <XAxis 
            type="number" 
            dataKey="totalFloorArea" 
            name="Total Floor Area" 
            unit=" sq.ft."
            tick={{ fill: '#9CA3AF', fontSize: getFontSize() }}
            tickLine={{ stroke: '#9CA3AF' }}
            stroke="#6B7280"
            label={screenSize === 'xs' ? undefined : { 
              value: screenSize === 'sm' ? 'Floor Area' : 'Total Floor Area (sq. ft.)', 
              position: 'insideBottom', 
              offset: screenSize === 'sm' ? -15 : -25, 
              fill: '#D1D5DB',
              fontSize: getFontSize()
            }}
          />
          <YAxis 
            type="number" 
            dataKey="avgMonthlyBill" 
            name="Avg Monthly Bill" 
            unit=" INR"
            tick={{ fill: '#9CA3AF', fontSize: getFontSize() }}
            tickLine={{ stroke: '#9CA3AF' }}
            stroke="#6B7280"
            label={screenSize === 'xs' ? undefined : {
              value: screenSize === 'sm' ? 'Bill (INR)' : 'Avg. Monthly Bill (INR)', 
              angle: -90, 
              position: 'insideLeft', 
              offset: screenSize === 'sm' ? -10 : -20, 
              fill: '#D1D5DB',
              fontSize: getFontSize()
            }}
          />
          <ZAxis 
            type="number" 
            dataKey="familyMembers" 
            range={getZAxisRange()} 
            name="Family Members" 
          />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
          <Legend
            verticalAlign={screenSize === 'xs' ? 'bottom' : 'top'}
            align="center"
            height={screenSize === 'xs' ? 15 : screenSize === 'sm' ? 20 : 36}
            wrapperStyle={{ fontSize: screenSize === 'xs' ? '10px' : screenSize === 'sm' ? '11px' : '12px' }}
          />
          <Scatter name="Households" data={data} fill="#8884d8" shape="circle" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScatterPlotComponent;
