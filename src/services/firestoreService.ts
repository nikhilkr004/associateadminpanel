import { db } from './firebase';
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
  orderBy,
  limit as firestoreLimit,
  doc,
  getDoc,
  updateDoc,
  runTransaction,
  addDoc,
  serverTimestamp,
  onSnapshot,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore';

// Dashbor;
export interface DashboardStats {
  totalUsers: number;
  totalAdvisors: number;
  totalBookings: number;
  pendingAdvisors: number;
  todayBookings: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const [usersCount, advisorsData, bookingsCount, todayBookingsCount] = await Promise.all([
    getUsersCount(),
    getAdvisorsData(),
    getTotalBookingsCount(),
    getTodayBookingsCount()
  ]);

  return {
    totalUsers: usersCount,
    totalAdvisors: advisorsData.total,
    totalBookings: bookingsCount,
    pendingAdvisors: advisorsData.pending,
    todayBookings: todayBookingsCount
  };
};

export const getUsersCount = async (): Promise<number> => {
  const usersSnapshot = await getDocs(collection(db, 'users'));
  return usersSnapshot.size;
};

export const getAdvisorsData = async (): Promise<{ total: number; pending: number }> => {
  const advisorsSnapshot = await getDocs(collection(db, 'advisors'));
  let pending = 0;

  advisorsSnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.basicInfo?.status === 'pending') {
      pending++;
    }
  });

  return {
    total: advisorsSnapshot.size,
    pending
  };
};

export const getTotalBookingsCount = async (): Promise<number> => {
  const [instantSnapshot, scheduledSnapshot] = await Promise.all([
    getDocs(collection(db, 'instant_bookings')),
    getDocs(collection(db, 'scheduled_bookings'))
  ]);

  return instantSnapshot.size + scheduledSnapshot.size;
};

export const getTodayBookingsCount = async (): Promise<number> => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startTimestamp = Timestamp.fromDate(startOfDay);

  const [instantQuery, scheduledQuery] = await Promise.all([
    getDocs(query(
      collection(db, 'instant_bookings'),
      where('timestamp', '>=', startTimestamp)
    )),
    getDocs(query(
      collection(db, 'scheduled_bookings'),
      where('timestamp', '>=', startTimestamp)
    ))
  ]);

  return instantQuery.size + scheduledQuery.size;
};

// User Data Types
export interface UserData {
  userId: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  gender: string;
  profilePhotoUrl?: string;
  jointAt: string;
  preferredLanguage: string;
}

export const getUsers = async (): Promise<UserData[]> => {
  const usersSnapshot = await getDocs(collection(db, 'users'));
  const users: UserData[] = [];

  usersSnapshot.forEach((doc) => {
    const data = doc.data();
    users.push({
      userId: doc.id,
      name: data.name || 'N/A',
      email: data.email || 'N/A',
      phone: data.phone || 'N/A',
      city: data.city || 'N/A',
      gender: data.gender || 'N/A',
      profilePhotoUrl: data.profilePhotoUrl,
      jointAt: data.jointAt || 'N/A',
      preferredLanguage: data.preferredLanguage || 'en'
    });
  });

  return users;
};

// Advisor Data Types
export interface AdvisorData {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  isActive: boolean;
  designation: string;
  department: string;
  experience: number;
  rating: number;
  reviewCount: number;
  city: string;
  profileImage?: string;
}

export const getAdvisors = async (): Promise<AdvisorData[]> => {
  const advisorsSnapshot = await getDocs(collection(db, 'advisors'));
  const advisors: AdvisorData[] = [];

  advisorsSnapshot.forEach((doc) => {
    const data = doc.data();
    advisors.push({
      id: doc.id,
      name: data.basicInfo?.name || 'N/A',
      email: data.basicInfo?.email || 'N/A',
      phone: data.basicInfo?.phoneNumber || 'N/A',
      status: data.basicInfo?.status || 'pending',
      isActive: data.basicInfo?.isactive === 'true', // check case sensitivity on 'isactive' vs 'isActive' based on data
      designation: data.professionalInfo?.designation || 'N/A',
      department: data.professionalInfo?.department || 'N/A',
      experience: data.professionalInfo?.experience || 0,
      rating: data.performanceInfo?.rating || 0,
      reviewCount: data.performanceInfo?.reviewCount || 0,
      city: data.basicInfo?.city || 'N/A',
      profileImage: data.basicInfo?.profileImage
    });
  });

  return advisors;
};

