import { useQuery } from '@tanstack/react-query';
import { getUserDetailsFull, UserDetailData } from '@/services/firestoreService';

export const useUserDetail = (userId: string) => {
  return useQuery<UserDetailData>({
    queryKey: ['userDetail', userId],
    queryFn: () => getUserDetailsFull(userId),
    enabled: !!userId,
  });
};

