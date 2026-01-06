import React from 'react';
import { Users, UserCheck, Calendar, IndianRupee } from 'lucide-react';
import StatCard from '@/components/StatCard';
import BookingsChart from '@/components/BookingsChart';
import CanceledBookingsChart from '@/components/CanceledBookingsChart';
import RecentComplaintsTable from '@/components/RecentComplaintsTable';
import { useDashboardStats } from '@/hooks/useDashboardStats';

const formatCurrency = (value: number) => {
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  } else if (value >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`;
  }
  return `₹${value.toFixed(0)}`;
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('en-IN').format(value);
};

const Dashboard: React.FC = () => {
  const { data: stats, isLoading } = useDashboardStats();

  const statCards = [
    {
      title: 'Total Users',
      value: isLoading ? '...' : formatNumber(stats?.totalUsers || 0),
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: Users,
      iconBgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Active Advisors',
      value: isLoading ? '...' : formatNumber(stats?.totalAdvisors || 0),
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: UserCheck,
      iconBgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      title: "Today's Sessions",
      value: isLoading ? '...' : formatNumber(stats?.todayBookings || 0),
      change: '+15.3%',
      changeType: 'positive' as const,
      icon: Calendar,
      iconBgColor: 'bg-violet-50',
      iconColor: 'text-violet-600',
    },
    {
      title: 'Revenue (MTD)',
      value: isLoading ? '...' : formatCurrency(stats?.totalRevenue || 0),
      change: '+22.1%',
      changeType: 'positive' as const,
      icon: IndianRupee,
      iconBgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
  ];

  return (
    <div className="space-y-6 p-1">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <BookingsChart />
        </div>
        <div>
          <CanceledBookingsChart />
        </div>
      </div>

      {/* Recent Activity Table */}
      <RecentComplaintsTable />
    </div>
  );
};

export default Dashboard;
