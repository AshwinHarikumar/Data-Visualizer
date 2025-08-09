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
        <div className="p-3 bg-gray-900/80 backdrop-blur-sm text-white rounded-lg shadow-lg border border-gray-700">
          <p className="font-bold">{`${data.category}: ${data.percentage}%`}</p>
        </div>
      );
    }
    return null;
};


const EnergyBreakdownChart: React.FC<EnergyBreakdownChartProps> = ({ data }) => {
  const chartData = useMemo(() => data, [data]);
  const [isSmall, setIsSmall] = useState(false);
  useEffect(() => {
    const onResize = () => setIsSmall(window.innerWidth < 640);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (!chartData || chartData.length === 0) {
    return <p className="text-center text-gray-400">No breakdown data available.</p>;
  }

  return (
    <div className="w-full h-60 sm:h-72 md:h-80">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                if (percent < 0.03) return null;
                const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
                const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                return (
                  <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={isSmall ? 10 : 12} fontWeight="bold">
                    {`${(percent * 100).toFixed(0)}%`}
                  </text>
                );
              }}
            outerRadius={isSmall ? 80 : 110}
            innerRadius={isSmall ? 35 : 45}
            fill="#8884d8"
            dataKey="percentage"
            nameKey="category"
            paddingAngle={2}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            iconSize={10} 
            iconType="circle" 
            layout={isSmall ? 'horizontal' : 'vertical'} 
            verticalAlign={isSmall ? 'bottom' : 'middle'} 
            align={isSmall ? 'center' : 'right'}
            wrapperStyle={{ fontSize: isSmall ? '12px' : '14px', color: '#D1D5DB' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EnergyBreakdownChart;