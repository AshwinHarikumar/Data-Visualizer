import React, { useEffect, useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PeerComparisonChartProps {
    selectedData: { bill: number; area: number; members: number; };
    averageData: { bill: number; area: number; members: number; };
    maxData: { bill: number; area: number; members: number; };
}

const COLORS = ['#3b82f6', '#10b981', '#f97316'];

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="p-2.5 xs:p-3 sm:p-3.5 bg-gray-900/95 backdrop-blur-sm text-white rounded-lg shadow-lg border border-gray-700 max-w-[220px] xs:max-w-[240px] sm:max-w-sm">
                <p className="font-bold text-xs xs:text-sm sm:text-base truncate">{data.name}</p>
                <p className="text-xs xs:text-sm sm:text-base">Your Value: {data.actualValue}{data.unit}</p>
                <p className="text-xs xs:text-sm sm:text-base">Peer Average: {data.averageValue}{data.unit}</p>
                <p className="text-xs xs:text-sm sm:text-base">Ratio: {data.ratio.toFixed(2)}x</p>
                <p className="text-xs xs:text-sm sm:text-base font-semibold text-blue-300">{data.comparison}</p>
                <p className="text-xs xs:text-sm sm:text-base text-gray-300">Chart %: {data.percentage.toFixed(1)}%</p>
            </div>
        );
    }
    return null;
};

const PeerComparisonChart: React.FC<PeerComparisonChartProps> = ({ selectedData, averageData, maxData }) => {
    // Prepare pie chart data showing comparison between selected household and peers
    const pieData = useMemo(() => {
        // Calculate comparison ratios relative to average
        const billRatio = averageData.bill > 0 ? selectedData.bill / averageData.bill : 1;
        const areaRatio = averageData.area > 0 ? selectedData.area / averageData.area : 1;
        const membersRatio = averageData.members > 0 ? selectedData.members / averageData.members : 1;

        // Create comparison data showing how this household compares to peers
        const comparisonData = [
            {
                name: 'Monthly Bill',
                value: selectedData.bill,
                actualValue: selectedData.bill,
                averageValue: averageData.bill,
                ratio: billRatio,
                normalizedValue: Math.max(0.1, billRatio * 100), // Ensure minimum visibility
                unit: '₹',
                comparison: billRatio > 1.2 ? 'Above Average' : billRatio < 0.8 ? 'Below Average' : 'Near Average'
            },
            {
                name: 'Floor Area',
                value: selectedData.area,
                actualValue: selectedData.area,
                averageValue: averageData.area,
                ratio: areaRatio,
                normalizedValue: Math.max(0.1, areaRatio * 100), // Ensure minimum visibility
                unit: 'sq.ft.',
                comparison: areaRatio > 1.2 ? 'Above Average' : areaRatio < 0.8 ? 'Below Average' : 'Near Average'
            },
            {
                name: 'Family Members',
                value: selectedData.members,
                actualValue: selectedData.members,
                averageValue: averageData.members,
                ratio: membersRatio,
                normalizedValue: Math.max(0.1, membersRatio * 150), // Scale up for better visibility
                unit: 'people',
                comparison: membersRatio > 1.2 ? 'Above Average' : membersRatio < 0.8 ? 'Below Average' : 'Near Average'
            }
        ];

        const total = comparisonData.reduce((sum, item) => sum + item.normalizedValue, 0);
        
        return comparisonData.map(item => ({
            ...item,
            percentage: total > 0 ? (item.normalizedValue / total) * 100 : 0
        }));
    }, [selectedData, averageData]);

    const [screenSize, setScreenSize] = useState<'xs' | 'sm' | 'md' | 'lg'>('lg');
    
    useEffect(() => {
        const updateScreenSize = () => {
            const width = window.innerWidth;
            if (width < 550) setScreenSize('xs');
            else if (width < 768) setScreenSize('sm');
            else if (width < 1024) setScreenSize('md');
            else setScreenSize('lg');
        };
        
        updateScreenSize();
        window.addEventListener('resize', updateScreenSize);
        return () => window.removeEventListener('resize', updateScreenSize);
    }, []);

    const getOuterRadius = () => {
        switch (screenSize) {
            case 'xs': return 85;
            case 'sm': return 105;
            case 'md': return 120;
            default: return 140;
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
            case 'xs': return 10;
            case 'sm': return 11;
            case 'md': return 13;
            default: return 15;
        }
    };

    const getLegendConfig = () => {
        switch (screenSize) {
            case 'xs':
                return {
                    iconSize: 10,
                    layout: 'horizontal' as const,
                    verticalAlign: 'bottom' as const,
                    align: 'center' as const,
                    wrapperStyle: { 
                        fontSize: '11px', 
                        paddingTop: '8px',
                        lineHeight: '1.3'
                    }
                };
            case 'sm':
                return {
                    iconSize: 12,
                    layout: 'horizontal' as const,
                    verticalAlign: 'bottom' as const,
                    align: 'center' as const,
                    wrapperStyle: { 
                        fontSize: '12px', 
                        paddingTop: '10px',
                        lineHeight: '1.3'
                    }
                };
            default:
                return {
                    iconSize: 14,
                    layout: 'horizontal' as const,
                    verticalAlign: 'bottom' as const,
                    align: 'center' as const,
                    wrapperStyle: { 
                        fontSize: '14px', 
                        paddingTop: '12px',
                        lineHeight: '1.4'
                    }
                };
        }
    };

    return (
        <div className="w-full h-56 xs:h-60 sm:h-64 md:h-72 lg:h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 12, right: 12, left: 12, bottom: 12 }}>
                    <Pie
                        data={pieData}
                        cx="50%"
                        cy={screenSize === 'xs' ? '45%' : screenSize === 'sm' ? '47%' : '50%'}
                        labelLine={false}
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }) => {
                            if (percent < 0.05) return null;
                            const radius = innerRadius + (outerRadius - innerRadius) * 0.75;
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
                                    stroke="rgba(0,0,0,0.7)"
                                    strokeWidth={1.5}
                                >
                                    {`${(percent * 100).toFixed(0)}%`}
                                </text>
                            );
                        }}
                        outerRadius={getOuterRadius()}
                        innerRadius={getInnerRadius()}
                        fill="#8884d8"
                        dataKey="normalizedValue"
                        paddingAngle={0.5}
                    >
                        {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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

export default PeerComparisonChart;