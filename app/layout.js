import './globals.css'
import AnalyticsProvider from '@/components/AnalyticsProvider'
// import { Analytics } from '@vercel/analytics/react'

export const metadata = {
  title: 'MedDrill — The Duolingo for Medicine',
  description: 'Master medicine through AI-powered micro-learning, smart flashcards, QBank, and gamified battles. Built for USMLE, NEET-PG, and beyond.',
  keywords: 'medical education, USMLE, NEET-PG, flashcards, spaced repetition, medical quiz',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AnalyticsProvider>
          {children}
          {/* <Analytics /> */}
        </AnalyticsProvider>
      </body>
    </html>
  )
}
