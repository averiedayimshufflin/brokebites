type RateLimitOptions = {
  key: string;
  maxAttempts: number;
  windowMs: number;
};

type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

export function checkClientRateLimit({
  key,
  maxAttempts,
  windowMs,
}: RateLimitOptions): RateLimitResult {
  try {
    const storageKey = `brokebites-rate-limit:${key}`;
    const now = Date.now();
    const storedAttempts = window.localStorage.getItem(storageKey);
    const attempts = storedAttempts ? (JSON.parse(storedAttempts) as number[]) : [];
    const recentAttempts = attempts.filter((attempt) => now - attempt < windowMs);
    const oldestAttempt = recentAttempts[0];

    if (recentAttempts.length >= maxAttempts && oldestAttempt) {
      return {
        allowed: false,
        retryAfterSeconds: Math.ceil((windowMs - (now - oldestAttempt)) / 1000),
      };
    }

    window.localStorage.setItem(storageKey, JSON.stringify([...recentAttempts, now]));

    return {
      allowed: true,
      retryAfterSeconds: 0,
    };
  } catch {
    return {
      allowed: true,
      retryAfterSeconds: 0,
    };
  }
}

export function getRateLimitMessage(action: string, retryAfterSeconds: number) {
  const waitTime =
    retryAfterSeconds >= 60
      ? `${Math.ceil(retryAfterSeconds / 60)} minute${retryAfterSeconds >= 120 ? "s" : ""}`
      : `${retryAfterSeconds} second${retryAfterSeconds === 1 ? "" : "s"}`;

  return `Too many tries ${action}. Please wait ${waitTime} and try again.`;
}
