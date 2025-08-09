import React, { useMemo, useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BreakdownData {
  category: string;
  percentage: number;
}

interface EnergyBreakdownChartProps {
  data: BreakdownData[];
}

const COLORS = ['#3b82f6', '#10b981', '#f97316', '#ec4899', '#8b5cf6', '#ef4444', '#f59e0b'];

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-2 sm:p-3 bg-gray-900/90 backdrop-blur-sm text-white rounded-lg shadow-lg border border-gray-700 max-w-xs">
          <p className="font-bold text-xs sm:text-sm">{`${data.category}: ${data.percentage}%`}</p>
        </div>
      );
    }
    return null;
};

const EnergyBreakdownChart: React.FC<EnergyBreakdownChartProps> = ({ data }) => {
  const chartData = useMemo(() => data, [data]);
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

  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 sm:h-64 md:h-80">
        <p className="text-center text-gray-400 text-sm sm:text-base">No breakdown data available.</p>
      </div>
    );
  }

  const getChartConfig = () => {
    switch (screenSize) {
      case 'xs':
        return {
          outerRadius: 60,
          innerRadius: 25,
          labelFontSize: 8,
          cy: '45%'
        };
      case 'sm':
        return {
          outerRadius: 80,
          innerRadius: 35,
          labelFontSize: 9,
          cy: '50%'
        };
      case 'md':
        return {
          outerRadius: 90,
          innerRadius: 40,
          labelFontSize: 10,
          cy: '50%'
        };
      default:
        return {
          outerRadius: 110,
          innerRadius: 45,
          labelFontSize: 11,
          cy: '50%'
        };
    }
  };

  const getLegendConfig = () => {
    switch (screenSize) {
      case 'xs':
        return {
          iconSize: 8,
          layout: 'horizontal' as const,
          verticalAlign: 'bottom' as const,
          align: 'center' as const,
          wrapperStyle: { fontSize: '10px', color: '#D1D5DB', paddingTop: '10px' }
        };
      case 'sm':
        return {
          iconSize: 9,
          layout: 'horizontal' as const,
          verticalAlign: 'bottom' as const,
          align: 'center' as const,
          wrapperStyle: { fontSize: '11px', color: '#D1D5DB', paddingTop: '10px' }
        };
      case 'md':
        return {
          iconSize: 10,
          layout: 'vertical' as const,
          verticalAlign: 'middle' as const,
          align: 'right' as const,
          wrapperStyle: { fontSize: '12px', color: '#D1D5DB', paddingLeft: '20px' }
        };
      default:
        return {
          iconSize: 10,
          layout: 'vertical' as const,
          verticalAlign: 'middle' as const,
          align: 'right' as const,
          wrapperStyle: { fontSize: '13px', color: '#D1D5DB', paddingLeft: '20px' }
        };
    }
  };

  const config = getChartConfig();
  const legendConfig = getLegendConfig();

  return (
    <div className="w-full h-48 sm:h-56 md:h-64 lg:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy={config.cy}
            labelLine={false}
            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                if (percent < 0.03) return null; // Hide very small slices
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
                    fontSize={config.labelFontSize} 
                    fontWeight="bold"
                  >
                    {`${(percent * 100).toFixed(0)}%`}
                  </text>
                );
              }}
            outerRadius={config.outerRadius}
            innerRadius={config.innerRadius}
            fill="#8884d8"
            dataKey="percentage"
            nameKey="category"
            paddingAngle={1}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                stroke={COLORS[index % COLORS.length]} 
                strokeWidth={1}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            iconType="circle"
            {...legendConfig}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EnergyBreakdownChart;