// Full Advisor Profile Interface
// Helper Interfaces for Advisor Data
export interface ScheduleSlot {
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  activeDays: string[];
  duration: number; // minutes
  generatedSlots: string[];
}

export interface AvailabilityConfig {
  workingDays: string[];
  workingHoursStart: string;
  workingHoursEnd: string;
  appointmentDuration: number;
  maxDailyAppointments: number;
  scheduledAvailability: {
    isChatEnabled: boolean;
    isAudioCallEnabled: boolean;
    isVideoCallEnabled: boolean;
    isInPersonEnabled: boolean;
    isOfficeVisitEnabled: boolean;
  };
  instantAvailability: {
    isChatEnabled: boolean;
    isAudioCallEnabled: boolean;
    isVideoCallEnabled: boolean;
  };
  virtualSchedule: ScheduleSlot;
  inPersonSchedule: ScheduleSlot;
}

export interface PricingConfig {
  instantChatFee: number;
  instantAudioFee: number;
  instantVideoFee: number;
  scheduledChatFee: number;
  scheduledAudioFee: number;
  scheduledVideoFee: number;
  scheduledInPersonFee: number;
}

export interface ContactPreferences {
  preferredContactMethod: string;
  responseTime: string;
}

export interface SystemInfo {
  userRole: string;
  accessLevel: string;
  canGenerateReports: boolean;
  canManageResources: boolean;
}

export interface EarningsInfo {
  totalLifetimeEarnings: number;
  todayEarnings: number;
  thisWeekEarnings: number;
  thisMonthEarnings: number;
  pendingBalance: number;
  totalWithdrawn: number;
  pendingWithdrawals?: number;
}

export interface TimeInfo {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLogin: Timestamp;
}

// Full Advisor Profile Interface
export interface FullAdvisorProfile {
  id: string; // Document ID
  basicInfo: {
    id: string;
    phoneNumber: string;
    email: string;
    name: string;
    gender: string;
    city: string;
    profileImage: string;
    status: string;
  };
  professionalInfo: {
    designation: string;
    department: string;
    experience: number;
    yearsInOrganization: number;
    employeeId: string;
    bio: string;
    officeLocation: string;
    specializations: string[];
    certifications: string[];
    languages: string[];
    specializationUrls: Record<string, string>;
  };
  educationInfo: {
    highestQualification: string;
    qualificationField: string;
    university: string;
    highestQualificationUrl: string;
  };
  availabilityInfo: AvailabilityConfig;
  pricingInfo: PricingConfig;
  contactPreferences: ContactPreferences;
  systemInfo: SystemInfo;
  performanceInfo: {
    totalStudentsAdvised: number;
    rating: number;
    reviewCount: number;
  };
  resources: {
    linkedinProfile: string;
    website: string;
    documentUrls: Record<string, string>;
  };
  timeInfo: TimeInfo;
  earningsInfo: EarningsInfo;
}

export const getAdvisorById = async (advisorId: string): Promise<FullAdvisorProfile | null> => {
  try {
    const docRef = doc(db, 'advisors', advisorId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data
      } as FullAdvisorProfile;
    }
    return null;
  } catch (error) {
    console.error("Error fetching advisor details:", error);
    throw error;
  }
};

export const updateAdvisorStatus = async (advisorId: string, status: string): Promise<void> => {
  try {
    const docRef = doc(db, 'advisors', advisorId);
    await updateDoc(docRef, {
      'basicInfo.status': status,
      'timeInfo.updatedAt': Timestamp.now()
    });
  } catch (error) {
    console.error("Error updating advisor status:", error);
    throw error;
  }
};
// Withdrawal Types
export interface WithdrawalRequest {
  id: string;
  advisorId: string;
  advisorName: string;
  advisorEmail: string;
  advisorPhone: string;
  requestedAmount: number;
  platformFee: number;
  gstOnFee: number;
  tdsDeducted: number;
  totalDeductions: number;
  netPayableAmount: number;

  // Bank Details
  bankAccountNumber: string;
  bankAccountHolderName: string;
  bankIfscCode: string;
  bankName: string;
  bankBranch: string;
  bankAccountType: string;
  bankPanNumber: string;

