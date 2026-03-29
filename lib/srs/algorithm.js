export function calculateNextReview(card, rating) {
  let { ease_factor = 2.5, interval_days = 0, repetitions = 0 } = card
  rating = Math.max(1, Math.min(4, rating))

  if (rating === 1) {
    repetitions = 0; interval_days = 0.007; ease_factor = Math.max(1.3, ease_factor - 0.2)
  } else if (rating === 2) {
    repetitions = Math.max(0, repetitions - 1); interval_days = Math.max(0.014, interval_days * 0.6); ease_factor = Math.max(1.3, ease_factor - 0.15)
  } else if (rating === 3) {
    interval_days = repetitions === 0 ? 1 : repetitions === 1 ? 4 : Math.round(interval_days * ease_factor)
    repetitions += 1
  } else {
    interval_days = repetitions === 0 ? 4 : Math.round(interval_days * ease_factor * 1.3)
    ease_factor = Math.min(3.0, ease_factor + 0.15); repetitions += 1
  }

  const jitter = 1 + (Math.random() - 0.5) * 0.2
  interval_days = Math.max(0.007, interval_days * jitter)
  const next_review_at = new Date(Date.now() + interval_days * 86400000)

  return { ease_factor, interval_days, repetitions, next_review_at: next_review_at.toISOString(), last_reviewed_at: new Date().toISOString() }
}

export function calculateConfidenceScore(attempts) {
  if (!attempts?.length) return 0
  const recent = attempts.slice(-20)
  const weights = recent.map((_, i) => i + 1)
  const total = weights.reduce((a, b) => a + b, 0)
  const score = recent.reduce((acc, a, i) => acc + (a.is_correct ? 1 : 0) * weights[i], 0)
  return Math.round((score / total) * 100)
}
