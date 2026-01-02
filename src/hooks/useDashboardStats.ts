import { useState, useEffect } from 'react';
import { db } from '@/services/firebase';
import { collection, Timestamp, onSnapshot } from 'firebase/firestore';

export interface DashboardStats {
  totalUsers: number;
  totalAdvisors: number;
  totalBookings: number;
  pendingAdvisors: number;
  todayBookings: number;
  totalRevenue: number;
  todayRevenue: number;
  activeBookings: number;
  totalWalletBalance: number;
}

export const useDashboardStats = () => {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);

    const unsubscribes: (() => void)[] = [];

    const stats: DashboardStats = {
      totalUsers: 0,
      totalAdvisors: 0,
      totalBookings: 0,
      pendingAdvisors: 0,
      todayBookings: 0,
      totalRevenue: 0,
      todayRevenue: 0,
      activeBookings: 0,
      totalWalletBalance: 0,
    };

    let listenersReady = 0;
    const totalListeners = 6;

    const checkAllReady = () => {
      listenersReady++;
      if (listenersReady >= totalListeners) {
        setIsLoading(false);
      }
    };

    const updateStats = () => {
      setData({ ...stats });
    };

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startTimestamp = Timestamp.fromDate(startOfDay);

    try {
      // 1. Users listener
      const usersUnsubscribe = onSnapshot(
        collection(db, 'users'),
        (snapshot) => {
          stats.totalUsers = snapshot.size;
          updateStats();
          checkAllReady();
        },
        (err) => {
          console.error('Users listener error:', err);
          setError(err);
          checkAllReady();
        }
      );
      unsubscribes.push(usersUnsubscribe);

      // 2. Advisors listener (counts pending and calculates revenue)
      const advisorsUnsubscribe = onSnapshot(
        collection(db, 'advisors'),
        (snapshot) => {
          stats.totalAdvisors = snapshot.size;
          let pending = 0;
          let totalRevenue = 0;
          let todayRevenue = 0;
          
          snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.basicInfo?.status === 'pending') {
              pending++;
            }
            // Calculate total revenue from advisor earnings
            if (data.earningsInfo) {
              totalRevenue += data.earningsInfo.totalLifetimeEarnings || 0;
              todayRevenue += data.earningsInfo.todayEarnings || 0;
            }
          });
          
          stats.pendingAdvisors = pending;
          stats.totalRevenue = totalRevenue;
          stats.todayRevenue = todayRevenue;
          updateStats();
          checkAllReady();
        },
        (err) => {
          console.error('Advisors listener error:', err);
          setError(err);
          checkAllReady();
        }
      );
      unsubscribes.push(advisorsUnsubscribe);

      // 3. Instant bookings listener
      let instantBookingsCount = 0;
      let scheduledBookingsCount = 0;
      let todayInstantCount = 0;
      let todayScheduledCount = 0;
      let activeInstantCount = 0;
      let activeScheduledCount = 0;

      const instantBookingsUnsubscribe = onSnapshot(
        collection(db, 'instant_bookings'),
        (snapshot) => {
          instantBookingsCount = snapshot.size;
          todayInstantCount = 0;
          activeInstantCount = 0;
          
          snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.timestamp && data.timestamp.toMillis() >= startTimestamp.toMillis()) {
              todayInstantCount++;
            }
            if (data.status === 'ongoing' || data.status === 'accepted') {
              activeInstantCount++;
            }
          });
          
          stats.totalBookings = instantBookingsCount + scheduledBookingsCount;
          stats.todayBookings = todayInstantCount + todayScheduledCount;
          stats.activeBookings = activeInstantCount + activeScheduledCount;
          updateStats();
          checkAllReady();
        },
        (err) => {
          console.error('Instant bookings listener error:', err);
          setError(err);
          checkAllReady();
        }
      );
      unsubscribes.push(instantBookingsUnsubscribe);

      // 4. Scheduled bookings listener
      const scheduledBookingsUnsubscribe = onSnapshot(
        collection(db, 'scheduled_bookings'),
        (snapshot) => {
          scheduledBookingsCount = snapshot.size;
          todayScheduledCount = 0;
          activeScheduledCount = 0;
          
          snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.timestamp && data.timestamp.toMillis() >= startTimestamp.toMillis()) {
              todayScheduledCount++;
            }
            if (data.status === 'ongoing' || data.status === 'accepted') {
              activeScheduledCount++;
            }
          });
          
          stats.totalBookings = instantBookingsCount + scheduledBookingsCount;
          stats.todayBookings = todayInstantCount + todayScheduledCount;
          stats.activeBookings = activeInstantCount + activeScheduledCount;
          updateStats();
          checkAllReady();
        },
        (err) => {
          console.error('Scheduled bookings listener error:', err);
          setError(err);
          checkAllReady();
        }
      );
      unsubscribes.push(scheduledBookingsUnsubscribe);

      // 5. Wallets listener (total user wallet balance)
      const walletsUnsubscribe = onSnapshot(
        collection(db, 'wallets'),
        (snapshot) => {
          let totalBalance = 0;
          snapshot.forEach((doc) => {
            const data = doc.data();
            totalBalance += data.balance || 0;
          });
          stats.totalWalletBalance = totalBalance;
          updateStats();
          checkAllReady();
        },
        (err) => {
          console.error('Wallets listener error:', err);
          checkAllReady();
        }
      );
      unsubscribes.push(walletsUnsubscribe);

      // 6. Support tickets listener
      const ticketsUnsubscribe = onSnapshot(
        collection(db, 'support_tickets'),
        () => {
          checkAllReady();
        },
        (err) => {
          console.error('Support tickets listener error:', err);
          checkAllReady();
        }
      );
      unsubscribes.push(ticketsUnsubscribe);

    } catch (err) {
      console.error('Error setting up listeners:', err);
      setError(err as Error);
      setIsLoading(false);
    }

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  return { data, isLoading, error };
};
