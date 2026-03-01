// Netlify serverless function — acts as a secure proxy to the Spotify API.
// The Spotify credentials live only in Netlify environment variables (never in
// the frontend bundle).
//
// Setup (one-time):
//   1. Go to https://developer.spotify.com/dashboard and create a free app.
//   2. Copy the Client ID and Client Secret.
//   3. In Netlify: Site settings → Environment variables → add:
//        SPOTIFY_CLIENT_ID     = your client id
//        SPOTIFY_CLIENT_SECRET = your client secret
//   4. Redeploy the site (or trigger from Netlify dashboard).

exports.handler = async (event) => {
  const { playlistId } = event.queryStringParameters ?? {}

  if (!playlistId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing playlistId parameter' }),
    }
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return {
      statusCode: 503,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET are not configured in Netlify environment variables.',
      }),
    }
  }

  // --- 1. Get a client-credentials access token ---
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!tokenRes.ok) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: 'Failed to obtain Spotify access token.' }),
    }
  }

  const { access_token } = await tokenRes.json()

  // --- 2. Fetch all playlist tracks (Spotify paginates at 100 items) ---
  const trackUrls = []
  let nextUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`

  while (nextUrl) {
    const res = await fetch(nextUrl, {
      headers: { Authorization: `Bearer ${access_token}` },
    })

    if (!res.ok) break

    const data = await res.json()

    for (const item of data.items ?? []) {
      // Skip local files, podcasts, or unavailable tracks
      if (item?.track?.id && item.track.type === 'track') {
        trackUrls.push(`https://open.spotify.com/track/${item.track.id}`)
      }
    }

    nextUrl = data.next ?? null
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300', // cache for 5 min
    },
    body: JSON.stringify(trackUrls),
  }
}
