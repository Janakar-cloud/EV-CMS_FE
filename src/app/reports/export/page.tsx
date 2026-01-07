'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ExportJob {
  id: string;
  name: string;
  type: 'revenue' | 'usage' | 'transactions' | 'commission';
  format: 'csv' | 'pdf';
  size: string;
  status: 'ready' | 'processing' | 'failed';
  createdAt: string;
}

export default function ReportsExportPage() {
  const [jobs, setJobs] = useState<ExportJob[]>([
    {
      id: 'exp-1',
      name: 'Revenue_Aug23.csv',
      type: 'revenue',
      format: 'csv',
      size: '24 MB',
      status: 'ready',
      createdAt: '2025-12-20 09:00',
    },
    {
      id: 'exp-2',
      name: 'Util_Report_W52.pdf',
      type: 'usage',
      format: 'pdf',
      size: '12 MB',
      status: 'processing',
      createdAt: '2025-12-29 10:30',
    },
  ]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: 'Custom_Report',
    type: 'revenue',
    format: 'csv',
  });

  const typeLabels: Record<ExportJob['type'], string> = {
    revenue: 'Revenue',
    usage: 'Usage',
    transactions: 'Transactions',
    commission: 'Commission',
  };

  const badgeVariant = (status: ExportJob['status']) => {
    switch (status) {
      case 'ready':
        return 'default';
      case 'processing':
        return 'secondary';
      default:
        return 'destructive';
    }
  };

  const filtered = useMemo(() => jobs, [jobs]);

  const handleCreate = async () => {
    try {
      setCreating(true);
      await new Promise((res) => setTimeout(res, 300));
      const next: ExportJob = {
        id: `exp-${jobs.length + 1}`,
        name: `${form.name}.${form.format}`,
        type: form.type as ExportJob['type'],
        format: form.format as ExportJob['format'],
        size: 'pending',
        status: 'processing',
        createdAt: new Date().toLocaleString(),
      };
      setJobs([next, ...jobs]);
      toast.success('Export job created');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create export');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Report Exports</h1>
        <p className="text-muted-foreground">Schedule and download generated reports</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create export</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="File name"
            />
            <select
              className="rounded-md border bg-background px-3 py-2"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="revenue">Revenue</option>
              <option value="usage">Usage</option>
              <option value="transactions">Transactions</option>
              <option value="commission">Commission</option>
            </select>
            <select
              className="rounded-md border bg-background px-3 py-2"
              value={form.format}
              onChange={(e) => setForm({ ...form, format: e.target.value })}
            >
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
            </select>
          </div>
          <Button onClick={handleCreate} disabled={creating}>
            {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
            Generate
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent exports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">No exports yet.</p>
          ) : (
            filtered.map((job) => (
              <div key={job.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">{job.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {typeLabels[job.type]} · {job.format.toUpperCase()} · {job.createdAt}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={badgeVariant(job.status)} className="capitalize">
                    {job.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{job.size}</span>
                  <Button size="sm" variant="outline" disabled={job.status !== 'ready'}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
