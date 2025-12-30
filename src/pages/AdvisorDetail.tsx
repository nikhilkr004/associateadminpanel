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
                            <CardContent>
                                <p className="text-muted-foreground leading-relaxed">
                                    {advisor.professionalInfo?.bio || 'No bio provided.'}
                                </p>
                                <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                                    {advisor.professionalInfo?.languages?.map(lang => (
                                        <Badge key={lang} variant="secondary">{lang}</Badge>
                                    ))}
                                </div>
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
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <div>
                                <span className="text-sm text-muted-foreground block">Designation</span>
                                <span className="font-medium">{advisor.professionalInfo?.designation}</span>
                            </div>
                            <div>
                                <span className="text-sm text-muted-foreground block">Department</span>
                                <span className="font-medium">{advisor.professionalInfo?.department}</span>
                            </div>
                            <div>
                                <span className="text-sm text-muted-foreground block">Total Experience</span>
                                <span className="font-medium">{advisor.professionalInfo?.experience} Years</span>
                            </div>
                            <div>
                                <span className="text-sm text-muted-foreground block">Office Location</span>
                                <span className="font-medium">{advisor.professionalInfo?.officeLocation}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Education</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-muted rounded-lg">
                                    <FileText className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-lg">{advisor.educationInfo?.highestQualification} in {advisor.educationInfo?.qualificationField}</h4>
                                    <p className="text-muted-foreground">{advisor.educationInfo?.university}</p>
                                    {advisor.educationInfo?.highestQualificationUrl && (
                                        <a href={advisor.educationInfo.highestQualificationUrl} target="_blank" rel="noreferrer" className="text-primary text-sm hover:underline flex items-center gap-1 mt-2">
                                            View Certificate <ExternalLink className="h-3 w-3" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Availability Tab */}
                <TabsContent value="availability" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Availability Settings</CardTitle>
                                <CardDescription>Scheduled working hours and days</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-muted-foreground">Working Days</span>
                                    <span className="font-medium text-right">{advisor.availabilityInfo?.workingDays?.join(', ')}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-muted-foreground">Hours</span>
                                    <span className="font-medium">{advisor.availabilityInfo?.workingHoursStart} - {advisor.availabilityInfo?.workingHoursEnd}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Pricing (Per Session/Min)</CardTitle>
                                <CardDescription>Advisor service rates</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-muted-foreground flex items-center gap-2"><Phone className="h-4 w-4" /> Audio Call</span>
                                    <div className="text-right">
                                        <div className="font-medium">₹{advisor.pricingInfo?.scheduledAudioFee}/session</div>
                                        <div className="text-xs text-muted-foreground">₹{advisor.pricingInfo?.instantAudioFee}/min (Instant)</div>
                                    </div>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-muted-foreground flex items-center gap-2"><Briefcase className="h-4 w-4" /> Video Call</span>
                                    <div className="text-right">
                                        <div className="font-medium">₹{advisor.pricingInfo?.scheduledVideoFee}/session</div>
                                        <div className="text-xs text-muted-foreground">₹{advisor.pricingInfo?.instantVideoFee}/min (Instant)</div>
                                    </div>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-muted-foreground flex items-center gap-2"><Mail className="h-4 w-4" /> Chat</span>
                                    <div className="text-right">
                                        <div className="font-medium">₹{advisor.pricingInfo?.scheduledChatFee}/session</div>
                                        <div className="text-xs text-muted-foreground">₹{advisor.pricingInfo?.instantChatFee}/min (Instant)</div>
                                    </div>
                                </div>
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
                                {advisor.resources?.documentUrls && Object.entries(advisor.resources.documentUrls).map(([name, url]) => (
                                    <a
                                        key={name}
                                        href={url as string}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors group"
                                    >
                                        <div className="p-2 bg-primary/10 text-primary rounded mr-3">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate capitalize">{name.replace(/([A-Z])/g, ' $1').trim()}</p>
                                            <p className="text-xs text-muted-foreground">Click to view</p>
                                        </div>
                                        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                ))}

                                {/* Fallback if no documents often happens in dev */}
                                {(!advisor.resources?.documentUrls || Object.keys(advisor.resources.documentUrls).length === 0) && (
                                    <div className="col-span-full py-8 text-center text-muted-foreground">
                                        No documents uploaded.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>
        </div>
    );
};

export default AdvisorDetail;
