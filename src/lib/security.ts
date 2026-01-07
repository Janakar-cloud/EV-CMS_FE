import { NextRequest, NextResponse } from 'next/server';

/**
 * Security headers configuration
 * Adds essential security headers to all responses
 */
export const securityHeaders = {
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Enable XSS protection (for older browsers)
  'X-XSS-Protection': '1; mode=block',
  
  // Prevent clickjacking attacks
  'X-Frame-Options': 'DENY',
  
  // Control referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions Policy (formerly Feature Policy)
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  
  // Enforce HTTPS for 1 year
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Content Security Policy - Customize based on your needs
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' 
      https://apis.google.com 
      https://maps.googleapis.com
      https://*.sentry.io;
    style-src 'self' 'unsafe-inline'
      https://fonts.googleapis.com;
    img-src 'self' data: https: blob:;
    font-src 'self' 
      https://fonts.gstatic.com
      data:;
    connect-src 'self' 
      https://maps.googleapis.com
      https://maps.gstatic.com
      https://*.sentry.io
      https://api.yourproduction.com;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
  `.replace(/\s+/g, ' ').trim(),
};

/**
 * Middleware to apply security headers
 */
export function withSecurityHeaders(response: NextResponse) {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

/**
 * CSP violation reporting
 * Can be used to track CSP violations
 */
export async function handleCSPViolation(request: NextRequest) {
  try {
    const body = await request.json();
    console.error('CSP Violation:', body);
    
    // You can send this to Sentry or another monitoring service
    // captureException(new Error('CSP Violation: ' + JSON.stringify(body)));
    
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Error processing CSP violation:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
