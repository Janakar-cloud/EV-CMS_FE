'use client';

import React, { useState, useEffect, useCallback } from 'react';
import bookingService, { Booking, BookingFilters } from '@/lib/booking-service';

export default function BookingList() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<BookingFilters>({ page: 1, limit: 10 });
  const [showForm, setShowForm] = useState(false);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await bookingService.listBookings(filters);
      setBookings(data);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await bookingService.cancelBooking(id);
      loadBookings();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleStart = async (id: string) => {
    try {
      await bookingService.startBooking(id);
      loadBookings();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await bookingService.completeBooking(id);
      loadBookings();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-blue-900/30 text-blue-300 border border-blue-700',
      in_progress: 'bg-yellow-900/30 text-yellow-300 border border-yellow-700',
      completed: 'bg-green-900/30 text-green-300 border border-green-700',
      cancelled: 'bg-red-900/30 text-red-300 border border-red-700',
    };
    return colors[status] || 'bg-slate-700/30 text-slate-300 border border-slate-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Bookings</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
        >
          {showForm ? 'Cancel' : 'New Booking'}
        </button>
      </div>

      {error && (
        <div className="rounded border border-red-700 bg-red-900/30 p-4 text-red-300">{error}</div>
      )}

      {showForm && (
        <BookingForm
          onSuccess={() => {
            setShowForm(false);
            loadBookings();
          }}
        />
      )}

      <div className="grid gap-4">
        {loading ? (
          <div className="py-8 text-center text-slate-400">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="py-8 text-center text-slate-400">No bookings found</div>
        ) : (
          bookings.map(booking => (
            <div
              key={booking.id}
              className="rounded-lg border border-slate-600 bg-gradient-to-br from-slate-700/50 to-slate-800/50 p-4 shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white">{booking.bookingReference}</h3>
                    <span className={`rounded px-2 py-1 text-sm ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-300">
                    {booking.bookedFrom} to {booking.bookedUntil}
                  </p>
                  <p className="text-sm text-slate-300">
                    Charger: {booking.chargerId} | Cost: ₹
                    {typeof booking.cost === 'number' ? booking.cost : (booking.cost?.total ?? 0)}
                  </p>
                </div>
                <div className="flex gap-2">
                  {booking.status === 'active' && (
                    <button
                      onClick={() => handleStart(booking.id)}
                      className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                    >
                      Start
                    </button>
                  )}
                  {booking.status === 'in_progress' && (
                    <button
                      onClick={() => handleComplete(booking.id)}
                      className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                    >
                      Complete
                    </button>
                  )}
                  {['active', 'in_progress'].includes(booking.status) && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

interface BookingFormProps {
  onSuccess: () => void;
}

function BookingForm({ onSuccess }: BookingFormProps) {
  const [formData, setFormData] = useState({
    stationId: '',
    chargerId: '',
    bookedFrom: '',
    bookedUntil: '',
    vehicleId: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await bookingService.createBooking(formData);
      onSuccess();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-slate-600 bg-gradient-to-br from-slate-700 to-slate-800 p-6"
    >
      <h2 className="mb-4 text-lg font-bold text-white">Create New Booking</h2>

      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Station ID"
          value={formData.stationId}
          onChange={e => setFormData({ ...formData, stationId: e.target.value })}
          className="rounded border border-slate-500 bg-white p-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
        <input
          type="text"
          placeholder="Charger ID"
          value={formData.chargerId}
          onChange={e => setFormData({ ...formData, chargerId: e.target.value })}
          className="rounded border border-slate-500 bg-white p-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
        <input
          type="datetime-local"
          placeholder="Booked From"
          value={formData.bookedFrom}
          onChange={e => setFormData({ ...formData, bookedFrom: e.target.value })}
          className="rounded border border-slate-500 bg-white p-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
        <input
          type="datetime-local"
          placeholder="Booked Until"
          value={formData.bookedUntil}
          onChange={e => setFormData({ ...formData, bookedUntil: e.target.value })}
          className="rounded border border-slate-500 bg-white p-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-4 rounded bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Booking'}
      </button>
    </form>
  );
}
