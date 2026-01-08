// Support Ticket Type Definitions

export interface SupportTicket {
  id: string;
  ticketNumber?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  subject: string;
  description: string;
  category:
    | 'technical'
    | 'billing'
    | 'general'
    | 'feature_request'
    | 'complaint'
    | 'booking'
    | 'station'
    | 'account'
    | 'other'
    | string;
  priority: 'low' | 'medium' | 'high' | 'critical' | 'urgent' | string;
  status: 'open' | 'in_progress' | 'in-progress' | 'waiting' | 'resolved' | 'closed' | string;
  assignedTo?: string;
  assignedToName?: string;
  comments?: TicketComment[];
  rating?: TicketRating | number;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
  slaStatus?: 'within' | 'breached' | string;
}

export interface TicketComment {
  id?: string;
  author: {
    name: string;
    role?: string;
  };
  comment: string;
  attachments?: string[];
  createdAt: string;
}

export interface TicketRating {
  score: number;
  feedback?: string;
  ratedAt: string;
}

export interface CreateTicketRequest {
  subject: string;
  description: string;
  category: SupportTicket['category'];
  priority?: SupportTicket['priority'];
}

export interface UpdateTicketRequest {
  status?: SupportTicket['status'];
  priority?: SupportTicket['priority'];
  assignedTo?: string;
}

export interface AddCommentRequest {
  comment: string;
  attachments?: string[];
}

export interface RateTicketRequest {
  rating: number;
  feedback?: string;
}

export interface SupportStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  avgResponseTime: number; // minutes
}
