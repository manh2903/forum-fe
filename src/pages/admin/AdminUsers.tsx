import { useState, useEffect } from 'react'
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Avatar, Chip, IconButton, Button, TextField,
  InputAdornment, Select, MenuItem, FormControl, Dialog, DialogTitle,
  DialogContent, DialogActions, CircularProgress, Tooltip, Pagination
} from '@mui/material'
import { Search as SearchIcon, Block as BanIcon, CheckCircle as UnbanIcon, AdminPanelSettings as RoleIcon } from '@mui/icons-material'
import api from '../../services/api'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [banDialog, setBanDialog] = useState<any>(null)
  const [banReason, setBanReason] = useState('')
  const [roleDialog, setRoleDialog] = useState<any>(null)
  const [newRole, setNewRole] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    loadUsers()
  }, [page, search, role, status])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/users', { params: { page, limit: 10, search, role, status } })
      setUsers(data.users)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } finally { setLoading(false) }
  }

  const handleBan = async () => {
    try {
      await api.put(`/admin/users/${banDialog.id}/ban`, { banReason })
      toast.success(`Đã ban ${banDialog.username}`)
      setBanDialog(null)
      setBanReason('')
      loadUsers()
    } catch { toast.error('Lỗi khi ban user') }
  }

  const handleUnban = async (user: any) => {
    try {
      await api.put(`/admin/users/${user.id}/unban`)
      toast.success(`Đã unban ${user.username}`)
      loadUsers()
    } catch { toast.error('Lỗi khi unban user') }
  }

  const handleRoleChange = async () => {
    try {
      await api.put(`/admin/users/${roleDialog.id}/role`, { role: newRole })
      toast.success('Đã cập nhật role')
      setRoleDialog(null)
      loadUsers()
    } catch { toast.error('Lỗi khi đổi role') }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>👥 Quản lý người dùng ({total})</Typography>
      </Box>

      <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid #e2e8f0', mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          placeholder="Tìm kiếm username, email..."
          size="small"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          sx={{ minWidth: 260 }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <Select
            value={role}
            onChange={(e) => { setRole(e.target.value); setPage(1) }}
            displayEmpty
          >
            <MenuItem value="">Tất cả Role</MenuItem>
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="moderator">Moderator</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <Select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1) }}
            displayEmpty
          >
            <MenuItem value="">Tất cả Trạng thái</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="banned">Banned</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', bgcolor: '#f8fafc' } }}>
              <TableCell sx={{ width: 60 }}>STT</TableCell>
              <TableCell>Người dùng</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Điểm</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Tham gia</TableCell>
              <TableCell align="right">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4 }}><CircularProgress /></TableCell></TableRow>
            ) : users.map((user, idx) => (
              <TableRow key={user.id} sx={{ '&:hover': { bgcolor: 'rgba(99,102,241,0.03)' } }}>
                <TableCell><Typography variant="body2" color="text.secondary">{(page - 1) * 15 + idx + 1}</Typography></TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar src={user.avatar} sx={{ width: 36, height: 36, fontSize: '0.85rem' }}>{user.username[0]}</Avatar>
                    <Typography variant="body2" fontWeight={600}>{user.username}</Typography>
                  </Box>
                </TableCell>
                <TableCell><Typography variant="body2" color="text.secondary">{user.email}</Typography></TableCell>
                <TableCell>
                  <Chip label={user.role} size="small"
                    color={user.role === 'admin' ? 'primary' : user.role === 'moderator' ? 'secondary' : 'default'}
                    sx={{ height: 20, fontSize: '0.65rem' }} />
                </TableCell>
                <TableCell><Typography variant="body2">⭐ {user.reputation}</Typography></TableCell>
                <TableCell>
                  <Chip
                    label={user.isBanned ? 'Banned' : 'Active'}
                    size="small"
                    sx={{ height: 20, fontSize: '0.65rem', bgcolor: user.isBanned ? '#ef444420' : '#10b98120', color: user.isBanned ? '#ef4444' : '#10b981' }}
                  />
                </TableCell>
                <TableCell><Typography variant="caption" color="text.secondary">{dayjs(user.createdAt).format('DD/MM/YY')}</Typography></TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                    <Tooltip title="Đổi role">
                      <IconButton size="small" onClick={() => { setRoleDialog(user); setNewRole(user.role) }}>
                        <RoleIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {user.isBanned ? (
                      <Tooltip title="Unban">
                        <IconButton size="small" onClick={() => handleUnban(user)} sx={{ color: '#10b981' }}>
                          <UnbanIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Ban">
                        <IconButton size="small" onClick={() => setBanDialog(user)} sx={{ color: '#ef4444' }}>
                          <BanIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
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

      {/* Ban dialog */}
      <Dialog open={!!banDialog} onClose={() => setBanDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>🚫 Ban người dùng: {banDialog?.username}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Lý do ban" multiline rows={3} value={banReason}
            onChange={(e) => setBanReason(e.target.value)} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBanDialog(null)} sx={{ borderColor: '#e2e8f0' }} variant="outlined">Hủy</Button>
          <Button onClick={handleBan} variant="contained" color="error">Ban</Button>
        </DialogActions>
      </Dialog>

      {/* Role dialog */}
      <Dialog open={!!roleDialog} onClose={() => setRoleDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Đổi role: {roleDialog?.username}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <Select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="moderator">Moderator</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialog(null)} variant="outlined" sx={{ borderColor: '#e2e8f0' }}>Hủy</Button>
          <Button onClick={handleRoleChange} variant="contained">Lưu</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
