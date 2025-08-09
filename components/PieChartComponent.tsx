import React, { useMemo, useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PieChartComponentProps {
  data: Record<string, any>[];
  category: string;
}

const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919',
    '#3498db', '#2ecc71', '#f1c40f', '#e67e22', '#9b59b6', '#e74c3c'
];

const PieChartComponent: React.FC<PieChartComponentProps> = ({ data, category }) => {
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

  const chartData = useMemo(() => {
    const counts = data.reduce((acc, item) => {
      const value = String(item[category]);
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [data, category]);

  if (chartData.length === 0) {
    return <p className="text-center text-gray-500 dark:text-white p-4">Select a category to see the chart.</p>;
  }

  const getOuterRadius = () => {
    switch (screenSize) {
      case 'xs': return 80;
      case 'sm': return 100;
      case 'md': return 110;
      default: return 120;
    }
  };

  const getLabelFontSize = () => {
    switch (screenSize) {
      case 'xs': return 8;
      case 'sm': return 10;
      case 'md': return 11;
      default: return 12;
    }
  };

  const getLegendConfig = () => {
    switch (screenSize) {
      case 'xs': 
        return {
          layout: 'horizontal' as const,
          verticalAlign: 'bottom' as const,
          align: 'center' as const,
          wrapperStyle: { fontSize: '10px', paddingTop: '10px' }
        };
      case 'sm':
        return {
          layout: 'horizontal' as const,
          verticalAlign: 'bottom' as const,
          align: 'center' as const,
          wrapperStyle: { fontSize: '11px', paddingTop: '15px' }
        };
      default:
        return {
          layout: 'horizontal' as const,
          verticalAlign: 'bottom' as const,
          align: 'center' as const,
          wrapperStyle: { fontSize: '12px', paddingTop: '20px' }
        };
    }
  };

  return (
    <div className="w-full h-48 xs:h-56 sm:h-64 md:h-80 lg:h-96">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy={screenSize === 'xs' ? '45%' : '50%'}
            labelLine={false}
            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
              if (percent < 0.05 && screenSize === 'xs') return null; // Hide small labels on mobile
              if (percent === 0) return null;
              const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
              const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
              const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
              return (
                <text 
                  x={x} 
                  y={y} 
                  fill="white" 
                  textAnchor="middle" 
                  dominantBaseline="central" 
                  fontSize={getLabelFontSize()}
                  fontWeight="bold"
                >
                  {`${(percent * 100).toFixed(0)}%`}
                </text>
              );
            }}
            outerRadius={getOuterRadius()}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
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
          <Legend
            iconSize={screenSize === 'xs' ? 8 : 12}
            iconType="circle"
            {...getLegendConfig()}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChartComponent;