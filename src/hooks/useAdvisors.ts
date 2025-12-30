import { useQuery } from '@tanstack/react-query';
import { getAdvisors, AdvisorData } from '@/services/firestoreService';

export const useAdvisors = () => {
  return useQuery<AdvisorData[]>({
    queryKey: ['advisors'],
    queryFn: getAdvisors,
    staleTime: 1000 * 60 * 5,
  });
};
