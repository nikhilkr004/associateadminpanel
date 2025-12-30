import React, { useState, useMemo } from 'react';
import { useComplaints } from '@/hooks/useComplaints';
import ComplaintCard from '@/components/ComplaintCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search, Filter, MessageSquareWarning } from 'lucide-react';
import { SupportTicket } from '@/services/complaintService';

const Complaints: React.FC = () => {
    const { data: tickets, isLoading, error } = useComplaints();
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Filter and search tickets
    const filteredTickets = useMemo(() => {
        if (!tickets) return [];

        return tickets.filter((ticket: SupportTicket) => {
            // Status filter
            if (statusFilter !== 'all' && ticket.status !== statusFilter) {
                return false;
            }

            // Priority filter
            if (priorityFilter !== 'all' && ticket.priority !== priorityFilter) {
                return false;
            }

            // Category filter
            if (categoryFilter !== 'all' && ticket.category !== categoryFilter) {
                return false;
            }

            // Search query
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return (
                    ticket.ticketId.toLowerCase().includes(query) ||
                    ticket.userName.toLowerCase().includes(query) ||
                    ticket.userEmail.toLowerCase().includes(query) ||
                    ticket.subject.toLowerCase().includes(query)
                );
            }

            return true;
        });
    }, [tickets, statusFilter, priorityFilter, categoryFilter, searchQuery]);

    // Get unique categories for filter
    const categories = useMemo(() => {
        if (!tickets) return [];
        const uniqueCategories = [...new Set(tickets.map((t: SupportTicket) => t.category))];
        return uniqueCategories;
    }, [tickets]);

    // Count tickets by status
    const statusCounts = useMemo(() => {
        if (!tickets) return { all: 0, open: 0, in_progress: 0, resolved: 0, closed: 0 };

        type StatusCounts = {
            all: number;
            open: number;
            in_progress: number;
            resolved: number;
            closed: number;
            [key: string]: number; // Add index signature to allow dynamic access
        };

        return tickets.reduce((acc: StatusCounts, ticket: SupportTicket) => {
            acc.all++;
            if (acc[ticket.status] !== undefined) {
                acc[ticket.status]++;
            }
            return acc;
        }, { all: 0, open: 0, in_progress: 0, resolved: 0, closed: 0 } as StatusCounts);
    }, [tickets]);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <MessageSquareWarning className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Support Tickets</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage and respond to advisor complaints
                        </p>
                    </div>
                </div>
            </div>

            {/* Status Tabs */}
            <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
                <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
                    <TabsTrigger value="all" className="gap-2">
                        All
                        <span className="hidden sm:inline-flex items-center justify-center w-5 h-5 text-xs bg-muted rounded-full">
                            {statusCounts.all}
                        </span>
                    </TabsTrigger>
                    <TabsTrigger value="open" className="gap-2">
                        Open
                        <span className="hidden sm:inline-flex items-center justify-center w-5 h-5 text-xs bg-orange-100 text-orange-700 rounded-full">
                            {statusCounts.open}
                        </span>
                    </TabsTrigger>
                    <TabsTrigger value="in_progress" className="gap-2">
                        In Progress
                        <span className="hidden sm:inline-flex items-center justify-center w-5 h-5 text-xs bg-blue-100 text-blue-700 rounded-full">
                            {statusCounts.in_progress}
                        </span>
                    </TabsTrigger>
                    <TabsTrigger value="resolved" className="gap-2">
                        Resolved
                        <span className="hidden sm:inline-flex items-center justify-center w-5 h-5 text-xs bg-green-100 text-green-700 rounded-full">
                            {statusCounts.resolved}
                        </span>
                    </TabsTrigger>
                    <TabsTrigger value="closed" className="gap-2">
                        Closed
                        <span className="hidden sm:inline-flex items-center justify-center w-5 h-5 text-xs bg-gray-100 text-gray-700 rounded-full">
                            {statusCounts.closed}
                        </span>
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Filters and Search */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="lg:col-span-2 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by ticket ID, name, or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Priority Filter */}
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            <SelectValue placeholder="Priority" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                </Select>

                {/* Category Filter */}
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            <SelectValue placeholder="Category" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                                {category}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Tickets Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="space-y-3 p-5 border rounded-lg">
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Error loading tickets. Please try again.</p>
                </div>
            ) : filteredTickets.length === 0 ? (
                <div className="text-center py-12">
                    <MessageSquareWarning className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No tickets found</h3>
                    <p className="text-muted-foreground">
                        {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all'
                            ? 'Try adjusting your filters or search query'
                            : 'No support tickets have been submitted yet'}
                    </p>
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Showing {filteredTickets.length} {filteredTickets.length === 1 ? 'ticket' : 'tickets'}
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTickets.map((ticket: SupportTicket) => (
                            <ComplaintCard key={ticket.id} ticket={ticket} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Complaints;
