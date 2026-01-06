'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ExposureChartProps {
    data: any[];
    color: string;
}

export function ExposureChart({ data, color }: ExposureChartProps) {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ left: 80, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="name"
                        type="category"
                        width={120}
                        tick={{ fontSize: 12, fill: '#78716c', fontWeight: 500 }}
                    />
                    <Tooltip
                        cursor={{ fill: '#f5f5f4' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: any) => [`£${Number(value).toLocaleString()}`, 'Pending Amount']}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24} fill={color}>
                        {/* Optional Label on right of bar */}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
