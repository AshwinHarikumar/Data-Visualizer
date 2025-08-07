
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { HouseholdData } from '../types';

interface PieChartComponentProps {
  data: HouseholdData[];
  category: keyof HouseholdData;
}

const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919',
    '#3498db', '#2ecc71', '#f1c40f', '#e67e22', '#9b59b6', '#e74c3c'
];

const PieChartComponent: React.FC<PieChartComponentProps> = ({ data, category }) => {
  const chartData = useMemo(() => {
    const counts = data.reduce((acc, item) => {
      const value = String(item[category]);
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [data, category]);

  if (chartData.length === 0) {
    return <p className="text-center text-gray-500 dark:text-white">Select a category to see the chart.</p>;
  }

  return (
    <div className="w-full h-96">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
              const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
              const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
              const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
              return (
                <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="12">
                  {`${(percent * 100).toFixed(0)}%`}
                </text>
              );
            }}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
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
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChartComponent;
