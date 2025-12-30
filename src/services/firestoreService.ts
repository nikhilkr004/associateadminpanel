import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  Timestamp,
  orderBy,
  limit as firestoreLimit
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
      isActive: data.basicInfo?.isactive === 'true',
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
