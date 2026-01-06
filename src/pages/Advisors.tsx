import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdvisors } from '@/hooks/useAdvisors';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, UserCheck, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const Advisors: React.FC = () => {
  const navigate = useNavigate();
  const { data: advisors, isLoading, error } = useAdvisors();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredAdvisors = advisors?.filter((advisor) => {
    const matchesSearch =
      advisor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      advisor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      advisor.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || advisor.status === statusFilter;

    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-success/10 text-success border-success/20">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-warning/10 text-warning border-warning/20">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Error loading advisors: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Advisors</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isLoading ? 'Loading...' : `${advisors?.length || 0} total advisors`}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card border-border/50"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-36 bg-card border-border/50">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <Card className="border-border/40 rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Advisor</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Department</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Experience</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Rating</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  </TableRow>
                ))
              ) : filteredAdvisors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {searchTerm || statusFilter !== 'all'
                      ? 'No advisors found matching your criteria'
                      : 'No advisors found'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAdvisors.map((advisor) => (
                  <TableRow
                    key={advisor.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => navigate(`/dashboard/advisors/${advisor.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={advisor.profileImage} alt={advisor.name} />
                          <AvatarFallback>
                            {advisor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{advisor.name}</p>
                          <p className="text-sm text-muted-foreground">{advisor.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{advisor.designation}</p>
                        <p className="text-sm text-muted-foreground">{advisor.department}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">{advisor.experience} years</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-warning text-warning" />
                        <span className="font-medium">{advisor.rating.toFixed(1)}</span>
                        <span className="text-muted-foreground text-sm">
                          ({advisor.reviewCount})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(advisor.status)}</TableCell>
                    <TableCell>
                      <Badge variant={advisor.isActive ? 'default' : 'secondary'}>
                        {advisor.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Advisors;
