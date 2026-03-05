import { useState, useEffect } from 'react'
import {
  Box, Grid, Typography, Button, Chip, CircularProgress,
  Paper, Skeleton, Stack
} from '@mui/material'
import {
  TrendingUp as TrendingIcon, NewReleases as NewIcon,
  LocalFireDepartment as HotIcon, Bookmark as BookmarkIcon
} from '@mui/icons-material'
import PostCard from '../components/Post/PostCard'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { alpha } from '@mui/material/styles'
import { Link, useSearchParams } from 'react-router-dom'
import BannerCarousel from '../components/Common/BannerCarousel'
import type { Category } from '../types'

const SORT_OPTIONS = [
  { value: 'latest', label: 'Mới nhất', icon: <NewIcon fontSize="small" /> },
  { value: 'popular', label: 'Phổ biến nhất', icon: <HotIcon fontSize="small" /> },
  { value: 'trending', label: 'Xu hướng', icon: <TrendingIcon fontSize="small" /> },
]

function PostSkeleton() {
  return (
    <Paper sx={{ p: 3, borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Skeleton variant="circular" width={28} height={28} />
        <Skeleton variant="text" width={120} />
      </Box>
      <Skeleton variant="text" width="80%" height={28} />
      <Skeleton variant="text" width="60%" height={28} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="90%" />
      <Skeleton variant="text" width="70%" sx={{ mb: 1.5 }} />
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Skeleton variant="rounded" width={60} height={22} />
        <Skeleton variant="rounded" width={60} height={22} />
      </Box>
    </Paper>
  )
}

export default function HomePage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sort, setSort] = useState(searchParams.get('sort') || 'latest')
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedTopic, setSelectedTopic] = useState<number | ''>('')

  useEffect(() => {
    loadPosts(1)
    loadCategories()
  }, [sort, selectedTopic])

  const loadPosts = async (p: number) => {
    setLoading(true)
    try {
      const params: any = { page: p, limit: 10, sort }
      if (selectedTopic) params.topic = selectedTopic
      const { data } = await api.get('/posts', { params })
      if (p === 1) setPosts(data.posts)
      else setPosts(prev => [...prev, ...data.posts])
      setTotalPages(data.totalPages)
      setPage(p)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const { data } = await api.get('/topics/categories')
      setCategories(data.categories)
    } catch {}
  }

  return (
    <Grid container spacing={3}>
      {/* Main content */}
      <Grid size={{ xs: 12, md: 8 }}>
        <BannerCarousel />
        {/* Sort bar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {SORT_OPTIONS.map(opt => (
              <Button
                key={opt.value}
                variant={sort === opt.value ? 'contained' : 'outlined'}
                size="small"
                startIcon={opt.icon}
                onClick={() => setSort(opt.value)}
                sx={{ borderRadius: '6px', borderColor: sort !== opt.value ? '#e2e8f0' : undefined }}
              >
                {opt.label}
              </Button>
            ))}
          </Box>
        </Box>

        {/* Posts list */}
        <Stack spacing={2}>
          {loading && page === 1
            ? Array.from({ length: 5 }).map((_, i) => <PostSkeleton key={i} />)
            : posts.map(post => <PostCard key={post.id} post={post} />)
          }
        </Stack>

        {posts.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h5" color="text.secondary" gutterBottom>Chưa có bài viết nào</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>Hãy là người đầu tiên chia sẻ kiến thức!</Typography>
            {user && (
              <Button component={Link} to="/create" variant="contained">Viết bài đầu tiên</Button>
            )}
          </Box>
        )}

        {page < totalPages && (
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button
              variant="outlined"
              onClick={() => loadPosts(page + 1)}
              disabled={loading}
              sx={{ borderRadius: '6px', borderColor: '#e2e8f0', px: 4 }}
            >
              {loading ? <CircularProgress size={20} /> : 'Xem thêm'}
            </Button>
          </Box>
        )}
      </Grid>

      {/* Sidebar */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Stack spacing={2} sx={{ position: 'sticky', top: 80 }}>
          {/* Topics */}
          <Paper sx={{ p: 2.5, borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingIcon fontSize="small" color="primary" /> Chủ đề
            </Typography>
            <Stack spacing={0.5}>
              {categories.slice(0, 1).map(cat =>
                cat.topics?.slice(0, 6).map((topic: any) => (
                  <Box
                    key={topic.id}
                    onClick={() => setSelectedTopic(selectedTopic === topic.id ? '' : topic.id)}
                    sx={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      px: 1.5, py: 1, borderRadius: 1.5, cursor: 'pointer',
                      bgcolor: selectedTopic === topic.id ? alpha('#6366f1', 0.15) : 'transparent',
                      '&:hover': { bgcolor: alpha('#6366f1', 0.08) },
                      transition: 'all 0.2s',
                    }}
                  >
                    <Typography variant="body2" color={selectedTopic === topic.id ? 'primary.light' : 'text.secondary'} fontWeight={500}>
                      {topic.name}
                    </Typography>
                    <Chip label={topic.postCount} size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#f1f5f9' }} />
                  </Box>
                ))
              )}
            </Stack>
            <Button fullWidth component={Link} to="/topics" variant="outlined" size="small" sx={{ mt: 1.5, borderRadius: '6px', borderColor: '#e2e8f0' }}>
              Xem tất cả chủ đề
            </Button>
          </Paper>

          {/* CTA */}
          {!user && (
            <Paper sx={{
              p: 3, borderRadius: 1.5,
              background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(6,182,212,0.1) 100%)',
              border: '1px solid rgba(99,102,241,0.3)',
              textAlign: 'center',
            }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Tham gia cộng đồng</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Chia sẻ kiến thức, học hỏi và kết nối với hàng nghìn developer khác.
              </Typography>
              <Stack spacing={1}>
                <Button component={Link} to="/register" variant="contained" fullWidth>Đăng ký miễn phí</Button>
                <Button component={Link} to="/login" variant="outlined" fullWidth sx={{ borderColor: '#e2e8f0' }}>Đăng nhập</Button>
              </Stack>
            </Paper>
          )}

          {/* Quick links */}
          {user && (
            <Paper sx={{ p: 2.5, borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1.5, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.1em' }}>
                Nhanh
              </Typography>
              <Stack spacing={0.5}>
                {[
                  { label: 'Bài đã lưu', path: '/bookmarks', icon: <BookmarkIcon fontSize="small" /> },
                ].map(item => (
                  <Button
                    key={item.path}
                    component={Link}
                    to={item.path}
                    startIcon={item.icon}
                    fullWidth
                    sx={{ justifyContent: 'flex-start', color: 'text.secondary', '&:hover': { color: 'text.primary' }, borderRadius: '6px' }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Stack>
            </Paper>
          )}
        </Stack>
      </Grid>
    </Grid>
  )
}
