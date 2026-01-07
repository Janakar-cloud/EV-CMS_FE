'use client';

import PricingRuleForm from '@/components/pricing/PricingRuleForm';
import { pricingService } from '@/lib/pricing-service';
import { PricingRule } from '@/types/pricing';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function PricingRuleAddPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSave = async (payload: Omit<PricingRule, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setSaving(true);
      await pricingService.create(payload);
      toast.success('Pricing rule created');
      router.push('/pricing/rules');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create pricing rule');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Pricing / Rules</p>
            <h1 className="text-3xl font-bold">Add Pricing Rule</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button disabled>
              <Loader2 className="mr-2 h-4 w-4" />
              Auto-save
            </Button>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Rule details</CardTitle>
          </CardHeader>
          <CardContent>
            <PricingRuleForm onSave={handleSave} onCancel={() => router.back()} disabled={saving} />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
