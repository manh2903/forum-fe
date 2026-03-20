import { useState, useEffect } from 'react'
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, TextField, InputAdornment,
  CircularProgress, Pagination, Tooltip, FormControl, Select, MenuItem
} from '@mui/material'
import { Search as SearchIcon, PushPin as PinIcon, Star as FeaturedIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { Link } from 'react-router-dom'
import { alpha } from '@mui/material/styles'
import api from '../../services/api'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'

export default function AdminPosts() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [topic, setTopic] = useState('')
  const [topics, setTopics] = useState<any[]>([])

  useEffect(() => { loadTopics() }, [])
  useEffect(() => { loadPosts() }, [page, search, topic])

  const loadTopics = async () => {
    const { data } = await api.get('/topics')
    setTopics(data.topics)
  }

  const loadPosts = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/posts', { params: { page, limit: 15, search, status: 'published', topic } })
      setPosts(data.posts)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } finally { setLoading(false) }
  }

  const togglePin = async (post: any) => {
    await api.put(`/admin/posts/${post.id}/pin`)
    toast.success(post.isPinned ? 'Đã bỏ ghim' : 'Đã ghim bài viết')
    loadPosts()
  }

  const toggleFeature = async (post: any) => {
    await api.put(`/admin/posts/${post.id}/feature`)
    toast.success(post.isFeatured ? 'Đã bỏ nổi bật' : 'Đã đánh dấu nổi bật')
    loadPosts()
  }

  const handleDelete = async (post: any) => {
    if (!confirm(`Xóa bài "${post.title}"?`)) return
    try {
      await api.delete(`/posts/${post.id}`)
      toast.success('Đã xóa bài viết')
      loadPosts()
    } catch { toast.error('Lỗi khi xóa') }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>📄 Quản lý bài viết ({total})</Typography>
      </Box>

      <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid #e2e8f0', mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          placeholder="Tìm kiếm tiêu đề..."
          size="small"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          sx={{ minWidth: 300 }}
        />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <Select
            value={topic}
            onChange={(e) => { setTopic(e.target.value); setPage(1) }}
            displayEmpty
          >
            <MenuItem value="">Tất cả chủ đề</MenuItem>
            {topics.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
          </Select>
        </FormControl>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', bgcolor: '#f8fafc' } }}>
              <TableCell sx={{ width: 60 }}>STT</TableCell>
              <TableCell>Tiêu đề</TableCell>
              <TableCell>Tác giả</TableCell>
              <TableCell>Tags</TableCell>
              <TableCell>Stats</TableCell>
              <TableCell>Ngày đăng</TableCell>
              <TableCell align="right">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}><CircularProgress /></TableCell></TableRow>
            ) : posts.map((post, idx) => (
              <TableRow key={post.id} sx={{ '&:hover': { bgcolor: 'rgba(99,102,241,0.03)' } }}>
                <TableCell><Typography variant="body2" color="text.secondary">{(page - 1) * 15 + idx + 1}</Typography></TableCell>
                <TableCell sx={{ maxWidth: 300 }}>
                  <Box>
                    <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
                      {post.isPinned && <Chip label="Ghim" size="small" sx={{ height: 16, fontSize: '0.6rem', bgcolor: alpha('#0c5d95', 0.1), color: '#1d4ed8' }} />}
                      {post.isFeatured && <Chip label="Nổi bật" size="small" sx={{ height: 16, fontSize: '0.6rem', bgcolor: '#f59e0b20', color: '#fbbf24' }} />}
                    </Box>
                    <Typography variant="body2" fontWeight={600}
                      component={Link} to={`/posts/${post.slug}`}
                      sx={{ color: 'text.primary', textDecoration: 'none', '&:hover': { color: 'primary.light' }, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {post.title}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">{post.author?.username}</Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {post.tags?.slice(0, 2).map((tag: any) => (
                      <Chip key={tag.id} label={tag.name} size="small" sx={{ height: 18, fontSize: '0.6rem' }} />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                    👁 {post.viewCount} · ❤ {post.likeCount} · 💬 {post.commentCount}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>{dayjs(post.createdAt).format('DD/MM/YY')}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                    <Tooltip title={post.isPinned ? 'Bỏ ghim' : 'Ghim'}>
                      <IconButton size="small" onClick={() => togglePin(post)} sx={{ color: post.isPinned ? '#0c5d95' : 'text.secondary' }}>
                        <PinIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={post.isFeatured ? 'Bỏ nổi bật' : 'Nổi bật'}>
                      <IconButton size="small" onClick={() => toggleFeature(post)} sx={{ color: post.isFeatured ? '#f59e0b' : 'text.secondary' }}>
                        <FeaturedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton size="small" onClick={() => handleDelete(post)} sx={{ color: '#ef4444' }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} color="primary" />
        </Box>
      )}
    </Box>
  )
}
