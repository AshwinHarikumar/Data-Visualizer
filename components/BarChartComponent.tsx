import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { HouseholdData } from '../types';

interface BarChartComponentProps {
  data: HouseholdData[];
  category: keyof HouseholdData;
}

const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919',
    '#3498db', '#2ecc71', '#f1c40f', '#e67e22', '#9b59b6', '#e74c3c'
];

const BarChartComponent: React.FC<BarChartComponentProps> = ({ data, category }) => {
  const chartData = useMemo(() => {
    const counts = data.reduce((acc: { [key: string]: number }, item: HouseholdData) => {
      const value = String(item[category]);
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value: Number(value) }))
      .sort((a, b) => b.value - a.value);
  }, [data, category]);
  
  if (chartData.length === 0) {
    return <p className="text-center text-gray-500 dark:text-white">Select a category to see the chart.</p>;
  }

  return (
    <div className="w-full h-96">
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} />
          <Tooltip
            contentStyle={{ 
                backgroundColor: 'rgba(31, 41, 55, 0.8)', 
                borderColor: '#4B5563',
                borderRadius: '0.5rem',
                color: '#ffffff'
            }}
            cursor={{ fill: 'rgba(107, 114, 128, 0.1)' }}
          />
          <Legend iconSize={12} iconType="circle" />
          <Bar dataKey="value" name="Count">
             {chartData.map((_: { name: string; value: number }, index: number) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartComponent;
