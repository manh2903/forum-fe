import { useState, useEffect } from 'react'
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Avatar, Chip, CircularProgress, Pagination
} from '@mui/material'
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

  useEffect(() => { loadLogs() }, [page])

  const loadLogs = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/audit-logs', { params: { page, limit: 20 } })
      setLogs(data.logs)
      setTotalPages(data.totalPages)
    } finally { setLoading(false) }
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>📋 Audit Log</Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', bgcolor: '#f8fafc' } }}>
              <TableCell>Admin</TableCell>
              <TableCell>Hành động</TableCell>
              <TableCell>Đối tượng</TableCell>
              <TableCell>Chi tiết</TableCell>
              <TableCell>IP</TableCell>
              <TableCell>Thời gian</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}><CircularProgress /></TableCell></TableRow>
            ) : logs.map(log => (
              <TableRow key={log.id} sx={{ '&:hover': { bgcolor: 'rgba(99,102,241,0.03)' } }}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar src={log.admin?.avatar} sx={{ width: 28, height: 28, fontSize: '0.7rem' }}>{log.admin?.username?.[0]}</Avatar>
                    <Typography variant="caption">{log.admin?.username}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip label={ACTION_LABELS[log.action] || log.action} size="small"
                    sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#ffffff' }} />
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {log.targetType} #{log.targetId}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {log.details ? JSON.stringify(log.details) : '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">{log.ipAddress || '-'}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">{dayjs(log.createdAt).format('DD/MM HH:mm')}</Typography>
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
