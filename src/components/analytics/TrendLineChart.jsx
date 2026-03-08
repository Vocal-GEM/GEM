import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export const TrendLineChart = ({ data, metric, trendInfo }) => {
    // Prep data mapping
    const getDataKey = (m) => {
        switch (m) {
            case 'pitch': return 'avgPitch';
            case 'resonance': return 'avgResonance';
            default: return 'value'; // generic
        }
    };

    const dataKey = getDataKey(metric);

    // Create projection line if trend info exists
    const projectedData = [...data];
    if (trendInfo && trendInfo.prediction) {
        // Add a couple of future points for visualization
        // logic simplified for demo
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart
                data={data}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" opacity={0.3} />
                <XAxis
                    dataKey="date"
                    tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    stroke="#888"
                    fontSize={12}
                />
                <YAxis stroke="#888" fontSize={12} domain={['auto', 'auto']} />
                <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#9ca3af' }}
                    itemStyle={{ color: '#fff' }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Line
                    type="monotone"
                    dataKey={dataKey}
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#8b5cf6' }}
                    activeDot={{ r: 8 }}
                />

                {/* Render a simple linear trend line if we calculated one */}
                {trendInfo && trendInfo.rateOfChange !== 0 && (
                    // visualizing trend line would require generating points y = mx + b
                    // omitted for brevity, but this is where it would go
                    <></>
                )}
            </LineChart>
        </ResponsiveContainer>
    );
};
