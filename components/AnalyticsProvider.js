'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

let initialized = false

export default function AnalyticsProvider({ children }) {
  const pathname = usePathname()

  useEffect(() => {
    // Initialize analytics on first load
    if (!initialized && typeof window !== 'undefined') {
      initialized = true
      
      // Initialize Posthog
      try {
        const { initPosthog, identifyUser } = require('@/lib/integrations/posthog')
        
        // Initialize
        initPosthog()
        
        // Check for existing user
        const userData = localStorage.getItem('meddrill_user')
        if (userData) {
          try {
            const user = JSON.parse(userData)
            if (user.id) {
              identifyUser(user.id, {
                email: user.email,
                name: user.full_name
              })
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
        
        console.log('[Analytics] Initialized')
      } catch (e) {
        console.log('[Analytics] Posthog not configured')
      }
    }
  }, [])

  // Track page views
  useEffect(() => {
    if (pathname && typeof window !== 'undefined') {
      try {
        const { trackEvent } = require('@/lib/integrations/posthog')
        trackEvent('Page View', { page: pathname })
      } catch (e) {
        // Ignore if not configured
      }
    }
  }, [pathname])

  return children
}
