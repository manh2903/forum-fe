import { useState, useEffect } from 'react'
import { Box, Typography, Stack, CircularProgress } from '@mui/material'
import { Bookmark as BookmarkIcon } from '@mui/icons-material'
import api from '../services/api'
import PostCard from '../components/Post/PostCard'

export default function BookmarksPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/posts', { params: { bookmarked: true, limit: 20 } })
      .then(({ data }) => setPosts(data.posts))
      .catch(() => {
        // Fallback: just show empty
        setPosts([])
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>🔖 Bài viết đã lưu</Typography>
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>
      ) : (
        <Stack spacing={2}>
          {posts.map(post => <PostCard key={post.id} post={post} />)}
          {posts.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <BookmarkIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography color="text.secondary">Bạn chưa lưu bài viết nào</Typography>
            </Box>
          )}
        </Stack>
      )}
    </Box>
  )
}
