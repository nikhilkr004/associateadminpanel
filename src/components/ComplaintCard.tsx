import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SupportTicket, formatTimestamp } from '@/services/complaintService';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { Card, CardContent } from '@/components/ui/card';
import {
    User,
    Mail,
    Clock,
    MessageSquare,
    AlertCircle,
    DollarSign,
    Bug,
    HelpCircle,
    Calendar
} from 'lucide-react';

interface ComplaintCardProps {
    ticket: SupportTicket;
}

const categoryIcons: Record<string, React.ReactNode> = {
    'Payment Issues': <DollarSign className="h-5 w-5 text-orange-500" />,
    'Technical Problems': <Bug className="h-5 w-5 text-red-500" />,
    'Account Help': <User className="h-5 w-5 text-blue-500" />,
    'Booking Issues': <Calendar className="h-5 w-5 text-purple-500" />,
    'General Inquiry': <HelpCircle className="h-5 w-5 text-gray-500" />,
};

const ComplaintCard: React.FC<ComplaintCardProps> = ({ ticket }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/dashboard/complaints/${ticket.id}`);
    };

    return (
        <Card
            className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] hover:border-primary/50"
            onClick={handleClick}
        >
            <CardContent className="p-5">
                {/* Header: Status and Priority */}
                <div className="flex items-center justify-between mb-4">
                    <StatusBadge status={ticket.status} size="sm" />
                    <PriorityBadge priority={ticket.priority} size="sm" />
                </div>

                {/* Category Icon and Ticket ID */}
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-muted rounded-lg">
                        {categoryIcons[ticket.category] || categoryIcons['General Inquiry']}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">#{ticket.ticketId}</p>
                        <h3 className="font-semibold text-foreground truncate">{ticket.subject}</h3>
                    </div>
                </div>

                {/* Category */}
                <div className="mb-3">
                    <span className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-md">
                        <AlertCircle className="h-3 w-3" />
                        {ticket.category}
                    </span>
                </div>

                {/* User Info */}
                <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span className="truncate">{ticket.userName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{ticket.userEmail}</span>
                    </div>
                </div>

                {/* Footer: Created Time and Responses Count */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimestamp(ticket.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageSquare className="h-3 w-3" />
                        <span>{ticket.responses?.length || 0} {ticket.responses?.length === 1 ? 'reply' : 'replies'}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ComplaintCard;
