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
            <div className="p-4 bg-gray-800/80 backdrop-blur-sm text-white rounded-lg shadow-lg border border-gray-700">
                <p className="font-bold text-lg">{data.name}</p>
                <p className="text-sm">Bill: ₹{data.avgMonthlyBill.toLocaleString()}</p>
                <p className="text-sm">Floor Area: {data.totalFloorArea.toLocaleString()} sq.ft.</p>
                <p className="text-sm">Family Members: {data.familyMembers}</p>
            </div>
        );
    }
    return null;
};


const ScatterPlotComponent: React.FC<ScatterPlotComponentProps> = ({ data }) => {
  const [isSmall, setIsSmall] = useState(false);

  useEffect(() => {
    const onResize = () => setIsSmall(window.innerWidth < 640);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500 dark:text-white">No data available for this analysis.</p>;
  }

  return (
    <div className="w-full h-60 sm:h-72 md:h-96">
      <ResponsiveContainer>
        <ScatterChart
          margin={{
            top: isSmall ? 10 : 20,
            right: isSmall ? 10 : 20,
            bottom: isSmall ? 30 : 40,
            left: isSmall ? 30 : 40,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
          <XAxis 
            type="number" 
            dataKey="totalFloorArea" 
            name="Total Floor Area" 
            unit=" sq.ft."
            tick={{ fill: '#9CA3AF', fontSize: isSmall ? 10 : 12 }}
            tickLine={{ stroke: '#9CA3AF' }}
            stroke="#6B7280"
            label={isSmall ? undefined : { value: 'Total Floor Area (sq. ft.)', position: 'insideBottom', offset: -25, fill: '#D1D5DB' }}
          />
          <YAxis 
            type="number" 
            dataKey="avgMonthlyBill" 
            name="Avg Monthly Bill" 
            unit=" INR"
            tick={{ fill: '#9CA3AF', fontSize: isSmall ? 10 : 12 }}
            tickLine={{ stroke: '#9CA3AF' }}
            stroke="#6B7280"
            label={
              isSmall
                ? undefined
                : { value: 'Avg. Monthly Bill (INR)', angle: -90, position: 'insideLeft', offset: -20, fill: '#D1D5DB' }
            }
          />
          <ZAxis type="number" dataKey="familyMembers" range={[isSmall ? 40 : 60, isSmall ? 220 : 400]} name="Family Members" />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
          <Legend
            verticalAlign={isSmall ? 'bottom' : 'top'}
            align={isSmall ? 'center' : 'center'}
            height={isSmall ? 20 : 36}
            wrapperStyle={{ fontSize: isSmall ? 11 : 12 }}
          />
          <Scatter name="Households" data={data} fill="#8884d8" shape="circle" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScatterPlotComponent;
