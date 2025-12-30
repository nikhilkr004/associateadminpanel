import { db } from './firebase';
import {
    collection,
    getDocs,
    getDoc,
    doc,
    query,
    where,
    orderBy,
    Timestamp,
    updateDoc,
    arrayUnion,
    serverTimestamp
} from 'firebase/firestore';

// TypeScript Interfaces
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

// Firestore Service Functions

/**
 * Get all support tickets ordered by creation date (latest first)
 */
export const getAllSupportTickets = async (): Promise<SupportTicket[]> => {
    try {
        const ticketsQuery = query(
            collection(db, 'support_tickets'),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(ticketsQuery);

        const tickets: SupportTicket[] = [];
        snapshot.forEach((doc) => {
            tickets.push({
                id: doc.id,
                ...doc.data()
            } as SupportTicket);
        });

        return tickets;
    } catch (error) {
        console.error('Error fetching support tickets:', error);
        throw error;
    }
};

/**
 * Get a single support ticket by ID
 */
export const getSupportTicketById = async (ticketId: string): Promise<SupportTicket | null> => {
    try {
        const docRef = doc(db, 'support_tickets', ticketId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data()
            } as SupportTicket;
        }

        return null;
    } catch (error) {
        console.error('Error fetching ticket by ID:', error);
        throw error;
    }
};

/**
 * Get tickets filtered by status
 */
export const getTicketsByStatus = async (
    status: 'open' | 'in_progress' | 'resolved' | 'closed'
): Promise<SupportTicket[]> => {
    try {
        const ticketsQuery = query(
            collection(db, 'support_tickets'),
            where('status', '==', status),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(ticketsQuery);

        const tickets: SupportTicket[] = [];
        snapshot.forEach((doc) => {
            tickets.push({
                id: doc.id,
                ...doc.data()
            } as SupportTicket);
        });

        return tickets;
    } catch (error) {
        console.error('Error fetching tickets by status:', error);
        throw error;
    }
};

/**
 * Get tickets filtered by priority
 */
export const getTicketsByPriority = async (
    priority: 'low' | 'medium' | 'high'
): Promise<SupportTicket[]> => {
    try {
        const ticketsQuery = query(
            collection(db, 'support_tickets'),
            where('priority', '==', priority),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(ticketsQuery);

        const tickets: SupportTicket[] = [];
        snapshot.forEach((doc) => {
            tickets.push({
                id: doc.id,
                ...doc.data()
            } as SupportTicket);
        });

        return tickets;
    } catch (error) {
        console.error('Error fetching tickets by priority:', error);
        throw error;
    }
};

/**
 * Get tickets filtered by category
 */
export const getTicketsByCategory = async (category: string): Promise<SupportTicket[]> => {
    try {
        const ticketsQuery = query(
            collection(db, 'support_tickets'),
            where('category', '==', category),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(ticketsQuery);

        const tickets: SupportTicket[] = [];
        snapshot.forEach((doc) => {
            tickets.push({
                id: doc.id,
                ...doc.data()
            } as SupportTicket);
        });

        return tickets;
    } catch (error) {
        console.error('Error fetching tickets by category:', error);
        throw error;
    }
};

/**
 * Update ticket status
 */
export const updateTicketStatus = async (
    ticketId: string,
    newStatus: 'open' | 'in_progress' | 'resolved' | 'closed'
): Promise<void> => {
    try {
        const ticketRef = doc(db, 'support_tickets', ticketId);
        await updateDoc(ticketRef, {
            status: newStatus,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error updating ticket status:', error);
        throw error;
    }
};

/**
 * Add admin response to a ticket
 */
export const addAdminResponse = async (
    ticketId: string,
    message: string
): Promise<void> => {
    try {
        const response: TicketResponse = {
            responseId: `response_${Date.now()}`,
            message: message,
            respondedBy: 'admin',
            respondedAt: Timestamp.now()
        };

        const ticketRef = doc(db, 'support_tickets', ticketId);
        await updateDoc(ticketRef, {
            responses: arrayUnion(response),
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error adding admin response:', error);
        throw error;
    }
};

/**
 * Get ticket statistics
 */
export const getTicketStats = async (): Promise<TicketStats> => {
    try {
        const snapshot = await getDocs(collection(db, 'support_tickets'));

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

        return stats;
    } catch (error) {
        console.error('Error fetching ticket stats:', error);
        throw error;
    }
};

/**
 * Format Firebase Timestamp to readable date string
 */
export const formatTimestamp = (timestamp: Timestamp | null | undefined): string => {
    if (!timestamp) return 'N/A';

    try {
        const date = timestamp.toDate();
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return 'Invalid Date';
    }
};
