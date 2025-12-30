import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const data = [
  { name: 'Jan', value: 1.2 },
  { name: 'Feb', value: 0.8 },
  { name: 'Mar', value: 1.5 },
  { name: 'Apr', value: 2.0 },
  { name: 'May', value: 3.5 },
  { name: 'Jun', value: 4.2 },
  { name: 'Jul', value: 5.0 },
  { name: 'Aug', value: 5.5 },
  { name: 'Sep', value: 6.0 },
  { name: 'Oct', value: 7.5 },
  { name: 'Nov', value: 9.0 },
  { name: 'Dec', value: 9.5 },
];

const BookingsChart: React.FC = () => {
  return (
    <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">All Bookings</h3>
        <Button variant="outline" size="sm" className="gap-2">
          <Calendar className="h-4 w-4" />
          Monthly
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => value.toString().padStart(2, '0')}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-lg)',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Bar 
              dataKey="value" 
              fill="url(#colorGradient)" 
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(271, 81%, 56%)" />
                <stop offset="100%" stopColor="hsl(217, 91%, 60%)" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BookingsChart;
