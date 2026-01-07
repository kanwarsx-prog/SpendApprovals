"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface StackedExposureChartProps {
    data: {
        role: string
        capex: number
        opex: number
    }[]
}

export function StackedExposureChart({ data }: StackedExposureChartProps) {
    return (
        <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ left: 80, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="role"
                        type="category"
                        width={120}
                        tick={{ fontSize: 12, fill: '#78716c', fontWeight: 500 }}
                    />
                    <Tooltip
                        cursor={{ fill: '#f5f5f4' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: any, name: string) => [
                            `£${Number(value).toLocaleString()}`,
                            name === 'capex' ? 'CAPEX Pending' : 'OPEX Pending'
                        ]}
                    />
                    <Legend verticalAlign="top" height={36} />
                    <Bar dataKey="capex" stackId="a" fill="#C02D76" radius={[0, 4, 4, 0]} barSize={32} name="CAPEX" />
                    <Bar dataKey="opex" stackId="a" fill="#22C55E" radius={[0, 4, 4, 0]} barSize={32} name="OPEX" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
