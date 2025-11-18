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
      for (let i=0;i<keys.length-1;i++) cur = cur[keys[i]];
      cur[keys[keys.length-1]] = value;
      return clone;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Entity Details</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Type</label>
              <select className="form-select w-full" value={data.entity.type} onChange={e => update('entity.type', e.target.value)}>
                {['Proprietor','Partnership','LLP','Private Ltd','Public Ltd','Trust','PSU'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Legal Name</label>
              <input className="form-input w-full" value={data.entity.legalName} onChange={e => update('entity.legalName', e.target.value)} required />
            </div>
            <div>
              <label className="label">Trade Name</label>
              <input className="form-input w-full" value={data.entity.tradeName || ''} onChange={e => update('entity.tradeName', e.target.value)} />
            </div>
            <div>
              <label className="label">CIN</label>
              <input className="form-input w-full" value={data.entity.cin || ''} onChange={e => update('entity.cin', e.target.value)} />
            </div>
            <div>
              <label className="label">PAN</label>
              <input className="form-input w-full" value={data.entity.pan} onChange={e => update('entity.pan', e.target.value)} required />
            </div>
            <div>
              <label className="label">GSTIN</label>
              <input className="form-input w-full" value={data.entity.gstin || ''} onChange={e => update('entity.gstin', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Contacts</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Signatory Name</label>
              <input className="form-input w-full" value={data.contacts.signatory.name} onChange={e => update('contacts.signatory.name', e.target.value)} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="form-input w-full" value={data.contacts.signatory.email} onChange={e => update('contacts.signatory.email', e.target.value)} required />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="form-input w-full" value={data.contacts.signatory.phone} onChange={e => update('contacts.signatory.phone', e.target.value)} required />
            </div>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Banking</h3>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="label">Account Name</label>
              <input className="form-input w-full" value={data.banking.accountName} onChange={e => update('banking.accountName', e.target.value)} required />
            </div>
            <div>
              <label className="label">Account Number</label>
              <input className="form-input w-full" value={data.banking.accountNumber} onChange={e => update('banking.accountNumber', e.target.value)} required />
            </div>
            <div>
              <label className="label">IFSC</label>
              <input className="form-input w-full" value={data.banking.ifsc} onChange={e => update('banking.ifsc', e.target.value)} required />
            </div>
            <div>
              <label className="label">Bank</label>
              <input className="form-input w-full" value={data.banking.bank} onChange={e => update('banking.bank', e.target.value)} required />
            </div>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Site</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="label">Address</label>
              <input className="form-input w-full" value={data.site.address} onChange={e => update('site.address', e.target.value)} required />
            </div>
            <div>
              <label className="label">City</label>
              <input className="form-input w-full" value={data.site.city} onChange={e => update('site.city', e.target.value)} required />
            </div>
            <div>
              <label className="label">State</label>
              <input className="form-input w-full" value={data.site.state} onChange={e => update('site.state', e.target.value)} required />
            </div>
            <div>
              <label className="label">Pincode</label>
              <input className="form-input w-full" value={data.site.pincode} onChange={e => update('site.pincode', e.target.value)} required />
            </div>
            <div>
              <label className="label">Latitude</label>
              <input className="form-input w-full" value={data.site.lat || ''} onChange={e => update('site.lat', e.target.value)} />
            </div>
            <div>
              <label className="label">Longitude</label>
              <input className="form-input w-full" value={data.site.lng || ''} onChange={e => update('site.lng', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Electrical & Hardware</h3>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="label">Sanctioned Load (kW)</label>
              <input type="number" className="form-input w-full" value={data.electrical.sanctionedLoadKW} onChange={e => update('electrical.sanctionedLoadKW', Number(e.target.value))} />
            </div>
            <div>
              <label className="label">DISCOM</label>
              <input className="form-input w-full" value={data.electrical.discom} onChange={e => update('electrical.discom', e.target.value)} />
            </div>
            <div>
              <label className="label">OCPP</label>
              <select className="form-select w-full" value={data.hardware.ocpp} onChange={e => update('hardware.ocpp', e.target.value)}>
                <option value="1.6J">1.6J</option>
                <option value="2.0.1">2.0.1</option>
              </select>
            </div>
            <div>
              <label className="label">Network</label>
              <select className="form-select w-full" value={data.hardware.network} onChange={e => update('hardware.network', e.target.value)}>
                <option value="SIM">SIM</option>
                <option value="Ethernet">Ethernet</option>
                <option value="WiFi">WiFi</option>
              </select>
            </div>
            <div className="col-span-4 flex items-center gap-2">
              <input id="tls" type="checkbox" checked={data.hardware.tlsReady} onChange={e => update('hardware.tlsReady', e.target.checked)} />
              <label htmlFor="tls">TLS Ready (for secure OCPP)</label>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Documents (metadata only in demo)</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">PAN</label>
              <input type="file" className="form-input w-full" onChange={e => update('documents.pan', e.target.files?.[0] || null)} />
            </div>
            <div>
              <label className="label">GST</label>
              <input type="file" className="form-input w-full" onChange={e => update('documents.gst', e.target.files?.[0] || null)} />
            </div>
            <div>
              <label className="label">Bank Proof</label>
              <input type="file" className="form-input w-full" onChange={e => update('documents.bankProof', e.target.files?.[0] || null)} />
            </div>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Preferences</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Settlement Cycle</label>
              <select className="form-select w-full" value={data.preferences.settlementCycle} onChange={e => update('preferences.settlementCycle', e.target.value)}>
                <option value="T+1">T+1</option>
                <option value="T+3">T+3</option>
                <option value="Weekly">Weekly</option>
              </select>
            </div>
            <div>
              <label className="label">Brand (optional)</label>
              <input className="form-input w-full" value={data.preferences.brand || ''} onChange={e => update('preferences.brand', e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button type="submit" className="btn btn-primary">Submit Onboarding</button>
      </div>
    </form>
  );
}
