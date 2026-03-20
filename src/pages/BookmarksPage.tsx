import { useState, useEffect } from 'react'
import { Box, Typography, Stack, CircularProgress, Paper, Button } from '@mui/material'
import { Bookmark as BookmarkIcon } from '@mui/icons-material'
import api from '../services/api'
import PostCard from '../components/Post/PostCard'
import { Link } from 'react-router-dom'

export default function BookmarksPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/posts', { params: { bookmarked: true, limit: 20 } })
      .then(({ data }) => setPosts(data.posts))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>🔖 Bài viết đã lưu</Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        {posts.length > 0
          ? `Bạn đang lưu ${posts.length} bài viết để xem lại sau`
          : 'Những bài viết bạn đánh dấu sẽ xuất hiện ở đây'}
      </Typography>

      {posts.length > 0 ? (
        <Stack spacing={2}>
          {posts.map(post => <PostCard key={post.id} post={post} />)}
        </Stack>
      ) : (
        <Paper sx={{
          textAlign: 'center', py: 10, px: 3,
          borderRadius: 3, border: '1px solid #e2e8f0',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.04) 0%, rgba(6,182,212,0.03) 100%)',
        }}>
          <BookmarkIcon sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
          <Typography variant="h6" fontWeight={700} gutterBottom>Chưa có bài viết nào được lưu</Typography>
          <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 360, mx: 'auto' }}>
            Khi đọc bài, nhấn icon 🔖 để lưu lại. Tất cả sẽ hiển thị ở đây.
          </Typography>
          <Button
            component={Link} to="/"
            variant="contained"
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
          >
            Khám phá bài viết
          </Button>
        </Paper>
      )}
    </Box>
  )
}
