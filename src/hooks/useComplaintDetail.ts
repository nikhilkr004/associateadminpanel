import { useQuery } from '@tanstack/react-query';
import { getSupportTicketById } from '@/services/complaintService';

export const useComplaintDetail = (ticketId: string) => {
    return useQuery({
        queryKey: ['support-ticket', ticketId],
        queryFn: () => getSupportTicketById(ticketId),
        enabled: !!ticketId,
        staleTime: 10000, // 10 seconds
    });
};
