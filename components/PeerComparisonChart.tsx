import React, { useEffect, useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface PeerComparisonChartProps {
    selectedData: { bill: number; area: number; members: number; };
    averageData: { bill: number; area: number; members: number; };
    maxData: { bill: number; area: number; members: number; };
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const subject = payload[0].payload.subject;
        return (
            <div className="p-2 sm:p-3 bg-gray-900/90 backdrop-blur-sm text-white rounded-lg shadow-lg border border-gray-700 max-w-xs">
                <p className="font-bold text-xs sm:text-md mb-1 sm:mb-2">{subject}</p>
                {payload.map((pld: any) => (
                    <div key={pld.dataKey} style={{ color: pld.color }} className="flex justify-between items-center text-xs sm:text-sm">
                        <span className="truncate pr-2">{pld.name}:</span>
                        <span className="font-semibold flex-shrink-0">
                            {Number(pld.value).toLocaleString(undefined, { 
                                maximumFractionDigits: subject === 'Family Size' ? 1 : 0 
                            })}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const PeerComparisonChart: React.FC<PeerComparisonChartProps> = ({ selectedData, averageData, maxData }) => {
    const data = [
        {
            subject: 'Bill Amount',
            'This Household': selectedData.bill,
            'Average': averageData.bill,
            fullMark: Math.max(100, maxData.bill * 1.1),
        },
        {
            subject: 'Floor Area',
            'This Household': selectedData.area,
            'Average': averageData.area,
            fullMark: Math.max(500, maxData.area * 1.1),
        },
        {
            subject: 'Family Size',
            'This Household': selectedData.members,
            'Average': averageData.members,
            fullMark: Math.max(5, maxData.members * 1.1),
        },
    ];

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
            case 'xs': return '60%';
            case 'sm': return '65%';
            case 'md': return '75%';
            default: return '80%';
        }
    };

    const getTickFontSize = () => {
        switch (screenSize) {
            case 'xs': return 9;
            case 'sm': return 10;
            case 'md': return 12;
            default: return 13;
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
                    wrapperStyle: { fontSize: '10px', paddingTop: '5px' }
                };
            case 'sm':
                return {
                    iconSize: 9,
                    layout: 'horizontal' as const,
                    verticalAlign: 'bottom' as const,
                    align: 'center' as const,
                    wrapperStyle: { fontSize: '11px', paddingTop: '8px' }
                };
            default:
                return {
                    iconSize: 10,
                    layout: 'horizontal' as const,
                    verticalAlign: 'bottom' as const,
                    align: 'center' as const,
                    wrapperStyle: { fontSize: '12px', paddingTop: '10px' }
                };
        }
    };

    return (
        <div className="w-full h-48 xs:h-52 sm:h-56 md:h-64 lg:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius={getOuterRadius()} data={data}>
                    <PolarGrid strokeOpacity={0.3} />
                    <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ 
                            fill: '#D1D5DB', 
                            fontSize: getTickFontSize()
                        }} 
                    />
                    <PolarRadiusAxis 
                        angle={30} 
                        domain={[0, 'dataMax']} 
                        tick={false} 
                        axisLine={false} 
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend {...getLegendConfig()} />
                    <Radar 
                        name="This Household" 
                        dataKey="This Household" 
                        stroke="#3b82f6" 
                        fill="#3b82f6" 
                        fillOpacity={0.6}
                        strokeWidth={2}
                    />
                    <Radar 
                        name="Average" 
                        dataKey="Average" 
                        stroke="#10b981" 
                        fill="#10b981" 
                        fillOpacity={0.5}
                        strokeWidth={2}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PeerComparisonChart;