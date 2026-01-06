import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Flag, FileText } from 'lucide-react';
import { useComplaints } from '@/hooks/useComplaints';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const RecentComplaintsTable: React.FC = () => {
  const navigate = useNavigate();
  const { data: complaints, isLoading } = useComplaints();

  const recentComplaints = complaints?.slice(0, 5) || [];

  const getTypeBadge = (category: string) => {
    const styles: Record<string, string> = {
      'Payment': 'bg-orange-100 text-orange-700',
      'Technical': 'bg-blue-100 text-blue-700',
      'Service': 'bg-purple-100 text-purple-700',
      'Other': 'bg-gray-100 text-gray-700',
    };
    return styles[category] || 'bg-blue-100 text-blue-700';
  };

  const getStatusIndicator = (status: string) => {
    const colors: Record<string, string> = {
      'resolved': 'bg-emerald-500',
      'closed': 'bg-emerald-500',
      'open': 'bg-yellow-500',
      'in_progress': 'bg-blue-500',
    };
    return colors[status] || 'bg-gray-400';
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl p-6 border border-border/40">
        <Skeleton className="h-6 w-40 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-6 border border-border/40">
      <h3 className="text-lg font-semibold text-foreground mb-6">
        Recent Activity
      </h3>

      {recentComplaints.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No recent activity
        </div>
      ) : (
        <div className="overflow-x-auto -mx-6">
          <div className="min-w-[800px] px-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Time
                  </th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    User
                  </th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Category
                  </th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-center py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentComplaints.map((complaint) => (
                  <tr
                    key={complaint.id}
                    className="border-b border-border/30 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => navigate(`/dashboard/complaints/${complaint.id}`)}
                  >
                    <td className="py-4 px-3">
                      <span className="text-sm text-muted-foreground">
                        {(() => {
                          const timestamp = complaint.createdAt;
                          const date = typeof timestamp === 'object' && 'toDate' in timestamp 
                            ? timestamp.toDate() 
                            : new Date(timestamp as unknown as string | number);
                          return date.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          });
                        })()}
                      </span>
                    </td>
                    <td className="py-4 px-3">
                      <span className="text-sm font-medium text-foreground">
                        {complaint.userName}
                      </span>
                    </td>
                    <td className="py-4 px-3">
                      <span className="text-sm text-foreground line-clamp-1 max-w-[200px]">
                        {complaint.subject}
                      </span>
                    </td>
                    <td className="py-4 px-3">
                      <span className={cn(
                        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                        getTypeBadge(complaint.category)
                      )}>
                        {complaint.category}
                      </span>
                    </td>
                    <td className="py-4 px-3">
                      <span className={cn(
                        'text-sm font-medium capitalize',
                        complaint.priority === 'high' && 'text-red-600',
                        complaint.priority === 'medium' && 'text-yellow-600',
                        complaint.priority === 'low' && 'text-green-600'
                      )}>
                        {complaint.priority}
                      </span>
                    </td>
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-2">
                        <span className={cn('h-2 w-2 rounded-full', getStatusIndicator(complaint.status))} />
                        <span className="text-sm text-foreground">
                          {formatStatus(complaint.status)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-3">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/dashboard/complaints/${complaint.id}`);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Flag className="h-4 w-4" />
                        </button>
                        <button 
                          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                      </div>
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
