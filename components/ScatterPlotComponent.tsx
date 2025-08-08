import React from 'react';
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
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500 dark:text-white">No data available for this analysis.</p>;
  }

  return (
    <div className="w-full h-96">
      <ResponsiveContainer>
        <ScatterChart
          margin={{
            top: 20,
            right: 20,
            bottom: 40,
            left: 40,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
          <XAxis 
            type="number" 
            dataKey="totalFloorArea" 
            name="Total Floor Area" 
            unit=" sq.ft."
            tick={{ fill: '#9CA3AF' }}
            tickLine={{ stroke: '#9CA3AF' }}
            stroke="#6B7280"
            label={{ value: 'Total Floor Area (sq. ft.)', position: 'insideBottom', offset: -25, fill: '#D1D5DB' }}
          />
          <YAxis 
            type="number" 
            dataKey="avgMonthlyBill" 
            name="Avg Monthly Bill" 
            unit=" INR"
            tick={{ fill: '#9CA3AF' }}
            tickLine={{ stroke: '#9CA3AF' }}
            stroke="#6B7280"
            label={{ value: 'Avg. Monthly Bill (INR)', angle: -90, position: 'insideLeft', offset: -20, fill: '#D1D5DB' }}
            />
          <ZAxis type="number" dataKey="familyMembers" range={[60, 400]} name="Family Members" />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={36} />
          <Scatter name="Households" data={data} fill="#8884d8" shape="circle" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScatterPlotComponent;
