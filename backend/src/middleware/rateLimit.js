const voteTracker = new Map();
// key = `${pollId}:${ip}`

export const checkVoteRateLimit = (pollId, ip) => {
  const key = `${pollId}:${ip}`;
  const now = Date.now();

  if (voteTracker.has(key)) {
    const lastVoteTime = voteTracker.get(key);
    if (now - lastVoteTime < 10_000) {
      return false; // ❌ rate limited
    }
  }

  voteTracker.set(key, now);
  return true; // ✅ allowed
};