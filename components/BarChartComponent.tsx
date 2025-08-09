import React, { useMemo, useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface BarChartComponentProps {
  data: any[];
  category: string;
}

const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919',
    '#3498db', '#2ecc71', '#f1c40f', '#e67e22', '#9b59b6', '#e74c3c'
];

const BarChartComponent: React.FC<BarChartComponentProps> = ({ data, category }) => {
  const chartData = useMemo(() => {
    const counts = data.reduce((acc, item) => {
      const value = String(item[category]);
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    // Sort alphabetically by category name for consistent display
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data, category]);
  
  const [isSmall, setIsSmall] = useState(false);
  useEffect(() => {
    const onResize = () => setIsSmall(window.innerWidth < 640);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (chartData.length === 0) {
    return <p className="text-center text-gray-500 dark:text-white">Select a category to see the chart.</p>;
  }

  return (
    <div className="w-full h-60 sm:h-72 md:h-96">
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 16,
            left: 10,
            bottom: isSmall ? 40 : 80,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
          <XAxis
            dataKey="name"
            angle={isSmall ? -30 : -45}
            textAnchor="end"
            tick={{ fontSize: isSmall ? 10 : 12 }}
            interval={isSmall ? 'preserveStartEnd' : 0}
          />
          <YAxis allowDecimals={false} tick={{ fontSize: isSmall ? 10 : 12 }} />
          <Tooltip
            contentStyle={{ 
                backgroundColor: 'rgba(31, 41, 55, 0.8)', 
                borderColor: '#4B5563',
                borderRadius: '0.5rem',
                color: '#ffffff'
            }}
            cursor={{ fill: 'rgba(107, 114, 128, 0.1)' }}
          />
          <Legend iconSize={12} iconType="circle" wrapperStyle={{ fontSize: isSmall ? 11 : 12 }} />
          <Bar dataKey="value" name="Count">
             {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartComponent;