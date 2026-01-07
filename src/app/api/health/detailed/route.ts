import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { apiClient } from '@/lib/api-client';

/**
 * GET /api/health/detailed
 * Detailed health check including API connectivity
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const checks: Record<string, any> = {};

  try {
    // Check API connectivity
    checks.api = await checkAPIHealth();

    // Check environment variables
    checks.environment = {
      hasApiUrl: !!process.env.NEXT_PUBLIC_API_URL,
      hasSentryDSN: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
      nodeEnv: process.env.NODE_ENV,
    };

    // Overall status
    const allHealthy = Object.values(checks).every((check) => {
      if (typeof check === 'object' && check !== null) {
        return check.status === 'healthy' || check.status === undefined || check.hasApiUrl !== false;
      }
      return true;
    });

    const health = {
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: Date.now() - startTime,
      checks,
    };

    return NextResponse.json(health, {
      status: allHealthy ? 200 : 503,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - startTime,
        checks,
      },
      { status: 503 }
    );
  }
}

async function checkAPIHealth() {
  const startTime = Date.now();
  try {
    // Try to reach the API's health endpoint
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      return { status: 'unconfigured', responseTime: 0 };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
      });

      return {
        status: response.ok ? 'healthy' : 'unhealthy',
        statusCode: response.status,
        responseTime: Date.now() - startTime,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    return {
      status: 'unreachable',
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime,
    };
  }
}
