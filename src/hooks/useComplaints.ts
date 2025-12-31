import { useState, useEffect } from 'react';
import { db } from '@/services/firebase';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';

export interface TicketResponse {
  responseId: string;
  message: string;
  respondedBy: string;
  respondedAt: Timestamp;
}

export interface SupportTicket {
  id: string;
  ticketId: string;
  userId: string;
  userType: string;
  userName: string;
  userEmail: string;
  category: string;
  subject: string;
  description: string;
  photoUrls: string[];
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  responses: TicketResponse[];
}

export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  high: number;
  medium: number;
  low: number;
}

export const useComplaints = () => {
  const [data, setData] = useState<SupportTicket[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);

    const ticketsQuery = query(
      collection(db, 'support_tickets'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      ticketsQuery,
      (snapshot) => {
        const tickets: SupportTicket[] = [];
        snapshot.forEach((doc) => {
          tickets.push({
            id: doc.id,
            ...doc.data()
          } as SupportTicket);
        });
        setData(tickets);
        setIsLoading(false);
      },
      (err) => {
        console.error('Complaints listener error:', err);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { data, isLoading, error };
};

export const useComplaintStats = () => {
  const [data, setData] = useState<TicketStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);

    const unsubscribe = onSnapshot(
      collection(db, 'support_tickets'),
      (snapshot) => {
        const stats: TicketStats = {
          total: snapshot.size,
          open: 0,
          inProgress: 0,
          resolved: 0,
          closed: 0,
          high: 0,
          medium: 0,
          low: 0
        };

        snapshot.forEach((doc) => {
          const data = doc.data();

          // Count by status
          if (data.status === 'open') stats.open++;
          else if (data.status === 'in_progress') stats.inProgress++;
          else if (data.status === 'resolved') stats.resolved++;
          else if (data.status === 'closed') stats.closed++;

          // Count by priority
          if (data.priority === 'high') stats.high++;
          else if (data.priority === 'medium') stats.medium++;
          else if (data.priority === 'low') stats.low++;
        });

        setData(stats);
        setIsLoading(false);
      },
      (err) => {
        console.error('Ticket stats listener error:', err);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { data, isLoading, error };
};
