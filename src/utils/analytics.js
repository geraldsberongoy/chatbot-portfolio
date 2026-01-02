export const analytics = {
  totalQueries: 0,
  popularKeywords: {},
  outOfScopeCount: 0,
  providerUsage: { gemini: 0, fallback: 0 },
  startTime: new Date().toISOString(),
};

export function trackQuery(message, source) {
  analytics.totalQueries++;
  analytics.providerUsage[source] = (analytics.providerUsage[source] || 0) + 1;

  if (!message) return;

  const words = message.toLowerCase().split(/\s+/);
  words.forEach((word) => {
    if (word.length > 3) {
      analytics.popularKeywords[word] =
        (analytics.popularKeywords[word] || 0) + 1;
    }
  });
}
