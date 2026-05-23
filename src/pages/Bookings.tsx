import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllBookings, cancelBooking, GlobalBooking } from '@/services/firestoreService';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Video, Phone, MessageSquare, Clock, Search, XCircle, Ban, CheckCircle2, MoreHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Bookings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: getAllBookings,
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, type }: { id: string, type: 'instant' | 'scheduled' }) => cancelBooking(id, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast({
        title: "Booking Cancelled",
        description: "The booking has been marked as cancelled.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error cancelling booking",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'accepted': return <Badge variant="default" className="bg-blue-100 text-blue-800">Accepted</Badge>;
      case 'completed': return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'cancelled':
      case 'payment_failed': return <Badge variant="destructive">Cancelled/Failed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Paid</Badge>;
      case 'refunded': return <Badge variant="outline" className="text-gray-500">Refunded</Badge>;
      case 'pending': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Unpaid</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getServiceIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'VIDEO': return <Video className="w-4 h-4 text-blue-500" />;
      case 'AUDIO': return <Phone className="w-4 h-4 text-green-500" />;
      case 'CHAT': return <MessageSquare className="w-4 h-4 text-purple-500" />;
      default: return <Video className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.advisorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' ? true : b.type === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleCancelBooking = (booking: GlobalBooking) => {
    if (confirm(`Are you sure you want to cancel this booking between ${booking.studentName} and ${booking.advisorName}?`)) {
      cancelMutation.mutate({ id: booking.id, type: booking.type });
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Bookings...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-primary" /> Booking Management
          </h1>
          <p className="text-muted-foreground text-sm">View and manage all instant and scheduled sessions.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <Tabs defaultValue="all" className="w-[400px]" onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="instant">Instant</TabsTrigger>
                <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search name or ID..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Advisor</TableHead>
                  <TableHead>Schedule / Created</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                      No bookings found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        {booking.type === 'instant' ? 
                          <Badge variant="outline" className="border-orange-200 text-orange-600 bg-orange-50">Instant</Badge> : 
                          <Badge variant="outline" className="border-indigo-200 text-indigo-600 bg-indigo-50">Scheduled</Badge>
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getServiceIcon(booking.bookingType)}
                          <span className="capitalize">{booking.bookingType.toLowerCase()}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{booking.studentName}</TableCell>
                      <TableCell>{booking.advisorName}</TableCell>
                      <TableCell>
                        {booking.type === 'scheduled' && booking.scheduledDate ? (
                          <div className="text-sm">
                            <div className="font-medium text-foreground">{booking.scheduledDate}</div>
                            <div className="text-muted-foreground text-xs">{booking.scheduledSlot}</div>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            {format(booking.timestamp, 'PP p')}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>₹{booking.sessionAmount?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {getStatusBadge(booking.status)}
                          {getPaymentBadge(booking.paymentStatus)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(booking.id)}>
                              Copy Booking ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-600"
                              disabled={booking.status === 'cancelled' || booking.status === 'completed'}
                              onClick={() => handleCancelBooking(booking)}
                            >
                              <Ban className="w-4 h-4 mr-2" /> Cancel Booking
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
