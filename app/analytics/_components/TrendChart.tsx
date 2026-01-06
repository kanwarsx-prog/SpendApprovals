'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function TrendChart({ data }: { data: any[] }) {
    return (
        <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#888888" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#888888" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorCapex" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#C02D76" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#C02D76" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorOpex" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12, fill: '#78716c' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 12, fill: '#78716c' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `£${value / 1000}k`}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e7e5e4' }}
                        formatter={(value: any) => [`£${Number(value).toLocaleString()}`, '']}
                    />
                    <Legend iconType="circle" />

                    {/* Total (Background / Reference) */}
                    <Area
                        type="monotone"
                        dataKey="total"
                        name="Total Spend"
                        stroke="#9ca3af"
                        strokeWidth={1}
                        strokeDasharray="5 5"
                        fill="url(#colorTotal)"
                    />

                    {/* OPEX */}
                    <Area
                        type="monotone"
                        dataKey="opex"
                        name="OPEX"
                        stroke="#22C55E"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorOpex)"
                    />

                    {/* CAPEX */}
                    <Area
                        type="monotone"
                        dataKey="capex"
                        name="CAPEX"
                        stroke="#C02D76"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorCapex)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
