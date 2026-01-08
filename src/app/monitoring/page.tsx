import React from 'react';
import Layout from '@/components/layout/Layout';
import { ChargerMonitoringPage } from '@/components/monitoring/ChargerMonitoringPage';

export default async function MonitoringPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  const params = await searchParams;
  const chargerId = typeof params?.chargerId === 'string' ? params.chargerId : undefined;
  const stationId = typeof params?.stationId === 'string' ? params.stationId : undefined;

  return (
    <Layout>
      <ChargerMonitoringPage chargerId={chargerId} stationId={stationId} />
    </Layout>
  );
}
