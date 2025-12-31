import { useQuery } from '@tanstack/react-query';
import { getAdvisorReviews, AdvisorReview } from '@/services/firestoreService';

export const useAdvisorReviews = (advisorId: string) => {
  return useQuery({
    queryKey: ['advisorReviews', advisorId],
    queryFn: () => getAdvisorReviews(advisorId),
    enabled: !!advisorId,
    staleTime: 1000 * 60 * 5,
  });
};

export type { AdvisorReview };
