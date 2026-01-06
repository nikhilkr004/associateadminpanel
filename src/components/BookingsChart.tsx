import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';

const generateData = (period: string) => {
  const baseData = {
    day: Array.from({ length: 24 }, (_, i) => ({
      name: `${i}:00`,
      value: Math.floor(Math.random() * 40) + 10,
    })),
    week: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
      name: day,
      value: Math.floor(Math.random() * 60) + 20,
    })),
    month: Array.from({ length: 30 }, (_, i) => ({
      name: `${i + 1}`,
      value: Math.floor(Math.random() * 50) + 15,
    })),
    year: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => ({
      name: month,
      value: Math.floor(Math.random() * 80) + 30,
    })),
  };
  return baseData[period as keyof typeof baseData] || baseData.month;
};

const BookingsChart: React.FC = () => {
  const [activePeriod, setActivePeriod] = useState('month');
  const data = generateData(activePeriod);
  
  const periods = [
    { key: 'day', label: 'Day' },
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'year', label: 'Year' },
  ];

  return (
    <div className="bg-card rounded-2xl p-6 border border-border/40">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Session Volume - Last 30 Days
        </h3>
        <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1">
          {periods.map((period) => (
            <button
              key={period.key}
              onClick={() => setActivePeriod(period.key)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200',
                activePeriod === period.key
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              interval={activePeriod === 'month' ? 4 : activePeriod === 'day' ? 3 : 0}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted) / 0.2)' }}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 500 }}
            />
            <Bar 
              dataKey="value" 
              fill="hsl(38, 92%, 50%)"
              radius={[3, 3, 0, 0]}
              maxBarSize={activePeriod === 'month' ? 12 : 32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BookingsChart;
