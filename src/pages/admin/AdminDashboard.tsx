import { useState, useEffect } from 'react'
import {
  Box, Typography, Paper, Grid, CircularProgress,
  Card, CardContent, Avatar, Chip, LinearProgress
} from '@mui/material'
import {
  People as PeopleIcon, Article as PostIcon,
  Comment as CommentIcon, Flag as ReportIcon
} from '@mui/icons-material'
import { XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import api from '../../services/api'
import dayjs from 'dayjs'
import { Link } from 'react-router-dom'

function StatCard({ title, value, sub, icon, color, change }: any) {
  return (
    <Card sx={{ borderRadius: 1.5, border: '1px solid #e2e8f0', background: `linear-gradient(135deg, ${color}10 0%, transparent 70%)` }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{title}</Typography>
            <Typography variant="h4" fontWeight={800}>{value?.toLocaleString()}</Typography>
            {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
          </Box>
          <Box sx={{ bgcolor: `${color}20`, borderRadius: 2, p: 1.5 }}>
            {icon}
          </Box>
        </Box>
        {change !== undefined && (
          <Box sx={{ mt: 1.5 }}>
            <Chip
              label={`+${change} tuần này`}
              size="small"
              sx={{ bgcolor: '#10b98120', color: '#10b981', border: '1px solid #10b98140', height: 20, fontSize: '0.7rem', borderRadius: '6px' }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/analytics')
      .then(({ data }) => setAnalytics(data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
  if (!analytics) return null

  const { overview, topPosts, topUsers, charts } = analytics

  // Merge chart data
  const chartData = (() => {
    const map = new Map()
    charts.userGrowth.forEach((d: any) => map.set(d.date, { date: dayjs(d.date).format('DD/MM'), users: parseInt(d.count) }))
    charts.postGrowth.forEach((d: any) => {
      const existing = map.get(d.date) || { date: dayjs(d.date).format('DD/MM'), users: 0 }
      map.set(d.date, { ...existing, posts: parseInt(d.count) })
    })
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date))
  })()

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>📊 Dashboard</Typography>

      {/* Stat cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Tổng người dùng" value={overview.userCount}
            sub={`${overview.newUsersWeek} mới tuần này`}
            icon={<PeopleIcon sx={{ color: '#6366f1' }} />} color="#6366f1"
            change={overview.newUsersWeek} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Bài viết" value={overview.postCount}
            sub={`${overview.newPostsWeek} mới tuần này`}
            icon={<PostIcon sx={{ color: '#06b6d4' }} />} color="#06b6d4"
            change={overview.newPostsWeek} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Bình luận" value={overview.commentCount}
            icon={<CommentIcon sx={{ color: '#10b981' }} />} color="#10b981" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Báo cáo chờ xử lý" value={overview.pendingReports}
            icon={<ReportIcon sx={{ color: '#ef4444' }} />} color="#ef4444" />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        {/* Growth chart */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>📈 Tăng trưởng 30 ngày qua</Typography>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="postGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <RechartsTooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 6, color: '#0f172a' }} />
                  <Area type="monotone" dataKey="users" name="Người dùng mới" stroke="#6366f1" fill="url(#userGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="posts" name="Bài viết mới" stroke="#06b6d4" fill="url(#postGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>Chưa có dữ liệu</Box>
            )}
          </Paper>
        </Grid>

        {/* Top users */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 1.5, border: '1px solid #e2e8f0', height: '100%' }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>🏆 Top Users</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {topUsers.map((u: any, i: number) => (
                <Box key={u.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ width: 16, textAlign: 'center', fontWeight: 700 }}>
                    {i + 1}
                  </Typography>
                  <Avatar src={u.avatar} sx={{ width: 32, height: 32, fontSize: '0.75rem' }}>{u.username[0]}</Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={600}>{u.username}</Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(u.reputation / (topUsers[0]?.reputation || 1)) * 100}
                      sx={{ height: 4, borderRadius: 2, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { bgcolor: '#6366f1' } }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">⭐{u.reputation}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Top posts */}
        <Grid size={12}>
          <Paper sx={{ p: 3, borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>🔥 Top Bài Viết</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {topPosts.map((post: any, i: number) => (
                <Box key={post.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, borderBottom: '1px solid #ffffff', '&:last-child': { borderBottom: 'none' } }}>
                  <Typography variant="h4" fontWeight={800} color="text.secondary" sx={{ width: 32, opacity: 0.4 }}>
                    {i + 1}
                  </Typography>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} noWrap
                      component={Link} to={`/posts/${post.slug}`}
                      sx={{ color: 'text.primary', textDecoration: 'none', '&:hover': { color: 'primary.light' } }}>
                      {post.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {dayjs(post.createdAt).format('DD/MM/YYYY')}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="primary.light" fontWeight={700}>{post.viewCount}</Typography>
                      <Typography variant="caption" color="text.secondary" display="block">views</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="#ef4444" fontWeight={700}>{post.likeCount}</Typography>
                      <Typography variant="caption" color="text.secondary" display="block">likes</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="#10b981" fontWeight={700}>{post.commentCount}</Typography>
                      <Typography variant="caption" color="text.secondary" display="block">comments</Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
