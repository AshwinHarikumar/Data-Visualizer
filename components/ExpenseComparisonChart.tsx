import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

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

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="p-1.5 sm:p-2 md:p-3 bg-gray-900/95 backdrop-blur-sm text-white rounded-md sm:rounded-lg shadow-lg border border-gray-700 max-w-[200px] sm:max-w-xs">
                <p className="font-bold text-[10px] xs:text-xs sm:text-sm truncate">{data.name}</p>
                <p className="text-[9px] xs:text-xs sm:text-sm">₹{data.cost.toLocaleString()}</p>
                <p className="text-[9px] xs:text-xs sm:text-sm">{data.percentage.toFixed(1)}%</p>
            </div>
        );
    }
    return null;
};

const ExpenseComparisonChart: React.FC<ExpenseComparisonChartProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-32 xs:h-36 sm:h-40 md:h-48 lg:h-56 w-full">
                <p className="text-center text-gray-400 text-xs xs:text-sm sm:text-base px-2 sm:px-4">
                    No expense data available for comparison.
                </p>
            </div>
        );
    }

    // Calculate percentages for pie chart
    const total = data.reduce((sum, item) => sum + item.cost, 0);
    const pieData = data.map(item => ({
        ...item,
        percentage: total > 0 ? (item.cost / total) * 100 : 0
    }));

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

    const getOuterRadius = () => {
        switch (screenSize) {
            case 'xs': return 70;
            case 'sm': return 85;
            case 'md': return 100;
            default: return 120;
        }
    };

    const getInnerRadius = () => {
        switch (screenSize) {
            case 'xs': return 0;
            case 'sm': return 0;
            case 'md': return 0;
            default: return 0;
        }
    };

    const getLabelFontSize = () => {
        switch (screenSize) {
            case 'xs': return 9;
            case 'sm': return 10;
            case 'md': return 12;
            default: return 14;
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
                    wrapperStyle: { 
                        fontSize: '10px', 
                        paddingTop: '8px',
                        lineHeight: '1.3'
                    }
                };
            case 'sm':
                return {
                    iconSize: 10,
                    layout: 'horizontal' as const,
                    verticalAlign: 'bottom' as const,
                    align: 'center' as const,
                    wrapperStyle: { 
                        fontSize: '11px', 
                        paddingTop: '10px',
                        lineHeight: '1.3'
                    }
                };
            default:
                return {
                    iconSize: 12,
                    layout: 'horizontal' as const,
                    verticalAlign: 'bottom' as const,
                    align: 'center' as const,
                    wrapperStyle: { 
                        fontSize: '13px', 
                        paddingTop: '12px',
                        lineHeight: '1.4'
                    }
                };
        }
    };

    return (
        <div className="w-full h-48 xs:h-52 sm:h-56 md:h-64 lg:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <Pie
                        data={pieData}
                        cx="50%"
                        cy={screenSize === 'xs' ? '45%' : screenSize === 'sm' ? '47%' : '50%'}
                        labelLine={false}
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                            // Hide labels on very small slices
                            if (percent < 0.05) return null;
                            const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
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
                                    stroke="rgba(0,0,0,0.5)"
                                    strokeWidth={1}
                                >
                                    {`${(percent * 100).toFixed(0)}%`}
                                </text>
                            );
                        }}
                        outerRadius={getOuterRadius()}
                        innerRadius={getInnerRadius()}
                        fill="#8884d8"
                        dataKey="cost"
                        paddingAngle={1}
                    >
                        {pieData.map((entry) => (
                            <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name] || '#8884d8'} />
                        ))}
                    </Pie>
                    <Tooltip 
                        content={<CustomTooltip />}
                        offset={15}
                    />
                    <Legend
                        iconType="circle"
                        {...getLegendConfig()}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ExpenseComparisonChart;