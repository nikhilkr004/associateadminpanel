import { useQuery } from '@tanstack/react-query';
import { getUsers, UserData } from '@/services/firestoreService';

export const useUsers = () => {
  return useQuery<UserData[]>({
    queryKey: ['users'],
    queryFn: getUsers,
    staleTime: 1000 * 60 * 5,
  });
};
