import { useQuery } from '@tanstack/react-query';
import { getAllSupportTickets, getTicketStats } from '@/services/complaintService';

export const useComplaints = () => {
    return useQuery({
        queryKey: ['support-tickets'],
        queryFn: getAllSupportTickets,
        staleTime: 30000, // 30 seconds
    });
};

export const useComplaintStats = () => {
    return useQuery({
        queryKey: ['ticket-stats'],
        queryFn: getTicketStats,
        staleTime: 60000, // 1 minute
    });
};
