import { useState, useEffect } from 'react'
import {
  Box, Typography, Grid, Card, CardMedia, CardContent, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControlLabel, Switch, Stack, IconButton, CircularProgress
} from '@mui/material'
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon, Visibility as ViewIcon,
  VisibilityOff as HiddenIcon
} from '@mui/icons-material'
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

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Quản lý Banner</Typography>
          <Typography variant="body2" color="text.secondary">Cấu hình banner quảng bá trên trang chủ</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Thêm Banner
        </Button>
      </Box>

      <Grid container spacing={3}>
        {banners.map((banner: any) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={banner.id}>
            <Card sx={{ borderRadius: 1.5, border: '1px solid #e2e8f0', overflow: 'hidden', position: 'relative' }}>
              <CardMedia
                component="img"
                height="160"
                image={banner.imageUrl}
                alt={banner.title}
                sx={{ opacity: banner.isActive ? 1 : 0.6 }}
              />
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                  <Typography variant="subtitle1" fontWeight={700} noWrap sx={{ flex: 1, mr: 1 }}>
                    {banner.title || 'Không có tiêu đề'}
                  </Typography>
                  <Stack direction="row" spacing={0.5}>
                    <IconButton size="small" onClick={() => handleOpen(banner)} color="primary">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(banner.id)} color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="caption" color="text.secondary">Thứ tự: {banner.order}</Typography>
                  <Box sx={{ flex: 1 }} />
                  {banner.isActive ? (
                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: 'success.main' }}>
                      <ViewIcon sx={{ fontSize: 14 }} />
                      <Typography variant="caption" fontWeight={600}>Đang hiển thị</Typography>
                    </Stack>
                  ) : (
                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: 'text.disabled' }}>
                      <HiddenIcon sx={{ fontSize: 14 }} />
                      <Typography variant="caption" fontWeight={600}>Đã ẩn</Typography>
                    </Stack>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
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
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Hình ảnh Banner</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth size="small" placeholder="URL hình ảnh..."
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                />
                <Button component="label" variant="outlined" sx={{ minWidth: 44, px: 0 }}>
                  {uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                  <input type="file" hidden accept="image/*" onChange={handleUpload} />
                </Button>
              </Box>
              {form.imageUrl && (
                <Box component="img" src={form.imageUrl} sx={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 1, mt: 1 }} />
              )}
            </Box>

            <TextField
              fullWidth label="Link liên kết (Tùy chọn)"
              placeholder="https://..."
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth type="number" label="Thứ tự hiển thị"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth label="Vị trí"
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                />
              </Grid>
            </Grid>

            <FormControlLabel
              control={<Switch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />}
              label="Kích hoạt banner này"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={uploading}>
            {editingId ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
