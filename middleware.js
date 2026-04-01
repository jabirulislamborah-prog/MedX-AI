import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100

// Rate limit store (in production, use Redis or similar)
const rateLimitStore = new Map()

function getClientIP(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || request.headers.get('x-real-ip')
    || 'unknown'
}

function isRateLimited(clientIP) {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW
  
  // Clean old entries
  for (const [ip, timestamps] of rateLimitStore.entries()) {
    const recent = timestamps.filter(ts => ts > windowStart)
    if (recent.length === 0) {
      rateLimitStore.delete(ip)
    } else {
      rateLimitStore.set(ip, recent)
    }
  }
  
  // Check current IP
  const timestamps = rateLimitStore.get(clientIP) || []
  const recentRequests = timestamps.filter(ts => ts > windowStart)
  
  if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return true
  }
  
  // Add current request
  recentRequests.push(now)
  rateLimitStore.set(clientIP, recentRequests)
  return false
}

export async function middleware(request) {
  const clientIP = getClientIP(request)
  
  // Skip rate limiting for static files and public assets
  const pathname = request.nextUrl.pathname
  const isStaticFile = pathname.match(/\/_next\/static|\.(js|css|woff|woff2|ttf|eot|svg|png|jpg|jpeg|gif|webp|ico)$/)
  
  if (!isStaticFile) {
    // Rate limiting check
    if (isRateLimited(clientIP)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': String(RATE_LIMIT_MAX_REQUESTS),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Date.now() + RATE_LIMIT_WINDOW)
          }
        }
      )
    }
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Secure cookie options
            const secureOptions = {
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
              maxAge: options.maxAge || (7 * 24 * 60 * 60) // 7 days default
            }
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, secureOptions)
          })
        },
      },
    }
  )

  // Refresh session if needed
  const { data: { session }, error: refreshError } = await supabase.auth.getSession()
  
  if (refreshError) {
    console.error('[Middleware] Session refresh error:', refreshError.message)
  }

  const { data: { user } } = await supabase.auth.getUser()

  // Public paths that don't require authentication
  const publicPaths = [
    '/login', 
    '/signup', 
    '/', 
    '/simulate', 
    '/onboarding', 
    '/auth/callback',
    '/api/auth',
    '/api/paypal',
    '/api/razorpay'
  ]
  
  // Check if path is public
  const isPublic = publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'))
  
  // API rate limiting bypass for public APIs
  const isPublicAPI = pathname.startsWith('/api/paypal') || pathname.startsWith('/api/razorpay')

  if (!user && !isPublic && !isPublicAPI) {
    // Log unauthorized access attempt
    console.log('[Middleware] Unauthorized access attempt to:', pathname, 'from IP:', clientIP)
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Redirect logged-in users away from auth pages
  if (user && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Add security headers to response
  supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff')
  supabaseResponse.headers.set('X-Frame-Options', 'DENY')
  supabaseResponse.headers.set('X-XSS-Protection', '1; mode=block')
  supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  supabaseResponse.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()')
  supabaseResponse.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
}
