import { useState, useEffect } from 'react'
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Select, MenuItem, FormControl, InputLabel,
  Stack, Chip, CircularProgress, IconButton, Tooltip
} from '@mui/material'
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { alpha } from '@mui/material/styles'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminTopics() {
  const { loading: authLoading } = useAuth()
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [addCatOpen, setAddCatOpen] = useState(false)
  const [addTopicOpen, setAddTopicOpen] = useState(false)
  const [catForm, setCatForm] = useState({ name: '', description: '', icon: '', color: '#0c5d95' })
  const [topicForm, setTopicForm] = useState({ name: '', categoryId: '', description: '' })
  const [catEditingId, setCatEditingId] = useState<string | null>(null)
  const [topicEditingId, setTopicEditingId] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    loadData()
  }, [authLoading])

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
      setCatForm({ name: '', description: '', icon: '', color: '#0c5d95' })
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
      setCatForm({ name: cat.name, description: cat.description || '', icon: cat.icon || '', color: cat.color || '#0c5d95' })
    } else {
      setCatEditingId(null)
      setCatForm({ name: '', description: '', icon: '', color: '#0c5d95' })
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

  // Flatten topics for the unified table
  const allTopics = categories.flatMap(cat => 
    (cat.topics || []).map((t: any) => ({ ...t, categoryName: cat.name }))
  )

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>📚 Quản lý Chủ đề & Danh mục</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button startIcon={<AddIcon />} variant="outlined" onClick={() => openAppCat()} sx={{ borderColor: '#cbd5e1', borderRadius: 1, borderWidth: '2px', fontWeight: 700 }}>
            Thêm danh mục
          </Button>
          <Button startIcon={<AddIcon />} variant="contained" onClick={() => openAppTopic()} sx={{ borderRadius: 1, fontWeight: 700 }}>
            Thêm chủ đề
          </Button>
        </Box>
      </Box>

      {/* Categories Section */}
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
        📁 Danh mục ({categories.length})
      </Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 1, border: '2px solid #cbd5e1', boxShadow: 'none', mb: 4, maxHeight: 300 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', bgcolor: '#f8fafc' } }}>
              <TableCell sx={{ width: 60 }}>STT</TableCell>
              <TableCell sx={{ width: 60 }}>Icon</TableCell>
              <TableCell>Tên danh mục</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell>Màu</TableCell>
              <TableCell align="right">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((cat, idx) => (
              <TableRow key={cat.id} sx={{ '&:hover': { bgcolor: alpha('#0c5d95', 0.02) } }}>
                <TableCell><Typography variant="body2" color="text.secondary">{idx + 1}</Typography></TableCell>
                <TableCell><Typography variant="h6">{cat.icon || '📁'}</Typography></TableCell>
                <TableCell><Typography variant="body2" fontWeight={600}>{cat.name}</Typography></TableCell>
                <TableCell><Typography variant="caption" color="text.secondary">{cat.description || '-'}</Typography></TableCell>
                <TableCell>
                  <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: cat.color || '#0c5d95', border: '2px solid #fff', boxShadow: '0 0 0 1px #e2e8f0' }} />
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Tooltip title="Sửa"><IconButton size="small" onClick={() => openAppCat(cat)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Xóa"><IconButton size="small" sx={{ color: 'error.main' }} onClick={() => handleDeleteCategory(cat.id, cat.name)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Topics Section */}
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
        🏷️ Chủ đề ({allTopics.length})
      </Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 1, border: '2px solid #cbd5e1', boxShadow: 'none', maxHeight: 'calc(100vh - 550px)' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', bgcolor: '#f8fafc' } }}>
              <TableCell sx={{ width: 60 }}>STT</TableCell>
              <TableCell>Tên chủ đề</TableCell>
              <TableCell>Danh mục</TableCell>
              <TableCell>Bài viết</TableCell>
              <TableCell>Follower</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell align="right">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allTopics.map((topic, idx) => (
              <TableRow key={topic.id} sx={{ '&:hover': { bgcolor: alpha('#0c5d95', 0.03) } }}>
                <TableCell><Typography variant="body2" color="text.secondary">{idx + 1}</Typography></TableCell>
                <TableCell><Typography variant="body2" fontWeight={600}>{topic.name}</Typography></TableCell>
                <TableCell>
                  <Chip label={topic.categoryName} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: alpha('#0c5d95', 0.08), color: '#0c5d95', border: '1px solid', borderColor: alpha('#0c5d95', 0.2) }} />
                </TableCell>
                <TableCell><Typography variant="body2">{topic.postCount}</Typography></TableCell>
                <TableCell><Typography variant="body2">{topic.followerCount}</Typography></TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {topic.description || '-'}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                    <Tooltip title="Sửa"><IconButton size="small" onClick={() => openAppTopic(topic)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Xóa"><IconButton size="small" sx={{ color: 'error.main' }} onClick={() => handleDeleteTopic(topic.id, topic.name)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add category dialog */}
      <Dialog open={addCatOpen} onClose={() => setAddCatOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>{catEditingId ? 'Sửa danh mục' : 'Thêm danh mục mới'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ py: 1 }}>
            <TextField fullWidth label="Tên danh mục *" value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} />
            <TextField fullWidth label="Mô tả" value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} multiline rows={2} />
            <TextField fullWidth label="Icon (emoji)" value={catForm.icon} onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })} placeholder="vd: 📁, 💻, 🎨" />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" fontWeight={600}>Màu nhận diện:</Typography>
              <input type="color" value={catForm.color} onChange={(e) => setCatForm({ ...catForm, color: e.target.value })} style={{ width: 60, height: 40, border: '2px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer', padding: 0 }} />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setAddCatOpen(false)} variant="outlined" sx={{ borderColor: '#e2e8f0' }}>Hủy</Button>
          <Button onClick={handleAddCategory} variant="contained">{catEditingId ? 'Cập nhật' : 'Thêm'}</Button>
        </DialogActions>
      </Dialog>

      {/* Add topic dialog */}
      <Dialog open={addTopicOpen} onClose={() => setAddTopicOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>{topicEditingId ? 'Sửa chủ đề' : 'Thêm chủ đề mới'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ py: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Danh mục *</InputLabel>
              <Select value={topicForm.categoryId} onChange={(e) => setTopicForm({ ...topicForm, categoryId: e.target.value })} label="Danh mục *">
                {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField fullWidth label="Tên chủ đề *" value={topicForm.name} onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })} />
            <TextField fullWidth label="Mô tả" value={topicForm.description} onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })} multiline rows={2} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setAddTopicOpen(false)} variant="outlined" sx={{ borderColor: '#e2e8f0' }}>Hủy</Button>
          <Button onClick={handleAddTopic} variant="contained">{topicEditingId ? 'Cập nhật' : 'Thêm'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
