import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const data = [
  { name: 'All Bookings', value: 60, color: 'hsl(var(--chart-orange))' },
  { name: 'Upcoming', value: 30, color: 'hsl(var(--chart-blue))' },
  { name: 'Canceled', value: 10, color: 'hsl(var(--chart-red))' },
];

const CanceledBookingsChart: React.FC = () => {
  return (
    <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Canceled Bookings</h3>
        <Button variant="outline" size="sm" className="gap-2">
          <Calendar className="h-4 w-4" />
          Monthly
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center justify-center">
        <div className="relative h-[200px] w-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={3}
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
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="text-2xl font-bold text-foreground">100%</span>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-foreground">{item.name}</span>
            </div>
            <span 
              className="text-sm font-medium"
              style={{ color: item.color }}
            >
              {item.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CanceledBookingsChart;
