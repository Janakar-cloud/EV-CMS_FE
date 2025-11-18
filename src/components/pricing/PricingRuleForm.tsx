"use client";

import { useState } from 'react';
import { PricingRule, PricingModel, SlabTier } from '@/types/pricing';

interface Props {
  initial?: Partial<PricingRule>;
  onSave: (rule: Omit<PricingRule, 'id'|'createdAt'|'updatedAt'>) => void;
  onCancel?: () => void;
}

export default function PricingRuleForm({ initial, onSave, onCancel }: Props) {
  const [name, setName] = useState(initial?.name || '');
  const [scopeLevel, setScopeLevel] = useState<'global'|'site'|'charger'|'connector'>(initial?.scope?.level as any || 'site');
  const [scopeId, setScopeId] = useState(initial?.scope?.id || '');
  const [model, setModel] = useState<PricingModel>(initial?.base?.model || 'slab');
  const [perKWh, setPerKWh] = useState<number>(initial?.base?.perKWh ?? 22);
  const [perMinute, setPerMinute] = useState<number>(initial?.base?.perMinute ?? 0);
  const [minBill, setMinBill] = useState<number>(initial?.base?.minBill ?? 50);
  const [gst, setGst] = useState<number>(initial?.taxes?.gstPercent ?? 18);
  const [active, setActive] = useState<boolean>(initial?.active ?? true);
  const [from, setFrom] = useState<string>(initial?.validity?.from || new Date().toISOString());
  const [to, setTo] = useState<string | ''>(initial?.validity?.to || '');
  const [days, setDays] = useState<Array<'Mon'|'Tue'|'Wed'|'Thu'|'Fri'|'Sat'|'Sun'>>(initial?.validity?.days || ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']);
  const [slabs, setSlabs] = useState<SlabTier[]>(initial?.slabs || [ { uptoKWh: 10, perKWh: 24 }, { uptoKWh: 40, perKWh: 22 }, { uptoKWh: null, perKWh: 20 } ]);
  const [idleGrace, setIdleGrace] = useState<number>(initial?.idleFee?.graceMinutes ?? 10);
  const [idlePerMin, setIdlePerMin] = useState<number>(initial?.idleFee?.perMinute ?? 3);
  const [idleCap, setIdleCap] = useState<number>(initial?.idleFee?.capPerSession ?? 400);
  const [maxMinutes, setMaxMinutes] = useState<number>(initial?.limits?.maxMinutes ?? 90);
  const [maxKWh, setMaxKWh] = useState<number>(initial?.limits?.maxKWh ?? 60);
  const [softStopSoC, setSoftStopSoC] = useState<number>(initial?.limits?.softStopSoC ?? 80);

  const toggleDay = (d: any) => {
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  };

  const addSlab = () => setSlabs(prev => [...prev, { uptoKWh: null, perKWh: perKWh }]);
  const updateSlab = (idx: number, key: keyof SlabTier, val: any) => {
    setSlabs(prev => prev.map((s, i) => i === idx ? { ...s, [key]: key === 'uptoKWh' && val === '' ? null : Number(val) } : s));
  };
  const removeSlab = (idx: number) => setSlabs(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Omit<PricingRule, 'id'|'createdAt'|'updatedAt'> = {
      name,
      scope: { level: scopeLevel as any, id: scopeLevel === 'global' ? undefined : scopeId },
      validity: { from, to: to || null, days },
      base: { model, perKWh, perMinute, minBill },
      slabs: model === 'slab' || model === 'hybrid' ? slabs : undefined,
      idleFee: { graceMinutes: idleGrace, perMinute: idlePerMin, capPerSession: idleCap },
      limits: { maxMinutes, maxKWh, softStopSoC },
      taxes: { gstPercent: gst },
      active,
    };
    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Basics</h3>
          <div className="space-y-3">
            <div>
              <label className="label">Rule Name</label>
              <input className="form-input w-full" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Scope Level</label>
                <select className="form-select w-full" value={scopeLevel} onChange={e => setScopeLevel(e.target.value as any)}>
                  <option value="global">Global</option>
                  <option value="site">Site</option>
                  <option value="charger">Charger</option>
                  <option value="connector">Connector</option>
                </select>
              </div>
              {scopeLevel !== 'global' && (
                <div>
                  <label className="label">Scope ID</label>
                  <input className="form-input w-full" value={scopeId} onChange={e => setScopeId(e.target.value)} placeholder="e.g. SITE-001 or CHG-123/1" />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Model</label>
                <select className="form-select w-full" value={model} onChange={e => setModel(e.target.value as PricingModel)}>
                  <option value="static">Static</option>
                  <option value="slab">Slab</option>
                  <option value="hybrid">Hybrid (kWh + time)</option>
                  <option value="time-of-use">Time of Use</option>
                  <option value="dynamic">Dynamic</option>
                </select>
              </div>
              <div>
                <label className="label">GST %</label>
                <input type="number" className="form-input w-full" value={gst} onChange={e => setGst(Number(e.target.value))} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label">â‚¹/kWh</label>
                <input type="number" className="form-input w-full" value={perKWh} onChange={e => setPerKWh(Number(e.target.value))} />
              </div>
              <div>
                <label className="label">â‚¹/min</label>
                <input type="number" className="form-input w-full" value={perMinute} onChange={e => setPerMinute(Number(e.target.value))} />
              </div>
              <div>
                <label className="label">Min Bill â‚¹</label>
                <input type="number" className="form-input w-full" value={minBill} onChange={e => setMinBill(Number(e.target.value))} />
              </div>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Validity</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">From</label>
                <input type="datetime-local" className="form-input w-full" value={from.slice(0,16)} onChange={e => setFrom(new Date(e.target.value).toISOString())} />
              </div>
              <div>
                <label className="label">To</label>
                <input type="datetime-local" className="form-input w-full" value={to ? to.slice(0,16) : ''} onChange={e => setTo(e.target.value ? new Date(e.target.value).toISOString() : '')} />
              </div>
            </div>
            <div>
              <label className="label">Days</label>
              <div className="flex flex-wrap gap-2">
                {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
                  <button key={d} type="button" onClick={() => toggleDay(d)} className={`px-2 py-1 rounded border ${days.includes(d as any) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}>{d}</button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input id="active" type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />
              <label htmlFor="active">Active</label>
            </div>
          </div>
        </div>
      </div>

      {(model === 'slab' || model === 'hybrid') && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Slabs</h3>
            <button type="button" className="btn btn-sm btn-outline" onClick={addSlab}>Add Slab</button>
          </div>
          <div className="space-y-2">
            {slabs.map((s, idx) => (
              <div key={idx} className="grid grid-cols-3 gap-3 items-end">
                <div>
                  <label className="label">Upto kWh (blank = âˆž)</label>
                  <input className="form-input w-full" value={s.uptoKWh ?? ''} onChange={e => updateSlab(idx, 'uptoKWh', e.target.value)} />
                </div>
                <div>
                  <label className="label">â‚¹/kWh</label>
                  <input className="form-input w-full" value={s.perKWh} onChange={e => updateSlab(idx, 'perKWh', e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => removeSlab(idx)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Idle Fees</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Grace (min)</label>
              <input type="number" className="form-input w-full" value={idleGrace} onChange={e => setIdleGrace(Number(e.target.value))} />
            </div>
            <div>
              <label className="label">â‚¹/min</label>
              <input type="number" className="form-input w-full" value={idlePerMin} onChange={e => setIdlePerMin(Number(e.target.value))} />
            </div>
            <div>
              <label className="label">Cap / session</label>
              <input type="number" className="form-input w-full" value={idleCap} onChange={e => setIdleCap(Number(e.target.value))} />
            </div>
          </div>
        </div>
        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Limits</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Max minutes</label>
              <input type="number" className="form-input w-full" value={maxMinutes} onChange={e => setMaxMinutes(Number(e.target.value))} />
            </div>
            <div>
              <label className="label">Max kWh</label>
              <input type="number" className="form-input w-full" value={maxKWh} onChange={e => setMaxKWh(Number(e.target.value))} />
            </div>
            <div>
              <label className="label">Soft stop SoC %</label>
              <input type="number" className="form-input w-full" value={softStopSoC} onChange={e => setSoftStopSoC(Number(e.target.value))} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        {onCancel && <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>}
        <button type="submit" className="btn btn-primary">Save Rule</button>
      </div>
    </form>
  );
}
