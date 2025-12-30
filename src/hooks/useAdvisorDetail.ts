import { useQuery } from '@tanstack/react-query';
import { getAdvisorById, FullAdvisorProfile } from '@/services/firestoreService';

export const useAdvisorDetail = (advisorId: string) => {
    return useQuery({
        queryKey: ['advisor', advisorId],
        queryFn: () => getAdvisorById(advisorId),
        enabled: !!advisorId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
