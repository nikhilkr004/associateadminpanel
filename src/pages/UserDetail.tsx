import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserDetail } from '@/hooks/useUserDetail';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  User,
  Wallet,
  Calendar,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  TrendingDown,
  Video,
  Mic,
  MessageSquare,
  Clock
} from 'lucide-react';

const UserDetail: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useUserDetail(userId || '');

  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBookingTypeIcon = (type: string) => {
    switch (type) {
      case 'VIDEO': return <Video className="h-4 w-4" />;
      case 'AUDIO': return <Mic className="h-4 w-4" />;
      case 'CHAT': return <MessageSquare className="h-4 w-4" />;
      default: return null;
    }
  };

  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    switch (status.toLowerCase()) {
      case 'ended':
      case 'completed':
      case 'success': return 'bg-green-100 text-green-800';
      case 'ongoing':
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Error loading user: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64 md:col-span-2" />
        </div>
      </div>
    );
  }

  if (!data || !data.profile) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/users')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">User Not Found</h1>
            <p className="text-muted-foreground text-sm">The user you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  const { profile, wallet, transactions = [], instantBookings = [], scheduledBookings = [] } = data;
  const totalBookings = (instantBookings?.length || 0) + (scheduledBookings?.length || 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/users')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{profile?.name || 'Unknown User'}</h1>
            <p className="text-muted-foreground text-sm">User Details</p>
          </div>
        </div>
      </div>

      {/* Profile & Wallet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.profilePhotoUrl} alt={profile?.name || 'User'} />
                <AvatarFallback className="text-2xl">
                  {profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{profile?.email || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{profile?.phone || 'N/A'}</span>
              </div>
              {profile?.city && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.city}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Joined: {profile?.jointAt || 'N/A'}</span>
              </div>
              {profile?.gender && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{profile.gender}</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Account Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-primary/5 rounded-lg text-center">
                <Wallet className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{wallet ? formatCurrency(wallet.balance || 0) : '₹0.00'}</p>
                <p className="text-xs text-muted-foreground">Wallet Balance</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg text-center">
                <TrendingDown className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                <p className="text-2xl font-bold">{wallet ? formatCurrency(wallet.totalSpent || 0) : '₹0.00'}</p>
                <p className="text-xs text-muted-foreground">Total Spent</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <Clock className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{totalBookings}</p>
                <p className="text-xs text-muted-foreground">Total Bookings</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">{transactions?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Transactions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Bookings & Transactions */}
      <Tabs defaultValue="instant" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="instant">Instant Bookings ({instantBookings?.length || 0})</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled ({scheduledBookings?.length || 0})</TabsTrigger>
          <TabsTrigger value="transactions">Transactions ({transactions?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="instant">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Urgency</TableHead>
                    <TableHead>Rate/Min</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Booking Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {instantBookings?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                        No instant bookings found
                      </TableCell>
                    </TableRow>
                  ) : (
                    instantBookings?.map((booking) => (
                      <TableRow key={booking.bookingId}>
                        <TableCell className="font-mono text-xs">{booking.bookingId}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getBookingTypeIcon(booking.bookingType)}
                            <span>{booking.bookingType}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate" title={booking.purpose}>
                          {booking.purpose || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{booking.urgencyLevel || 'Medium'}</Badge>
                        </TableCell>
                        <TableCell>{booking.ratePerMinute ? formatCurrency(booking.ratePerMinute) : '-'}/min</TableCell>
                        <TableCell>
                          {booking.actualDuration
                            ? `${Math.floor(booking.actualDuration / 60)}m ${booking.actualDuration % 60}s`
                            : booking.duration
                              ? `${booking.duration}s`
                              : '-'}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {booking.totalPrice
                            ? formatCurrency(booking.totalPrice)
                            : booking.sessionAmount
                              ? formatCurrency(booking.sessionAmount)
                              : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(booking.bookingStatus || 'pending')}>
                            {booking.bookingStatus || 'pending'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={booking.paymentStatus === 'paid' ? 'default' : 'secondary'}
                            className={booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                          >
                            {booking.paymentStatus || 'pending'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(booking.bookingTimestamp || booking.timestamp)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Date & Slot</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Booking Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduledBookings?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No scheduled bookings found
                      </TableCell>
                    </TableRow>
                  ) : (
                    scheduledBookings?.map((booking) => (
                      <TableRow key={booking.bookingId}>
                        <TableCell className="font-mono text-xs">{booking.bookingId}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getBookingTypeIcon(booking.bookingType)}
                            <span>{booking.bookingType}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate" title={booking.purpose}>
                          {booking.purpose || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="font-medium">{booking.bookingDate || '-'}</span>
                            <span className="text-xs text-muted-foreground">{booking.bookingSlot || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {booking.sessionAmount ? formatCurrency(booking.sessionAmount) : '-'}
                        </TableCell>
                        <TableCell>
                          {booking.actualDuration
                            ? `${Math.floor(booking.actualDuration / 60)}m ${booking.actualDuration % 60}s`
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(booking.bookingStatus || 'pending')}>
                            {booking.bookingStatus || 'pending'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="default"
                            className="bg-green-100 text-green-800"
                          >
                            {booking.paymentStatus || 'paid'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(booking.bookingTimestamp || booking.timestamp)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!transactions?.length ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions?.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {tx.type === 'CREDIT' ? (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-500" />
                            )}
                            <span>{tx.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className={tx.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}>
                          {tx.type === 'CREDIT' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </TableCell>
                        <TableCell>{tx.description}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(tx.status)}>{tx.status}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(tx.timestamp)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs >
    </div >
  );
};

export default UserDetail;
