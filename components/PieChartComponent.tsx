import React, { useMemo, useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { preparePieChartData, formatColumnName } from '../services/dataAnalysisService';

interface PieChartComponentProps {
  data: Record<string, any>[];
  category: string;
  aggregationColumn?: string;
  aggregationType?: 'count' | 'sum' | 'average' | 'min' | 'max';
  title?: string;
}

const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919',
    '#3498db', '#2ecc71', '#f1c40f', '#e67e22', '#9b59b6', '#e74c3c',
    '#16a085', '#8e44ad', '#2980b9', '#27ae60', '#f39c12', '#d35400'
];

// Custom tooltip for better data display
const CustomTooltip = ({ active, payload, aggregationType }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const percentage = ((data.value / payload[0].payload.totalValue) * 100);
    
    let valueText = data.value.toLocaleString();
    if (aggregationType === 'average') {
      valueText = data.value.toFixed(2);
    } else if (aggregationType === 'count') {
      valueText = `${data.value} item${data.value !== 1 ? 's' : ''}`;
    }
    
    return (
      <div className="p-1.5 xs:p-2 sm:p-3 bg-gray-900/95 backdrop-blur-sm text-white rounded-md sm:rounded-lg shadow-lg border border-gray-700 max-w-[180px] xs:max-w-[200px] sm:max-w-xs">
        <p className="font-bold text-[10px] xs:text-xs sm:text-sm truncate">{data.name}</p>
        <p className="text-[9px] xs:text-xs sm:text-sm">Value: {valueText}</p>
        <p className="text-[9px] xs:text-xs sm:text-sm">Percentage: {percentage.toFixed(1)}%</p>
      </div>
    );
  }
  return null;
};

const PieChartComponent: React.FC<PieChartComponentProps> = ({ 
  data, 
  category, 
  aggregationColumn, 
  aggregationType = 'count',
  title 
}) => {
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
    const rawData = preparePieChartData(data, category, aggregationColumn, aggregationType as 'count' | 'sum' | 'average' | 'min' | 'max');
    const totalValue = rawData.reduce((sum, item) => sum + item.value, 0);
    
    // Add total value to each item for tooltip percentage calculation
    return rawData.map(item => ({ ...item, totalValue }));
  }, [data, category, aggregationColumn, aggregationType]);

  const displayTitle = useMemo(() => {
    if (title) return title;
    
    let baseTitle = formatColumnName(category);
    if (aggregationColumn && aggregationType !== 'count') {
      const aggTitle = formatColumnName(aggregationColumn);
      const aggTypeText = aggregationType.charAt(0).toUpperCase() + aggregationType.slice(1);
      baseTitle = `${aggTypeText} ${aggTitle} by ${baseTitle}`;
    } else {
      baseTitle = `${baseTitle} Distribution`;
    }
    
    return baseTitle;
  }, [title, category, aggregationColumn, aggregationType]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 sm:h-64 md:h-80">
        <p className="text-center text-gray-500 dark:text-white p-4">
          {!category ? 'Select a category to see the chart.' : 'No data available for the selected category.'}
        </p>
      </div>
    );
  }

  const getOuterRadius = () => {
    switch (screenSize) {
      case 'xs': return 60;
      case 'sm': return 80;
      case 'md': return 100;
      default: return 120;
    }
  };

  const getLabelFontSize = () => {
    switch (screenSize) {
      case 'xs': return 7;
      case 'sm': return 8;
      case 'md': return 10;
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
          wrapperStyle: { fontSize: '8px', paddingTop: '5px', lineHeight: '1.2' }
        };
      case 'sm':
        return {
          layout: 'horizontal' as const,
          verticalAlign: 'bottom' as const,
          align: 'center' as const,
          wrapperStyle: { fontSize: '9px', paddingTop: '8px', lineHeight: '1.3' }
        };
      default:
        return {
          layout: 'horizontal' as const,
          verticalAlign: 'bottom' as const,
          align: 'center' as const,
          wrapperStyle: { fontSize: '12px', paddingTop: '15px', lineHeight: '1.4' }
        };
    }
  };

  return (
    <div className="w-full h-40 xs:h-44 sm:h-52 md:h-64 lg:h-80">
      {displayTitle && (
        <h4 className="text-xs xs:text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-1 xs:mb-2 text-center px-2 truncate">
          {displayTitle}
        </h4>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <Pie
            data={chartData}
            cx="50%"
            cy={screenSize === 'xs' ? '40%' : screenSize === 'sm' ? '43%' : '47%'}
            labelLine={false}
            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
              if (percent < 0.08 || (screenSize === 'xs' && percent < 0.15)) return null;
              if (percent === 0) return null;
              const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
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
                  stroke="rgba(0,0,0,0.3)"
                  strokeWidth={0.5}
                >
                  {`${(percent * 100).toFixed(0)}%`}
                </text>
              );
            }}
            outerRadius={getOuterRadius()}
            fill="#8884d8"
            dataKey="value"
            paddingAngle={screenSize === 'xs' ? 1 : 2}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            content={<CustomTooltip aggregationType={aggregationType} />}
            cursor={{ fill: 'rgba(107, 114, 128, 0.1)' }}
            offset={screenSize === 'xs' ? 5 : 10}
          />
          <Legend
            iconSize={screenSize === 'xs' ? 6 : screenSize === 'sm' ? 8 : 12}
            iconType="circle"
            {...getLegendConfig()}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChartComponent;