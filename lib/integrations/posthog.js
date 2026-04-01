/**
 * Posthog Analytics Integration
 * Track user events for product analytics
 */

import posthog from 'posthog-js'

// Initialize Posthog - replace with your API key
const POSTHOG_API_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || 'phc_example'

// Initialize on client side
export function initPosthog() {
  if (typeof window === 'undefined') return
  
  posthog.init(POSTHOG_API_KEY, {
    api_host: 'https://app.posthog.com',
    capture_pageview: true,
    capture_exceptions: true,
    autocapture: {
      css_selector_whitelist: ['.btn', '.card', 'input', 'form'],
    },
    session_recording: {
      recordCanvas: false,
    },
  })
  
  return posthog
}

// Track custom events
export function trackEvent(eventName, properties = {}) {
  if (typeof window !== 'undefined' && window.posthog) {
    window.posthog.capture(eventName, properties)
  }
}

// User identification
export function identifyUser(userId, traits = {}) {
  if (typeof window !== 'undefined' && window.posthog) {
    window.posthog.identify(userId, traits)
  }
}

// Common event tracking functions
export const Analytics = {
  // Auth events
  signUp: (userId) => trackEvent('User Signed Up', { userId }),
  login: (userId) => trackEvent('User Logged In', { userId }),
  
  // Study events
  startQBank: (source, exam) => trackEvent('Started QBank', { source, exam }),
  completeQBank: (score, total, source) => trackEvent('Completed QBank', { score, total, source }),
  startFlashcards: (source) => trackEvent('Started Flashcards', { source }),
  completeFlashcards: (count) => trackEvent('Completed Flashcards', { count }),
  
  // Upload events
  uploadFile: (fileType, fileSize) => trackEvent('Uploaded File', { fileType, fileSize }),
  processDocument: (success) => trackEvent('Processed Document', { success }),
  
  // AI Tutor events
  startChat: () => trackEvent('Started AI Chat'),
  sendMessage: () => trackEvent('Sent Chat Message'),
  
  // Gamification events
  earnXP: (amount, source) => trackEvent('Earned XP', { amount, source }),
  levelUp: (newLevel) => trackEvent('Leveled Up', { newLevel }),
  streakContinue: (days) => trackEvent('Streak Continued', { days }),
  
  // UI events
  clickButton: (buttonName) => trackEvent('Button Clicked', { button: buttonName }),
  pageView: (page) => trackEvent('Page View', { page }),
}

export default Analytics
