import { useState, useEffect } from 'react'
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Avatar, Chip, CircularProgress, Pagination,
  FormControl, Select, MenuItem, Grid, Card, CardContent, Stack
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import { 
  History as HistoryIcon, ErrorOutline as ErrorIcon, 
  Security as SecurityIcon, TrendingUp as TrendIcon,
  Timeline as ChartIcon, Psychology as InsightIcon
} from '@mui/icons-material'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip as ReChartTooltip, ResponsiveContainer, Legend
} from 'recharts'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'
import dayjs from 'dayjs'

const ACTION_LABELS: Record<string, string> = {
  ban_user: '🚫 Ban user', unban_user: '✅ Unban user', change_role: '🔄 Đổi role',
  resolve_report: '📋 Xử lý báo cáo', delete_post: '🗑 Xóa bài', feature_post: '⭐ Nổi bật',
  update_post_admin: '📝 Sửa bài viết (Admin)', update_user_info: '👤 Cập nhật User (Admin)'
}

const StatCard = ({ title, value, icon, color, trend }: any) => (
  <Card sx={{ 
    height: '100%',
    borderRadius: 1, 
    border: '2px solid #cbd5e1', 
    background: `linear-gradient(135deg, ${color}15 0%, transparent 60%)`, 
    boxShadow: 'none',
    display: 'flex',
    flexDirection: 'column'
  }}>
    <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Box sx={{ 
          p: 1.25, borderRadius: 1, bgcolor: color, color: '#ffffff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 12px ${alpha(color, 0.4)}`
        }}>
          {icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={900} sx={{ mt: 0.5, color: 'text.primary' }}>
            {value}
          </Typography>
        </Box>
        {trend && (
          <Box sx={{ 
            px: 1, py: 0.5, borderRadius: 1, bgcolor: trend > 0 ? '#10b981' : '#f43f5e',
            color: '#ffffff', fontSize: '0.75rem', fontWeight: 800
          }}>
            {trend > 0 ? '+' : ''}{trend}%
          </Box>
        )}
      </Stack>
    </CardContent>
  </Card>
)

export default function AdminAuditLog() {
  const { loading: authLoading } = useAuth()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [action, setAction] = useState('')
  const [analytics, setAnalytics] = useState<any>(null)

  useEffect(() => {
    if (authLoading) return
    loadLogs()
  }, [authLoading, page, action])
  useEffect(() => {
    if (authLoading) return
    loadAnalytics()
  }, [authLoading])

  const loadLogs = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/audit-logs', { params: { page, limit: 15, action } })
      setLogs(data.logs)
      setTotalPages(data.totalPages)
    } finally { setLoading(false) }
  }

  const loadAnalytics = async () => {
    try {
      const { data } = await api.get('/admin/audit-analytics')
      setAnalytics(data)
    } catch (err) {
      console.error(err)
    }
  }

  const getHealthStatus = () => {
    if (!analytics?.summary?.errorRate) return { label: 'Đang tải...', color: '#6366f1' }
    const rate = parseFloat(analytics.summary.errorRate)
    if (rate < 2) return { label: 'Tuyệt vời', color: '#10b981', desc: 'Hệ thống vận hành ổn định.' }
    if (rate < 5) return { label: 'Ổn định', color: '#f59e0b', desc: 'Có một vài lỗi nhỏ cần chú ý.' }
    return { label: 'Cần chú ý', color: '#ef4444', desc: 'Tỷ lệ lỗi cao bất thường.' }
  }

  const health = getHealthStatus()

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>📊 Hệ thống Giám sát & Phân tích</Typography>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Chip icon={<HistoryIcon sx={{ fontSize: '1rem !important' }} />} 
            label="Dự đoán: Bình thường" color="success" variant="outlined" sx={{ borderRadius: 1.5, fontWeight: 600 }} />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select
              value={action}
              onChange={(e) => { setAction(e.target.value); setPage(1) }}
              displayEmpty
              sx={{ borderRadius: 1 }}
            >
              <MenuItem value="">Hành động (Tất cả)</MenuItem>
              {Object.entries(ACTION_LABELS).map(([k, v]) => (
                <MenuItem key={k} value={k}>{v}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Box>

      {/* Analytics Overview */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard title="Tổng lượt tương tác" value={analytics?.summary?.totalLogs || 0} icon={<ChartIcon />} color="#6366f1" trend={12} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard title="Tỷ lệ lỗi hệ thống" value={`${analytics?.summary?.errorRate || 0}%`} icon={<ErrorIcon />} color="#f43f5e" trend={-3} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard title="Mức độ an toàn" value="Cao" icon={<SecurityIcon />} color="#6d28d9" />
        </Grid> 

        {/* Chart Section */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ p: 3, borderRadius: 1, border: '2px solid #cbd5e1', boxShadow: 'none', height: 350 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendIcon color="primary" /> Xu hướng hoạt động 30 ngày qua
            </Typography>
            <Box sx={{ height: '80%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.dailyTrend || []}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorErrors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} 
                    tickFormatter={(val) => dayjs(val).format('DD/MM')} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <ReChartTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}
                    labelStyle={{ fontWeight: 700, marginBottom: 4 }}
                  />
                  <Area type="monotone" dataKey="count" name="Hoạt động" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                  <Area type="monotone" dataKey="errors" name="Lỗi" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorErrors)" />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: 20, fontSize: 12 }} />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Insights / Predictions */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 1, border: '2px solid #cbd5e1', boxShadow: 'none', height: 350, bgcolor: alpha('#6366f1', 0.02) }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <InsightIcon sx={{ color: '#6366f1' }} /> Dự đoán & Phân tích
            </Typography>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>SỨC KHỎE HỆ THỐNG</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                  <Typography variant="h6" fontWeight={800} sx={{ color: health.color }}>{health.label}</Typography>
                  <Chip label={`${analytics?.summary?.errorRate || 0}% error`} size="small" sx={{ bgcolor: alpha(health.color, 0.1), color: health.color, fontWeight: 800 }} />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {health.desc} Dựa trên dữ liệu 30 ngày qua.
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>DỰ BÁO HOẠT ĐỘNG</Typography>
                <Typography variant="body2" sx={{ mt: 1, color: 'text.primary' }}>
                   Tần suất admin hoạt động tập trung vào <strong>20:00 - 23:00</strong>. Dự kiến ngày mai lưu lượng sẽ tăng nhẹ.
                </Typography>
              </Box>

              {/* <Paper sx={{ p: 2.5, borderRadius: 1, border: '2px solid #cbd5e1', boxShadow: 'none', background: '#f8fafc' }}>
                <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1, color: 'primary.main' }}>
                  💡 Gợi ý cho bạn
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Kiểm tra log của Admin, đây là người có nhiều thay đổi hệ thống nhất.
                </Typography>
              </Paper> */}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Main Table */}
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <HistoryIcon sx={{ color: 'text.secondary' }} /> Nhật ký chi tiết
      </Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 1, border: '2px solid #cbd5e1', boxShadow: 'none', maxHeight: 'calc(100vh - 280px)' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase', bgcolor: '#f8fafc', py: 1.5 } }}>
              <TableCell sx={{ width: 50 }}>STT</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Hành động / Endpoint</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Dữ liệu</TableCell>
              <TableCell>Thời gian</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6 }}><CircularProgress size={30} /></TableCell></TableRow>
            ) : logs.map((log, idx) => (
              <TableRow key={log.id} sx={{ '&:hover': { bgcolor: alpha('#6366f1', 0.03) } }}>
                <TableCell><Typography variant="caption" color="text.secondary">{(page - 1) * 15 + idx + 1}</Typography></TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar src={log.user?.avatar} sx={{ width: 24, height: 24, fontSize: '0.65rem' }}>
                      {log.user?.username?.[0] || '?'}
                    </Avatar>
                    <Typography variant="caption" fontWeight={600}>{log.user?.username || 'Guest'}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.2 }}>
                      <Chip label={log.method} size="small" sx={{ height: 16, fontSize: '0.55rem', fontWeight: 900, borderRadius: 1 }}
                        color={log.method === 'DELETE' ? 'error' : log.method === 'POST' ? 'primary' : 'default'} />
                      <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.7rem' }}>
                        {ACTION_LABELS[log.action] || log.action}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', fontFamily: 'monospace' }}>{log.endpoint}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip label={log.status} size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 800 }}
                    color={log.status < 300 ? 'success' : log.status < 400 ? 'warning' : 'error'} />
                </TableCell>
                <TableCell><Typography variant="caption" color="text.secondary">{log.duration}ms</Typography></TableCell>
                <TableCell sx={{ maxWidth: 180 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', fontFamily: 'monospace', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {log.error ? `Error: ${log.error}` : log.requestBody || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                    {dayjs(log.createdAt).format('DD/MM HH:mm:ss')}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} color="primary" size="small" />
        </Box>
      )}
    </Box>
  )
}
