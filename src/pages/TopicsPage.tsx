import { useState, useEffect } from 'react'
import {
  Box, Typography, Grid, Paper, Chip, Button, CircularProgress
} from '@mui/material'

import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import type { Category } from '../types'
import toast from 'react-hot-toast'

export default function TopicsPage() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [followedTopics, setFollowedTopics] = useState<Set<number>>(new Set())

  useEffect(() => {
    api.get('/topics/categories')
      .then(({ data }) => { setCategories(data.categories) })
      .finally(() => setLoading(false))
    if (user) {
      api.get('/topics').then(({ data }) => {
        const followed = new Set(data.topics.filter((t: any) => t.isFollowing).map((t: any) => t.id))
        setFollowedTopics(followed as Set<number>)
      })
    }
  }, [user])

  const handleFollowTopic = async (topicId: number) => {
    if (!user) return toast.error('Đăng nhập để theo dõi chủ đề')
    try {
      const { data } = await api.post(`/topics/${topicId}/follow`)
      setFollowedTopics(prev => {
        const next = new Set(prev)
        data.following ? next.add(topicId) : next.delete(topicId)
        return next
      })
    } catch {}
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>📚 Khám phá chủ đề</Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>Theo dõi các chủ đề quan tâm để cá nhân hóa feed của bạn</Typography>

      {categories.map(cat => (
        <Box key={cat.id} sx={{ mb: 5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            {cat.icon && <Typography fontSize={24}>{cat.icon}</Typography>}
            <Box>
              <Typography variant="h5" fontWeight={700}>{cat.name}</Typography>
              {cat.description && <Typography variant="body2" color="text.secondary">{cat.description}</Typography>}
            </Box>
          </Box>

          <Grid container spacing={2}>
            {cat.topics?.map(topic => (
              <Grid key={topic.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper sx={{
                  p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0',
                  background: `linear-gradient(135deg, ${cat.color || '#6366f1'}08 0%, transparent 70%)`,
                  '&:hover': { borderColor: cat.color || '#6366f1', transform: 'translateY(-2px)' },
                  transition: 'all 0.2s',
                }}>
                  <Typography variant="body1" fontWeight={700} sx={{ mb: 0.5 }}>{topic.name}</Typography>
                  {topic.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {topic.description}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip label={`${topic.postCount} bài`} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#ffffff' }} />
                      <Chip label={`${topic.followerCount} follow`} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#ffffff' }} />
                    </Box>
                    <Button
                      size="small"
                      variant={followedTopics.has(topic.id) ? 'contained' : 'outlined'}
                      onClick={() => handleFollowTopic(topic.id)}
                      sx={{ borderRadius: '8px', borderColor: '#e2e8f0', py: 0.25, height: 28, fontSize: '0.75rem' }}
                    >
                      {followedTopics.has(topic.id) ? '✓ Đang theo dõi' : '+ Theo dõi'}
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}

      {categories.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary">Chưa có chủ đề nào. Hãy chờ admin tạo!</Typography>
        </Box>
      )}
    </Box>
  )
}
