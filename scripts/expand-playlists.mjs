/**
 * Reads public/songs.source.json, expands any Spotify playlist URLs into
 * individual track URLs using the Spotify API, and writes the result to
 * public/songs.json. Non-playlist URLs (tracks, albums) pass through unchanged.
 *
 * Requires: SPOTIFY_TOKEN env var (set by the GitHub Actions workflow).
 */

import { readFileSync, writeFileSync } from 'fs'

const token = process.env.SPOTIFY_TOKEN
if (!token) {
  console.error('❌ SPOTIFY_TOKEN is not set.')
  process.exit(1)
}

const sources = JSON.parse(readFileSync('public/songs.source.json', 'utf8'))
const output = []

for (const url of sources) {
  const match = url.match(/open\.spotify\.com\/playlist\/([a-zA-Z0-9]+)/)

  if (!match) {
    // Track, album, or other — keep as-is
    output.push(url)
    continue
  }

  const playlistId = match[1]
  console.log(`🎵 Expanding playlist ${playlistId}…`)

  let nextUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`
  let count = 0

  while (nextUrl) {
    const res = await fetch(nextUrl, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
      console.error(`  ❌ Spotify API error: ${res.status} ${res.statusText}`)
      break
    }

    const data = await res.json()

    for (const item of data.items ?? []) {
      // Skip podcasts, local files, and unavailable tracks
      if (item?.track?.id && item.track.type === 'track') {
        output.push(`https://open.spotify.com/track/${item.track.id}`)
        count++
      }
    }

    nextUrl = data.next ?? null
  }

  console.log(`  ✅ ${count} tracks added`)
}

writeFileSync('public/songs.json', JSON.stringify(output, null, 2) + '\n')
console.log(`\n✅ songs.json updated — ${output.length} total tracks`)
