import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdvisorDetail } from '@/hooks/useAdvisorDetail';
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
    Briefcase
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

const AdvisorDetail: React.FC = () => {
    const { advisorId } = useParams<{ advisorId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { data: advisor, isLoading, error } = useAdvisorDetail(advisorId || '');
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
                <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 overflow-x-auto">
                    <TabsTrigger value="overview" className="gap-2"><User className="h-4 w-4" /> Overview</TabsTrigger>
                    <TabsTrigger value="professional" className="gap-2"><Briefcase className="h-4 w-4" /> Professional</TabsTrigger>
                    <TabsTrigger value="availability" className="gap-2"><Clock className="h-4 w-4" /> Availability</TabsTrigger>
                    <TabsTrigger value="documents" className="gap-2"><FileText className="h-4 w-4" /> Documents</TabsTrigger>
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
                                        <div>
                                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Active Days</span>
                                            <div className="flex flex-wrap gap-1">
                                                {advisor.availabilityInfo.virtualSchedule.activeDays?.map(day => (
                                                    <Badge key={day} variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">{day}</Badge>
                                                )) || <span className="text-sm text-muted-foreground">No days selected</span>}
                                            </div>
                                        </div>
                                        <div className="text-sm text-muted-foreground mt-2">
                                            Duration per slot: <span className="font-medium text-foreground">{advisor.availabilityInfo.virtualSchedule.duration} min</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-6 text-muted-foreground">No virtual schedule configured</div>
                                )}
                            </CardContent>
                        </Card>

                        {/* In-Person Schedule */}
                        <Card className="border-l-4 border-l-green-500">
                            <CardHeader>
                                <CardTitle className="text-green-700">In-Person Schedule</CardTitle>
                                <CardDescription>Availability for physical visits</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {advisor.availabilityInfo?.inPersonSchedule ? (
                                    <>
                                        <div className="flex justify-between items-center bg-green-50 p-3 rounded-md">
                                            <span className="flex items-center gap-2 text-sm font-medium text-green-900"><Clock className="h-4 w-4" /> Time Range</span>
                                            <span className="font-bold text-green-700">
                                                {advisor.availabilityInfo.inPersonSchedule.startTime} - {advisor.availabilityInfo.inPersonSchedule.endTime}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Active Days</span>
                                            <div className="flex flex-wrap gap-1">
                                                {advisor.availabilityInfo.inPersonSchedule.activeDays?.map(day => (
                                                    <Badge key={day} variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200">{day}</Badge>
                                                )) || <span className="text-sm text-muted-foreground">No days selected</span>}
                                            </div>
                                        </div>
                                        <div className="text-sm text-muted-foreground mt-2">
                                            Duration per slot: <span className="font-medium text-foreground">{advisor.availabilityInfo.inPersonSchedule.duration} min</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-6 text-muted-foreground">No in-person schedule configured</div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Pricing (Per Session/Min)</CardTitle>
                            <CardDescription>Advisor service rates</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between py-3 border-b">
                                <span className="text-muted-foreground flex items-center gap-2"><Phone className="h-4 w-4" /> Audio Call</span>
                                <div className="text-right">
                                    <div className="font-medium">₹{advisor.pricingInfo?.scheduledAudioFee || 0}/session</div>
                                    <div className="text-xs text-muted-foreground">₹{advisor.pricingInfo?.instantAudioFee || 0}/min (Instant)</div>
                                </div>
                            </div>
                            <div className="flex justify-between py-3 border-b">
                                <span className="text-muted-foreground flex items-center gap-2"><Briefcase className="h-4 w-4" /> Video Call</span>
                                <div className="text-right">
                                    <div className="font-medium">₹{advisor.pricingInfo?.scheduledVideoFee || 0}/session</div>
                                    <div className="text-xs text-muted-foreground">₹{advisor.pricingInfo?.instantVideoFee || 0}/min (Instant)</div>
                                </div>
                            </div>
                            <div className="flex justify-between py-3 border-b">
                                <span className="text-muted-foreground flex items-center gap-2"><Mail className="h-4 w-4" /> Chat</span>
                                <div className="text-right">
                                    <div className="font-medium">₹{advisor.pricingInfo?.scheduledChatFee || 0}/session</div>
                                    <div className="text-xs text-muted-foreground">₹{advisor.pricingInfo?.instantChatFee || 0}/min (Instant)</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
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
        </div>
    );
};

export default AdvisorDetail;
