import { useState, useEffect } from 'react'
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Avatar, Chip, CircularProgress, Pagination,
  FormControl, Select, MenuItem
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import api from '../../services/api'
import dayjs from 'dayjs'

const ACTION_LABELS: Record<string, string> = {
  ban_user: '🚫 Ban user', unban_user: '✅ Unban user', change_role: '🔄 Đổi role',
  resolve_report: '📋 Xử lý báo cáo', delete_post: '🗑 Xóa bài', feature_post: '⭐ Nổi bật',
}

export default function AdminAuditLog() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [action, setAction] = useState('')

  useEffect(() => { loadLogs() }, [page, action])

  const loadLogs = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/audit-logs', { params: { page, limit: 20, action } })
      setLogs(data.logs)
      setTotalPages(data.totalPages)
    } finally { setLoading(false) }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>📋 Audit Log</Typography>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <Select
            value={action}
            onChange={(e) => { setAction(e.target.value); setPage(1) }}
            displayEmpty
          >
            <MenuItem value="">Tất cả hành động</MenuItem>
            {Object.entries(ACTION_LABELS).map(([k, v]) => (
              <MenuItem key={k} value={k}>{v}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', bgcolor: '#f8fafc' } }}>
              <TableCell sx={{ width: 60 }}>STT</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Hành động / Endpoint</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Chi tiết (Body/Error)</TableCell>
              <TableCell>IP</TableCell>
              <TableCell>Thời gian</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={9} align="center" sx={{ py: 4 }}><CircularProgress /></TableCell></TableRow>
            ) : logs.map((log, idx) => (
              <TableRow key={log.id} sx={{ '&:hover': { bgcolor: alpha('#0c5d95', 0.03) } }}>
                <TableCell><Typography variant="caption" color="text.secondary">{(page - 1) * 20 + idx + 1}</Typography></TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar src={log.user?.avatar} sx={{ width: 28, height: 28, fontSize: '0.7rem' }}>
                      {log.user?.username?.[0] || '?'}
                    </Avatar>
                    <Typography variant="caption" fontWeight={600}>
                      {log.user?.username || 'Guest'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Chip 
                        label={log.method || 'ACTION'} 
                        size="small" 
                        color={log.method === 'DELETE' ? 'error' : log.method === 'POST' ? 'primary' : 'default'}
                        sx={{ height: 18, fontSize: '0.6rem', fontWeight: 800 }} 
                      />
                      <Typography variant="caption" fontWeight={700}>
                        {ACTION_LABELS[log.action] || log.action}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: '0.65rem' }}>
                      {log.endpoint}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={log.status || '-'} 
                    size="small"
                    color={!log.status || log.status < 300 ? 'success' : log.status < 400 ? 'warning' : 'error'}
                    sx={{ height: 20, fontSize: '0.65rem', minWidth: 35 }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {log.duration ? `${log.duration}ms` : '-'}
                  </Typography>
                </TableCell>
                <TableCell sx={{ maxWidth: 200 }}>
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ 
                      display: '-webkit-box', 
                      WebkitLineClamp: 2, 
                      WebkitBoxOrient: 'vertical', 
                      overflow: 'hidden',
                      fontSize: '0.65rem',
                      fontFamily: 'monospace'
                    }}
                    title={log.requestBody || log.error || '-'}
                  >
                    {log.error ? `Error: ${log.error}` : log.requestBody || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">{log.ipAddress || '-'}</Typography>
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
          <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} color="primary" />
        </Box>
      )}
    </Box>
  )
}
