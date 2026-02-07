'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, Shield, Mail, Phone, Clock3, CheckCircle2, Ban } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import adminUsersService, { type AdminUserSummary } from '@/lib/admin-users-service';

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<AdminUserSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadUser();
  }, [params?.id]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const data = await adminUsersService.getUser(params?.id as string);
      setUser(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load user');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!user) return;
    try {
      setUpdating(true);
      const nextStatus = user.status === 'active' ? 'suspended' : 'active';
      await adminUsersService.updateUserStatus(user.id, nextStatus);
      setUser({ ...user, status: nextStatus });
      toast.success(`User ${nextStatus === 'active' ? 'activated' : 'suspended'}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Unable to find user
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-muted-foreground">User details and account controls</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/admin/users')}>
            Back to users
          </Button>
          <Button
            variant={user.status === 'active' ? 'destructive' : 'default'}
            onClick={handleStatusToggle}
            disabled={updating}
          >
            {updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {user.status === 'active' ? (
              <Ban className="mr-2 h-4 w-4" />
            ) : (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            )}
            {user.status === 'active' ? 'Suspend' : 'Activate'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Account Status</CardTitle>
          </div>
          <div className="flex gap-2">
            <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
              {user.status}
            </Badge>
            {user.kycStatus ? (
              <Badge variant={user.kycStatus === 'verified' ? 'default' : 'secondary'}>
                KYC: {user.kycStatus}
              </Badge>
            ) : null}
            <Badge variant="outline">Role: {user.role}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{user.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock3 className="h-4 w-4" />
                <span>Joined {format(new Date(user.createdAt), 'PP')}</span>
              </div>
              {user.lastLogin && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock3 className="h-4 w-4" />
                  <span>Last login {format(new Date(user.lastLogin), 'PPp')}</span>
                </div>
              )}
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">Segments</p>
              <div className="flex flex-wrap gap-2">
                {(user.segments || ['General']).map((segment: string) => (
                  <Badge key={segment} variant="outline">
                    {segment}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Use segments to power targeted notifications and offers.
              </p>
            </div>
          </div>
          <Separator />
          <div className="text-sm text-muted-foreground">
            For actions like password reset or role changes, wire this screen to your admin API
            endpoints.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
