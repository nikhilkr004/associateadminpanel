import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoreVertical, ChevronDown, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useComplaints } from '@/hooks/useComplaints';
import { formatTimestamp, SupportTicket } from '@/services/complaintService';
import { Skeleton } from '@/components/ui/skeleton';
import StatusBadge from '@/components/StatusBadge';
import PriorityBadge from '@/components/PriorityBadge';

const RecentComplaintsTable: React.FC = () => {
  const navigate = useNavigate();
  const { data: complaints, isLoading } = useComplaints();

  const recentComplaints = complaints?.slice(0, 5) || [];

  const getStatusIcon = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4 text-error" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'resolved':
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      default:
        return null;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPriorityColor = (priority: SupportTicket['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-error/10 text-error';
      case 'medium':
        return 'bg-warning/10 text-warning';
      case 'low':
        return 'bg-success/10 text-success';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl p-6 shadow-card border border-border/50 animate-slide-up stagger-5">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-6 shadow-card border border-border/50 animate-slide-up stagger-5 hover-lift">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Recent Complaints</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1 text-muted-foreground hover:text-primary transition-colors"
          onClick={() => navigate('/dashboard/complaints')}
        >
          View All
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      {recentComplaints.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No complaints found
        </div>
      ) : (
        <div className="overflow-x-auto -mx-6">
          <div className="min-w-[700px] px-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    User
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Subject
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Category
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Priority
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentComplaints.map((complaint, index) => (
                  <tr
                    key={complaint.id}
                    className="border-b border-border/50 hover:bg-secondary/50 transition-all duration-200 cursor-pointer group"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => navigate(`/dashboard/complaints/${complaint.id}`)}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 transition-transform duration-200 group-hover:scale-105">
                          <AvatarFallback className={getPriorityColor(complaint.priority)}>
                            {getInitials(complaint.userName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="font-medium text-foreground block">{complaint.userName}</span>
                          <span className="text-xs text-muted-foreground">{complaint.userEmail}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-foreground line-clamp-1">{complaint.subject}</span>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">{complaint.category}</td>
                    <td className="py-4 px-4">
                      <StatusBadge status={complaint.status} size="sm" />
                    </td>
                    <td className="py-4 px-4">
                      <PriorityBadge priority={complaint.priority} size="sm" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/dashboard/complaints/${complaint.id}`)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-error">Mark Resolved</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentComplaintsTable;
