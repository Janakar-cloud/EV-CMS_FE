'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { rfidService } from '@/lib/rfid-service';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Zap } from 'lucide-react';

interface RegistrationForm {
  uid: string;
  userId: string;
  vehicleId: string;
  cardName: string;
  cardType: 'user' | 'vehicle' | 'both';
  expiryDate: string;
}

export default function RFIDRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegistrationForm>({
    uid: '',
    userId: '',
    vehicleId: '',
    cardName: '',
    cardType: 'user',
    expiryDate: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [scanMode, setScanMode] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.uid.trim()) {
      newErrors.uid = 'RFID UID is required (can be scanned from card)';
    }
    if (!formData.userId.trim()) {
      newErrors.userId = 'User ID is required';
    }
    if (formData.cardType === 'vehicle' && !formData.vehicleId.trim()) {
      newErrors.vehicleId = 'Vehicle ID is required for vehicle cards';
    }
    if (formData.cardType === 'both' && !formData.vehicleId.trim()) {
      newErrors.vehicleId = 'Vehicle ID is required for combined cards';
    }
    if (!formData.cardName.trim()) {
      newErrors.cardName = 'Card name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      await rfidService.registerCard({
        uid: formData.uid,
        userId: formData.userId,
        vehicleId: formData.vehicleId || undefined,
        cardName: formData.cardName,
        cardType: formData.cardType,
        expiryDate: formData.expiryDate || undefined,
      });

      toast.success('RFID card registered successfully!');
      setTimeout(() => {
        router.push('/rfid');
      }, 1500);
    } catch (error: any) {
      toast.error(error.message || 'Failed to register card');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNFCScan = async () => {
    // In a real implementation, this would trigger NFC reader
    // For now, show a prompt
    const uid = prompt('Please scan NFC card or enter UID manually:');
    if (uid) {
      setFormData((prev) => ({ ...prev, uid }));
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-300 hover:text-white mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="text-4xl font-bold text-white">Register RFID Card</h1>
          <p className="mt-2 text-slate-300">Create a new NFC card mapping for user or vehicle access</p>
        </div>

        {/* Registration Form */}
        <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg border border-slate-600 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* RFID UID Section */}
            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
              <label className="block text-sm font-semibold text-white mb-3">RFID Card UID *</label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="uid"
                    value={formData.uid}
                    onChange={handleInputChange}
                    placeholder="e.g., 04:12:34:56:78:90:AB"
                    className="flex-1 bg-white text-slate-900 border border-slate-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleNFCScan}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    Scan NFC
                  </button>
                </div>
                {errors.uid && <p className="text-red-400 text-sm">{errors.uid}</p>}
                <p className="text-xs text-slate-400">
                  Unique identifier from the NFC card (typically hexadecimal format)
                </p>
              </div>
            </div>

            {/* Card Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-white mb-3">Card Type *</label>
              <div className="grid grid-cols-3 gap-3">
                {(['user', 'vehicle', 'both'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, cardType: type }))}
                    className={`p-3 rounded-md border-2 transition font-medium capitalize ${
                      formData.cardType === type
                        ? 'border-emerald-500 bg-emerald-600/20 text-white'
                        : 'border-slate-500 bg-slate-700/50 text-slate-300 hover:border-slate-400'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Select whether this card identifies a user, vehicle, or both
              </p>
            </div>

            {/* User ID */}
            <div>
              <label htmlFor="userId" className="block text-sm font-semibold text-white mb-2">
                User ID *
              </label>
              <input
                type="text"
                id="userId"
                name="userId"
                value={formData.userId}
                onChange={handleInputChange}
                placeholder="e.g., user123 or admin@example.com"
                className={`w-full bg-white text-slate-900 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.userId ? 'border-red-500' : 'border-slate-400'
                }`}
              />
              {errors.userId && <p className="text-red-400 text-sm mt-1">{errors.userId}</p>}
            </div>

            {/* Vehicle ID (conditional) */}
            {(formData.cardType === 'vehicle' || formData.cardType === 'both') && (
              <div>
                <label htmlFor="vehicleId" className="block text-sm font-semibold text-white mb-2">
                  Vehicle ID {(formData.cardType === 'vehicle' || formData.cardType === 'both') && '*'}
                </label>
                <input
                  type="text"
                  id="vehicleId"
                  name="vehicleId"
                  value={formData.vehicleId}
                  onChange={handleInputChange}
                  placeholder="e.g., vehicle456 or registration number"
                  className={`w-full bg-white text-slate-900 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors.vehicleId ? 'border-red-500' : 'border-slate-400'
                  }`}
                />
                {errors.vehicleId && <p className="text-red-400 text-sm mt-1">{errors.vehicleId}</p>}
              </div>
            )}

            {/* Card Name */}
            <div>
              <label htmlFor="cardName" className="block text-sm font-semibold text-white mb-2">
                Card Name *
              </label>
              <input
                type="text"
                id="cardName"
                name="cardName"
                value={formData.cardName}
                onChange={handleInputChange}
                placeholder="e.g., Main Card, Office Card, Backup"
                className={`w-full bg-white text-slate-900 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.cardName ? 'border-red-500' : 'border-slate-400'
                }`}
              />
              {errors.cardName && <p className="text-red-400 text-sm mt-1">{errors.cardName}</p>}
            </div>

            {/* Expiry Date */}
            <div>
              <label htmlFor="expiryDate" className="block text-sm font-semibold text-white mb-2">
                Expiry Date (Optional)
              </label>
              <input
                type="date"
                id="expiryDate"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                className="w-full bg-white text-slate-900 border border-slate-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-xs text-slate-400 mt-1">Leave blank for no expiration</p>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-6 border-t border-slate-600">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-4 py-2 border border-slate-500 rounded-md text-slate-300 hover:bg-slate-600 font-medium transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  'Register Card'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-900/30 border border-blue-700 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">Registration Guide</h3>
          <ul className="text-blue-200 text-sm space-y-1">
            <li>• Ensure you have the NFC card ready</li>
            <li>• Click "Scan NFC" to read the card automatically</li>
            <li>• User ID must exist in the system</li>
            <li>• For vehicle cards, select the associated vehicle</li>
            <li>• Cards are active immediately after registration</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
