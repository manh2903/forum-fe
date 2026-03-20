import { useState, useEffect } from 'react'
import {
  Box, Typography, Paper,  Grid, CircularProgress,
  Card, CardContent, Avatar, Chip, LinearProgress, Stack, Divider,
  Tooltip, IconButton, Button
} from '@mui/material'
import {
  People as PeopleIcon, Article as PostIcon,
  Comment as CommentIcon, Flag as ReportIcon,
  TrendingUp as TrendIcon, History as HistoryIcon,
  LocalOffer as TagIcon, AdminPanelSettings as AdminIcon,
  CheckCircle as CheckIcon, MoreVert as MoreIcon,
  Error as ErrorIcon
} from '@mui/icons-material'
import { 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Area, AreaChart, PieChart, Pie, Cell 
} from 'recharts'
import api from '../../services/api'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Link } from 'react-router-dom'
import { alpha } from '@mui/material/styles'

dayjs.extend(relativeTime)

function StatCard({ title, value, sub, icon, color, change }: any) {
  return (
    <Card sx={{ borderRadius: 3, border: '1px solid #eef2f6', background: `linear-gradient(135deg, ${color}08 0%, transparent 70%)`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</Typography>
            <Typography variant="h4" fontWeight={800}>{value?.toLocaleString()}</Typography>
            {sub && <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>{sub}</Typography>}
          </Box>
          <Box sx={{ bgcolor: alpha(color, 0.1), color: color, borderRadius: 2.5, p: 1.5, display: 'flex' }}>
            {icon}
          </Box>
        </Box>
        {change !== undefined && (
          <Box sx={{ mt: 1.5 }}>
            <Chip
              label={`+${change} tuần này`}
              size="small"
              sx={{ bgcolor: alpha('#10b981', 0.1), color: '#10b981', fontWeight: 700, height: 20, fontSize: '0.65rem' }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'];

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

  const { overview, topPosts, topUsers, charts, latestAuditLogs, topTags, roleDistribution } = analytics

  const chartData = (() => {
    const map = new Map()
    charts.userGrowth.forEach((d: any) => map.set(d.date, { date: dayjs(d.date).format('DD/MM'), users: parseInt(d.count) }))
    charts.postGrowth.forEach((d: any) => {
      const existing = map.get(d.date) || { date: dayjs(d.date).format('DD/MM'), users: 0 }
      map.set(d.date, { ...existing, posts: parseInt(d.count) })
    })
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date))
  })()

  const pieData = roleDistribution.map((r: any) => ({ name: r.role.toUpperCase(), value: parseInt(r.count) }))

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>🚀 Tổng quan Hệ thống</Typography>
          <Typography variant="body2" color="text.secondary">Chào bạn quay trở lại. Đây là những gì đang diễn ra hôm nay.</Typography>
        </Box>
        <Chip label={dayjs().format('DD MMMM, YYYY')} variant="outlined" sx={{ fontWeight: 600, borderRadius: 2 }} />
      </Box>

      {/* Primary Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Cộng đồng" value={overview.userCount}
            sub={`${overview.newUsersWeek} thành viên mới`}
            icon={<PeopleIcon />} color="#6366f1"
            change={overview.newUsersWeek} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Nội dung" value={overview.postCount}
            sub={`${overview.newPostsWeek} bài viết mới`}
            icon={<PostIcon />} color="#06b6d4"
            change={overview.newPostsWeek} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Tương tác" value={overview.commentCount}
            sub="Tổng số bình luận"
            icon={<CommentIcon />} color="#10b981" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Kiểm duyệt" value={overview.pendingReports}
            sub={`${overview.resolvedReports} đã xử lý`}
            icon={<ReportIcon />} color="#ef4444" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Main Growth Chart */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid #eef2f6', boxShadow: 'none' }}>
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

        {/* Role Distribution & Top Tags */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={3} sx={{ height: '100%' }}>
            <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid #eef2f6', boxShadow: 'none', flex: 1 }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>👥 Phân bổ Quyền hạn</Typography>
              <Box sx={{ height: 160, display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                      {pieData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                {roleDistribution.map((r: any, i: number) => (
                  <Box key={r.role} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: COLORS[i % COLORS.length] }} />
                      <Typography variant="body2" fontWeight={600} color="text.secondary">{r.role.toUpperCase()}</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={700}>{r.count}</Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>

            <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid #eef2f6', boxShadow: 'none' }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>#️⃣ Chủ đề Phổ biến</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {topTags.map((tag: any) => (
                  <Chip key={tag.id} label={tag.name} size="small" variant="outlined" 
                    sx={{ borderRadius: 1.5, borderColor: '#eef2f6', bgcolor: '#f8fafc', fontWeight: 600 }}
                    avatar={<Avatar sx={{ bgcolor: alpha('#6366f1', 0.1), color: '#6366f1', fontSize: '0.6rem !important' }}>{tag.postCount}</Avatar>} />
                ))}
              </Box>
            </Paper>
          </Stack>
        </Grid>

        {/* Top Content */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid #eef2f6', boxShadow: 'none' }}>
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
                  <Chip label="Popular" size="small" sx={{ bgcolor: alpha('#f59e0b', 0.1), color: '#f59e0b', fontWeight: 800, fontSize: '0.65rem' }} />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Audit Logs / Activity */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid #eef2f6', boxShadow: 'none', height: '100%' }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HistoryIcon sx={{ color: '#6366f1' }} /> Hoạt động Quản trị
              </Typography>
              <IconButton size="small" component={Link} to="/admin/audit-log"><MoreIcon /></IconButton>
            </Box>
            <Stack spacing={3}>
              {latestAuditLogs.map((log: any) => (
                <Box key={log.id} sx={{ display: 'flex', gap: 2 }}>
                  <Avatar src={log.user?.avatar} sx={{ width: 32, height: 32 }}>{log.user?.username?.[0]}</Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {log.user?.username} <Typography variant="caption" color="text.secondary" fontWeight={400}>đã thực hiện</Typography>
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', color: 'primary.main', fontWeight: 700, mt: 0.2 }}>
                       {log.action.replace(/_/g, ' ').toUpperCase()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      {dayjs(log.createdAt).fromNow()}
                    </Typography>
                  </Box>
                  {log.status >= 400 && <ErrorIcon color="error" sx={{ fontSize: '1rem' }} />}
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
