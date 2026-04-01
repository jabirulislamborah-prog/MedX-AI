/**
 * Resend Email Integration
 * Transactional emails for user communications
 */

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || 're_example')

// Email templates
export const EMAIL_TEMPLATES = {
  WELCOME: 'welcome',
  EMAIL_CONFIRMATION: 'email_confirmation',
  PASSWORD_RESET: 'password_reset',
  STREAK_REMINDER: 'streak_reminder',
  WEEKLY_PROGRESS: 'weekly_progress',
  ACHIEVEMENT_UNLOCKED: 'achievement',
}

// Send email function
export async function sendEmail({ to, subject, template, data = {} }) {
  if (!process.env.RESEND_API_KEY) {
    console.log('[Resend] API key not configured, skipping email')
    return { success: false, error: 'API key not configured' }
  }

  try {
    const html = generateTemplate(template, data)
    
    const result = await resend.emails.send({
      from: 'MedDrill <noreply@meddrill.com>',
      to,
      subject,
      html,
    })

    console.log('[Resend] Email sent:', result.data?.id)
    return { success: true, id: result.data?.id }
  } catch (error) {
    console.error('[Resend] Error:', error)
    return { success: false, error: error.message }
  }
}

// Generate HTML template
function generateTemplate(template, data) {
  const templates = {
    [EMAIL_TEMPLATES.WELCOME]: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6C5CE7;">Welcome to MedDrill! 🩺</h1>
        <p>Hi ${data.name || 'there'},</p>
        <p>Welcome to MedDrill — your AI-powered medical education companion. We're excited to help you ace your exams!</p>
        <p><strong>Here's what you can do:</strong></p>
        <ul>
          <li>📚 Upload study materials and generate AI-powered lessons</li>
          <li>❓ Practice with QBank questions</li>
          <li>🃏 Review flashcards with spaced repetition</li>
          <li>🤖 Get help from our AI Clinical Tutor</li>
        </ul>
        <p><a href="https://med-x-ai-eight.vercel.app/dashboard" style="background: #6C5CE7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Get Started →</a></p>
        <p>Best of luck with your medical studies!</p>
        <p>— The MedDrill Team</p>
      </div>
    `,
    
    [EMAIL_TEMPLATES.STREAK_REMINDER]: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #FDCB6E;">🔥 Don't break your streak!</h1>
        <p>Hi ${data.name || 'there'},</p>
        <p>You have a <strong>${data.streak || 0} day streak</strong> going! Don't let it break — your streak resets if you don't study today.</p>
        <p><a href="https://med-x-ai-eight.vercel.app/dashboard" style="background: #6C5CE7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Continue Your Streak →</a></p>
        <p>Keep up the great work!</p>
        <p>— The MedDrill Team</p>
      </div>
    `,
    
    [EMAIL_TEMPLATES.WEEKLY_PROGRESS]: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #00D2A0;">📊 Your Weekly Progress</h1>
        <p>Hi ${data.name || 'there'},</p>
        <p>Here's your weekly summary:</p>
        <ul>
          <li>⭐ <strong>${data.xp || 0} XP</strong> earned this week</li>
          <li>❓ <strong>${data.questions || 0}</strong> questions answered</li>
          <li>🃏 <strong>${data.flashcards || 0}</strong> flashcards reviewed</li>
          <li>🔥 <strong>${data.streak || 0} days</strong> streak</li>
        </ul>
        <p><a href="https://med-x-ai-eight.vercel.app/dashboard" style="background: #6C5CE7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">View Dashboard →</a></p>
        <p>Keep up the amazing work!</p>
        <p>— The MedDrill Team</p>
      </div>
    `,
    
    [EMAIL_TEMPLATES.ACHIEVEMENT_UNLOCKED]: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #FFD700;">🏆 Achievement Unlocked!</h1>
        <p>Hi ${data.name || 'there'},</p>
        <p>🎉 <strong>${data.achievement || 'New Achievement'}</strong></p>
        <p>${data.description || 'Congratulations on your achievement!'}</p>
        <p><a href="https://med-x-ai-eight.vercel.app/profile" style="background: #6C5CE7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">View Profile →</a></p>
        <p>— The MedDrill Team</p>
      </div>
    `,
    
    [EMAIL_TEMPLATES.EMAIL_CONFIRMATION]: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6C5CE7;">Confirm Your Email</h1>
        <p>Hi ${data.name || 'there'},</p>
        <p>Click the button below to confirm your email address:</p>
        <p><a href="${data.confirmUrl}" style="background: #6C5CE7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Confirm Email →</a></p>
        <p>Or copy this link: ${data.confirmUrl}</p>
        <p>— The MedDrill Team</p>
      </div>
    `,
  }

  return templates[template] || '<p>Email content</p>'
}

// Pre-built email functions
export const Emails = {
  async welcome(user) {
    return sendEmail({
      to: user.email,
      subject: 'Welcome to MedDrill! 🩺',
      template: EMAIL_TEMPLATES.WELCOME,
      data: { name: user.full_name }
    })
  },

  async streakReminder(user, streak) {
    return sendEmail({
      to: user.email,
      subject: `🔥 ${streak} Day Streak — Don't Break It!`,
      template: EMAIL_TEMPLATES.STREAK_REMINDER,
      data: { name: user.full_name, streak }
    })
  },

  async weeklyProgress(user, stats) {
    return sendEmail({
      to: user.email,
      subject: '📊 Your Weekly Progress Report',
      template: EMAIL_TEMPLATES.WEEKLY_PROGRESS,
      data: { name: user.full_name, ...stats }
    })
  },

  async achievementUnlocked(user, achievement) {
    return sendEmail({
      to: user.email,
      subject: '🏆 Achievement Unlocked!',
      template: EMAIL_TEMPLATES.ACHIEVEMENT_UNLOCKED,
      data: { name: user.full_name, ...achievement }
    })
  }
}

export default Emails
