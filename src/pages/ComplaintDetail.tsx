import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useComplaintDetail } from '@/hooks/useComplaintDetail';
import { updateTicketStatus, addAdminResponse, formatTimestamp } from '@/services/complaintService';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import StatusBadge from '@/components/StatusBadge';
import PriorityBadge from '@/components/PriorityBadge';
import {
    ArrowLeft,
    User,
    Mail,
    Calendar,
    MessageSquare,
    Image as ImageIcon,
    Send,
    CheckCircle2,
} from 'lucide-react';

const ComplaintDetail: React.FC = () => {
    const { ticketId } = useParams<{ ticketId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { data: ticket, isLoading, error } = useComplaintDetail(ticketId || '');

    const [newStatus, setNewStatus] = useState<string>('');
    const [responseMessage, setResponseMessage] = useState<string>('');
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isAddingResponse, setIsAddingResponse] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    React.useEffect(() => {
        if (ticket) {
            setNewStatus(ticket.status);
        }
    }, [ticket]);

    const handleStatusUpdate = async () => {
        if (!ticket || newStatus === ticket.status) return;

        setIsUpdatingStatus(true);
        try {
            await updateTicketStatus(ticket.id, newStatus as any);
            await queryClient.invalidateQueries({ queryKey: ['support-ticket', ticketId] });
            await queryClient.invalidateQueries({ queryKey: ['support-tickets'] });

            toast({
                title: 'Status Updated',
                description: `Ticket status changed to ${newStatus.replace('_', ' ')}`,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update ticket status',
                variant: 'destructive',
            });
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleAddResponse = async () => {
        if (!ticket || !responseMessage.trim()) return;

        setIsAddingResponse(true);
        try {
            await addAdminResponse(ticket.id, responseMessage.trim());
            await queryClient.invalidateQueries({ queryKey: ['support-ticket', ticketId] });
            await queryClient.invalidateQueries({ queryKey: ['support-tickets'] });

            setResponseMessage('');
            toast({
                title: 'Response Added',
                description: 'Your response has been sent successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to add response',
                variant: 'destructive',
            });
        } finally {
            setIsAddingResponse(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <Skeleton className="h-10 w-32" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-48 w-full" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-48 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !ticket) {
        return (
            <div className="space-y-6 animate-fade-in">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/dashboard/complaints')}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Complaints
                </Button>
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Ticket not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Back Button */}
            <Button
                variant="ghost"
                onClick={() => navigate('/dashboard/complaints')}
                className="gap-2"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Complaints
            </Button>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-2xl font-bold text-foreground">{ticket.subject}</h1>
                    </div>
                    <p className="text-sm text-muted-foreground">Ticket ID: #{ticket.ticketId}</p>
                </div>
                <div className="flex items-center gap-3">
                    <StatusBadge status={ticket.status} size="lg" />
                    <PriorityBadge priority={ticket.priority} size="lg" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Ticket Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Ticket Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Category</p>
                                <p className="text-base">{ticket.category}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                                <p className="text-base whitespace-pre-wrap">{ticket.description}</p>
                            </div>
                            {ticket.photoUrls && ticket.photoUrls.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-2">Attachments</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {ticket.photoUrls.map((url, index) => (
                                            <div
                                                key={index}
                                                className="relative aspect-square rounded-lg overflow-hidden border border-border cursor-pointer hover:opacity-80 transition-opacity"
                                                onClick={() => setSelectedImage(url)}
                                            >
                                                <img
                                                    src={url}
                                                    alt={`Attachment ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                                                    <ImageIcon className="h-6 w-6 text-white" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Responses Thread */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                Responses ({ticket.responses?.length || 0})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {ticket.responses && ticket.responses.length > 0 ? (
                                <div className="space-y-4">
                                    {ticket.responses.map((response) => (
                                        <div
                                            key={response.responseId}
                                            className={`p-4 rounded-lg border ${response.respondedBy === 'admin'
                                                    ? 'bg-primary/5 border-primary/20'
                                                    : 'bg-muted'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium">
                                                    {response.respondedBy === 'admin' ? 'Admin' : ticket.userName}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatTimestamp(response.respondedAt)}
                                                </span>
                                            </div>
                                            <p className="text-sm whitespace-pre-wrap">{response.message}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No responses yet
                                </p>
                            )}

                            {/* Add Response */}
                            <div className="pt-4 border-t space-y-3">
                                <Textarea
                                    placeholder="Type your response here..."
                                    value={responseMessage}
                                    onChange={(e) => setResponseMessage(e.target.value)}
                                    rows={4}
                                    className="resize-none"
                                />
                                <Button
                                    onClick={handleAddResponse}
                                    disabled={!responseMessage.trim() || isAddingResponse}
                                    className="w-full gap-2"
                                >
                                    <Send className="h-4 w-4" />
                                    {isAddingResponse ? 'Sending...' : 'Send Response'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* User Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                User Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Name</p>
                                <p className="font-medium">{ticket.userName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Email</p>
                                <p className="font-medium break-all">{ticket.userEmail}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">User Type</p>
                                <p className="font-medium capitalize">{ticket.userType}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Ticket Metadata */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Ticket Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Created</p>
                                <p className="text-sm">{formatTimestamp(ticket.createdAt)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
                                <p className="text-sm">{formatTimestamp(ticket.updatedAt)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Priority</p>
                                <PriorityBadge priority={ticket.priority} size="sm" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Status Management */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5" />
                                Update Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Select value={newStatus} onValueChange={setNewStatus}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                onClick={handleStatusUpdate}
                                disabled={newStatus === ticket.status || isUpdatingStatus}
                                className="w-full"
                            >
                                {isUpdatingStatus ? 'Updating...' : 'Update Status'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Image Lightbox */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-4xl max-h-full">
                        <img
                            src={selectedImage}
                            alt="Full size"
                            className="max-w-full max-h-[90vh] object-contain"
                        />
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-4 right-4"
                        >
                            Close
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComplaintDetail;
