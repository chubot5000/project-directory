import { useState, useEffect } from 'react'
import './App.css'

const GITHUB_USER = 'chubot5000'

// Known Vercel mappings — add new ones here as needed
const VERCEL_MAP = {
  'usdai-landing': { url: 'https://usdai-landing-main.vercel.app', domain: null },
  'sleepnebula': { url: 'https://sleepnebula.com', domain: 'sleepnebula.com' },
  'baez': { url: 'https://baez-xi.vercel.app', domain: null },
  'drive-directory': { url: 'https://drive-directory.vercel.app', domain: null },
  'permian-labs': { url: 'https://permian-labs.vercel.app', domain: null },
  'gpuloans-site': { url: 'https://gpuloans-new.vercel.app', domain: null },
  'mb9k': { url: 'https://mb9k.vercel.app', domain: null },
  'project-directory': { url: 'https://project-directory.vercel.app', domain: null },
}

const STATUS_LABELS = {
  active: 'Active',
  archived: 'Archived',
  deprecated: 'Deprecated',
}

function getStatus(repo) {
  if (repo.archived) return 'archived'
  if (repo.description?.toLowerCase().includes('deprecated')) return 'deprecated'
  return 'active'
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

function RepoCard({ repo }) {
  const status = getStatus(repo)
  const vercel = VERCEL_MAP[repo.name]
  const lang = repo.language

  return (
    <div className={`card ${status}`}>
      <div className="card-header">
        <div className="card-status-row">
          <span className={`status-dot ${status}`} />
          <span className="status-label">{STATUS_LABELS[status]}</span>
        </div>
        <span className="card-updated">{timeAgo(repo.pushed_at)}</span>
      </div>

      <h2 className="card-name">{repo.name}</h2>

      {repo.description && (
        <p className="card-desc">{repo.description}</p>
      )}

      <div className="card-meta">
        {lang && <span className="meta-lang">{lang}</span>}
        {repo.stargazers_count > 0 && <span className="meta-stars">★ {repo.stargazers_count}</span>}
        {repo.size > 0 && <span className="meta-size">{(repo.size / 1024).toFixed(1)} MB</span>}
      </div>

      <div className="card-links">
        <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="link-gh">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          GitHub
        </a>
        {vercel && (
          <a href={vercel.url} target="_blank" rel="noopener noreferrer" className="link-vercel">
            <svg width="13" height="12" viewBox="0 0 76 65" fill="currentColor"><path d="M37.5274 0L75.0548 65H0L37.5274 0Z"/></svg>
            {vercel.domain || 'Vercel'}
          </a>
        )}
      </div>
    </div>
  )
}

export default function App() {
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`)
      .then(r => r.json())
      .then(data => {
        setRepos(Array.isArray(data) ? data.filter(r => !r.fork) : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const statusOrder = { active: 0, archived: 1, deprecated: 2 }

  const filtered = repos.filter(r => {
    const status = getStatus(r)
    if (filter !== 'all' && filter !== status) return false
    if (search && !r.name.toLowerCase().includes(search.toLowerCase()) &&
        !(r.description || '').toLowerCase().includes(search.toLowerCase())) return false
    return true
  }).sort((a, b) => {
    const sa = statusOrder[getStatus(a)] || 0
    const sb = statusOrder[getStatus(b)] || 0
    if (sa !== sb) return sa - sb
    return new Date(b.pushed_at) - new Date(a.pushed_at)
  })

  const counts = {
    all: repos.length,
    active: repos.filter(r => getStatus(r) === 'active').length,
    archived: repos.filter(r => getStatus(r) === 'archived').length,
  }

  return (
    <div className="app">
      {/* Wabi-sabi texture */}
      <div className="texture" />

      <header className="header">
        <div className="header-inner">
          <div className="brand-mark">
            <div className="enso" />
          </div>
          <h1 className="site-title">Projects</h1>
          <p className="site-sub">chubot5000 — repositories & deployments</p>
        </div>
      </header>

      <div className="controls">
        <div className="search-wrap">
          <svg className="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            className="search"
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filters">
          {['all', 'active', 'archived'].map(f => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : STATUS_LABELS[f]} <span className="filter-count">{counts[f]}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="grid">
        {loading ? (
          <div className="loading">
            <div className="loading-circle" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="empty">No projects found</p>
        ) : (
          filtered.map(repo => <RepoCard key={repo.id} repo={repo} />)
        )}
      </main>

      <footer className="footer">
        <p>
          <span className="footer-dot" /> Live from GitHub API
          <span className="footer-sep">·</span>
          {repos.length} repositories
          <span className="footer-sep">·</span>
          {Object.keys(VERCEL_MAP).length} deployments
        </p>
      </footer>
    </div>
  )
}