  // Status
  status: 'PENDING' | 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';
  requestedAt: Timestamp;
  approvedAt?: Timestamp | null;
  processedAt?: Timestamp | null;
  completedAt?: Timestamp | null;
  rejectedAt?: Timestamp | null;

  // Admin Fields
  transactionId?: string;
  utrNumber?: string;
  paymentMode?: string;
  adminNotes?: string;
  approvedBy?: string;
  failureReason?: string;
  rejectionReason?: string;
}

export const getWithdrawalRequests = async (): Promise<WithdrawalRequest[]> => {
  const q = query(collection(db, 'withdrawal_requests'), orderBy('requestedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as WithdrawalRequest));
};

export const approveWithdrawalRequest = async (requestId: string, adminId: string): Promise<void> => {
  const docRef = doc(db, 'withdrawal_requests', requestId);
  await updateDoc(docRef, {
    status: 'APPROVED',
    approvedAt: serverTimestamp(),
    approvedBy: adminId
  });
};

export const completeWithdrawalRequest = async (
  requestId: string,
  advisorId: string,
  amount: number,
  transactionDetails: { transactionId: string; utrNumber: string; paymentMode: string; adminNotes?: string }
): Promise<void> => {
  await runTransaction(db, async (transaction) => {
    // 1. Get references
    const withdrawalRef = doc(db, 'withdrawal_requests', requestId);
    const advisorRef = doc(db, 'advisors', advisorId);

    // 2. Read operations (if needed, but here we assume inputs are valid or handled by security rules/logic)
    const advisorDoc = await transaction.get(advisorRef);
    if (!advisorDoc.exists()) {
      throw new Error("Advisor does not exist!");
    }

    // 3. Updates
    // Update Withdrawal Request
    transaction.update(withdrawalRef, {
      status: 'COMPLETED',
      completedAt: serverTimestamp(),
      ...transactionDetails
    });

    // Update Advisor Financials
    // Decrement pendingBalance, Increment totalWithdrawn
    const advisorData = advisorDoc.data();
    const currentPending = advisorData.earningsInfo?.pendingBalance || 0;
    const currentTotalWithdrawn = advisorData.earningsInfo?.totalWithdrawn || 0;

    const newPendingBalance = currentPending - amount;
    const newTotalWithdrawn = currentTotalWithdrawn + amount;

    transaction.update(advisorRef, {
      'earningsInfo.pendingBalance': newPendingBalance,
      'earningsInfo.totalWithdrawn': newTotalWithdrawn
    });
  });
};

export const rejectWithdrawalRequest = async (
  requestId: string,
  advisorId: string,
  amount: number,
  rejectionReason: string
): Promise<void> => {
  await runTransaction(db, async (transaction) => {
    const withdrawalRef = doc(db, 'withdrawal_requests', requestId);
    const advisorRef = doc(db, 'advisors', advisorId);

    const advisorDoc = await transaction.get(advisorRef);
    if (!advisorDoc.exists()) {
      throw new Error("Advisor does not exist!");
    }

    transaction.update(withdrawalRef, {
      status: 'REJECTED',
      rejectedAt: serverTimestamp(),
      rejectionReason: rejectionReason
    });

    // Note: We do NOT refund the balance here because the system deducts it only upon successful withdrawal request creation
    // AND if the request creation failed, well, it wouldn't be here.
    // If the logic was "deduct on request", then rejecting should refund.
    // However, the user explicitly stated that the current logic (which refunded) was creating a DOUBLE balance.
    // This implies the balance wasn't deducted, OR the user's premise about "double balance" means 
    // "it adds it back but it was already there".
    // So we remove the balance update logic entirely here.
  });
};

// Advisor Reviews
export interface AdvisorReview {
  id: string;
  reviewerName: string;
  reviewerImage?: string;
  rating: number;
  comment: string;
  createdAt: Timestamp;
  bookingType: string;
}

export const getAdvisorReviews = async (advisorId: string): Promise<AdvisorReview[]> => {
  try {
    const reviewsRef = collection(db, 'advisors', advisorId, 'reviews');
    const q = query(reviewsRef);
    const snapshot = await getDocs(q);

    const reviews = await Promise.all(snapshot.docs.map(async (docSnap) => {
      const data = docSnap.data();
      let reviewerName = data.reviewerName || data.userName || 'Anonymous';
      let reviewerImage = data.reviewerImage || data.userImage;
      const userId = data.userId; // Assuming userId field exists in review doc

      if (userId) {
        try {
          const userRef = doc(db, 'users', userId);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            reviewerName = userData.name || reviewerName;
            reviewerImage = userData.profilePhotoUrl || reviewerImage;
          }
        } catch (e) {
          console.warn(`Failed to fetch user details for review ${docSnap.id}`, e);
        }
      }

      return {
        id: docSnap.id,
        reviewerName,
        reviewerImage,
        rating: data.rating || 0,
        comment: data.comment || data.review || '',
        createdAt: data.createdAt,
        bookingType: data.bookingType || 'general'
      };
    }));

    return reviews.sort((a, b) => {
      const dateA = a.createdAt?.toMillis?.() || 0;
      const dateB = b.createdAt?.toMillis?.() || 0;
      return dateB - dateA;
    });
  } catch (error) {
    console.error("Error fetching advisor reviews:", error);
    return [];
  }
};

// Advisor Transactions (Bookings & Activity)
export interface AdvisorTransaction {
  id: string;
  type: 'instant' | 'scheduled';
  userName: string;
  userImage?: string;
  serviceType: string;
  amount: number;
  status: string;
  createdAt: Timestamp;
  duration?: number;

  // New Activity Fields
  bookingId?: string;
  userId?: string;
  callEndTime?: Timestamp; // or just rely on createdAt for start
  endReason?: string;
  completedBy?: string;
}

export const getAdvisorTransactions = async (advisorId: string): Promise<AdvisorTransaction[]> => {
  try {
    const transactions: AdvisorTransaction[] = [];

    // Fetch instant bookings
    const instantQuery = query(
      collection(db, 'instant_bookings'),
      where('advisorId', '==', advisorId),
      firestoreLimit(50)
    );
    const instantSnapshot = await getDocs(instantQuery);

    instantSnapshot.forEach(doc => {
      const data = doc.data();
      transactions.push({
        id: doc.id,
        type: 'instant',
        userName: data.userName || data.studentName || 'Unknown User',
        userImage: data.userImage || data.studentImage,
        serviceType: data.callType || data.serviceType || 'Chat',
        amount: data.amount || data.fee || 0,
        status: data.status || 'completed',
        createdAt: data.timestamp || data.createdAt,
        duration: data.duration,

        bookingId: data.bookingId || doc.id,
        userId: data.userId,
        callEndTime: data.callEndTime || data.endTime,
        endReason: data.endReason,
        completedBy: data.completedBy
      });
    });

    // Fetch scheduled bookings
    const scheduledQuery = query(
      collection(db, 'scheduled_bookings'),
      where('advisorId', '==', advisorId),
      firestoreLimit(50)
    );
    const scheduledSnapshot = await getDocs(scheduledQuery);

    scheduledSnapshot.forEach(doc => {
      const data = doc.data();
      transactions.push({
        id: doc.id,
        type: 'scheduled',
        userName: data.userName || data.studentName || 'Unknown User',
        userImage: data.userImage || data.studentImage,
        serviceType: data.callType || data.serviceType || 'Scheduled',
        amount: data.amount || data.fee || 0,
        status: data.status || 'completed',
        createdAt: data.timestamp || data.createdAt,
        duration: data.duration,

        bookingId: data.bookingId || doc.id,
        userId: data.userId,
        callEndTime: data.callEndTime || data.endTime,
        endReason: data.endReason,
        completedBy: data.completedBy
      });
    });

    // Sort by date descending
    return transactions.sort((a, b) => {
      const dateA = a.createdAt?.toMillis?.() || 0;
      const dateB = b.createdAt?.toMillis?.() || 0;
      return dateB - dateA;
    });
  } catch (error) {
    console.error("Error fetching advisor transactions:", error);
    return [];
  }
};
// User Details Full Data Fetching
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

export const getUserDetailsFull = async (userId: string): Promise<UserDetailData> => {
  try {
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
    // Note: Booking documents use 'studentId' field to reference the user
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
    // Note: Booking documents use 'studentId' field to reference the user
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
  } catch (error) {
    console.error("Error fetching user full details:", error);
    throw error;
  }
};
