'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { bookingService } from '@/lib/booking-service';
import type { Booking } from '@/types/booking';
import { toast } from 'sonner';
import { ArrowLeft, Calendar, Clock, MapPin, Zap, Loader2, Star } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';

export default function BookingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      loadBookingDetails();
    }
  }, [bookingId]);

  const loadBookingDetails = async () => {
    try {
      const data = await bookingService.getBooking(bookingId);
      setBooking(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await bookingService.cancelBooking(bookingId);
      toast.success('Booking cancelled successfully');
      router.push('/bookings');
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel booking');
    }
  };

  const handleRateBooking = () => {
    router.push(`/bookings/${bookingId}/rate`);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return <div>Booking not found</div>;
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      pending: { variant: 'secondary', label: 'Pending' },
      confirmed: { variant: 'default', label: 'Confirmed' },
      active: { variant: 'default', label: 'Active' },
      completed: { variant: 'outline', label: 'Completed' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Bookings
      </Button>

      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{booking.station.name}</CardTitle>
                <CardDescription className="mt-2">
                  Booking ID: {booking.id}
                </CardDescription>
              </div>
              {getStatusBadge(booking.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{booking.station.address}</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {format(new Date(booking.scheduledTime), 'PPP')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {format(new Date(booking.scheduledTime), 'p')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connector Details */}
        <Card>
          <CardHeader>
            <CardTitle>Connector Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium">{booking.connector.type}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Power</span>
              <span className="font-medium">{booking.connector.power} kW</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge>{booking.connector.status}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Details */}
        {booking.vehicle && (
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Model</span>
                <span className="font-medium">
                  {booking.vehicle.make} {booking.vehicle.model}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Registration</span>
                <span className="font-medium">{booking.vehicle.registrationNumber}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cost Breakdown */}
        {booking.totalCost && (
          <Card>
            <CardHeader>
              <CardTitle>Cost Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Energy Cost</span>
                <span>₹{booking.totalCost.energyCost.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Service Fee</span>
                <span>₹{booking.totalCost.serviceFee.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>₹{booking.totalCost.tax.toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total Amount</span>
                <span>₹{booking.totalCost.totalAmount.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rating */}
        {booking.rating && (
          <Card>
            <CardHeader>
              <CardTitle>Your Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="text-lg font-semibold">{booking.rating.rating}/5</span>
              </div>
              {booking.rating.comment && (
                <p className="mt-2 text-sm text-muted-foreground">{booking.rating.comment}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          {booking.status === 'confirmed' && (
            <Button variant="destructive" className="flex-1" onClick={handleCancelBooking}>
              Cancel Booking
            </Button>
          )}
          {booking.status === 'completed' && !booking.rating && (
            <Button className="flex-1" onClick={handleRateBooking}>
              <Star className="mr-2 h-4 w-4" />
              Rate This Booking
            </Button>
          )}
          {booking.status === 'active' && (
            <Button
              className="flex-1"
              onClick={() => router.push(`/sessions/${booking.id}`)}
            >
              <Zap className="mr-2 h-4 w-4" />
              View Active Session
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
