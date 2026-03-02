import { useState, useEffect, useCallback } from 'react'
import { Heart, Music, ListMusic, Info, Shuffle, ExternalLink } from 'lucide-react'
import confetti from 'canvas-confetti'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toEmbedUrl(url) {
  const match = url.match(
    /open\.spotify\.com\/(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/
  )
  if (!match) return null
  return `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0`
}

function getTypeLabel(url) {
  const match = url.match(/open\.spotify\.com\/(track|album|playlist|episode|show)\//)
  const map = { track: 'Titre', album: 'Album', playlist: 'Playlist', episode: 'Épisode', show: 'Podcast' }
  return map[match?.[1]] ?? 'Lien'
}

function launchConfetti() {
  const colors = ['#f9a8d4', '#fde68a', '#fbcfe8', '#fef3c7', '#f472b6', '#fb923c']
  confetti({ particleCount: 80, spread: 60, origin: { y: 0.55 }, colors, scalar: 1.1 })
  setTimeout(() => {
    confetti({ particleCount: 50, spread: 80, origin: { y: 0.5, x: 0.3 }, colors, angle: 60, scalar: 0.9 })
    confetti({ particleCount: 50, spread: 80, origin: { y: 0.5, x: 0.7 }, colors, angle: 120, scalar: 0.9 })
  }, 280)
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function HeartLoader() {
  return (
    <div className="flex flex-col items-center gap-4 py-10">
      <div className="animate-heartbeat text-pink-400">
        <Heart className="w-20 h-20 fill-current drop-shadow-md" />
      </div>
      <p className="text-pink-500 font-semibold text-lg tracking-wide">
        Bruno choisit pour toi…
      </p>
    </div>
  )
}

function SpotifyEmbed({ url }) {
  const [loading, setLoading] = useState(true)
  const embedUrl = toEmbedUrl(url)

  if (!embedUrl) {
    return <div className="text-center p-6 text-rose-400 bg-rose-50 rounded-2xl">Lien invalide.</div>
  }

  return (
    <div className="w-full">
      {loading && (
        <div className="flex justify-center py-6">
          <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-400 rounded-full animate-spin" />
        </div>
      )}
      <iframe
        key={embedUrl}
        src={embedUrl}
        width="100%"
        height="352"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className={`rounded-2xl shadow-lg transition-all duration-500 ${
          loading ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'
        }`}
        onLoad={() => setLoading(false)}
        title="Spotify player"
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tab: Pour Maminette
// ---------------------------------------------------------------------------

function MaminetteTab({ songs }) {
  const [currentUrl, setCurrentUrl] = useState(null)
  const [isRevealing, setIsRevealing] = useState(false)

  const handleSuggest = useCallback(() => {
    if (songs.length === 0 || isRevealing) return
    setIsRevealing(true)
    setCurrentUrl(null)
    setTimeout(() => {
      const pick = songs[Math.floor(Math.random() * songs.length)]
      setCurrentUrl(pick)
      setIsRevealing(false)
      launchConfetti()
    }, 1600)
  }, [songs, isRevealing])

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-8">
      {/* Hero */}
      <div className="text-center">
        <div className="flex justify-center items-end gap-1 mb-3">
          <Heart className="w-5 h-5 text-pink-300 fill-current" />
          <Heart className="w-8 h-8 text-pink-500 fill-current" />
          <Heart className="w-5 h-5 text-pink-300 fill-current" />
        </div>
        <h2 className="text-3xl font-bold text-pink-600 font-serif">Pour Maminette</h2>
        <p className="text-pink-400 text-sm mt-2">
          Une suggestion musicale avec tout l'amour de Bruno 🎵
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={handleSuggest}
        disabled={isRevealing || songs.length === 0}
        className="
          group relative w-full max-w-sm py-5 px-6
          bg-gradient-to-r from-pink-400 to-rose-400
          text-white text-xl font-bold rounded-3xl shadow-xl
          active:scale-95 transition-all duration-200
          disabled:opacity-60 disabled:cursor-not-allowed
          flex items-center justify-center gap-3
          hover:shadow-2xl hover:shadow-pink-200
        "
      >
        <Music className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300 flex-shrink-0" />
        <span>Écouter une suggestion de Bruno</span>
        <Heart className="w-5 h-5 fill-current flex-shrink-0" />
      </button>

      {isRevealing && <HeartLoader />}

      {currentUrl && !isRevealing && (
        <div className="w-full max-w-sm animate-fadeIn flex flex-col gap-3">
          <div className="flex items-center gap-2 text-pink-500 font-semibold">
            <Music className="w-4 h-4" />
            <span className="text-sm">Bruno te propose…</span>
          </div>

          <SpotifyEmbed url={currentUrl} />

          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-xs text-pink-400 hover:text-pink-600 transition-colors py-1"
          >
            <ExternalLink className="w-3 h-3" />
            Ouvrir dans Spotify
          </a>

          <button
            onClick={handleSuggest}
            className="
              w-full py-3 px-4
              bg-pink-100 hover:bg-pink-200 text-pink-600 font-semibold
              rounded-2xl flex items-center justify-center gap-2
              active:scale-95 transition-all duration-200
            "
          >
            <Shuffle className="w-4 h-4" />
            Une autre suggestion
          </button>
        </div>
      )}

      {songs.length === 0 && !isRevealing && (
        <p className="text-pink-300 text-sm text-center px-4">
          Pas encore de chanson disponible… Bruno va en ajouter bientôt !
        </p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tab: Only for Bruno
// ---------------------------------------------------------------------------

function BrunoTab({ songs }) {
  return (
    <div className="px-4 py-6 flex flex-col gap-5">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-amber-700 font-serif">Only for Bruno</h2>
        <p className="text-amber-500 text-sm mt-1">Panneau d'administration 🎛️</p>
      </div>

      {/* How it works */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
        <div className="flex items-center gap-2 text-amber-700 font-semibold">
          <Info className="w-5 h-5 flex-shrink-0 text-amber-500" />
          Comment changer la playlist
        </div>
        <ol className="text-amber-700 text-sm space-y-2 list-none">
          {[
            <>Va sur ton dépôt GitHub → ouvre <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-xs">public/songs.source.json</code></>,
            <>Remplace l'URL par celle de ta <strong>playlist Spotify</strong> et valide</>,
            <>GitHub lance automatiquement un script qui extrait tous les titres de la playlist</>,
            <>Le site se met à jour tout seul en quelques secondes ✅</>,
          ].map((step, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-amber-200 text-amber-700 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <div className="bg-white border border-amber-200 rounded-xl p-3 mt-1">
          <p className="text-xs text-amber-500 font-semibold mb-1.5 uppercase tracking-wide">songs.source.json</p>
          <pre className="text-xs text-amber-700 font-mono whitespace-pre-wrap break-all">
{`["https://open.spotify.com/playlist/TON_ID"]`}
          </pre>
        </div>

        {/* One-time Spotify setup */}
        <div className="bg-amber-100 rounded-xl p-3 flex flex-col gap-2">
          <p className="text-xs text-amber-700 font-semibold uppercase tracking-wide">Configuration unique (à faire une fois)</p>
          <p className="text-xs text-amber-600">
            Va sur <strong>developer.spotify.com/dashboard</strong> → crée une appli gratuite → copie le <strong>Client ID</strong> et <strong>Client Secret</strong>.
          </p>
          <p className="text-xs text-amber-600">
            Puis dans GitHub → Settings → <strong>Secrets and variables → Actions</strong> → ajoute :
          </p>
          <div className="bg-white rounded-lg p-2 font-mono text-xs text-amber-700 space-y-0.5">
            <p>SPOTIFY_CLIENT_ID</p>
            <p>SPOTIFY_CLIENT_SECRET</p>
          </div>
        </div>
      </div>

      {/* Current track list */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-pink-600 font-semibold">
          <ListMusic className="w-5 h-5" />
          Chansons disponibles
          <span className="ml-auto bg-pink-100 text-pink-500 text-xs font-bold px-2.5 py-0.5 rounded-full">
            {songs.length}
          </span>
        </div>

        {songs.length === 0 ? (
          <div className="text-center py-10">
            <Music className="w-14 h-14 mx-auto mb-3 text-pink-200" />
            <p className="text-pink-300 text-sm">Aucune chanson pour l'instant</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {songs.map((url, i) => {
              const typeLabel = getTypeLabel(url)
              const match = url.match(/open\.spotify\.com\/(?:track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/)
              const shortId = match?.[1]?.substring(0, 12) ?? '???'

              return (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm border border-pink-100 hover:border-pink-300 hover:shadow-md active:scale-[0.98] transition-all duration-150 group"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Music className="w-4 h-4 text-pink-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-pink-400 font-medium">{typeLabel}</p>
                    <p className="text-sm text-gray-500 truncate font-mono">{shortId}…</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-pink-300">#{i + 1}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-pink-300 group-hover:text-pink-500 transition-colors" />
                  </div>
                </a>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Root App
// ---------------------------------------------------------------------------

export default function App() {
  const [activeTab, setActiveTab] = useState('maminette')
  const [songs, setSongs] = useState([])

  useEffect(() => {
    fetch('./songs.json')
      .then(r => r.json())
      .then(data => setSongs(Array.isArray(data) ? data : []))
      .catch(() => setSongs([]))
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-yellow-50">
      <header className="sticky top-0 z-20 bg-white/75 backdrop-blur-md border-b border-pink-100">
        <div className="max-w-lg mx-auto px-4 pt-3 pb-2">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-pink-300 fill-current" />
            <h1 className="text-lg font-bold text-pink-600 tracking-wide font-serif">
              Bruno ♥ Maminette
            </h1>
            <Heart className="w-4 h-4 text-pink-300 fill-current" />
          </div>
          <div className="flex bg-pink-100 rounded-2xl p-1 gap-1">
            <button
              onClick={() => setActiveTab('maminette')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                activeTab === 'maminette'
                  ? 'bg-white text-pink-600 shadow-sm'
                  : 'text-pink-400 hover:text-pink-500'
              }`}
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              Pour Maminette
            </button>
            <button
              onClick={() => setActiveTab('bruno')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                activeTab === 'bruno'
                  ? 'bg-white text-amber-600 shadow-sm'
                  : 'text-amber-400 hover:text-amber-500'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              Only for Bruno
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto">
        {activeTab === 'maminette'
          ? <MaminetteTab songs={songs} />
          : <BrunoTab songs={songs} />
        }
      </main>

      <footer className="flex items-center justify-center gap-1.5 py-6 text-pink-300 text-xs">
        Fait avec <Heart className="w-3 h-3 fill-current text-pink-400" /> par Bruno
      </footer>
    </div>
  )
}
