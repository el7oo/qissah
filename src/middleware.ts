import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';
// Admin session cookie logic removed in favor of secret path

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

function getClientIp(request: NextRequest): string {
  const cf = request.headers.get('cf-connecting-ip');
  if (cf) return cf.trim();
  const vercelFf = request.headers.get('x-vercel-forwarded-for');
  if (vercelFf) return vercelFf.split(',')[0].trim();
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return '127.0.0.1';
}

function buildConnectSrc(isProduction: boolean): string {
  const parts = [
    "'self'",
    'https://*.sanity.io',
    'https://*.sanity-cdn.com',
    'https://sanity-cdn.com',
    'https://*.sanity-cdn.work',
    'https://sanity-cdn.work',
    'https://*.supabase.co',
    'wss://*.supabase.co',
    'https://*.firebaseio.com',
    'https://*.googleapis.com',
    'https://identitytoolkit.googleapis.com',
    'https://securetoken.googleapis.com',
    'https://*.insforge.app',
    'wss://*.insforge.app',
  ];
  const insforgeUrl = process.env.NEXT_PUBLIC_INSFORGE_BASE_URL?.trim();
  if (insforgeUrl) {
    try {
      parts.push(new URL(insforgeUrl).origin);
    } catch {
      /* ignore invalid URL */
    }
  }
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim();
  if (authDomain && /^[\w.-]+\.firebaseapp\.com$/i.test(authDomain)) {
    parts.push(`https://${authDomain}`);
  }
  return [...new Set(parts)].join(' ');
}

function contentSecurityPolicy(isProduction: boolean): string {
  const scriptSrc = "'self' 'unsafe-eval' 'unsafe-inline'";
  const styleSrc = "'self' 'unsafe-inline'";
  const imgSrc = "'self' blob: data: https:";
  const connectSrc = buildConnectSrc(isProduction);
  return `
    default-src 'self';
    script-src ${scriptSrc};
    style-src ${styleSrc};
    img-src ${imgSrc};
    connect-src ${connectSrc};
    font-src 'self' https://fonts.gstatic.com;
    frame-src 'none';
    worker-src 'self' blob:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export async function middleware(request: NextRequest) {
  const ip = getClientIp(request);
  const url = request.nextUrl.pathname;
  const isProduction = process.env.NODE_ENV === 'production';

  if (
    process.env.REQUIRE_UPSTASH_REDIS === 'true' &&
    !redis &&
    /^\/api\/(?:auth\/(?:login|admin-login)|orders|products)/.test(url)
  ) {
    return new NextResponse(
      JSON.stringify({
        error: 'Rate limiting service unavailable.',
        ar: 'خدمة التحديد غير متاحة.',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  if (url.startsWith('/api/')) {
    let limit = 100;
    let windowSeconds = 60;
    let bucket = 'api';
    if (url.startsWith('/api/orders')) {
      bucket = 'orders';
      limit = 30;
      windowSeconds = 60;
    } else if (url.startsWith('/api/products')) {
      bucket = 'products';
      limit = 120;
      windowSeconds = 60;
    } else if (url.includes('/register')) {
      bucket = 'register';
      limit = 5;
      windowSeconds = 15 * 60;
    }

    if (redis) {
      try {
        const key = `rate_limit_${bucket}_${ip}`;
        const requests = await redis.incr(key);
        if (requests === 1) {
          await redis.expire(key, windowSeconds);
        }
        if (requests > limit) {
          return new NextResponse(
            JSON.stringify({
              error: 'Too many requests, try again later.',
              ar: 'تم تجاوز الحد المسموح للطلبات، يرجى المحاولة لاحقاً.',
            }),
            {
              status: 429,
              headers: {
                'Content-Type': 'application/json',
                'Retry-After': String(windowSeconds),
              },
            }
          );
        }
      } catch (error) {
        console.error('Redis rate limiting error:', error);
        if (
          process.env.REQUIRE_UPSTASH_REDIS === 'true' &&
          /^\/api\/(?:auth\/(?:login|admin-login)|orders|products)/.test(url)
        ) {
          return new NextResponse(JSON.stringify({ error: 'Rate limiter error' }), { status: 503 });
        }
      }
    }
  }

  const adminProtected = url === '/admin' || url.startsWith('/admin/') || url === '/studio' || url.startsWith('/studio/');
  
  // Secret Admin Access Logic
  // Replace 'luxara-secret-admin' with your preferred hidden path
  const secretPath = process.env.ADMIN_SECRET_PATH ? `/${process.env.ADMIN_SECRET_PATH}` : '/luxara-secret-admin';
  
  if (url === secretPath) {
    const response = NextResponse.redirect(new URL('/admin', request.url));
    // Set a long-lived cookie for admin access
    response.cookies.set('luxara_admin_access', 'granted', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return response;
  }

  if (adminProtected) {
    const hasAccess = request.cookies.get('luxara_admin_access')?.value === 'granted';
    if (!hasAccess) {
      // Redirect unauthorized users to home page, effectively hiding the admin path
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  if (isProduction) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Content-Security-Policy', contentSecurityPolicy(isProduction));
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
};

