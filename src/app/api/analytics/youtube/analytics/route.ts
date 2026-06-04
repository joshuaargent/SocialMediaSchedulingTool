import { NextRequest, NextResponse } from 'next/server';
import { isDatabaseConfigured, requirePrisma } from '@/lib/db/prisma';

const ANALYTICS_API = 'https://youtubeanalytics.googleapis.com/v2/reports';
const CACHE_TTL = 5 * 60 * 1000;
let analyticsCache: { data: any; timestamp: number } | null = null;

export async function GET(request: NextRequest) {
  const forceRefresh = request.nextUrl.searchParams.get('refresh') === 'true';
  
  if (!forceRefresh && analyticsCache && Date.now() - analyticsCache.timestamp < CACHE_TTL) {
    return NextResponse.json({ connected: true, ...analyticsCache.data, cached: true });
  }

  // Get organization
  const orgId = request.cookies.get('current_org_id')?.value;
  
  // Get tokens from database first (if org exists), then fall back to cookies
  let accessToken = request.cookies.get('yt_access_token')?.value;
  let refreshToken = request.cookies.get('yt_refresh_token')?.value;
  let channelId = 'channel==MINE';

  // If org exists and has database configured, try to get tokens from DB
  if (orgId && isDatabaseConfigured()) {
    try {
      const db = requirePrisma();
      const dbConnection = await db.platformConnection.findUnique({
        where: {
          organizationId_platform: {
            organizationId: orgId,
            platform: 'youtube',
          },
        },
      });
      
      if (dbConnection?.accessToken) {
        accessToken = dbConnection.accessToken;
        refreshToken = dbConnection.refreshToken || refreshToken;
      }
    } catch (err) {
      console.error('Failed to fetch tokens from DB:', err);
    }
  }

  if (!accessToken && !refreshToken) {
    return NextResponse.json({ connected: false, error: 'YouTube not connected' }, { status: 401 });
  }

  // Refresh token if needed
  if (!accessToken && refreshToken) {
    const clientId = process.env.YOUTUBE_CLIENT_ID;
    const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
    if (clientId && clientSecret) {
      try {
        const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
          }),
        });
        if (refreshResponse.ok) {
          const tokenData = await refreshResponse.json();
          accessToken = tokenData.access_token;
          
          // Update DB with new token
          if (orgId && isDatabaseConfigured()) {
            await requirePrisma().platformConnection.update({
              where: {
                organizationId_platform: {
                  organizationId: orgId,
                  platform: 'youtube',
                },
              },
              data: {
                accessToken: tokenData.access_token,
                expiresAt: tokenData.expires_at ? new Date(tokenData.expires_at * 1000) : null,
              },
            });
          }
        }
      } catch (e) {
        console.error('Token refresh failed:', e);
      }
    }
  }

  if (!accessToken) {
    return NextResponse.json({ connected: false, error: 'Failed to get access token' }, { status: 401 });
  }

  try {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const startDate = thirtyDaysAgo.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    const ytStatsCookie = request.cookies.get('yt_stats')?.value;
    if (ytStatsCookie) {
      try {
        const stats = JSON.parse(ytStatsCookie);
        if (stats.channelId) channelId = `channel==${stats.channelId}`;
      } catch (e) {}
    }

    const headers = { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' };

    console.log('YouTube Analytics request:', { channelId, startDate, endDate, hasToken: !!accessToken });
    console.log('Token source:', {
      fromCookie: !!request.cookies.get('yt_access_token')?.value,
      fromDB: orgId ? 'checking' : 'no org'
    });
    
    const parseResponse = async (url: string, name: string) => {
      const response = await fetch(url, { headers });
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`${name} API error:`, response.status, errorText);
        return { rows: [], headers: [], raw: { error: errorText } };
      }
      const data = await response.json();
      // Debug: log the raw response
      console.log(`${name} raw response:`, JSON.stringify(data).substring(0, 500));
      return { headers: data.columnHeaders || [], rows: data.rows || [], raw: data };
    };

    const [overview, age, gender, traffic, devices, geo, locations] = await Promise.all([
      parseResponse(`${ANALYTICS_API}?ids=${channelId}&startDate=${startDate}&endDate=${endDate}&metrics=views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained,subscribersLost&dimensions=day&sort=day`, 'overview'),
      parseResponse(`${ANALYTICS_API}?ids=${channelId}&startDate=${startDate}&endDate=${endDate}&metrics=views,estimatedMinutesWatched&dimensions=ageGroup&sort=ageGroup`, 'age'),
      parseResponse(`${ANALYTICS_API}?ids=${channelId}&startDate=${startDate}&endDate=${endDate}&metrics=views,estimatedMinutesWatched&dimensions=gender&sort=gender`, 'gender'),
      parseResponse(`${ANALYTICS_API}?ids=${channelId}&startDate=${startDate}&endDate=${endDate}&metrics=views,estimatedMinutesWatched&dimensions=insightTrafficSourceType&sort=-views`, 'traffic'),
      parseResponse(`${ANALYTICS_API}?ids=${channelId}&startDate=${startDate}&endDate=${endDate}&metrics=views,estimatedMinutesWatched&dimensions=deviceType&sort=-views`, 'devices'),
      parseResponse(`${ANALYTICS_API}?ids=${channelId}&startDate=${startDate}&endDate=${endDate}&metrics=views,estimatedMinutesWatched&dimensions=country&sort=-views&maxResults=10`, 'geo'),
      parseResponse(`${ANALYTICS_API}?ids=${channelId}&startDate=${startDate}&endDate=${endDate}&metrics=views,estimatedMinutesWatched&dimensions=insightPlaybackLocationType&sort=-views`, 'locations'),
    ]);

    const overviewData = { totalViews: 0, totalMinutesWatched: 0, avgViewDuration: 0, avgViewPercentage: 0, subscribersGained: 0, subscribersLost: 0, dailyData: [] as any[] };
    
    if (overview.rows?.length && overview.headers?.length) {
      const h = overview.headers.map((x: any) => x.name);
      overview.rows.forEach((row: any[]) => {
        const viewsIdx = h.indexOf('views');
        const minsIdx = h.indexOf('estimatedMinutesWatched');
        const dayIdx = h.indexOf('day');
        
        overviewData.totalViews += parseInt(row[viewsIdx >= 0 ? viewsIdx : 0] || 0);
        overviewData.totalMinutesWatched += parseInt(row[minsIdx >= 0 ? minsIdx : 1] || 0);
        overviewData.dailyData.push({ 
          date: row[dayIdx >= 0 ? dayIdx : 0] || '', 
          views: parseInt(row[viewsIdx >= 0 ? viewsIdx : 0] || 0), 
          minutes: parseInt(row[minsIdx >= 0 ? minsIdx : 1] || 0) 
        });
      });
      const last = overview.rows[overview.rows.length - 1];
      const avgDurIdx = h.indexOf('averageViewDuration');
      const avgPctIdx = h.indexOf('averageViewPercentage');
      const subGainedIdx = h.indexOf('subscribersGained');
      const subLostIdx = h.indexOf('subscribersLost');
      
      overviewData.avgViewDuration = parseInt(last[avgDurIdx >= 0 ? avgDurIdx : 2] || 0);
      overviewData.avgViewPercentage = parseFloat(last[avgPctIdx >= 0 ? avgPctIdx : 3] || 0);
      overviewData.subscribersGained = overview.rows.reduce((s: number, r: any[]) => s + parseInt(r[subGainedIdx >= 0 ? subGainedIdx : 4] || 0), 0);
      overviewData.subscribersLost = overview.rows.reduce((s: number, r: any[]) => s + parseInt(r[subLostIdx >= 0 ? subLostIdx : 5] || 0), 0);
    }

    const processRows = (data: any) => {
      if (!data.rows?.length || !data.headers?.length) return [];
      const total = data.rows.reduce((s: number, r: any[]) => s + parseInt(r[0] || 0), 0);
      const h = data.headers.map((x: any) => x.name);
      const firstColIdx = 0;
      const viewsIdx = h.indexOf('views');
      return data.rows.map((row: any[]) => ({
        label: row[firstColIdx] || 'Unknown',
        views: parseInt(row[viewsIdx >= 0 ? viewsIdx : 1] || 0),
        percentage: total > 0 ? (parseInt(row[viewsIdx >= 0 ? viewsIdx : 1] || 0) / total) * 100 : 0,
      }));
    };

    // Add raw API response for debugging
    const rawApiResponses: Record<string, any> = {};
    const responses = { overview, age, gender, traffic, devices, geo, locations };
    Object.entries(responses).forEach(([key, value]: [string, any]) => {
      if (value.raw) {
        rawApiResponses[key] = value.raw;
      }
    });
    
    const result = {
      connected: true,
      overview: overviewData,
      demographics: { age: processRows(age).map((r: any) => ({ group: r.label, ...r })), gender: processRows(gender).map((r: any) => ({ gender: r.label, ...r })) },
      trafficSources: traffic.rows?.map((row: any[]) => { const h = traffic.headers.map((x: any) => x.name); const views = parseInt(row[h.indexOf('views')] || 0); return { source: row[h.indexOf('insightTrafficSourceType')] || 'Unknown', views, minutes: parseInt(row[h.indexOf('estimatedMinutesWatched')] || 0), percentage: 0 }; }) || [],
      deviceTypes: devices.rows?.map((row: any[]) => { const h = devices.headers.map((x: any) => x.name); return { device: row[h.indexOf('deviceType')] || 'Unknown', views: parseInt(row[h.indexOf('views')] || 0), percentage: 0 }; }) || [],
      topCountries: geo.rows?.map((row: any[]) => { const h = geo.headers.map((x: any) => x.name); return { country: row[h.indexOf('country')] || 'Unknown', views: parseInt(row[h.indexOf('views')] || 0), minutes: parseInt(row[h.indexOf('estimatedMinutesWatched')] || 0) }; }) || [],
      playbackLocations: locations.rows?.map((row: any[]) => { const h = locations.headers.map((x: any) => x.name); return { location: row[h.indexOf('insightPlaybackLocationType')] || 'Unknown', views: parseInt(row[h.indexOf('views')] || 0), minutes: parseInt(row[h.indexOf('estimatedMinutesWatched')] || 0) }; }) || [],
      dateRange: { startDate, endDate },
      // Debug info
      _debug: {
        overviewRows: overview.rows?.length || 0,
        overviewHeaders: overview.headers?.map((h: any) => h.name) || [],
        ageRows: age.rows?.length || 0,
        genderRows: gender.rows?.length || 0,
        trafficRows: traffic.rows?.length || 0,
        devicesRows: devices.rows?.length || 0,
        geoRows: geo.rows?.length || 0,
        locationsRows: locations.rows?.length || 0,
        rawResponses: rawApiResponses,
      }
    };

    console.log('Final result:', JSON.stringify(result, null, 2));

    analyticsCache = { data: result, timestamp: Date.now() };
    return NextResponse.json(result);
  } catch (error) {
    console.error('YouTube Analytics API error:', error);
    return NextResponse.json({ 
      connected: false, 
      error: 'Failed to fetch analytics: ' + (error instanceof Error ? error.message : 'Unknown error'),
      details: error
    }, { status: 500 });
  }
}
