"use client";

import { useState } from 'react';

interface OnboardingData {
  entity: {
    type: 'Proprietor'|'Partnership'|'LLP'|'Private Ltd'|'Public Ltd'|'Trust'|'PSU';
    legalName: string;
    tradeName?: string;
    cin?: string;
    pan: string;
    gstin?: string;
  };
  contacts: {
    signatory: { name: string; email: string; phone: string; idProof?: string };
    opsManager?: { name: string; email: string; phone: string };
  };
  banking: { accountName: string; accountNumber: string; ifsc: string; bank: string };
  site: { address: string; city: string; state: string; pincode: string; lat?: string; lng?: string };
  electrical: { sanctionedLoadKW: number; discom: string; consumerNo?: string; tariffCategory?: string };
  hardware: { ocpp: '1.6J'|'2.0.1'; connectors: string; network: 'SIM'|'Ethernet'|'WiFi'; tlsReady: boolean };
  documents: { coi?: File|null; moaAoa?: File|null; pan?: File|null; gst?: File|null; bankProof?: File|null; noc?: File|null };
  preferences: { settlementCycle: 'T+1'|'T+3'|'Weekly'; brand?: string };
}

interface Props {
  onSubmit: (data: OnboardingData) => void;
}

export default function OnboardingForm({ onSubmit }: Props) {
  const [data, setData] = useState<OnboardingData>({
    entity: { type: 'Private Ltd', legalName: '', pan: '' },
    contacts: { signatory: { name: '', email: '', phone: '' } },
    banking: { accountName: '', accountNumber: '', ifsc: '', bank: '' },
    site: { address: '', city: '', state: '', pincode: '' },
    electrical: { sanctionedLoadKW: 0, discom: '' },
    hardware: { ocpp: '1.6J', connectors: 'Type-2 / CCS2', network: 'SIM', tlsReady: false },
    documents: {},
    preferences: { settlementCycle: 'T+3' },
  });

  const update = (path: string, value: any) => {
    setData(prev => {
      const clone: any = structuredClone(prev);
      const keys = path.split('.');
      let cur = clone;
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (key) cur = cur[key];
      }
      const lastKey = keys[keys.length - 1];
      if (lastKey) cur[lastKey] = value;
      return clone;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Entity Details Section */}
      <div className="group">
        <div className="mb-3 flex items-center gap-2 border-b border-slate-600/50 pb-2">
          <div className="h-6 w-0.5 bg-gradient-to-b from-emerald-400 to-blue-500 rounded"></div>
          <h3 className="text-sm font-bold text-slate-100 tracking-wide uppercase">Entity Details</h3>
        </div>
        <div className="backdrop-blur-xl bg-slate-800/40 border border-slate-700/50 rounded-lg p-4 hover:border-slate-600/50 transition-all duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="group/field">
              <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">Entity Type *</label>
              <select 
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/20 transition-all duration-200 font-medium"
                value={data.entity.type}
                onChange={e => update('entity.type', e.target.value)}
              >
                {['Proprietor','Partnership','LLP','Private Ltd','Public Ltd','Trust','PSU'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="group/field">
              <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">Legal Name *</label>
              <input 
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/20 transition-all duration-200 font-medium"
                value={data.entity.legalName}
                onChange={e => update('entity.legalName', e.target.value)}
                required
              />
            </div>
            <div className="group/field">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Trade Name</label>
              <input 
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/20 transition-all duration-200 font-medium"
                value={data.entity.tradeName || ''}
                onChange={e => update('entity.tradeName', e.target.value)}
              />
            </div>
            <div className="group/field">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">CIN</label>
              <input 
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/20 transition-all duration-200 font-medium"
                value={data.entity.cin || ''}
                onChange={e => update('entity.cin', e.target.value)}
              />
            </div>
            <div className="group/field">
              <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">PAN *</label>
              <input 
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/20 transition-all duration-200 font-medium"
                value={data.entity.pan}
                onChange={e => update('entity.pan', e.target.value)}
                required
              />
            </div>
            <div className="group/field">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">GSTIN</label>
              <input 
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/20 transition-all duration-200 font-medium"
                value={data.entity.gstin || ''}
                onChange={e => update('entity.gstin', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contacts Section */}
      <div className="group">
        <div className="mb-4 flex items-center gap-3 border-b-2 border-gradient pb-3">
          <div className="h-8 w-1 bg-gradient-to-b from-blue-400 to-purple-500 rounded"></div>
          <h3 className="text-lg font-bold text-slate-100 tracking-wide uppercase">Primary Contacts</h3>
        </div>
        <div className="backdrop-blur-xl bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-all duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="group/field">
              <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Signatory Name *</label>
              <input 
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/20 transition-all duration-200 font-medium"
                value={data.contacts.signatory.name}
                onChange={e => update('contacts.signatory.name', e.target.value)}
                required
              />
            </div>
            <div className="group/field">
              <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Email *</label>
              <input 
                type="email"
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/20 transition-all duration-200 font-medium"
                value={data.contacts.signatory.email}
                onChange={e => update('contacts.signatory.email', e.target.value)}
                required
              />
            </div>
            <div className="group/field">
              <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Phone *</label>
              <input 
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/20 transition-all duration-200 font-medium"
                value={data.contacts.signatory.phone}
                onChange={e => update('contacts.signatory.phone', e.target.value)}
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Banking Section */}
      <div className="group">
        <div className="mb-4 flex items-center gap-3 border-b-2 border-gradient pb-3">
          <div className="h-8 w-1 bg-gradient-to-b from-purple-400 to-pink-500 rounded"></div>
          <h3 className="text-lg font-bold text-slate-100 tracking-wide uppercase">Banking Details</h3>
        </div>
        <div className="backdrop-blur-xl bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-all duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="group/field">
              <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Account Name *</label>
              <input 
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/20 transition-all duration-200 font-medium"
                value={data.banking.accountName}
                onChange={e => update('banking.accountName', e.target.value)}
                required
              />
            </div>
            <div className="group/field">
              <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Account Number *</label>
              <input 
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/20 transition-all duration-200 font-medium"
                value={data.banking.accountNumber}
                onChange={e => update('banking.accountNumber', e.target.value)}
                required
              />
            </div>
            <div className="group/field">
              <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">IFSC Code *</label>
              <input 
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/20 transition-all duration-200 font-medium"
                value={data.banking.ifsc}
                onChange={e => update('banking.ifsc', e.target.value)}
                required
              />
            </div>
            <div className="group/field">
              <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Bank Name *</label>
              <input 
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/20 transition-all duration-200 font-medium"
                value={data.banking.bank}
                onChange={e => update('banking.bank', e.target.value)}
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Site Details Section */}
      <div className="group">
        <div className="mb-4 flex items-center gap-3 border-b-2 border-gradient pb-3">
          <div className="h-8 w-1 bg-gradient-to-b from-cyan-400 to-emerald-500 rounded"></div>
          <h3 className="text-lg font-bold text-slate-100 tracking-wide uppercase">Site Location</h3>
        </div>
        <div className="backdrop-blur-xl bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-all duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2 group/field">
              <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Address *</label>
              <input 
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/20 transition-all duration-200 font-medium"
                value={data.site.address}
                onChange={e => update('site.address', e.target.value)}
                required
              />
            </div>
            <div className="group/field">
              <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">City *</label>
              <input 
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/20 transition-all duration-200 font-medium"
                value={data.site.city}
                onChange={e => update('site.city', e.target.value)}
                required
              />
            </div>
            <div className="group/field">
              <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">State *</label>
              <input 
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/20 transition-all duration-200 font-medium"
                value={data.site.state}
                onChange={e => update('site.state', e.target.value)}
                required
              />
            </div>
            <div className="group/field">
              <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Pincode *</label>
              <input 
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/20 transition-all duration-200 font-medium"
                value={data.site.pincode}
                onChange={e => update('site.pincode', e.target.value)}
                required
              />
            </div>
            <div className="group/field">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Latitude</label>
              <input 
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/20 transition-all duration-200 font-medium"
                value={data.site.lat || ''}
                onChange={e => update('site.lat', e.target.value)}
              />
            </div>
            <div className="group/field">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Longitude</label>
              <input 
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/20 transition-all duration-200 font-medium"
                value={data.site.lng || ''}
                onChange={e => update('site.lng', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Electrical & Hardware Section */}
      <div className="group">
        <div className="mb-4 flex items-center gap-3 border-b-2 border-gradient pb-3">
          <div className="h-8 w-1 bg-gradient-to-b from-yellow-400 to-orange-500 rounded"></div>
          <h3 className="text-lg font-bold text-slate-100 tracking-wide uppercase">Infrastructure</h3>
        </div>
        <div className="backdrop-blur-xl bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-all duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="group/field">
              <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Sanctioned Load (kW)</label>
              <input 
                type="number"
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/20 transition-all duration-200 font-medium"
                value={data.electrical.sanctionedLoadKW}
                onChange={e => update('electrical.sanctionedLoadKW', Number(e.target.value))}
              />
            </div>
            <div className="group/field">
              <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">DISCOM</label>
              <input 
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/20 transition-all duration-200 font-medium"
                value={data.electrical.discom}
                onChange={e => update('electrical.discom', e.target.value)}
              />
            </div>
            <div className="group/field">
              <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">OCPP Version</label>
              <select 
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/20 transition-all duration-200 font-medium"
                value={data.hardware.ocpp}
                onChange={e => update('hardware.ocpp', e.target.value)}
              >
                <option value="1.6J">1.6J</option>
                <option value="2.0.1">2.0.1</option>
              </select>
            </div>
            <div className="group/field">
              <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Network Type</label>
              <select 
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/20 transition-all duration-200 font-medium"
                value={data.hardware.network}
                onChange={e => update('hardware.network', e.target.value)}
              >
                <option value="SIM">SIM</option>
                <option value="Ethernet">Ethernet</option>
                <option value="WiFi">WiFi</option>
              </select>
            </div>
            <div className="md:col-span-2 group/field">
              <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 hover:border-emerald-400/50 transition-all duration-200">
                <input 
                  id="tls"
                  type="checkbox"
                  checked={data.hardware.tlsReady}
                  onChange={e => update('hardware.tlsReady', e.target.checked)}
                  className="w-5 h-5 rounded accent-emerald-400"
                />
                <label htmlFor="tls" className="text-sm font-semibold text-slate-100 flex-1">TLS Ready (for secure OCPP)</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <div className="group">
        <div className="mb-4 flex items-center gap-3 border-b-2 border-gradient pb-3">
          <div className="h-8 w-1 bg-gradient-to-b from-pink-400 to-red-500 rounded"></div>
          <h3 className="text-lg font-bold text-slate-100 tracking-wide uppercase">Documents</h3>
        </div>
        <div className="backdrop-blur-xl bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-all duration-300">
          <p className="text-xs text-slate-400 mb-4 italic">Metadata only in demo mode</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="group/field">
              <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">PAN Document</label>
              <input 
                type="file"
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 file:text-slate-100 file:bg-emerald-600/20 file:border-0 file:rounded file:mr-3 file:px-3 file:py-1 file:text-xs file:font-medium hover:border-emerald-400/50 transition-all duration-200"
                onChange={e => update('documents.pan', e.target.files?.[0] || null)}
              />
            </div>
            <div className="group/field">
              <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">GST Document</label>
              <input 
                type="file"
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 file:text-slate-100 file:bg-emerald-600/20 file:border-0 file:rounded file:mr-3 file:px-3 file:py-1 file:text-xs file:font-medium hover:border-emerald-400/50 transition-all duration-200"
                onChange={e => update('documents.gst', e.target.files?.[0] || null)}
              />
            </div>
            <div className="group/field">
              <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Bank Proof</label>
              <input 
                type="file"
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 file:text-slate-100 file:bg-emerald-600/20 file:border-0 file:rounded file:mr-3 file:px-3 file:py-1 file:text-xs file:font-medium hover:border-emerald-400/50 transition-all duration-200"
                onChange={e => update('documents.bankProof', e.target.files?.[0] || null)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="group">
        <div className="mb-4 flex items-center gap-3 border-b-2 border-gradient pb-3">
          <div className="h-8 w-1 bg-gradient-to-b from-indigo-400 to-blue-500 rounded"></div>
          <h3 className="text-lg font-bold text-slate-100 tracking-wide uppercase">Preferences</h3>
        </div>
        <div className="backdrop-blur-xl bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-all duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="group/field">
              <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Settlement Cycle</label>
              <select 
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/20 transition-all duration-200 font-medium"
                value={data.preferences.settlementCycle}
                onChange={e => update('preferences.settlementCycle', e.target.value)}
              >
                <option value="T+1">T+1 (Next Day)</option>
                <option value="T+3">T+3 (3 Days)</option>
                <option value="Weekly">Weekly</option>
              </select>
            </div>
            <div className="group/field">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Brand (Optional)</label>
              <input 
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/20 transition-all duration-200 font-medium"
                value={data.preferences.brand || ''}
                onChange={e => update('preferences.brand', e.target.value)}
                placeholder="e.g., VoltGrid Pro"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-3 pt-6">
        <button 
          type="submit"
          className="relative group/btn px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 font-bold uppercase tracking-wider rounded-lg shadow-lg hover:shadow-emerald-500/50 hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover/btn:opacity-20 transition-opacity duration-300"></div>
          <span className="relative">Submit Onboarding</span>
        </button>
      </div>
    </form>
  );
}
