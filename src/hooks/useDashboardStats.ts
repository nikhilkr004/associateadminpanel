import { useState, useEffect, useCallback } from 'react';
import { db } from '@/services/firebase';
import { collection, query, where, Timestamp, onSnapshot } from 'firebase/firestore';

export interface DashboardStats {
  totalUsers: number;
  totalAdvisors: number;
  totalBookings: number;
  pendingAdvisors: number;
  todayBookings: number;
}

export const useDashboardStats = () => {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);

    // Listeners array to track all unsubscribes
    const unsubscribes: (() => void)[] = [];

    // Stats object that gets updated by each listener
    const stats: DashboardStats = {
      totalUsers: 0,
      totalAdvisors: 0,
      totalBookings: 0,
      pendingAdvisors: 0,
      todayBookings: 0,
    };

    let listenersReady = 0;
    const totalListeners = 5;

    const checkAllReady = () => {
      listenersReady++;
      if (listenersReady >= totalListeners) {
        setIsLoading(false);
      }
    };

    const updateStats = () => {
      setData({ ...stats });
    };

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

      // 2. Advisors listener (also counts pending)
      const advisorsUnsubscribe = onSnapshot(
        collection(db, 'advisors'),
        (snapshot) => {
          stats.totalAdvisors = snapshot.size;
          let pending = 0;
          snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.basicInfo?.status === 'pending') {
              pending++;
            }
          });
          stats.pendingAdvisors = pending;
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

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const startTimestamp = Timestamp.fromDate(startOfDay);

      const instantBookingsUnsubscribe = onSnapshot(
        collection(db, 'instant_bookings'),
        (snapshot) => {
          instantBookingsCount = snapshot.size;
          todayInstantCount = 0;
          snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.timestamp && data.timestamp.toMillis() >= startTimestamp.toMillis()) {
              todayInstantCount++;
            }
          });
          stats.totalBookings = instantBookingsCount + scheduledBookingsCount;
          stats.todayBookings = todayInstantCount + todayScheduledCount;
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
          snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.timestamp && data.timestamp.toMillis() >= startTimestamp.toMillis()) {
              todayScheduledCount++;
            }
          });
          stats.totalBookings = instantBookingsCount + scheduledBookingsCount;
          stats.todayBookings = todayInstantCount + todayScheduledCount;
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

      // 5. Support tickets listener (for complaints count - used in table)
      const ticketsUnsubscribe = onSnapshot(
        collection(db, 'support_tickets'),
        (snapshot) => {
          // This just triggers a checkAllReady - complaints are handled separately
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

    // Cleanup function
    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  return { data, isLoading, error };
};
