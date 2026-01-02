import { useQuery } from '@tanstack/react-query';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  phone: string;
  profilePhotoUrl: string;
  dateOfBirth?: string;
  gender: string;
  jointAt: string;
  city?: string;
  fcmToken?: string;
}

export interface WalletData {
  userId: string;
  balance: number;
  totalSpent: number;
  transactionCount: number;
}

export interface UserTransaction {
  id: string;
  amount: number;
  type: 'DEBIT' | 'CREDIT';
  description: string;
  status: string;
  timestamp: any;
  relatedBookingId?: string;
}

export interface InstantBooking {
  bookingId: string;
  advisorId: string;
  advisorName?: string;
  bookingType: 'AUDIO' | 'VIDEO' | 'CHAT';
  rate: number;
  status: string;
  urgencyLevel?: string;
  timestamp: any;
  duration?: number;
}

export interface ScheduledBooking {
  bookingId: string;
  advisorId: string;
  advisorName?: string;
  bookingType: 'AUDIO' | 'VIDEO' | 'CHAT';
  bookingSlot: string;
  bookingDate: string;
  sessionAmount: number;
  status: string;
  timestamp: any;
}

export interface UserDetailData {
  profile: UserProfile;
  wallet: WalletData | null;
  transactions: UserTransaction[];
  instantBookings: InstantBooking[];
  scheduledBookings: ScheduledBooking[];
}

const fetchUserDetail = async (userId: string): Promise<UserDetailData> => {
  // Fetch user profile
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) {
    throw new Error('User not found');
  }
  const profile = { userId: userDoc.id, ...userDoc.data() } as UserProfile;

  // Fetch wallet
  const walletDoc = await getDoc(doc(db, 'wallets', userId));
  const wallet = walletDoc.exists() 
    ? { userId: walletDoc.id, ...walletDoc.data() } as WalletData 
    : null;

  // Fetch transactions
  const transactionsRef = collection(db, `users/${userId}/transactions`);
  const transactionsSnapshot = await getDocs(transactionsRef);
  const transactions = transactionsSnapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }) as UserTransaction)
    .sort((a, b) => {
      const timeA = a.timestamp?.toMillis?.() || 0;
      const timeB = b.timestamp?.toMillis?.() || 0;
      return timeB - timeA;
    });

  // Fetch instant bookings
  const instantBookingsRef = collection(db, 'instant_bookings');
  const instantQuery = query(instantBookingsRef, where('studentId', '==', userId));
  const instantSnapshot = await getDocs(instantQuery);
  const instantBookings = instantSnapshot.docs
    .map(doc => ({ bookingId: doc.id, ...doc.data() }) as InstantBooking)
    .sort((a, b) => {
      const timeA = a.timestamp?.toMillis?.() || 0;
      const timeB = b.timestamp?.toMillis?.() || 0;
      return timeB - timeA;
    });

  // Fetch scheduled bookings
  const scheduledBookingsRef = collection(db, 'scheduled_bookings');
  const scheduledQuery = query(scheduledBookingsRef, where('studentId', '==', userId));
  const scheduledSnapshot = await getDocs(scheduledQuery);
  const scheduledBookings = scheduledSnapshot.docs
    .map(doc => ({ bookingId: doc.id, ...doc.data() }) as ScheduledBooking)
    .sort((a, b) => {
      const timeA = a.timestamp?.toMillis?.() || 0;
      const timeB = b.timestamp?.toMillis?.() || 0;
      return timeB - timeA;
    });

  return { profile, wallet, transactions, instantBookings, scheduledBookings };
};

export const useUserDetail = (userId: string) => {
  return useQuery<UserDetailData>({
    queryKey: ['userDetail', userId],
    queryFn: () => fetchUserDetail(userId),
    enabled: !!userId,
  });
};
