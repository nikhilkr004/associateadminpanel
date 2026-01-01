import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdvisorDetail } from '@/hooks/useAdvisorDetail';
import { useAdvisorReviews } from '@/hooks/useAdvisorReviews';
import { useAdvisorTransactions } from '@/hooks/useAdvisorTransactions';
import { updateAdvisorStatus } from '@/services/firestoreService';
import {
    ArrowLeft,
    Calendar,
    CheckCircle,
    FileText,
    Mail,
    MapPin,
    Phone,
    Shield,
    Star,
    User,
    ExternalLink,
    Download,
    Clock,
    Briefcase,
    MessageSquare,
    CreditCard,
    Video,
    Mic,
    Activity,
    Settings,
    DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { format } from 'date-fns';

const AdvisorDetail: React.FC = () => {
    const { advisorId } = useParams<{ advisorId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { data: advisor, isLoading, error } = useAdvisorDetail(advisorId || '');
    const { data: reviews, isLoading: isLoadingReviews } = useAdvisorReviews(advisorId || '');
    const { data: transactions, isLoading: isLoadingTransactions } = useAdvisorTransactions(advisorId || '');
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStatusChange = async (newStatus: string) => {
        if (!advisorId) return;

        setIsUpdating(true);
        try {
            await updateAdvisorStatus(advisorId, newStatus);
            await queryClient.invalidateQueries({ queryKey: ['advisor', advisorId] });
            await queryClient.invalidateQueries({ queryKey: ['advisors'] });

            toast({
                title: 'Status Updated',
                description: `Advisor status has been changed to ${newStatus}.`,
            });
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to update advisor status.',
                variant: 'destructive',
            });
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-8 w-48" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-64 col-span-1" />
                    <Skeleton className="h-64 col-span-2" />
                </div>
            </div>
        );
    }

    if (error || !advisor) {
        return (
            <div className="container mx-auto p-6 text-center">
                <h2 className="text-2xl font-bold text-destructive">Error Loading Profile</h2>
                <p className="text-muted-foreground mb-4">Could not load advisor details.</p>
                <Button onClick={() => navigate('/dashboard/advisors')}>Back to Advisors</Button>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-700 border-green-200';
            case 'approved': return 'bg-green-100 text-green-700 border-green-200';
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
            case 'suspended': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-6 space-y-6 animate-fade-in">
            {/* Header & Navigation */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate('/dashboard/advisors')} className="gap-2 pl-0 hover:pl-2 transition-all">
                    <ArrowLeft className="h-4 w-4" />
                    Back to list
                </Button>

                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button disabled={isUpdating} variant={isUpdating ? "outline" : "default"}>
                                {isUpdating ? 'Updating...' : 'Update Status'}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleStatusChange('active')}>
                                Set Active / Approved
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange('pending')}>
                                Set Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange('rejected')} className="text-destructive">
                                Reject Application
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange('suspended')} className="text-destructive">
                                Suspend Account
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Profile Header Card */}
            <Card className="border-none shadow-md bg-gradient-to-r from-card to-secondary/10">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                        <Avatar className="h-24 w-24 border-4 border-background shadow-sm">
                            <AvatarImage src={advisor.basicInfo.profileImage} />
                            <AvatarFallback className="text-2xl">
                                {advisor.basicInfo.name?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-2">
                            <div className="flex flex-col md:flex-row md:items-center gap-3">
                                <h1 className="text-3xl font-bold">{advisor.basicInfo.name}</h1>
                                <Badge variant="outline" className={`${getStatusColor(advisor.basicInfo.status)} capitalize px-3 py-1`}>
                                    {advisor.basicInfo.status || 'Unknown'}
                                </Badge>
                            </div>

                            <div className="flex flex-wrap gap-4 text-muted-foreground text-sm">
                                <div className="flex items-center gap-1">
                                    <Mail className="h-4 w-4" />
                                    {advisor.basicInfo.email}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Phone className="h-4 w-4" />
                                    {advisor.basicInfo.phoneNumber}
                                </div>
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {advisor.basicInfo.city}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 min-w-[120px] bg-background/50 p-3 rounded-xl border border-border/50">
                            <div className="flex items-center gap-1 text-yellow-500">
                                <Star className="h-5 w-5 fill-current" />
                                <span className="text-xl font-bold">{advisor.performanceInfo?.rating?.toFixed(1) || '0.0'}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{advisor.performanceInfo?.reviewCount || 0} Reviews</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 overflow-x-auto flex-wrap">
                    <TabsTrigger value="overview" className="gap-2"><User className="h-4 w-4" /> Overview</TabsTrigger>
                    <TabsTrigger value="reviews" className="gap-2"><Star className="h-4 w-4" /> Reviews ({reviews?.length || 0})</TabsTrigger>
                    <TabsTrigger value="transactions" className="gap-2"><CreditCard className="h-4 w-4" /> Transactions ({transactions?.length || 0})</TabsTrigger>
                    <TabsTrigger value="professional" className="gap-2"><Briefcase className="h-4 w-4" /> Professional</TabsTrigger>
                    <TabsTrigger value="availability" className="gap-2"><Clock className="h-4 w-4" /> Availability</TabsTrigger>
                    <TabsTrigger value="documents" className="gap-2"><FileText className="h-4 w-4" /> Documents</TabsTrigger>
                    <TabsTrigger value="activity" className="gap-2"><Activity className="h-4 w-4" /> Activity & System</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Stats & Performance</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-primary/5 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-primary">{advisor.performanceInfo?.totalStudentsAdvised || 0}</div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Students Advised</div>
                                    </div>
                                    <div className="p-4 bg-green-500/5 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {advisor.earningsInfo?.totalLifetimeEarnings ? `₹${advisor.earningsInfo.totalLifetimeEarnings}` : '₹0'}
                                        </div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Lifetime Earnings</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">About</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-semibold mb-2">Bio</h4>
                                    <p className="text-muted-foreground leading-relaxed text-sm">
                                        {advisor.professionalInfo?.bio || 'No bio provided.'}
                                    </p>
                                </div>

                                {advisor.professionalInfo?.languages && advisor.professionalInfo.languages.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold mb-2">Languages</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {advisor.professionalInfo.languages.map(lang => (
                                                <Badge key={lang} variant="secondary" className="px-2 py-0.5">{lang}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {advisor.professionalInfo?.specializations && advisor.professionalInfo.specializations.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold mb-2">Specializations</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {advisor.professionalInfo.specializations.map(spec => (
                                                <Badge key={spec} variant="outline" className="px-2 py-0.5 border-primary/20 text-primary">{spec}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Reviews Tab */}
                <TabsContent value="reviews" className="space-y-6 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Star className="h-5 w-5 text-yellow-500" />
                                User Reviews
                            </CardTitle>
                            <CardDescription>All feedback received from users</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoadingReviews ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex gap-4 p-4 border rounded-lg animate-pulse">
                                            <Skeleton className="h-12 w-12 rounded-full" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 w-32" />
                                                <Skeleton className="h-3 w-20" />
                                                <Skeleton className="h-4 w-full" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : reviews && reviews.length > 0 ? (
                                <div className="space-y-4">
                                    {reviews.map((review, index) => (
                                        <div
                                            key={review.id}
                                            className="flex gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-all duration-300 animate-fade-in"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <Avatar className="h-12 w-12 border-2 border-background shadow">
                                                <AvatarImage src={review.reviewerImage} />
                                                <AvatarFallback className="bg-primary/10 text-primary">
                                                    {review.reviewerName?.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                                    <h4 className="font-semibold">{review.reviewerName}</h4>
                                                    <div className="flex items-center gap-1 text-yellow-500">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'opacity-30'}`}
                                                            />
                                                        ))}
                                                        <span className="ml-1 text-sm font-medium text-foreground">{review.rating}/5</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                    <Badge variant="outline" className="text-xs capitalize">{review.bookingType}</Badge>
                                                    {review.createdAt && (
                                                        <span>{format(review.createdAt.toDate(), 'MMM dd, yyyy')}</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{review.comment || 'No comment provided.'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/10">
                                    <Star className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                                    <p className="text-muted-foreground font-medium">No reviews yet</p>
                                    <p className="text-xs text-muted-foreground mt-1">Reviews will appear here once users leave feedback.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Transactions Tab */}
                <TabsContent value="transactions" className="space-y-6 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-green-500" />
                                Transaction History
                            </CardTitle>
                            <CardDescription>All bookings and payments for this advisor</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoadingTransactions ? (
                                <div className="space-y-3">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="flex items-center gap-4 p-3 animate-pulse">
                                            <Skeleton className="h-10 w-10 rounded" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 w-40" />
                                                <Skeleton className="h-3 w-24" />
                                            </div>
                                            <Skeleton className="h-4 w-16" />
                                        </div>
                                    ))}
                                </div>
                            ) : transactions && transactions.length > 0 ? (
                                <div className="rounded-md border overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/30">
                                                <TableHead>User</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Service</TableHead>
                                                <TableHead className="text-center">Duration</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Details</TableHead>
                                                <TableHead>Date</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {transactions.map((tx, index) => (
                                                <TableRow
                                                    key={tx.id}
                                                    className="hover:bg-muted/20 transition-colors animate-fade-in"
                                                    style={{ animationDelay: `${index * 30}ms` }}
                                                >
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarImage src={tx.userImage} />
                                                                <AvatarFallback className="text-xs bg-primary/10">
                                                                    {tx.userName?.substring(0, 2).toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span className="font-medium text-sm">{tx.userName}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={tx.type === 'instant' ? 'default' : 'secondary'}
                                                            className={tx.type === 'instant' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}
                                                        >
                                                            {tx.type === 'instant' ? 'Instant' : 'Scheduled'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1.5">
                                                            {tx.serviceType?.toLowerCase().includes('video') && <Video className="h-4 w-4 text-blue-500" />}
                                                            {tx.serviceType?.toLowerCase().includes('audio') && <Mic className="h-4 w-4 text-green-500" />}
                                                            {tx.serviceType?.toLowerCase().includes('chat') && <MessageSquare className="h-4 w-4 text-purple-500" />}
                                                            <span className="capitalize text-sm">{tx.serviceType}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {tx.duration ? (
                                                            <span className="text-sm font-mono text-muted-foreground">
                                                                {Math.floor(tx.duration / 60)}m {tx.duration % 60}s
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted-foreground">-</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-semibold text-green-600">₹{tx.amount}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                tx.status === 'completed' ? 'border-green-300 bg-green-50 text-green-700' :
                                                                    tx.status === 'cancelled' ? 'border-red-300 bg-red-50 text-red-700' :
                                                                        tx.status === 'pending' ? 'border-yellow-300 bg-yellow-50 text-yellow-700' :
                                                                            'border-gray-300 bg-gray-50 text-gray-700'
                                                            }
                                                        >
                                                            {tx.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col gap-0.5 text-xs">
                                                            {tx.bookingId && (
                                                                <span className="text-muted-foreground/60">ID: {tx.bookingId.substring(0, 8)}...</span>
                                                            )}
                                                            {tx.completedBy && (
                                                                <span className="text-muted-foreground">By: {tx.completedBy}</span>
                                                            )}
                                                            {tx.endReason && (
                                                                <span className="max-w-[150px] truncate" title={tx.endReason}>Reas.: {tx.endReason}</span>
                                                            )}
                                                            {!tx.bookingId && !tx.completedBy && !tx.endReason && <span className="text-muted-foreground">-</span>}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {tx.createdAt ? format(tx.createdAt.toDate(), 'MMM dd, yyyy HH:mm') : 'N/A'}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/10">
                                    <CreditCard className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                                    <p className="text-muted-foreground font-medium">No transactions yet</p>
                                    <p className="text-xs text-muted-foreground mt-1">Booking transactions will appear here.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Professional Tab */}
                <TabsContent value="professional" className="space-y-6 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Professional Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div>
                                <span className="text-sm text-muted-foreground block mb-1">Designation</span>
                                <span className="font-medium text-base">{advisor.professionalInfo?.designation || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-sm text-muted-foreground block mb-1">Department</span>
                                <span className="font-medium text-base">{advisor.professionalInfo?.department || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-sm text-muted-foreground block mb-1">Total Experience</span>
                                <span className="font-medium text-base">{advisor.professionalInfo?.experience ? `${advisor.professionalInfo.experience} Years` : 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-sm text-muted-foreground block mb-1">Office Location</span>
                                <span className="font-medium text-base">{advisor.professionalInfo?.officeLocation || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-sm text-muted-foreground block mb-1">Employee ID</span>
                                <span className="font-medium text-base">{advisor.professionalInfo?.employeeId || 'N/A'}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Education</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-start gap-4 p-4 border rounded-lg bg-card/50">
                                <div className="p-3 bg-primary/10 rounded-lg">
                                    <FileText className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-lg">
                                        {advisor.educationInfo?.highestQualification || 'Qualification'}
                                        {advisor.educationInfo?.qualificationField ? ` in ${advisor.educationInfo.qualificationField}` : ''}
                                    </h4>
                                    <p className="text-muted-foreground">{advisor.educationInfo?.university || 'University not specified'}</p>

                                    {advisor.educationInfo?.highestQualificationUrl && (
                                        <a
                                            href={advisor.educationInfo.highestQualificationUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-primary hover:underline bg-primary/5 px-3 py-1.5 rounded-md transition-colors"
                                        >
                                            View Degree Certificate <ExternalLink className="h-3 w-3" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Availability Tab */}
                <TabsContent value="availability" className="space-y-6 mt-6">
                    {/* Availability Flags */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Service Availability</CardTitle>
                                <CardDescription>Services enabled for this advisor</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h4 className="text-sm font-semibold mb-3">Instant Services</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {advisor.availabilityInfo?.instantAvailability?.isChatEnabled && <Badge variant="secondary">Instant Chat</Badge>}
                                        {advisor.availabilityInfo?.instantAvailability?.isAudioCallEnabled && <Badge variant="secondary">Instant Audio</Badge>}
                                        {advisor.availabilityInfo?.instantAvailability?.isVideoCallEnabled && <Badge variant="secondary">Instant Video</Badge>}
                                        {!advisor.availabilityInfo?.instantAvailability?.isChatEnabled &&
                                            !advisor.availabilityInfo?.instantAvailability?.isAudioCallEnabled &&
                                            !advisor.availabilityInfo?.instantAvailability?.isVideoCallEnabled &&
                                            <span className="text-sm text-muted-foreground">No instant services enabled</span>}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold mb-3">Scheduled Services</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {advisor.availabilityInfo?.scheduledAvailability?.isChatEnabled && <Badge variant="outline">Chat</Badge>}
                                        {advisor.availabilityInfo?.scheduledAvailability?.isAudioCallEnabled && <Badge variant="outline">Audio Call</Badge>}
                                        {advisor.availabilityInfo?.scheduledAvailability?.isVideoCallEnabled && <Badge variant="outline">Video Call</Badge>}
                                        {advisor.availabilityInfo?.scheduledAvailability?.isInPersonEnabled && <Badge variant="outline">In-Person</Badge>}
                                        {advisor.availabilityInfo?.scheduledAvailability?.isOfficeVisitEnabled && <Badge variant="outline">Office Visit</Badge>}
                                        {!advisor.availabilityInfo?.scheduledAvailability?.isChatEnabled &&
                                            !advisor.availabilityInfo?.scheduledAvailability?.isAudioCallEnabled &&
                                            !advisor.availabilityInfo?.scheduledAvailability?.isVideoCallEnabled &&
                                            !advisor.availabilityInfo?.scheduledAvailability?.isInPersonEnabled &&
                                            !advisor.availabilityInfo?.scheduledAvailability?.isOfficeVisitEnabled &&
                                            <span className="text-sm text-muted-foreground">No scheduled services enabled</span>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>General Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-muted-foreground">Working Days</span>
                                    <span className="font-medium text-right">{advisor.availabilityInfo?.workingDays?.join(', ') || 'None set'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-muted-foreground">General Hours</span>
                                    <span className="font-medium">
                                        {advisor.availabilityInfo?.workingHoursStart && advisor.availabilityInfo?.workingHoursEnd
                                            ? `${advisor.availabilityInfo.workingHoursStart} - ${advisor.availabilityInfo.workingHoursEnd}`
                                            : 'Not set'}
                                    </span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-muted-foreground">Max Daily Appointments</span>
                                    <span className="font-medium">{advisor.availabilityInfo?.maxDailyAppointments || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-muted-foreground">Slot Duration</span>
                                    <span className="font-medium">{advisor.availabilityInfo?.appointmentDuration ? `${advisor.availabilityInfo.appointmentDuration} min` : 'N/A'}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Schedule Slots */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Virtual Schedule */}
                        <Card className="border-l-4 border-l-blue-500">
                            <CardHeader>
                                <CardTitle className="text-blue-700">Virtual Schedule</CardTitle>
                                <CardDescription>Availability for online sessions</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {advisor.availabilityInfo?.virtualSchedule ? (
                                    <>
                                        <div className="flex justify-between items-center bg-blue-50 p-3 rounded-md">
                                            <span className="flex items-center gap-2 text-sm font-medium text-blue-900"><Clock className="h-4 w-4" /> Time Range</span>
                                            <span className="font-bold text-blue-700">
                                                {advisor.availabilityInfo.virtualSchedule.startTime} - {advisor.availabilityInfo.virtualSchedule.endTime}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-sm font-medium text-muted-foreground">Active Days</span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {advisor.availabilityInfo.virtualSchedule.activeDays && advisor.availabilityInfo.virtualSchedule.activeDays.length > 0
                                                    ? advisor.availabilityInfo.virtualSchedule.activeDays.map(day => (
                                                        <Badge key={day} variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-none">{day.substring(0, 3)}</Badge>
                                                    ))
                                                    : <span className="text-sm text-muted-foreground">No active days</span>}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-muted-foreground italic">No virtual schedule configured.</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* In-Person Schedule */}
                        <Card className="border-l-4 border-l-purple-500">
                            <CardHeader>
                                <CardTitle className="text-purple-700">In-Person Schedule</CardTitle>
                                <CardDescription>Availability for physical visits</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {advisor.availabilityInfo?.inPersonSchedule ? (
                                    <>
                                        <div className="flex justify-between items-center bg-purple-50 p-3 rounded-md">
                                            <span className="flex items-center gap-2 text-sm font-medium text-purple-900"><MapPin className="h-4 w-4" /> Time Range</span>
                                            <span className="font-bold text-purple-700">
                                                {advisor.availabilityInfo.inPersonSchedule.startTime} - {advisor.availabilityInfo.inPersonSchedule.endTime}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-sm font-medium text-muted-foreground">Active Days</span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {advisor.availabilityInfo.inPersonSchedule.activeDays && advisor.availabilityInfo.inPersonSchedule.activeDays.length > 0
                                                    ? advisor.availabilityInfo.inPersonSchedule.activeDays.map(day => (
                                                        <Badge key={day} variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-none">{day.substring(0, 3)}</Badge>
                                                    ))
                                                    : <span className="text-sm text-muted-foreground">No active days</span>}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-muted-foreground italic">No in-person schedule configured.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent value="documents" className="space-y-6 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Uploaded Documents</CardTitle>
                            <CardDescription>Verify advisor qualification and identity documents here.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {advisor.resources?.documentUrls && Object.keys(advisor.resources.documentUrls).length > 0 ? (
                                    Object.entries(advisor.resources.documentUrls).map(([name, url]) => (
                                        <a
                                            key={name}
                                            href={url as string}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors group bg-card"
                                        >
                                            <div className="p-2 bg-primary/10 text-primary rounded mr-3">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate capitalize text-sm">{name.replace(/([A-Z])/g, ' $1').trim()}</p>
                                                <p className="text-xs text-muted-foreground group-hover:text-primary transition-colors">Click to view document</p>
                                            </div>
                                            <ExternalLink className="h-4 w-4 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
                                        </a>
                                    ))
                                ) : (
                                    <div className="col-span-full py-12 text-center border-2 border-dashed rounded-lg bg-muted/10">
                                        <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                                        <p className="text-muted-foreground font-medium">No documents uploaded yet.</p>
                                        <p className="text-xs text-muted-foreground mt-1">Uploaded documents will appear here.</p>
                                    </div>
                                )}
                            </div>

                            {/* Specialization Certificates Section */}
                            <div className="mt-8">
                                <h3 className="text-lg font-semibold mb-4">Specialization Certificates</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {advisor.professionalInfo?.specializationUrls && Object.keys(advisor.professionalInfo.specializationUrls).length > 0 ? (
                                        Object.entries(advisor.professionalInfo.specializationUrls).map(([name, url]) => (
                                            <a
                                                key={name}
                                                href={url as string}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors group bg-card"
                                            >
                                                <div className="p-2 bg-blue-50 text-blue-600 rounded mr-3">
                                                    <Shield className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate capitalize text-sm">{name} Certificate</p>
                                                    <p className="text-xs text-muted-foreground group-hover:text-primary transition-colors">Click to view</p>
                                                </div>
                                                <ExternalLink className="h-4 w-4 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
                                            </a>
                                        ))
                                    ) : (
                                        <div className="col-span-full py-8 text-center border-2 border-dashed rounded-lg bg-muted/5">
                                            <Shield className="h-6 w-6 text-muted-foreground mx-auto mb-2 opacity-50" />
                                            <p className="text-muted-foreground text-sm">No specialization certificates found.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            {/* Activity & System Tab */}
            <TabsContent value="activity" className="space-y-6 mt-6">
                {/* Financial Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-green-600" />
                            Detailed Financial Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 border rounded-lg bg-card">
                                <span className="text-xs text-muted-foreground uppercase">Today's Earnings</span>
                                <div className="text-2xl font-bold mt-1">₹{advisor.earningsInfo?.todayEarnings || 0}</div>
                            </div>
                            <div className="p-4 border rounded-lg bg-card">
                                <span className="text-xs text-muted-foreground uppercase">This Week</span>
                                <div className="text-2xl font-bold mt-1">₹{advisor.earningsInfo?.thisWeekEarnings || 0}</div>
                            </div>
                            <div className="p-4 border rounded-lg bg-card">
                                <span className="text-xs text-muted-foreground uppercase">This Month</span>
                                <div className="text-2xl font-bold mt-1">₹{advisor.earningsInfo?.thisMonthEarnings || 0}</div>
                            </div>
                            <div className="p-4 border rounded-lg bg-muted/30">
                                <span className="text-xs text-muted-foreground uppercase">Pending Balance</span>
                                <div className="text-2xl font-bold mt-1 text-primary">₹{advisor.earningsInfo?.pendingBalance || 0}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* System Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                System & Access Control
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-muted-foreground">User Role</span>
                                <Badge variant="outline" className="uppercase">{advisor.systemInfo?.userRole || 'Advisor'}</Badge>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-muted-foreground">Access Level</span>
                                <Badge variant="secondary">{advisor.systemInfo?.accessLevel || 'Standard'}</Badge>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-muted-foreground">Generate Reports</span>
                                {advisor.systemInfo?.canGenerateReports ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                    <div className="h-5 w-5 rounded-full border border-muted-foreground/30" />
                                )}
                            </div>
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-muted-foreground">Manage Resources</span>
                                {advisor.systemInfo?.canManageResources ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                    <div className="h-5 w-5 rounded-full border border-muted-foreground/30" />
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact & Activity Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Activity & Contact
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Response Time</span>
                                <span className="font-medium">{advisor.contactPreferences?.responseTime || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Preferred Contact</span>
                                <span className="font-medium capitalize">{advisor.contactPreferences?.preferredContactMethod || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Total Sessions</span>
                                <span className="font-medium">{transactions?.length || 0}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Last Login</span>
                                <span className="font-medium text-sm">
                                    {advisor.timeInfo?.lastLogin ? format(advisor.timeInfo.lastLogin.toDate(), 'PP p') : 'Never'}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Timestamps */}
                <Card className="bg-muted/10">
                    <CardContent className="p-4 flex flex-wrap gap-6 justify-center text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Joined: {advisor.timeInfo?.createdAt ? format(advisor.timeInfo.createdAt.toDate(), 'PPP') : 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>Updated: {advisor.timeInfo?.updatedAt ? format(advisor.timeInfo.updatedAt.toDate(), 'PPP') : 'N/A'}</span>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </div >
    );
};

export default AdvisorDetail;
