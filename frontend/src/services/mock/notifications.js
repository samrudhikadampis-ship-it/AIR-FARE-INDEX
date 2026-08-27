export function buildNotifications() {
  const now = Date.now()
  return [
    {
      id: 'n1',
      title: 'Fare spike on New Delhi → Bengaluru',
      body: 'Median quote crossed ₹9,200 in the last collection window.',
      type: 'fare',
      createdAt: new Date(now - 12 * 60 * 1000).toISOString(),
      unread: true,
    },
    {
      id: 'n2',
      title: 'SpiceJet scraper degraded',
      body: 'Success rate dropped to 88%. Quotes still flowing, latency is up.',
      type: 'scraper',
      createdAt: new Date(now - 48 * 60 * 1000).toISOString(),
      unread: true,
    },
    {
      id: 'n3',
      title: 'Collection cycle completed',
      body: '27,012 quotes ingested across 9 sources in the last 24 hours.',
      type: 'system',
      createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      unread: false,
    },
    {
      id: 'n4',
      title: 'Yatra source is down',
      body: 'Last successful run was 47 minutes ago. Coverage is still above 98%.',
      type: 'scraper',
      createdAt: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
      unread: false,
    },
    {
      id: 'n5',
      title: 'Weekend demand lifting Goa fares',
      body: 'Mumbai → Goa average fare is up 11% versus mid-week quotes.',
      type: 'fare',
      createdAt: new Date(now - 26 * 60 * 60 * 1000).toISOString(),
      unread: false,
    },
  ]
}
