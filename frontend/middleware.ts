import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Nonce für sichere Scripts generieren
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  res.headers.set('x-nonce', nonce)

  // CSP für 40.000 User Kleinanzeigen-Plattform - GELOCKERT für Bilder
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://cdnjs.cloudflare.com`,
    "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
    "img-src 'self' data: https: http://localhost:8000 blob: https://*.supabase.co 'unsafe-inline' 'unsafe-eval' *",
    "font-src 'self' https://cdnjs.cloudflare.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://configcat.com https://cdn-global.configcat.com http://localhost:8000 ws://localhost:8000",
    "worker-src 'self'",
    "frame-src 'self' https://*.stripe.com", // Payment-Integration
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ')
  
  res.headers.set('Content-Security-Policy', csp)
  
  // Zusätzliche Security-Header für 40k User
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  return res
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
