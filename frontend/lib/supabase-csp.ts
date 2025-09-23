// CSP-Konfiguration für Supabase und 40.000 User Kleinanzeigen-Plattform
export const SUPABASE_CSP_DIRECTIVES = {
  connectSrc: [
    'self',
    'https://*.supabase.co',
    'wss://*.supabase.co', // WebSocket für Realtime
    'https://configcat.com',
    'https://cdn-global.configcat.com'
  ],
  scriptSrc: [
    'self',
    'https://cdnjs.cloudflare.com' // Monaco Editor
  ],
  styleSrc: [
    'self',
    'unsafe-inline',
    'https://cdnjs.cloudflare.com'
  ],
  imgSrc: [
    'self',
    'data:',
    'https:',
    'https://*.supabase.co' // Supabase Storage
  ],
  fontSrc: [
    'self',
    'https://cdnjs.cloudflare.com'
  ],
  workerSrc: [
    'self'
  ],
  frameSrc: [
    'self',
    'https://*.stripe.com' // Payment-Integration
  ]
}

// CSP-String für direkte Verwendung
export const generateCSP = (nonce: string): string => {
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://cdnjs.cloudflare.com`,
    "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
    "img-src 'self' data: https: https://*.supabase.co",
    "font-src 'self' https://cdnjs.cloudflare.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://configcat.com https://cdn-global.configcat.com",
    "worker-src 'self'",
    "frame-src 'self' https://*.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ]
  
  return directives.join('; ')
}
