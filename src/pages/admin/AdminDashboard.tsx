import { useState, useEffect } from 'react'
import {
  Box, Typography, Paper, Grid, Card, CardContent, CircularProgress,
  Avatar, Stack, Chip, Button
} from '@mui/material'
import {
  PeopleAlt as UserIcon, Article as PostIcon,
  Comment as CommentIcon, Report as ReportIcon,
  Timeline as TrendIcon
} from '@mui/icons-material'
import {
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Area, AreaChart
} from 'recharts'
import api from '../../services/api'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { alpha } from '@mui/material/styles'
import EngagementWidget from '../../components/Dashboard/Engagementwidget'

dayjs.extend(relativeTime)

function StatCard({ title, value, sub, icon, color, change }: any) {
  return (
    <Card sx={{ 
      height: '100%',
      borderRadius: 1, 
      border: '2px solid #cbd5e1', 
      background: `linear-gradient(135deg, ${color}15 0%, transparent 60%)`, 
      boxShadow: 'none',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: change !== undefined ? 1 : 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</Typography>
            <Typography variant="h3" fontWeight={900} color="text.primary">{value?.toLocaleString()}</Typography>
            {sub && <Typography variant="caption" color="text.primary" sx={{ fontWeight: 600 }}>{sub}</Typography>}
          </Box>
          <Box sx={{ bgcolor: color, color: '#ffffff', borderRadius: 1, p: 1.25, display: 'flex', boxShadow: `0 4px 12px ${alpha(color, 0.4)}` }}>
            {icon}
          </Box>
        </Box>
        {change !== undefined && (
          <Box sx={{ mt: 'auto', pt: 1 }}>
            <Chip
              label={`+${change} tuần này`}
              size="small"
              sx={{ bgcolor: '#10b981', color: '#ffffff', fontWeight: 800, height: 22, fontSize: '0.7rem', borderRadius: 1 }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default function AdminDashboard() {
  const { loading: authLoading } = useAuth()
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    api.get('/admin/analytics')
      .then(({ data }) => setAnalytics(data))
      .finally(() => setLoading(false))
  }, [authLoading])

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
  if (!analytics) return null

  const {
    overview,
    engagementByTopic = [],
    topUsers = [],
    topPosts = [],
    topTags = [],
    topSearches = [],
    charts = { userGrowth: [], postGrowth: [] }
  } = analytics || {};

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
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>🚀 Tổng quan Hệ thống</Typography>
          <Typography variant="body2" color="text.secondary">Chào bạn quay trở lại. Đây là những gì đang diễn ra hôm nay.</Typography>
        </Box>
        <Chip label={dayjs().format('DD MMMM, YYYY')} variant="outlined" sx={{ fontWeight: 600, borderRadius: 1, border: '2px solid #cbd5e1' }} />
      </Box>

      {/* Primary Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Người dùng" value={overview.userCount} 
            change={overview.newUsersWeek} sub="Thành viên" 
            icon={<UserIcon />} color="#6366f1" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Nội dung" value={overview.postCount} 
            change={overview.newPostsWeek} sub="Bài viết" 
            icon={<PostIcon />} color="#06b6d4" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Thảo luận" value={overview.commentCount}
            sub="Bình luận"
            icon={<CommentIcon />} color="#10b981" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Kiểm duyệt" value={overview.pendingReports}
            sub={`${overview.resolvedReports} xử lý`}
            icon={<ReportIcon />} color="#64748b" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Main Growth Chart */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ p: 3, borderRadius: 1, border: '2px solid #cbd5e1', boxShadow: 'none' }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendIcon color="primary" /> Tăng trưởng Cộng đồng
              </Typography>
              <Stack direction="row" spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#6366f1' }} />
                  <Typography variant="caption" fontWeight={600}>Người dùng</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#06b6d4' }} />
                  <Typography variant="caption" fontWeight={600}>Bài viết</Typography>
                </Box>
              </Stack>
            </Box>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="postGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="users" stroke="#6366f1" fill="url(#userGrad)" strokeWidth={3} />
                  <Area type="monotone" dataKey="posts" stroke="#06b6d4" fill="url(#postGrad)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Top Users */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 1, border: '2px solid #cbd5e1', boxShadow: 'none', height: '100%' }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>🌟 Thành viên Nổi bật</Typography>
            <Stack spacing={2}>
              {topUsers.map((u: any) => (
                <Box key={u.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar src={u.avatar} sx={{ width: 32, height: 32 }}>{u.username?.[0]}</Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={700} component={Link} to={`/profile/${u.username}`} sx={{ color: 'inherit', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                      {u.username}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      ⭐ {u.reputation} điểm uy tín
                    </Typography>
                  </Box>
                  <Chip label={u.role} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.6rem', border: 'none', bgcolor: alpha('#6366f1', 0.1), color: '#6366f1' }} />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Engagement Widget */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <EngagementWidget data={engagementByTopic} loading={loading} />
        </Grid>

        {/* Search Trends */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper sx={{ p: 3, borderRadius: 1, border: '2px solid #cbd5e1', boxShadow: 'none', height: '100%' }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendIcon sx={{ color: '#6366f1' }} /> Từ khóa Tìm kiếm
              </Typography>
              <Chip label="Đang xu hướng" size="small" color="primary" sx={{ borderRadius: 1.5, height: 20, fontSize: '0.7rem' }} />
            </Box>
            <Stack spacing={2}>
              {topSearches.map((s: any, i: number) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" fontWeight={700} color="text.secondary" sx={{ width: 24 }}>{i + 1}.</Typography>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={600}>{s.query}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Cập nhật {dayjs(s.latest).fromNow()}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" fontWeight={800} color="primary.main">{s.count}</Typography>
                    <Typography variant="caption" color="text.secondary">lượt</Typography>
                  </Box>
                </Box>
              ))}
              {topSearches.length === 0 && (
                <Typography variant="body2" color="text.secondary" align="center">Chưa có dữ liệu tìm kiếm</Typography>
              )}
            </Stack>
          </Paper>
        </Grid>

        {/* Top Content */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ p: 3, borderRadius: 1, border: '2px solid #cbd5e1', boxShadow: 'none' }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight={800}>🔥 Bài viết Thịnh hành</Typography>
              <Button size="small" component={Link} to="/admin/posts">Xem tất cả</Button>
            </Box>
            <Stack spacing={0}>
              {topPosts.map((post: any, i: number) => (
                <Box key={post.id} sx={{ 
                  display: 'flex', alignItems: 'center', gap: 2, py: 2, 
                  borderBottom: i === topPosts.length - 1 ? 'none' : '1px solid #f1f5f9' 
                }}>
                  <Typography variant="h4" fontWeight={800} color="text.secondary" sx={{ opacity: 0.2, width: 40 }}>{i + 1}</Typography>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body1" fontWeight={700} noWrap sx={{ display: 'block', mb: 0.5, color: 'inherit', textDecoration: 'none', '&:hover': { color: 'primary.main' } }} component={Link} to={`/posts/${post.slug}`}>
                      {post.title}
                    </Typography>
                    <Stack direction="row" spacing={2} color="text.secondary">
                      <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>👀 {post.viewCount}</Typography>
                      <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>❤️ {post.likeCount}</Typography>
                      <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>💬 {post.commentCount}</Typography>
                    </Stack>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Top Tags */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 1, border: '2px solid #cbd5e1', boxShadow: 'none', height: '100%' }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>#️⃣ Chủ đề Phổ biến</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {topTags.map((tag: any) => (
                <Chip key={tag.id} label={tag.name} size="small" variant="outlined" 
                  sx={{ borderRadius: 1.5, borderColor: '#eef2f6', bgcolor: '#f8fafc', fontWeight: 600 }}
                  avatar={<Avatar sx={{ bgcolor: alpha('#6366f1', 0.1), color: '#6366f1', fontSize: '0.6rem !important' }}>{tag.postCount}</Avatar>} />
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
