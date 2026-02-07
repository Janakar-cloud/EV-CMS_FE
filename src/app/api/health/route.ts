import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * GET /api/health
 * Health check endpoint for load balancers and monitoring
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Check basic health status
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.APP_VERSION || '1.0.0',
      responseTime: Date.now() - startTime,
    };

    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
