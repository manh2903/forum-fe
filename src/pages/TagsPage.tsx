import { useState, useEffect } from 'react'
import { Box, Typography, Paper, Chip, CircularProgress, TextField, InputAdornment } from '@mui/material'
import { Search as SearchIcon } from '@mui/icons-material'
import { Link } from 'react-router-dom'
import api from '../services/api'

export default function TagsPage() {
  const [tags, setTags] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    api.get('/topics/tags', { params: { search, limit: 50 } })
      .then(({ data }) => setTags(data.tags))
      .finally(() => setLoading(false))
  }, [search])

  const maxCount = tags[0]?.postCount || 1
  const getSize = (count: number) => {
    const ratio = count / maxCount
    if (ratio > 0.7) return '1.2rem'
    if (ratio > 0.4) return '1rem'
    return '0.85rem'
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>🏷️ Tags</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>Khám phá các tags phổ biến trong cộng đồng</Typography>

      <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid #e2e8f0', mb: 3 }}>
        <TextField
          fullWidth size="small"
          placeholder="Tìm tag..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        />
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
          {tags.map(tag => (
            <Box
              key={tag.id}
              component={Link}
              to={`/?tag=${tag.slug}`}
              sx={{
                display: 'inline-flex', alignItems: 'center', gap: 0.75,
                px: 1.5, py: 0.75,
                bgcolor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: getSize(tag.postCount),
                color: '#475569',
                fontWeight: 600,
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: '#6366f1',
                  color: '#6366f1',
                  bgcolor: 'rgba(99,102,241,0.1)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              #{tag.name}
              <Chip
                label={tag.postCount}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.7rem',
                  bgcolor: '#f1f5f9',
                  color: '#64748b',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  fontWeight: 600,
                  '&:hover': { borderColor: '#6366f1', color: '#6366f1', bgcolor: 'rgba(99,102,241,0.05)' }
                }}
              />
            </Box>
          ))}
        </Box>
        {tags.length === 0 && (
          <Typography align="center" color="text.secondary" sx={{ py: 4 }}>Không tìm thấy tag nào</Typography>
        )}
      </Paper>
    </Box>
  )
}
