import { useState, useEffect, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  Box, Typography, TextField, InputAdornment, Tab, Tabs,
  Paper, Stack, Avatar, Chip, CircularProgress, Grid, Button
} from '@mui/material'
import { Search as SearchIcon, Clear as ClearIcon, History as HistoryIcon } from '@mui/icons-material'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import PostCard from '../components/Post/PostCard'

function highlightText(text: string, query: string) {
  const parts = text.split(new RegExp(`(${query})`, 'gi'))
  return parts.map((part, i) => (
    part.toLowerCase() === query.toLowerCase()
      ? <Box key={i} component="mark" sx={{ bgcolor: 'rgba(99,102,241,0.3)', color: 'primary.light', borderRadius: '3px', px: 0.25 }}>{part}</Box>
      : part
  ))
}

export default function SearchPage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [tab, setTab] = useState(0)
  const [results, setResults] = useState<any>({})
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const types = ['all', 'posts', 'users', 'topics']
  const typeLabels = ['Tất cả', 'Bài viết', 'Người dùng', 'Chủ đề']

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) { setQuery(q); doSearch(q) }
    if (user) loadHistory()
  }, [searchParams.get('q')])

  const doSearch = async (q: string) => {
    if (!q.trim() || q.trim().length < 2) return
    setLoading(true)
    try {
      const type = types[tab] === 'all' ? 'all' : types[tab]
      const { data } = await api.get('/search', { params: { q, type } })
      setResults(data.results)
      if (user) loadHistory()
    } finally { setLoading(false) }
  }

  const loadHistory = async () => {
    try {
      const { data } = await api.get('/search/history')
      setHistory(data.history)
    } catch {}
  }

  const clearHistory = async () => {
    await api.delete('/search/history')
    setHistory([])
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setSearchParams({ q: query.trim() })
      doSearch(query.trim())
    }
  }

  const currentQuery = searchParams.get('q') || ''

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>🔍 Tìm kiếm</Typography>

      {/* Search box */}
      <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid #e2e8f0', mb: 3 }}>
        <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            inputRef={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm bài viết, người dùng, chủ đề..."
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>,
              endAdornment: query && (
                <InputAdornment position="end">
                  <Box component="span" onClick={() => { setQuery(''); setSearchParams({}); setResults({}) }}
                    sx={{ cursor: 'pointer', display: 'flex', color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
                    <ClearIcon fontSize="small" />
                  </Box>
                </InputAdornment>
              ),
            }}
          />
          <Button type="submit" variant="contained" sx={{ px: 3, borderRadius: '10px' }}>Tìm</Button>
        </Box>
      </Paper>

      {/* No query - show history */}
      {!currentQuery && user && history.length > 0 && (
        <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              <HistoryIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
              Tìm kiếm gần đây
            </Typography>
            <Button size="small" onClick={clearHistory} sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>Xóa tất cả</Button>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {history.map((h: any) => (
              <Chip
                key={h.id}
                label={h.query}
                onClick={() => { setQuery(h.query); setSearchParams({ q: h.query }); doSearch(h.query) }}
                size="small"
                sx={{ bgcolor: '#ffffff', color: 'text.secondary', cursor: 'pointer', '&:hover': { bgcolor: '#e2e8f0', color: 'text.primary' } }}
              />
            ))}
          </Box>
        </Paper>
      )}

      {/* Results */}
      {currentQuery && (
        <>
          <Tabs value={tab} onChange={(_, v) => { setTab(v); doSearch(currentQuery) }} sx={{ mb: 2 }}>
            {typeLabels.map((l, i) => <Tab key={i} label={l} />)}
          </Tabs>

          {loading ? (
            <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>
          ) : (
            <Box>
              {/* Posts */}
              {(tab === 0 || tab === 1) && results.posts && (
                <Box sx={{ mb: 3 }}>
                  {tab === 0 && <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>Bài viết ({results.posts.total})</Typography>}
                  <Stack spacing={2}>
                    {results.posts.items.map((post: any) => <PostCard key={post.id} post={post} />)}
                  </Stack>
                </Box>
              )}

              {/* Users */}
              {(tab === 0 || tab === 2) && results.users && (
                <Box sx={{ mb: 3 }}>
                  {tab === 0 && <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>Người dùng ({results.users.total})</Typography>}
                  <Grid container spacing={2}>
                    {results.users.items.map((user: any) => (
                      <Grid key={user.id} size={{ xs: 12, sm: 6 }}>
                        <Paper
                          component={Link}
                          to={`/profile/${user.username}`}
                          sx={{ p: 2, borderRadius: 2, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none', '&:hover': { borderColor: '#6366f1' }, transition: 'border-color 0.2s' }}
                        >
                          <Avatar src={user.avatar} sx={{ width: 44, height: 44 }}>{user.username[0].toUpperCase()}</Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight={700} color="text.primary">
                              {highlightText(user.username, currentQuery)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">⭐ {user.reputation} điểm · {user.role}</Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Topics */}
              {(tab === 0 || tab === 3) && results.topics && (
                <Box>
                  {tab === 0 && <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>Chủ đề ({results.topics.total})</Typography>}
                  <Grid container spacing={2}>
                    {results.topics.items.map((topic: any) => (
                      <Grid key={topic.id} size={{ xs: 12, sm: 6 }}>
                        <Paper
                          component={Link}
                          to={`/topics?id=${topic.id}`}
                          sx={{ p: 2, borderRadius: 2, border: '1px solid #e2e8f0', textDecoration: 'none', '&:hover': { borderColor: '#6366f1' }, transition: 'border-color 0.2s' }}
                        >
                          <Typography variant="body1" fontWeight={700} color="text.primary">
                            {highlightText(topic.name, currentQuery)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">{topic.postCount} bài viết</Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* No results */}
              {Object.values(results).every((r: any) => r?.total === 0 || r?.items?.length === 0) && (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="h5" color="text.secondary" gutterBottom>Không tìm thấy kết quả</Typography>
                  <Typography color="text.secondary">Thử từ khóa khác hoặc kiểm tra chính tả</Typography>
                </Box>
              )}
            </Box>
          )}
        </>
      )}
    </Box>
  )
}
