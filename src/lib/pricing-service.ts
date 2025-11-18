import { PricingRule } from '@/types/pricing';

const KEY = 'evcms_pricing_rules_v1';

function load(): PricingRule[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(rules: PricingRule[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(rules));
}

export const pricingService = {
  list(): PricingRule[] {
    return load().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  },
  get(id: string): PricingRule | undefined {
    return load().find(r => r.id === id);
  },
  create(rule: Omit<PricingRule, 'id'|'createdAt'|'updatedAt'>): PricingRule {
    const rules = load();
    const now = new Date().toISOString();
    const newRule: PricingRule = { ...rule, id: crypto.randomUUID(), createdAt: now, updatedAt: now } as PricingRule;
    rules.push(newRule);
    save(rules);
    return newRule;
  },
  update(id: string, patch: Partial<PricingRule>): PricingRule | undefined {
    const rules = load();
    const idx = rules.findIndex(r => r.id === id);
    if (idx === -1) return undefined;
    const updated = { ...rules[idx], ...patch, updatedAt: new Date().toISOString() } as PricingRule;
    rules[idx] = updated;
    save(rules);
    return updated;
  },
  remove(id: string): boolean {
    const rules = load();
    const next = rules.filter(r => r.id !== id);
    save(next);
    return rules.length !== next.length;
  },
  seedIfEmpty() {
    const rules = load();
    if (rules.length > 0) return;
    const now = new Date().toISOString();
    const seed: PricingRule = {
      id: 'seed-1',
      name: 'Default DC Highway',
      scope: { level: 'site', id: 'SITE-HWY-01' },
      validity: { from: now, to: null, days: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] },
      base: { model: 'slab', perKWh: 22, minBill: 50 },
      slabs: [
        { uptoKWh: 10, perKWh: 24 },
        { uptoKWh: 40, perKWh: 22 },
        { uptoKWh: null, perKWh: 20 }
      ],
      tou: [
        { window: '17:00-22:00', multiplier: 1.1 },
        { window: '22:00-06:00', multiplier: 0.95 }
      ],
      idleFee: { graceMinutes: 10, perMinute: 3, capPerSession: 400 },
      limits: { maxMinutes: 90, maxKWh: 60, softStopSoC: 80 },
      segments: [
        { segment: 'registered', kWhDiscount: 1 },
        { segment: 'fleet', kWhDiscount: 2 }
      ],
      location: { zone: 'highway', multiplier: 1.05 },
      taxes: { gstPercent: 18 },
      createdAt: now,
      updatedAt: now,
      active: true,
    };
    save([seed]);
  }
};
