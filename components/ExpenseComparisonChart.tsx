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
        <div className="p-2 sm:p-3 bg-gray-900/90 backdrop-blur-sm text-white rounded-lg shadow-lg border border-gray-700">
          <p className="font-bold text-xs sm:text-sm">{`${label}: ₹${payload[0].value.toLocaleString()}`}</p>
        </div>
      );
    }
    return null;
};

const ExpenseComparisonChart: React.FC<ExpenseComparisonChartProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return <p className="text-center text-gray-400 h-48 sm:h-64 flex items-center justify-center text-sm sm:text-base px-4">No expense data available for comparison.</p>;
    }

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

    const getMargins = () => {
        switch (screenSize) {
            case 'xs': return { top: 5, right: 8, left: 8, bottom: 5 };
            case 'sm': return { top: 5, right: 12, left: 8, bottom: 5 };
            default: return { top: 5, right: 16, left: 8, bottom: 5 };
        }
    };

    const getTickFontSize = () => {
        switch (screenSize) {
            case 'xs': return 8;
            case 'sm': return 9;
            case 'md': return 11;
            default: return 12;
        }
    };

    const getBarSize = () => {
        switch (screenSize) {
            case 'xs': return 18;
            case 'sm': return 22;
            case 'md': return 28;
            default: return 35;
        }
    };

    const getYAxisWidth = () => {
        switch (screenSize) {
            case 'xs': return 40;
            case 'sm': return 45;
            case 'md': return 60;
            default: return 70;
        }
    };

    return (
        <div className="w-full h-48 xs:h-52 sm:h-56 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={getMargins()}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                    <XAxis 
                        type="number" 
                        stroke="#9CA3AF" 
                        tick={{ 
                            fill: '#D1D5DB', 
                            fontSize: getTickFontSize() 
                        }} 
                        unit="₹" 
                    />
                    <YAxis 
                        type="category" 
                        dataKey="name" 
                        stroke="#9CA3AF" 
                        tick={{ 
                            fill: '#D1D5DB', 
                            fontSize: getTickFontSize() 
                        }} 
                        width={getYAxisWidth()}
                    />
                    <Tooltip 
                        content={<CustomTooltip />} 
                        cursor={{ fill: 'rgba(107, 114, 128, 0.1)' }} 
                    />
                    <Bar dataKey="cost" name="Monthly Cost" barSize={getBarSize()}>
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