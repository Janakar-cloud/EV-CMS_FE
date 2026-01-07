'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Flag, CheckCircle2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Review {
  id: string;
  stationName: string;
  userName: string;
  rating: number;
  comment: string;
  status: 'pending' | 'published' | 'flagged';
  createdAt: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/admin/reviews');
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (id: string, action: 'publish' | 'flag') => {
    try {
      setProcessing(id);
      const response = await fetch(`/api/v1/admin/reviews/${id}/moderate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!response.ok) throw new Error('Failed to moderate review');
      setReviews((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, status: action === 'publish' ? 'published' : 'flagged' }
            : r
        )
      );
      toast.success(`Review ${action === 'publish' ? 'published' : 'flagged'}`);
    } catch (error: any) {
      toast.error(error.message || 'Action failed');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Review Moderation</h1>
        <p className="text-muted-foreground">Approve or flag user feedback across stations</p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No reviews to moderate
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>{review.stationName}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {review.userName} · {format(new Date(review.createdAt), 'PPp')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={review.status === 'published' ? 'default' : 'secondary'}>
                    {review.status}
                  </Badge>
                  <div className="flex items-center gap-1 text-yellow-500">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className={`h-4 w-4 ${idx < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                      />
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-foreground">{review.comment}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    disabled={processing === review.id}
                    onClick={() => handleModerate(review.id, 'publish')}
                  >
                    {processing === review.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                    )}
                    Publish
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={processing === review.id}
                    onClick={() => handleModerate(review.id, 'flag')}
                  >
                    {processing === review.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Flag className="mr-2 h-4 w-4" />
                    )}
                    Flag
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
