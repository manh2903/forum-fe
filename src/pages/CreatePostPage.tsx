import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box, Paper, Typography, TextField, Button, Chip, Select,
  MenuItem, FormControl, CircularProgress, Alert,
  Stack, Grid
} from '@mui/material'
import {
  Publish as PublishIcon, Save as SaveIcon, ArrowBack as BackIcon,
  AddCircleOutline as AddTagIcon, CloudUpload as CloudUploadIcon
} from '@mui/icons-material'
import api from '../services/api'
import toast from 'react-hot-toast'
import TiptapEditor from '../components/Editor/TiptapEditor'

interface Props { editMode?: boolean }

export default function CreatePostPage({ editMode = false }: Props) {
  const navigate = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState({
    title: '', content: '', excerpt: '', topicId: '', coverImage: '', tags: [] as string[], status: 'draft'
  })
  const [postId, setPostId] = useState<number | null>(null)
  const [tagInput, setTagInput] = useState('')
  const [topics, setTopics] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/topics').then(({ data }) => setTopics(data.topics))
    if (editMode && id) {
      api.get(`/posts/${id}`).then(({ data }) => {
        const p = data.post
        setPostId(p.id)
        setForm({
          title: p.title,
          content: p.content,
          excerpt: p.excerpt || '',
          topicId: p.topicId || '',
          coverImage: p.coverImage || '',
          tags: p.tags?.map((t: any) => t.name) || [],
          status: p.status
        })
      })
    }
  }, [editMode, id])

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !form.tags.includes(tag) && form.tags.length < 5) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, tag] }))
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))
  }

  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('image', file)

    setUploadingImage(true)
    try {
      const { data } = await api.post('/upload/image?type=posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setForm({ ...form, coverImage: data.url })
      toast.success('Đã tải ảnh lên')
    } catch {
      toast.error('Lỗi khi tải ảnh lên')
    } finally {
      setUploadingImage(false)
      // Reset input value to allow selecting same file again
      e.target.value = ''
    }
  }

  const handleSubmit = async (status: string) => {
    if (!form.title.trim()) return setError('Vui lòng nhập tiêu đề')
    if (!form.content.trim()) return setError('Vui lòng nhập nội dung')
    setError('')
    setLoading(true)
    try {
      const payload = { ...form, status }
      if (editMode && postId) {
        await api.put(`/posts/${postId}`, payload)
        toast.success('Đã cập nhật bài viết!')
      } else {
        const { data } = await api.post('/posts', payload)
        toast.success(status === 'published' ? 'Đã đăng bài viết!' : 'Đã lưu nháp!')
        if (status === 'published') navigate(`/posts/${data.post.slug}`)
        else navigate('/')
        return
      }
      navigate(-1)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate(-1)} sx={{ color: 'text.secondary' }}>
          Quay lại
        </Button>
        <Typography variant="h5" fontWeight={700}>
          {editMode ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Button
          variant="outlined"
          startIcon={<SaveIcon />}
          onClick={() => handleSubmit('draft')}
          disabled={loading}
          sx={{ borderColor: '#e2e8f0' }}
        >
          Lưu nháp
        </Button>
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={16} /> : <PublishIcon />}
          onClick={() => handleSubmit('published')}
          disabled={loading}
        >
          Đăng bài
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            {/* Title */}
            <Box>
              <TextField
                fullWidth
                placeholder="Tiêu đề bài viết..."
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                variant="standard"
                InputProps={{
                  disableUnderline: true,
                  sx: { fontSize: '1.75rem', fontWeight: 700, color: 'text.primary', letterSpacing: '-0.02em' }
                }}
              />
            </Box>

            <Box sx={{ borderTop: '1px solid #e2e8f0' }}>
              <TiptapEditor
                value={form.content}
                onChange={(content) => setForm({ ...form, content })}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2} sx={{ position: 'sticky', top: 80 }}>
            {/* Topic */}
            <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Chủ đề</Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={form.topicId}
                  onChange={(e) => setForm({ ...form, topicId: e.target.value })}
                  displayEmpty
                  sx={{ bgcolor: '#f8fafc' }}
                >
                  <MenuItem value=""><em>Chọn chủ đề</em></MenuItem>
                  {topics.map((t: any) => (
                    <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>

            {/* Tags */}
            <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Tags ({form.tags.length}/5)</Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                {form.tags.map(tag => (
                  <Chip key={tag} label={`#${tag}`} onDelete={() => removeTag(tag)} size="small"
                    sx={{ bgcolor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', fontWeight: 600 }} />
                ))}
              </Box>
              {form.tags.length < 5 && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small" placeholder="Thêm tag..." fullWidth
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                  />
                  <Button variant="outlined" onClick={addTag} size="small" sx={{ borderColor: '#e2e8f0', minWidth: 36, px: 1 }}>
                    <AddTagIcon fontSize="small" />
                  </Button>
                </Box>
              )}
            </Paper>

            {/* Excerpt + Cover */}
            <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Tóm tắt</Typography>
              <TextField
                fullWidth multiline rows={3} size="small"
                placeholder="Mô tả ngắn về bài viết..."
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              />
              <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 2, mb: 1 }}>Ảnh bìa (URL hoặc Upload)</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth size="small"
                  placeholder="https://example.com/image.jpg"
                  value={form.coverImage}
                  onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                />
                <Button 
                  component="label" 
                  variant="outlined" 
                  sx={{ borderColor: '#e2e8f0', minWidth: 40, px: 0 }}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? <CircularProgress size={20} /> : <CloudUploadIcon fontSize="small" />}
                  <input type="file" hidden accept="image/*" onChange={handleUploadCover} />
                </Button>
              </Box>
              {form.coverImage && (
                <Box component="img" src={form.coverImage} alt="cover"
                  sx={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 2, mt: 1 }}
                  onError={(e: any) => e.target.style.display = 'none'}
                />
              )}
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}
