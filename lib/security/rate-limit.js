/**
 * Rate Limiting Implementation
 * Provides in-memory rate limiting with configurable limits
 */

const rateLimitStore = new Map()

const DEFAULT_CONFIG = {
  windowMs: 60 * 1000, // 1 minute window
  maxRequests: 100, // Max requests per window
  blockDuration: 60 * 1000, // Block duration in ms
  keyPrefix: 'rl:',
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
}

/**
 * Create rate limiter middleware
 * @param {object} config - Rate limit configuration
 * @returns {function} - Express/Next.js middleware
 */
export function rateLimiter(config = {}) {
  const options = { ...DEFAULT_CONFIG, ...config }
  
  return async function rateLimitMiddleware(request, next) {
    const clientIP = getClientIP(request)
    const key = options.keyPrefix + clientIP
    
    const result = await checkRateLimit(key, options)
    
    if (result.blocked) {
      return new Response(
        JSON.stringify({ 
          error: 'Too many requests',
          message: `Rate limit exceeded. Try again in ${Math.ceil(result.retryAfter / 1000)} seconds.`,
          retryAfter: result.retryAfter
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil(result.retryAfter / 1000)),
            'X-RateLimit-Limit': String(options.maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(result.resetTime),
          }
        }
      )
    }
    
    // Add rate limit headers to response
    request.rateLimit = {
      limit: options.maxRequests,
      remaining: result.remaining,
      reset: result.resetTime
    }
    
    return next ? await next() : null
  }
}

/**
 * Check if client is rate limited
 */
async function checkRateLimit(key, options) {
  const now = Date.now()
  const windowStart = now - options.windowMs
  
  // Get existing record
  let record = rateLimitStore.get(key)
  
  if (!record || record.resetTime < now) {
    // New request window
    record = {
      count: 1,
      resetTime: now + options.windowMs,
      blocked: false,
      firstRequest: now
    }
    rateLimitStore.set(key, record)
    
    return {
      blocked: false,
      remaining: options.maxRequests - 1,
      resetTime: record.resetTime,
      retryAfter: 0,
      totalRequests: record.count
    }
  }
  
  // Check if blocked from previous window
  if (record.blocked && record.blockUntil && record.blockUntil > now) {
    return {
      blocked: true,
      remaining: 0,
      resetTime: record.resetTime,
      retryAfter: record.blockUntil - now,
      totalRequests: record.count
    }
  }
  
  // Increment count
  record.count++
  
  // Check limit
  if (record.count > options.maxRequests) {
    // Block the client
    record.blocked = true
    record.blockUntil = now + options.blockDuration
    
    return {
      blocked: true,
      remaining: 0,
      resetTime: record.resetTime,
      retryAfter: options.blockDuration,
      totalRequests: record.count
    }
  }
  
  return {
    blocked: false,
    remaining: options.maxRequests - record.count,
    resetTime: record.resetTime,
    retryAfter: 0,
    totalRequests: record.count
  }
}

/**
 * Get client IP address from request
 */
function getClientIP(request) {
  // Check common headers (behind proxy)
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  
  // Fallback to remote address (Next.js handles this)
  return request.ip || 'unknown'
}

/**
 * Reset rate limit for a specific key
 */
export function resetRateLimit(key) {
  rateLimitStore.delete(key)
}

/**
 * Get current rate limit status
 */
export function getRateLimitStatus(key) {
  const record = rateLimitStore.get(key)
  if (!record) {
    return { count: 0, remaining: DEFAULT_CONFIG.maxRequests, blocked: false }
  }
  
  return {
    count: record.count,
    remaining: Math.max(0, DEFAULT_CONFIG.maxRequests - record.count),
    blocked: record.blocked,
    resetTime: record.resetTime
  }
}

/**
 * Cleanup old entries (call periodically)
 */
export function cleanupRateLimitStore() {
  const now = Date.now()
  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetTime < now - 60000) {
      rateLimitStore.delete(key)
    }
  }
}

// Predefined rate limiters for different endpoints
export const authLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10, // 10 attempts
  blockDuration: 30 * 60 * 1000, // 30 minute block
  keyPrefix: 'rl:auth:'
})

export const apiLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
  blockDuration: 60 * 1000,
  keyPrefix: 'rl:api:'
})

export const uploadLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 20, // 20 uploads per hour
  blockDuration: 60 * 60 * 1000,
  keyPrefix: 'rl:upload:'
})

export const chatLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 messages per minute
  blockDuration: 60 * 1000,
  keyPrefix: 'rl:chat:'
})

export default {
  rateLimiter,
  resetRateLimit,
  getRateLimitStatus,
  authLimiter,
  apiLimiter,
  uploadLimiter,
  chatLimiter
}
