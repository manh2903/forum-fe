import { useState, useEffect } from 'react'
import {
  Box, Typography, Paper, Grid, Card, CardContent, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, Stack, Chip, CircularProgress, IconButton, Tooltip
} from '@mui/material'
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminTopics() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [addCatOpen, setAddCatOpen] = useState(false)
  const [addTopicOpen, setAddTopicOpen] = useState(false)
  const [catForm, setCatForm] = useState({ name: '', description: '', icon: '', color: '#6366f1' })
  const [topicForm, setTopicForm] = useState({ name: '', categoryId: '', description: '' })
  const [catEditingId, setCatEditingId] = useState<string | null>(null)
  const [topicEditingId, setTopicEditingId] = useState<string | null>(null)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/topics/categories')
      setCategories(data.categories)
    } finally { setLoading(false) }
  }

  const handleAddCategory = async () => {
    try {
      if (catEditingId) {
        await api.put(`/topics/categories/${catEditingId}`, catForm)
        toast.success('Đã cập nhật danh mục!')
      } else {
        await api.post('/topics/categories', catForm)
        toast.success('Đã thêm danh mục!')
      }
      setAddCatOpen(false)
      setCatForm({ name: '', description: '', icon: '', color: '#6366f1' })
      setCatEditingId(null)
      loadData()
    } catch (err: any) { toast.error(err.response?.data?.message || 'Lỗi') }
  }

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Xóa danh mục "${name}" và tất cả chủ đề bên trong?`)) return
    try {
      await api.delete(`/topics/categories/${id}`)
      toast.success('Đã xóa danh mục')
      loadData()
    } catch { toast.error('Lỗi khi xóa') }
  }

  const handleAddTopic = async () => {
    try {
      if (topicEditingId) {
        await api.put(`/topics/${topicEditingId}`, topicForm)
        toast.success('Đã cập nhật chủ đề!')
      } else {
        await api.post('/topics', topicForm)
        toast.success('Đã thêm chủ đề!')
      }
      setAddTopicOpen(false)
      setTopicForm({ name: '', categoryId: '', description: '' })
      setTopicEditingId(null)
      loadData()
    } catch (err: any) { toast.error(err.response?.data?.message || 'Lỗi') }
  }

  const handleDeleteTopic = async (id: string, name: string) => {
    if (!confirm(`Xóa chủ đề "${name}"?`)) return
    try {
      await api.delete(`/topics/${id}`)
      toast.success('Đã xóa chủ đề')
      loadData()
    } catch { toast.error('Lỗi khi xóa') }
  }

  const openAppCat = (cat?: any) => {
    if (cat) {
      setCatEditingId(cat.id)
      setCatForm({ name: cat.name, description: cat.description || '', icon: cat.icon || '', color: cat.color || '#6366f1' })
    } else {
      setCatEditingId(null)
      setCatForm({ name: '', description: '', icon: '', color: '#6366f1' })
    }
    setAddCatOpen(true)
  }

  const openAppTopic = (topic?: any, catId?: string) => {
    if (topic) {
      setTopicEditingId(topic.id)
      setTopicForm({ name: topic.name, categoryId: topic.categoryId || catId || '', description: topic.description || '' })
    } else {
      setTopicEditingId(null)
      setTopicForm({ name: '', categoryId: catId || '', description: '' })
    }
    setAddTopicOpen(true)
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>📚 Quản lý chủ đề</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button startIcon={<AddIcon />} variant="outlined" onClick={() => openAppCat()} sx={{ borderColor: '#e2e8f0' }}>
            Thêm danh mục
          </Button>
          <Button startIcon={<AddIcon />} variant="contained" onClick={() => openAppTopic()}>
            Thêm chủ đề
          </Button>
        </Box>
      </Box>

      {categories.map(cat => (
        <Paper key={cat.id} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: cat.color || '#6366f1' }} />
              <Typography variant="h6" fontWeight={700}>{cat.name}</Typography>
              {cat.description && <Typography variant="body2" color="text.secondary">— {cat.description}</Typography>}
            </Box>
            <Box>
              <Tooltip title="Sửa danh mục">
                <IconButton size="small" onClick={() => openAppCat(cat)}><EditIcon fontSize="small" /></IconButton>
              </Tooltip>
              <Tooltip title="Xóa danh mục">
                <IconButton size="small" sx={{ color: 'error.main' }} onClick={() => handleDeleteCategory(cat.id, cat.name)}><DeleteIcon fontSize="small" /></IconButton>
              </Tooltip>
            </Box>
          </Box>
          <Grid container spacing={1.5}>
            {cat.topics?.map((topic: any) => (
              <Grid key={topic.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card sx={{ borderRadius: 2, border: '1px solid #e2e8f0', p: 0 }}>
                  <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body2" fontWeight={600}>{topic.name}</Typography>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton size="small" onClick={() => openAppTopic(topic, cat.id)} sx={{ p: 0.25 }}><EditIcon sx={{ fontSize: '1rem' }} /></IconButton>
                        <IconButton size="small" onClick={() => handleDeleteTopic(topic.id, topic.name)} sx={{ p: 0.25, color: 'error.main' }}><DeleteIcon sx={{ fontSize: '1rem' }} /></IconButton>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                      <Chip label={`${topic.postCount} bài`} size="small" sx={{ height: 18, fontSize: '0.6rem' }} />
                      <Chip label={`${topic.followerCount} follow`} size="small" sx={{ height: 18, fontSize: '0.6rem', bgcolor: '#6366f120', color: '#818cf8' }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      ))}

      {/* Add category dialog */}
      <Dialog open={addCatOpen} onClose={() => setAddCatOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{catEditingId ? 'Sửa danh mục' : 'Thêm danh mục mới'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Tên danh mục *" value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} />
            <TextField label="Mô tả" value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} multiline rows={2} />
            <TextField label="Icon (emoji)" value={catForm.icon} onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2">Màu:</Typography>
              <input type="color" value={catForm.color} onChange={(e) => setCatForm({ ...catForm, color: e.target.value })} style={{ width: 48, height: 36, border: 'none', cursor: 'pointer' }} />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddCatOpen(false)} variant="outlined" sx={{ borderColor: '#e2e8f0' }}>Hủy</Button>
          <Button onClick={handleAddCategory} variant="contained">{catEditingId ? 'Cập nhật' : 'Thêm'}</Button>
        </DialogActions>
      </Dialog>

      {/* Add topic dialog */}
      <Dialog open={addTopicOpen} onClose={() => setAddTopicOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{topicEditingId ? 'Sửa chủ đề' : 'Thêm chủ đề mới'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Danh mục *</InputLabel>
              <Select value={topicForm.categoryId} onChange={(e) => setTopicForm({ ...topicForm, categoryId: e.target.value })} label="Danh mục *">
                {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Tên chủ đề *" value={topicForm.name} onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })} />
            <TextField label="Mô tả" value={topicForm.description} onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })} multiline rows={2} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddTopicOpen(false)} variant="outlined" sx={{ borderColor: '#e2e8f0' }}>Hủy</Button>
          <Button onClick={handleAddTopic} variant="contained">{topicEditingId ? 'Cập nhật' : 'Thêm'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
