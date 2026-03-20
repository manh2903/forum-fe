import { useState, useEffect } from 'react'
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, FormControlLabel, Switch, Stack, IconButton,
  CircularProgress, Tooltip, Avatar, Chip
} from '@mui/material'
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon, Visibility as ViewIcon,
  VisibilityOff as HiddenIcon
} from '@mui/icons-material'
import { alpha } from '@mui/material/styles'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminBanners() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({
    title: '', imageUrl: '', link: '', order: 0, isActive: true, position: 'home_top'
  })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadBanners()
  }, [])

  const loadBanners = async () => {
    try {
      const { data } = await api.get('/banners/admin')
      setBanners(data.banners)
    } finally {
      setLoading(false)
    }
  }

  const handleOpen = (banner?: any) => {
    if (banner) {
      setEditingId(banner.id)
      setForm({
        title: banner.title || '',
        imageUrl: banner.imageUrl,
        link: banner.link || '',
        order: banner.order || 0,
        isActive: banner.isActive,
        position: banner.position || 'home_top'
      })
    } else {
      setEditingId(null)
      setForm({ title: '', imageUrl: '', link: '', order: 0, isActive: true, position: 'home_top' })
    }
    setOpen(true)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('image', file)

    setUploading(true)
    try {
      const { data } = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setForm({ ...form, imageUrl: data.url })
      toast.success('Đã tải ảnh lên')
    } catch {
      toast.error('Lỗi khi tải ảnh')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.imageUrl) return toast.error('Vui lòng cung cấp ảnh')
    try {
      if (editingId) {
        await api.put(`/banners/${editingId}`, form)
        toast.success('Đã cập nhật banner')
      } else {
        await api.post('/banners', form)
        toast.success('Đã thêm banner mới')
      }
      setOpen(false)
      loadBanners()
    } catch {
      toast.error('Có lỗi xảy ra')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa banner này?')) return
    try {
      await api.delete(`/banners/${id}`)
      toast.success('Đã xóa banner')
      loadBanners()
    } catch {
      toast.error('Không thể xóa')
    }
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>🖼️ Quản lý Banner ({banners.length})</Typography>
          <Typography variant="body2" color="text.secondary">Cấu hình banner quảng bá trên trang chủ</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Thêm Banner
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', maxHeight: 'calc(100vh - 280px)' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', bgcolor: '#f8fafc' } }}>
              <TableCell sx={{ width: 60 }}>STT</TableCell>
              <TableCell>Ảnh</TableCell>
              <TableCell>Tiêu đề / Link</TableCell>
              <TableCell>Vị trí</TableCell>
              <TableCell>Thứ tự</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell align="right">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {banners.map((banner: any, idx) => (
              <TableRow key={banner.id} sx={{ '&:hover': { bgcolor: alpha('#0c5d95', 0.03) } }}>
                <TableCell><Typography variant="body2" color="text.secondary">{idx + 1}</Typography></TableCell>
                <TableCell>
                  <Avatar 
                    variant="rounded" 
                    src={banner.imageUrl} 
                    sx={{ width: 100, height: 50, border: '1px solid #e2e8f0' }} 
                  />
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>{banner.title || 'Không có tiêu đề'}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {banner.link || 'N/A'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip label={banner.position} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{banner.order}</Typography>
                </TableCell>
                <TableCell>
                  {banner.isActive ? (
                    <Chip 
                      icon={<ViewIcon sx={{ fontSize: '14px !important' }} />} 
                      label="Hiển thị" 
                      size="small" 
                      color="success" 
                      sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#10b98120', color: '#10b981' }} 
                    />
                  ) : (
                    <Chip 
                      icon={<HiddenIcon sx={{ fontSize: '14px !important' }} />} 
                      label="Đã ẩn" 
                      size="small" 
                      sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#64748b20', color: '#64748b' }} 
                    />
                  )}
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                    <Tooltip title="Chỉnh sửa">
                      <IconButton size="small" onClick={() => handleOpen(banner)} color="primary">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton size="small" onClick={() => handleDelete(banner.id)} color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingId ? 'Chỉnh sửa Banner' : 'Thêm Banner mới'}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ py: 1 }}>
            <TextField
              fullWidth label="Tiêu đề (Tùy chọn)"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Hình ảnh Banner</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth size="small" placeholder="URL hình ảnh..."
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                />
                <Button component="label" variant="outlined" sx={{ minWidth: 44, px: 0, borderColor: '#e2e8f0' }}>
                  {uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                  <input type="file" hidden accept="image/*" onChange={handleUpload} />
                </Button>
              </Box>
              {form.imageUrl && (
                <Box component="img" src={form.imageUrl} sx={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 2, mt: 1.5, border: '1px solid #e2e8f0' }} />
              )}
            </Box>

            <TextField
              fullWidth label="Link liên kết (Tùy chọn)"
              placeholder="https://..."
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth type="number" label="Thứ tự hiển thị"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
              />
              <TextField
                fullWidth label="Vị trí"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
              />
            </Box>

            <FormControlLabel
              control={<Switch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} color="primary" />}
              label="Kích hoạt banner này"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpen(false)} variant="outlined" sx={{ borderColor: '#e2e8f0' }}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={uploading}>
            {editingId ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
