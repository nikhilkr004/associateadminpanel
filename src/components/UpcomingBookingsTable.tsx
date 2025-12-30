import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoreVertical, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Booking {
  id: string;
  name: string;
  avatar: string;
  service: string;
  startTime: string;
  endTime: string;
  client: number;
}

const bookings: Booking[] = [
  {
    id: '1',
    name: 'Mostofa kamal',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    service: 'Hair Cut',
    startTime: '2024-02-12 10:30:00',
    endTime: '2024-02-12 11:00:00',
    client: 26,
  },
  {
    id: '2',
    name: 'Jahid hasan',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    service: 'Hair triming',
    startTime: '2024-02-12 10:30:00',
    endTime: '2024-02-12 11:00:00',
    client: 16,
  },
  {
    id: '3',
    name: 'Tahsan kamal',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face',
    service: 'Hair Cut',
    startTime: '2024-02-12 10:30:00',
    endTime: '2024-02-12 11:00:00',
    client: 2,
  },
];

const UpcomingBookingsTable: React.FC = () => {
  return (
    <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Upcoming Bookings</h3>
        <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
          View All
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      <div className="overflow-x-auto -mx-6">
        <div className="min-w-[700px] px-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Name
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Services
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Start Time
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  End Time
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Client
                </th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Manage
                </th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="border-b border-border/50 hover:bg-secondary/50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={booking.avatar} alt={booking.name} />
                        <AvatarFallback>{booking.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-foreground">{booking.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-muted-foreground">{booking.service}</td>
                  <td className="py-4 px-4 text-muted-foreground">{booking.startTime}</td>
                  <td className="py-4 px-4 text-muted-foreground">{booking.endTime}</td>
                  <td className="py-4 px-4 text-muted-foreground">
                    {booking.client.toString().padStart(2, '0')}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-error">Cancel</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UpcomingBookingsTable;
