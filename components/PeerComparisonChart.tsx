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
            <div className="p-3 bg-gray-900/80 backdrop-blur-sm text-white rounded-lg shadow-lg border border-gray-700">
                <p className="font-bold text-md mb-2">{subject}</p>
                {payload.map((pld: any) => (
                    <div key={pld.dataKey} style={{ color: pld.color }} className="flex justify-between items-center text-sm">
                        <span>{pld.name}:</span>
                        <span className="font-semibold ml-4">{Number(pld.value).toLocaleString(undefined, { maximumFractionDigits: subject === 'Family Size' ? 1 : 0 })}</span>
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

    const [isSmall, setIsSmall] = useState(false);
    useEffect(() => {
        const onResize = () => setIsSmall(window.innerWidth < 640);
        onResize();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    return (
        <div className="w-full h-56 sm:h-64 md:h-[300px]">
            <ResponsiveContainer>
                <RadarChart cx="50%" cy="50%" outerRadius={isSmall ? '70%' : '80%'} data={data}>
                    <PolarGrid strokeOpacity={0.3} />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#D1D5DB', fontSize: isSmall ? 11 : 13 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      iconSize={10}
                      layout={isSmall ? 'horizontal' : 'horizontal'}
                      verticalAlign={isSmall ? 'bottom' : 'bottom'}
                      align={isSmall ? 'center' : 'center'}
                      wrapperStyle={{ fontSize: isSmall ? '12px' : '14px' }}
                    />
                    <Radar name="This Household" dataKey="This Household" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    <Radar name="Average" dataKey="Average" stroke="#10b981" fill="#10b981" fillOpacity={0.5} />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PeerComparisonChart;