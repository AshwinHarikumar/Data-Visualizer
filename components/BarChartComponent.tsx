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

  if (chartData.length === 0) {
    return <p className="text-center text-gray-500 dark:text-white p-4">Select a category to see the chart.</p>;
  }

  const getMargins = () => {
    switch (screenSize) {
      case 'xs': return { top: 5, right: 8, left: 8, bottom: 30 };
      case 'sm': return { top: 5, right: 12, left: 10, bottom: 40 };
      case 'md': return { top: 5, right: 16, left: 10, bottom: 60 };
      default: return { top: 5, right: 16, left: 10, bottom: 80 };
    }
  };

  const getTickConfig = () => {
    switch (screenSize) {
      case 'xs': return {
        fontSize: 8,
        angle: -45,
        interval: 'preserveStartEnd' as const
      };
      case 'sm': return {
        fontSize: 9,
        angle: -30,
        interval: 'preserveStartEnd' as const
      };
      case 'md': return {
        fontSize: 10,
        angle: -45,
        interval: 0
      };
      default: return {
        fontSize: 12,
        angle: -45,
        interval: 0
      };
    }
  };

  const getLegendConfig = () => {
    switch (screenSize) {
      case 'xs': return {
        iconSize: 8,
        iconType: 'circle' as const,
        wrapperStyle: { fontSize: '9px' }
      };
      case 'sm': return {
        iconSize: 10,
        iconType: 'circle' as const,
        wrapperStyle: { fontSize: '10px' }
      };
      default: return {
        iconSize: 12,
        iconType: 'circle' as const,
        wrapperStyle: { fontSize: '11px' }
      };
    }
  };

  const tickConfig = getTickConfig();

  return (
    <div className="w-full h-48 xs:h-56 sm:h-64 md:h-80 lg:h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={getMargins()}
        >
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
          <XAxis
            dataKey="name"
            angle={tickConfig.angle}
            textAnchor="end"
            tick={{ fontSize: tickConfig.fontSize }}
            interval={tickConfig.interval}
            height={getMargins().bottom}
          />
          <YAxis 
            allowDecimals={false} 
            tick={{ fontSize: tickConfig.fontSize }} 
          />
          <Tooltip
            contentStyle={{ 
                backgroundColor: 'rgba(31, 41, 55, 0.9)', 
                borderColor: '#4B5563',
                borderRadius: '0.5rem',
                color: '#ffffff',
                fontSize: screenSize === 'xs' ? '12px' : '14px'
            }}
            cursor={{ fill: 'rgba(107, 114, 128, 0.1)' }}
          />
          <Legend {...getLegendConfig()} />
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