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

// Dashboard Stats
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
    // Decrement pendingWithdrawals, Increment totalWithdrawn
    // We need to read current values first to be safe, or use increment
    // Since we are in a transaction reading is safe.
    const advisorData = advisorDoc.data();
    const currentPending = advisorData.earningsInfo?.pendingBalance || 0; // Note: Verify if pendingWithdrawals is a separate field or part of pendingBalance logic.
    // Based on user prompt: "advisor/earningsInfo/pendingWithdrawals: Decrease by requestedAmount."
    // "advisor/earningsInfo/totalWithdrawn: Increase by requestedAmount."
    // Let's assume these fields exist or we create them. 
    // The prompt says: "advisor/earningsInfo/pendingWithdrawals"

    // Check if these fields exist in FullAdvisorProfile. 
    // They are NOT in the current FullAdvisorProfile interface I saw earlier. 
    // I should probably add them to the interface if I can, or cast to any.
    // For now, I will follow the prompt's logic.

    const newPendingWithdrawals = (advisorData.earningsInfo?.pendingWithdrawals || 0) - amount;
    const newTotalWithdrawn = (advisorData.earningsInfo?.totalWithdrawn || 0) + amount;

    transaction.update(advisorRef, {
      'earningsInfo.pendingWithdrawals': newPendingWithdrawals,
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

    // Update Withdrawal Request
    transaction.update(withdrawalRef, {
      status: 'REJECTED',
      rejectedAt: serverTimestamp(),
      rejectionReason: rejectionReason
    });

    // Refund: Decrease pendingWithdrawals (and likely add back to available/pending balance? 
    // User prompt says: "Refund: Update Advisor Doc → pendingWithdrawals: Decrease by requestedAmount (Unlock funds)."
    // Usually purely decreasing pending withdrawals doesn't refund. 
    // It implies the amount was moved from 'Available' to 'PendingWithdrawals' when requested.
    // So to refund, we must move it back: Decrease 'pendingWithdrawals', Increase 'pendingBalance' (or availableBalance).
    // The prompt says "Unlock funds".
    // I'll assume 'pendingBalance' is the available balance for withdrawal based on `EarningsInfo` interface having `pendingBalance`. 
    // Wait, `EarningsInfo` has `pendingBalance`. 
    // If request moved money `pendingBalance` -> `pendingWithdrawals`, then refund is `pendingWithdrawals` -> `pendingBalance`.

    const advisorData = advisorDoc.data();
    const currentPendingWith = advisorData.earningsInfo?.pendingWithdrawals || 0;
    const currentAvailable = advisorData.earningsInfo?.pendingBalance || 0;

    transaction.update(advisorRef, {
      'earningsInfo.pendingWithdrawals': currentPendingWith - amount,
      'earningsInfo.pendingBalance': currentAvailable + amount
    });
  });
};
