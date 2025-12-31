import React from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Users, Target, UserCheck, Calendar } from 'lucide-react';
import StatCard from '@/components/StatCard';
import BookingsChart from '@/components/BookingsChart';
import CanceledBookingsChart from '@/components/CanceledBookingsChart';
import RecentComplaintsTable from '@/components/RecentComplaintsTable';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard: React.FC = () => {
  const { data: stats, isLoading } = useDashboardStats();

  const statCards = [
    {
      title: 'Total Users',
      value: isLoading ? '...' : stats?.totalUsers || 0,
      percentage: stats ? Math.round((stats.totalUsers / 100) * 100) : 0,
      icon: Users,
      iconBgColor: 'bg-info-light text-info',
      progressColor: 'bg-info',
    },
    {
      title: 'Total Advisors',
      value: isLoading ? '...' : stats?.totalAdvisors || 0,
      percentage: stats ? Math.round((stats.totalAdvisors / 50) * 100) : 0,
      icon: UserCheck,
      iconBgColor: 'bg-chart-purple/10 text-chart-purple',
      progressColor: 'bg-chart-purple',
    },
    {
      title: 'Pending Approvals',
      value: isLoading ? '...' : stats?.pendingAdvisors || 0,
      percentage: stats?.totalAdvisors ? Math.round((stats.pendingAdvisors / stats.totalAdvisors) * 100) : 0,
      icon: Target,
      iconBgColor: 'bg-warning-light text-warning',
      progressColor: 'bg-warning',
    },
    {
      title: 'Total Bookings',
      value: isLoading ? '...' : stats?.totalBookings || 0,
      percentage: stats ? Math.round((stats.todayBookings / Math.max(stats.totalBookings, 1)) * 100) : 0,
      icon: Calendar,
      iconBgColor: 'bg-success-light text-success',
      progressColor: 'bg-success',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-down">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <Button className="gap-2 shadow-md hover-lift group">
          <FileDown className="h-4 w-4 transition-transform group-hover:scale-110" />
          Generate Report
        </Button>
      </div>

      {/* Stats Grid - Staggered Animation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <StatCard key={stat.title} {...stat} delay={index * 100} />
        ))}
      </div>

      {/* Charts Row - With Animation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 animate-slide-up stagger-3">
          <div className="hover-lift transition-all duration-300">
            <BookingsChart />
          </div>
        </div>
        <div className="animate-slide-up stagger-4">
          <div className="hover-lift transition-all duration-300">
            <CanceledBookingsChart />
          </div>
        </div>
      </div>

      {/* Recent Complaints Table */}
      <RecentComplaintsTable />
    </div>
  );
};

export default Dashboard;
