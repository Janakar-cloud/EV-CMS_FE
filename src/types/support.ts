// Support Ticket Type Definitions

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  userName: string;
  subject: string;
  description: string;
  category: 'technical' | 'billing' | 'general' | 'complaint';
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  assignedTo?: string;
  comments: TicketComment[];
  rating?: TicketRating;
  createdAt: string;
  resolvedAt?: string;
  slaStatus: 'within' | 'breached';
}

export interface TicketComment {
  id?: string;
  author: string;
  authorType: 'user' | 'support';
  comment: string;
  attachments: string[];
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
  category: 'technical' | 'billing' | 'general' | 'complaint';
  priority?: 'low' | 'medium' | 'high';
}

export interface UpdateTicketRequest {
  status?: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high';
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
