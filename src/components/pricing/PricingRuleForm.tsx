'use client';

import { useState } from 'react';
import { PricingRule, PricingModel, SlabTier } from '@/types/pricing';

interface Props {
  initial?: Partial<PricingRule>;
  onSave: (rule: Omit<PricingRule, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel?: () => void;
  disabled?: boolean;
}

export default function PricingRuleForm({ initial, onSave, onCancel, disabled }: Props) {
  const [name, setName] = useState(initial?.name || '');
  const [scopeLevel, setScopeLevel] = useState<'global' | 'site' | 'charger' | 'connector'>(
    (initial?.scope?.level as any) || 'site'
  );
  const [scopeId, setScopeId] = useState(initial?.scope?.id || '');
  const [model, setModel] = useState<PricingModel>(initial?.base?.model || 'slab');
  const [perKWh, setPerKWh] = useState<number>(initial?.base?.perKWh ?? 22);
  const [perMinute, setPerMinute] = useState<number>(initial?.base?.perMinute ?? 0);
  const [minBill, setMinBill] = useState<number>(initial?.base?.minBill ?? 50);
  const [gst, setGst] = useState<number>(initial?.taxes?.gstPercent ?? 18);
  const [active, setActive] = useState<boolean>(initial?.active ?? true);
  const [from, setFrom] = useState<string>(initial?.validity?.from || new Date().toISOString());
  const [to, setTo] = useState<string | ''>(initial?.validity?.to || '');
  const [days, setDays] = useState<Array<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'>>(
    initial?.validity?.days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  );
  const [slabs, setSlabs] = useState<SlabTier[]>(
    initial?.slabs || [
      { uptoKWh: 10, perKWh: 24 },
      { uptoKWh: 40, perKWh: 22 },
      { uptoKWh: null, perKWh: 20 },
    ]
  );
  const [idleGrace, setIdleGrace] = useState<number>(initial?.idleFee?.graceMinutes ?? 10);
  const [idlePerMin, setIdlePerMin] = useState<number>(initial?.idleFee?.perMinute ?? 3);
  const [idleCap, setIdleCap] = useState<number>(initial?.idleFee?.capPerSession ?? 400);
  const [maxMinutes, setMaxMinutes] = useState<number>(initial?.limits?.maxMinutes ?? 90);
  const [maxKWh, setMaxKWh] = useState<number>(initial?.limits?.maxKWh ?? 60);
  const [softStopSoC, setSoftStopSoC] = useState<number>(initial?.limits?.softStopSoC ?? 80);

