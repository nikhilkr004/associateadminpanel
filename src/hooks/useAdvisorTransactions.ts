import { useQuery } from '@tanstack/react-query';
import { getAdvisorTransactions, AdvisorTransaction } from '@/services/firestoreService';

export const useAdvisorTransactions = (advisorId: string) => {
  return useQuery({
    queryKey: ['advisorTransactions', advisorId],
    queryFn: () => getAdvisorTransactions(advisorId),
    enabled: !!advisorId,
    staleTime: 1000 * 60 * 5,
  });
};

export type { AdvisorTransaction };
