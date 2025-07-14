// src/lib/rateLimiter.ts
const rateLimit = {
  maxPerMinute: 15,
  maxPerDay: 200,
  minuteWindow: 60 * 1000, // 1 minute
  dayWindow: 24 * 60 * 60 * 1000, // 1 day
}

let requestTimestamps: number[] = []

export function isRateLimited(): { limited: boolean; reason?: string } {
  const now = Date.now()

  // Filter out old timestamps
  requestTimestamps = requestTimestamps.filter(ts => now - ts < rateLimit.dayWindow)

  const requestsLastMinute = requestTimestamps.filter(ts => now - ts < rateLimit.minuteWindow).length
  const requestsLastDay = requestTimestamps.length

  if (requestsLastMinute >= rateLimit.maxPerMinute) {
    return { limited: true, reason: "Rate limit exceeded: Try again in a minute." }
  }

  if (requestsLastDay >= rateLimit.maxPerDay) {
    return { limited: true, reason: "Daily limit reached: Try again tomorrow." }
  }

  // Track this request
  requestTimestamps.push(now)

  return { limited: false }
}
