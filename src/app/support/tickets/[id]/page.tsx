'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supportService } from '@/lib/support-service';
import type { SupportTicket, TicketComment } from '@/types/support';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, MessageCircle, Send } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

export default function TicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params.id as string;
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (ticketId) {
      loadTicketDetails();
    }
  }, [ticketId]);

  const loadTicketDetails = async () => {
    try {
      const [ticketData, commentsData] = await Promise.all([
        supportService.getTicket(ticketId),
        supportService.getComments(ticketId),
      ]);
      setTicket(ticketData);
      setComments(commentsData.data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      await supportService.addComment(ticketId, { comment: newComment });
      setNewComment('');
      toast.success('Comment added successfully');
      loadTicketDetails();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!ticket) {
    return <div>Ticket not found</div>;
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Tickets
      </Button>

      <div className="space-y-6">
        {/* Ticket Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{ticket.subject}</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">Ticket ID: {ticket.id}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant={ticket.status === 'open' ? 'default' : 'outline'}>
                  {ticket.status}
                </Badge>
                <Badge variant={ticket.priority === 'urgent' ? 'destructive' : 'secondary'}>
                  {ticket.priority}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {ticket.category && (
              <div>
                <span className="text-sm text-muted-foreground">Category: </span>
                <Badge variant="outline">{ticket.category}</Badge>
              </div>
            )}
            <div>
              <p className="mb-1 text-sm font-medium">Description:</p>
              <p className="text-sm text-muted-foreground">{ticket.description}</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Created: {format(new Date(ticket.createdAt), 'PPpp')}</span>
              {ticket.updatedAt && (
                <span>Updated: {format(new Date(ticket.updatedAt), 'PPpp')}</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Comments */}
        <Card>
          <CardHeader>
            <CardTitle>Comments ({comments.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {comments.length === 0 ? (
              <p className="text-center text-muted-foreground">No comments yet</p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-4">
                    <Avatar>
                      <AvatarFallback>
                        {comment.author.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{comment.author.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {comment.author.role}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(comment.createdAt), 'PPp')}
                        </span>
                      </div>
                      <p className="text-sm">{comment.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Separator />

            {/* Add Comment Form */}
            {ticket.status !== 'closed' && (
              <form onSubmit={handleAddComment} className="space-y-4">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={4}
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={submitting || !newComment.trim()}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Add Comment
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}

            {ticket.status === 'closed' && (
              <p className="text-center text-sm text-muted-foreground">
                This ticket is closed. No more comments can be added.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Rating (if resolved) */}
        {ticket.status === 'resolved' && !ticket.rating && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="mb-4 text-muted-foreground">Was this support helpful?</p>
              <Button onClick={() => router.push(`/support/tickets/${ticketId}/rate`)}>
                Rate This Support
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