  const toggleDay = (d: any) => {
    setDays(prev => (prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]));
  };

  const addSlab = () => setSlabs(prev => [...prev, { uptoKWh: null, perKWh: perKWh }]);
  const updateSlab = (idx: number, key: keyof SlabTier, val: any) => {
    setSlabs(prev =>
      prev.map((s, i) =>
        i === idx ? { ...s, [key]: key === 'uptoKWh' && val === '' ? null : Number(val) } : s
      )
    );
  };
  const removeSlab = (idx: number) => setSlabs(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Omit<PricingRule, 'id' | 'createdAt' | 'updatedAt'> = {
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-600 bg-gradient-to-br from-slate-700 to-slate-800 p-4">
          <h3 className="mb-3 text-lg font-bold text-white">Basics</h3>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-300">Rule Name</label>
              <input
                disabled={disabled}
                className="w-full rounded border border-slate-500 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-300">
                  Scope Level
                </label>
                <select
                  disabled={disabled}
                  className="w-full rounded border border-slate-500 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={scopeLevel}
                  onChange={e => setScopeLevel(e.target.value as any)}
                >
                  <option value="global">Global</option>
                  <option value="site">Site</option>
                  <option value="charger">Charger</option>
                  <option value="connector">Connector</option>
                </select>
              </div>
              {scopeLevel !== 'global' && (
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-300">
                    Scope ID
                  </label>
                  <input
                    disabled={disabled}
                    className="w-full rounded border border-slate-500 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={scopeId}
                    onChange={e => setScopeId(e.target.value)}
                    placeholder="e.g. SITE-001 or CHG-123/1"
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-300">Model</label>
                <select
                  disabled={disabled}
                  className="w-full rounded border border-slate-500 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={model}
                  onChange={e => setModel(e.target.value as PricingModel)}
                >
                  <option value="static">Static</option>
                  <option value="slab">Slab</option>
                  <option value="hybrid">Hybrid (kWh + time)</option>
                  <option value="time-of-use">Time of Use</option>
                  <option value="dynamic">Dynamic</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-300">GST %</label>
                <input
                  disabled={disabled}
                  type="number"
                  className="w-full rounded border border-slate-500 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={gst}
                  onChange={e => setGst(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-300">₹/kWh</label>
                <input
                  disabled={disabled}
                  type="number"
                  className="w-full rounded border border-slate-500 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={perKWh}
                  onChange={e => setPerKWh(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-300">₹/min</label>
                <input
                  disabled={disabled}
                  type="number"
                  className="w-full rounded border border-slate-500 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={perMinute}
                  onChange={e => setPerMinute(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-300">
                  Min Bill ₹
                </label>
                <input
                  disabled={disabled}
                  type="number"
                  className="w-full rounded border border-slate-500 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={minBill}
                  onChange={e => setMinBill(Number(e.target.value))}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-600 bg-gradient-to-br from-slate-700 to-slate-800 p-4">
          <h3 className="mb-3 text-lg font-bold text-white">Validity</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-300">From</label>
                <input
                  disabled={disabled}
                  type="datetime-local"
                  className="w-full rounded border border-slate-500 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={from.slice(0, 16)}
                  onChange={e => setFrom(new Date(e.target.value).toISOString())}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-300">To</label>
                <input
                  disabled={disabled}
                  type="datetime-local"
                  className="w-full rounded border border-slate-500 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={to ? to.slice(0, 16) : ''}
                  onChange={e =>
                    setTo(e.target.value ? new Date(e.target.value).toISOString() : '')
                  }
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">Days</label>
              <div className="flex flex-wrap gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                  <button
                    key={d}
                    disabled={disabled}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={`rounded border px-3 py-1 font-semibold transition ${days.includes(d as any) ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                disabled={disabled}
                id="active"
                type="checkbox"
                checked={active}
                onChange={e => setActive(e.target.checked)}
                className="h-4 w-4 rounded accent-emerald-600"
              />
              <label htmlFor="active" className="font-semibold text-slate-300">
                Active
              </label>
            </div>
          </div>
        </div>
      </div>

      {(model === 'slab' || model === 'hybrid') && (
        <div className="rounded-lg border border-slate-600 bg-gradient-to-br from-slate-700 to-slate-800 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Slabs</h3>
            <button
              disabled={disabled}
              type="button"
              className="rounded bg-emerald-600 px-3 py-1 text-sm font-semibold text-white hover:bg-emerald-700"
              onClick={addSlab}
            >
              Add Slab
            </button>
          </div>
          <div className="space-y-2">
            {slabs.map((s, idx) => (
              <div key={idx} className="grid grid-cols-3 items-end gap-3">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-300">
                    Upto kWh (blank = ∞)
                  </label>
                  <input
                    disabled={disabled}
                    className="w-full rounded border border-slate-500 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={s.uptoKWh ?? ''}
                    onChange={e => updateSlab(idx, 'uptoKWh', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-300">₹/kWh</label>
                  <input
                    disabled={disabled}
                    className="w-full rounded border border-slate-500 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={s.perKWh}
                    onChange={e => updateSlab(idx, 'perKWh', e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={disabled}
                    type="button"
                    className="rounded bg-red-600 px-3 py-1 text-sm font-semibold text-white hover:bg-red-700"
                    onClick={() => removeSlab(idx)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-600 bg-gradient-to-br from-slate-700 to-slate-800 p-4">
          <h3 className="mb-3 text-lg font-bold text-white">Idle Fees</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-300">Grace (min)</label>
              <input
                disabled={disabled}
                type="number"
                className="w-full rounded border border-slate-500 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={idleGrace}
                onChange={e => setIdleGrace(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-300">₹/min</label>
              <input
                disabled={disabled}
                type="number"
                className="w-full rounded border border-slate-500 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={idlePerMin}
                onChange={e => setIdlePerMin(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-300">
                Cap / session
              </label>
              <input
                disabled={disabled}
                type="number"
                className="w-full rounded border border-slate-500 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={idleCap}
                onChange={e => setIdleCap(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-600 bg-gradient-to-br from-slate-700 to-slate-800 p-4">
          <h3 className="mb-3 text-lg font-bold text-white">Limits</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-300">Max minutes</label>
              <input
                disabled={disabled}
                type="number"
                className="w-full rounded border border-slate-500 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={maxMinutes}
                onChange={e => setMaxMinutes(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-300">Max kWh</label>
              <input
                disabled={disabled}
                type="number"
                className="w-full rounded border border-slate-500 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={maxKWh}
                onChange={e => setMaxKWh(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-300">
                Soft stop SoC %
              </label>
              <input
                disabled={disabled}
                type="number"
                className="w-full rounded border border-slate-500 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={softStopSoC}
                onChange={e => setSoftStopSoC(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <button
            disabled={disabled}
            type="button"
            className="rounded border border-slate-600 bg-slate-700 px-4 py-2 font-semibold text-white hover:bg-slate-600"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
        <button
          disabled={disabled}
          type="submit"
          className="rounded bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
        >
          Save Rule
        </button>
      </div>
    </form>
  );
}
