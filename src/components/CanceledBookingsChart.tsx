import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Chat', value: 50, color: '#3B82F6' },
  { name: 'Audio', value: 25, color: '#22C55E' },
  { name: 'Video', value: 25, color: '#F97316' },
];

const total = data.reduce((sum, item) => sum + item.value, 0);

const CanceledBookingsChart: React.FC = () => {
  return (
    <div className="bg-card rounded-2xl p-6 border border-border/40 h-full">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Session Type Distribution
      </h3>

      <div className="flex items-center justify-center">
        <div className="relative h-[200px] w-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-foreground">1,240</span>
            <span className="text-sm text-muted-foreground">Total</span>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-foreground">{item.name}</span>
            </div>
            <span className="text-sm font-semibold text-foreground">
              {item.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CanceledBookingsChart;
