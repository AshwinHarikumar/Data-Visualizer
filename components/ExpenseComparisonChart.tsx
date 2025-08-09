import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export interface ExpenseData {
  name: 'Energy' | 'Water' | 'Vehicle';
  cost: number;
}

interface ExpenseComparisonChartProps {
  data: ExpenseData[];
}

const COLORS: { [key in ExpenseData['name']]: string } = {
  Energy: '#3b82f6', // blue
  Water: '#0ea5e9', // sky
  Vehicle: '#f97316', // orange
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-gray-900/80 backdrop-blur-sm text-white rounded-lg shadow-lg border border-gray-700">
          <p className="font-bold">{`${label}: ₹${payload[0].value.toLocaleString()}`}</p>
        </div>
      );
    }
    return null;
};

const ExpenseComparisonChart: React.FC<ExpenseComparisonChartProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return <p className="text-center text-gray-400 h-64 flex items-center justify-center">No expense data available for comparison.</p>;
    }

    const [isSmall, setIsSmall] = useState(false);
    useEffect(() => {
        const onResize = () => setIsSmall(window.innerWidth < 640);
        onResize();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    return (
        <div className="w-full h-56 sm:h-64">
            <ResponsiveContainer>
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 16, left: 8, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                    <XAxis type="number" stroke="#9CA3AF" tick={{ fill: '#D1D5DB', fontSize: isSmall ? 10 : 12 }} unit="₹" />
                    <YAxis type="category" dataKey="name" stroke="#9CA3AF" tick={{ fill: '#D1D5DB', fontSize: isSmall ? 12 : 14 }} width={isSmall ? 50 : 70} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(107, 114, 128, 0.1)' }} />
                    <Bar dataKey="cost" name="Monthly Cost" barSize={isSmall ? 24 : 35}>
                        {data.map((entry) => (
                            <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name] || '#8884d8'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ExpenseComparisonChart;