import { useState, useEffect } from 'react'
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button, Select, MenuItem,
  FormControl, TextField, CircularProgress, Dialog,
  DialogTitle, DialogContent, DialogActions, Pagination, Avatar
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import api from '../../services/api'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'

const REASON_LABELS: Record<string, string> = {
  spam: 'Spam', harassment: 'Quấy rối', misinformation: 'Sai lệch',
  inappropriate: 'Không phù hợp', copyright: 'Vi phạm bản quyền', other: 'Khác',
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Chờ xử lý', color: '#f59e0b' },
  reviewing: { label: 'Đang xem xét', color: '#0c5d95' },
  resolved: { label: 'Đã xử lý', color: '#10b981' },
  dismissed: { label: 'Bác bỏ', color: '#64748b' },
}

export default function AdminReports() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('pending')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [resolveDialog, setResolveDialog] = useState<any>(null)
  const [resolution, setResolution] = useState('')
  const [newStatus, setNewStatus] = useState('resolved')

  useEffect(() => { loadReports() }, [statusFilter, page])

  const loadReports = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/reports', { params: { status: statusFilter, page, limit: 15 } })
      setReports(data.reports)
      setTotalPages(data.totalPages)
    } finally { setLoading(false) }
  }

  const handleResolve = async () => {
    try {
      await api.put(`/admin/reports/${resolveDialog.id}`, { status: newStatus, resolution })
      toast.success('Đã xử lý báo cáo!')
      setResolveDialog(null)
      setResolution('')
      loadReports()
    } catch { toast.error('Lỗi khi xử lý') }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>🚩 Quản lý báo cáo</Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}>
            <MenuItem value="pending">Chờ xử lý</MenuItem>
            <MenuItem value="reviewing">Đang xem xét</MenuItem>
            <MenuItem value="resolved">Đã xử lý</MenuItem>
            <MenuItem value="dismissed">Bác bỏ</MenuItem>
            <MenuItem value="all">Tất cả</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', maxHeight: 'calc(100vh - 280px)' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', bgcolor: '#f8fafc' } }}>
              <TableCell sx={{ width: 60 }}>STT</TableCell>
              <TableCell>Người báo cáo</TableCell>
              <TableCell>Loại nội dung</TableCell>
              <TableCell>Lý do</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ngày</TableCell>
              <TableCell align="right">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4 }}><CircularProgress /></TableCell></TableRow>
            ) : reports.map((report, idx) => {
              const sc = STATUS_CONFIG[report.status]
              return (
                <TableRow key={report.id} sx={{ '&:hover': { bgcolor: alpha('#0c5d95', 0.03) } }}>
                  <TableCell><Typography variant="body2" color="text.secondary">{(page - 1) * 15 + idx + 1}</Typography></TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar src={report.reporter?.avatar} sx={{ width: 28, height: 28, fontSize: '0.7rem' }}>
                        {report.reporter?.username?.[0]}
                      </Avatar>
                      <Typography variant="caption">{report.reporter?.username}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={report.targetType} size="small"
                      sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#ffffff' }} />
                  </TableCell>
                  <TableCell>
                    <Chip label={REASON_LABELS[report.reason]} size="small"
                      sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#ef444420', color: '#ef4444' }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary"
                      sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', maxWidth: 200 }}>
                      {report.description || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={sc.label} size="small"
                      sx={{ height: 20, fontSize: '0.65rem', bgcolor: `${sc.color}20`, color: sc.color }} />
                  </TableCell>
                  <TableCell><Typography variant="caption" color="text.secondary">{dayjs(report.createdAt).format('DD/MM/YY')}</Typography></TableCell>
                  <TableCell align="right">
                    {report.status === 'pending' && (
                      <Button size="small" variant="outlined" onClick={() => setResolveDialog(report)}
                        sx={{ borderRadius: '8px', borderColor: '#e2e8f0', fontSize: '0.7rem', py: 0.25 }}>
                        Xử lý
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} color="primary" />
        </Box>
      )}

      <Dialog open={!!resolveDialog} onClose={() => setResolveDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Xử lý báo cáo</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
            <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              <MenuItem value="resolved">Đã giải quyết</MenuItem>
              <MenuItem value="dismissed">Bác bỏ</MenuItem>
              <MenuItem value="reviewing">Đang xem xét</MenuItem>
            </Select>
          </FormControl>
          <TextField fullWidth multiline rows={3} label="Ghi chú xử lý" value={resolution}
            onChange={(e) => setResolution(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolveDialog(null)} variant="outlined" sx={{ borderColor: '#e2e8f0' }}>Hủy</Button>
          <Button onClick={handleResolve} variant="contained">Xác nhận</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
