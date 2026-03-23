import { useState, useEffect } from 'react'
import {
  Box, Grid, Typography, Button, Chip,
  Paper, Skeleton, Stack, Avatar, Pagination
} from '@mui/material'
import {
  TrendingUp as TrendingIcon, NewReleases as NewIcon,
  LocalFireDepartment as HotIcon, Bookmark as BookmarkIcon,
  EmojiEvents as TrophyIcon, WorkspacePremium as ReputationIcon
} from '@mui/icons-material'
import PostCard from '../components/Post/PostCard'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { alpha } from '@mui/material/styles'
import { Link, useSearchParams } from 'react-router-dom'
import BannerCarousel from '../components/Common/BannerCarousel'
import type { Category } from '../types'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

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
  const [savedPosts, setSavedPosts] = useState<any[]>([])
  const [topAuthors, setTopAuthors] = useState<any[]>([])

  useEffect(() => {
    loadPosts(1)
    loadCategories()
  }, [sort, selectedTopic])

  useEffect(() => {
    if (user) {
      loadSavedPosts()
    }
    loadTopAuthors()
  }, [user])

  const loadPosts = async (p: number) => {
    setLoading(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    try {
      const params: any = { page: p, limit: 10, sort }
      if (selectedTopic) params.topic = selectedTopic
      const { data } = await api.get('/posts', { params })
      setPosts(data.posts)
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

  const loadSavedPosts = async () => {
    try {
      const { data } = await api.get('/posts', { params: { bookmarked: true, limit: 5 } })
      setSavedPosts(data.posts)
    } catch (err) {
      console.error(err)
    }
  }

  const loadTopAuthors = async () => {
    try {
      const { data } = await api.get('/users', { params: { limit: 5 } })
      setTopAuthors(data.users)
    } catch {}
  }

  const handleFollow = async (e: React.MouseEvent, authorId: number, isFollowing: boolean) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      window.location.href = '/login'
      return
    }

    try {
      if (isFollowing) {
        await api.delete(`/users/${authorId}/follow`)
      } else {
        await api.post(`/users/${authorId}/follow`)
      }
      setTopAuthors(prev => prev.map(a => 
        a.id === authorId ? { ...a, isFollowing: !isFollowing } : a
      ))
    } catch (err) {
      console.error(err)
    }
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

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, mt: 4 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => loadPosts(value)}
              color="primary"
              shape="rounded"
              showFirstButton
              showLastButton
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: '8px',
                  fontWeight: 600,
                },
              }}
            />
            <Typography variant="caption" color="text.secondary">
              Trang {page} / {totalPages}
            </Typography>
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
                      bgcolor: selectedTopic === topic.id ? alpha('#0c5d95', 0.15) : 'transparent',
                      '&:hover': { bgcolor: alpha('#0c5d95', 0.08) },
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

          {/* Saved posts */}
          {user && savedPosts.length > 0 && (
            <Paper sx={{ p: 2.5, borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <BookmarkIcon fontSize="small" color="primary" /> Bài đã lưu
              </Typography>
              <Stack spacing={2}>
                {savedPosts.map(post => (
                  <Box key={post.id}>
                    <Typography
                      component={Link}
                      to={`/posts/${post.slug}`}
                      variant="body2"
                      fontWeight={600}
                      sx={{
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        textDecoration: 'none', color: 'text.primary', '&:hover': { color: 'primary.main' },
                        lineHeight: 1.4, mb: 0.5
                      }}
                    >
                      {post.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar src={post.author.avatar} sx={{ width: 16, height: 16, fontSize: '0.5rem' }}>
                        {post.author.username[0].toUpperCase()}
                      </Avatar>
                      <Typography variant="caption" color="text.secondary">
                        {post.author.username} · {dayjs(post.createdAt).fromNow()}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
              <Button fullWidth component={Link} to="/bookmarks" variant="outlined" size="small" sx={{ mt: 2, borderRadius: '6px', borderColor: '#e2e8f0' }}>
                Xem tất cả
              </Button>
            </Paper>
          )}

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

          {/* Top Authors */}
          {topAuthors.length > 0 && (
            <Paper sx={{ p: 2.5, borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrophyIcon fontSize="small" color="warning" /> Tác giả hàng đầu
              </Typography>
              <Stack spacing={1.5}>
                {topAuthors.map((author, idx) => (
                  <Box
                    key={author.id}
                    component={Link}
                    to={`/profile/${author.username}`}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1.5,
                      textDecoration: 'none', px: 1, py: 0.75, borderRadius: 1.5,
                      '&:hover': { bgcolor: alpha('#6366f1', 0.06) },
                      transition: 'all 0.2s',
                    }}
                  >
                    {/* Rank badge */}
                    <Box sx={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: idx === 0 ? '#fbbf24' : idx === 1 ? '#94a3b8' : idx === 2 ? '#b45309' : alpha('#0c5d95', 0.1),
                      fontSize: '0.6rem', fontWeight: 800,
                      color: idx < 3 ? 'white' : '#0c5d95',
                    }}>
                      {idx + 1}
                    </Box>
                    <Avatar
                      src={author.avatar}
                      sx={{ width: 34, height: 34, fontSize: '0.8rem', flexShrink: 0 }}
                    >
                      {author.username[0].toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={700} color="text.primary" noWrap>
                        {author.username}
                      </Typography>
                      {author.jobTitle && (
                        <Typography variant="caption" color="text.secondary" noWrap display="block">
                          {author.jobTitle}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, flexShrink: 0, mr: 1 }}>
                      <ReputationIcon sx={{ fontSize: 13, color: '#0c5d95' }} />
                      <Typography variant="caption" fontWeight={700} color="primary">
                        {author.reputation}
                      </Typography>
                    </Box>

                    {user?.id !== author.id && (
                      <Button
                        size="small"
                        variant={author.isFollowing ? "outlined" : "contained"}
                        onClick={(e) => handleFollow(e, author.id, !!author.isFollowing)}
                        sx={{
                          minWidth: 85,
                          width: 85,
                          px: 0,
                          py: 0.5,
                          fontSize: '0.65rem',
                          borderRadius: 1.5,
                          textTransform: 'none',
                          boxShadow: 'none',
                          transition: 'all 0.2s',
                          ...(author.isFollowing ? {
                            borderColor: '#e2e8f0',
                            color: 'text.secondary',
                            '& .unfollow-text': { display: 'none' },
                            '&:hover': { 
                               bgcolor: alpha('#ef4444', 0.08),
                               borderColor: '#fca5a5',
                               color: '#ef4444',
                               '& .following-text': { display: 'none' },
                               '& .unfollow-text': { display: 'inline' }
                            }
                          } : {
                            bgcolor: '#0c5d95',
                            '&:hover': { bgcolor: '#094a76', boxShadow: 'none' }
                          })
                        }}
                      >
                        {author.isFollowing ? (
                          <>
                            <span className="following-text">Đã theo dõi</span>
                            <span className="unfollow-text">Bỏ theo dõi</span>
                          </>
                        ) : 'Theo dõi'}
                      </Button>
                    )}
                  </Box>
                ))}
              </Stack>
            </Paper>
          )}

          {/* Quick links */}
          {/* {user && (
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
          )} */}
        </Stack>
      </Grid>
    </Grid>
  )
}
