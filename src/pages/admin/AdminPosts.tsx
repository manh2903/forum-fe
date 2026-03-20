import { useState, useEffect } from 'react'
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Button, TextField, InputAdornment,
  CircularProgress, Pagination, Tooltip, FormControl, Select, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Stack, Autocomplete
} from '@mui/material'
import { 
  Search as SearchIcon, PushPin as PinIcon, Star as FeaturedIcon, 
  Delete as DeleteIcon, AutoFixHigh as UpdateIcon,
  Visibility as ShowIcon, VisibilityOff as HideIcon, Edit as EditIcon,
  CheckCircle as ApproveIcon, Cancel as RejectIcon, Restore as RestoreIcon
} from '@mui/icons-material'
import { Link } from 'react-router-dom'
import { alpha } from '@mui/material/styles'
import api from '../../services/api'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'
import TiptapEditor from '../../components/Editor/TiptapEditor'

export default function AdminPosts() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [topic, setTopic] = useState('')
  const [topics, setTopics] = useState<any[]>([])
  const [updatingFeatured, setUpdatingFeatured] = useState(false)
  const [status, setStatus] = useState('')
  const [editPost, setEditPost] = useState<any>(null)
  const [counts, setCounts] = useState<any>({})

  useEffect(() => { loadTopics() }, [])
  useEffect(() => { loadPosts() }, [page, search, topic, status])

  const loadTopics = async () => {
    const { data } = await api.get('/topics')
    setTopics(data.topics)
  }

  const loadPosts = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/posts', { 
        params: { page, limit: 15, search, topicId: topic, status } 
      })
      setPosts(data.posts)
      setTotalPages(data.totalPages)
      setTotal(data.total)
      setCounts(data.counts || {})
    } finally { setLoading(false) }
  }

  const togglePin = async (post: any) => {
    await api.put(`/admin/posts/${post.id}/pin`)
    toast.success(post.isPinned ? 'Đã bỏ ghim' : 'Đã ghim bài viết')
    loadPosts()
  }

  const toggleFeature = async (post: any) => {
    await api.put(`/admin/posts/${post.id}/feature`)
    toast.success(post.isFeatured ? 'Đã bỏ nổi bật' : 'Đã đánh dấu nổi bật')
    loadPosts()
  }

  const handleDelete = async (post: any) => {
    if (!confirm(`Xóa bài "${post.title}"?`)) return
    try {
      await api.delete(`/posts/${post.id}`)
      toast.success('Đã xóa bài viết')
      loadPosts()
    } catch { toast.error('Lỗi khi xóa') }
  }

  const handleUpdateFeatured = async () => {
    if (!confirm('Tính toán lại toàn bộ bài viết nổi bật dựa trên thuật toán?')) return
    setUpdatingFeatured(true)
    try {
      const { data } = await api.post('/admin/posts/update-featured')
      toast.success(data.message || 'Đã cập nhật bài nổi bật!')
      loadPosts()
    } catch {
      toast.error('Lỗi khi cập nhật')
    } finally {
      setUpdatingFeatured(false)
    }
  }

  const handleToggleStatus = async (post: any) => {
    try {
      await api.put(`/admin/posts/${post.id}/status`)
      toast.success(post.status === 'published' ? 'Đã ẩn bài viết' : 'Đã hiện bài viết')
      loadPosts()
    } catch { toast.error('Lỗi khi thay đổi trạng thái') }
  }

  const handleUpdatePost = async () => {
    try {
      await api.put(`/admin/posts/${editPost.id}`, editPost)
      toast.success('Đã cập nhật bài viết')
      setEditPost(null)
      loadPosts()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi cập nhật')
    }
  }

  const handleApprove = async (post: any) => {
    try {
      await api.put(`/admin/posts/${post.id}/approve`)
      toast.success('Đã phê duyệt bài viết')
      await loadPosts()
    } catch { toast.error('Lỗi khi phê duyệt') }
  }

  const handleReject = async (post: any) => {
    const reason = prompt('Bạn muốn từ chối bài viết này? Nhập lý do (tùy chọn):')
    if (reason === null) return // Canceled
    try {
      await api.put(`/admin/posts/${post.id}/reject`, { reason: reason })
      toast.success('Đã từ chối bài viết')
      await loadPosts()
    } catch { toast.error('Lỗi khi từ chối') }
  }

  const handleRestore = async (post: any) => {
    try {
      await api.put(`/admin/posts/${post.id}/restore`)
      toast.success('Đã khôi phục bài viết')
      await loadPosts()
    } catch { toast.error('Lỗi khi khôi phục') }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Typography variant="h5" fontWeight={700}>📄 Quản lý bài viết</Typography>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Chip 
              label={`Tổng: ${counts?.total || 0}`} 
              size="small" 
              sx={{ fontWeight: 600, bgcolor: '#f1f5f9', color: '#475569' }} 
            />
            <Chip 
              label={`Chờ duyệt: ${counts?.pending || 0}`} 
              size="small" 
              color="warning" 
              variant="outlined" 
              sx={{ fontWeight: 600, bgcolor: alpha('#f59e0b', 0.05) }} 
            />
            <Chip 
              label={`Đã đăng: ${counts?.published || 0}`} 
              size="small" 
              color="success" 
              variant="outlined" 
              sx={{ fontWeight: 600, bgcolor: alpha('#10b981', 0.05) }} 
            />
            <Chip 
              label={`Bị từ chối: ${counts?.rejected || 0}`} 
              size="small" 
              color="error" 
              variant="outlined" 
              sx={{ fontWeight: 600, bgcolor: alpha('#ef4444', 0.05) }} 
            />
            <Chip 
              label={`Đã xóa: ${counts?.deleted || 0}`} 
              size="small" 
              color="error" 
              variant="filled" 
              sx={{ fontWeight: 600 }} 
            />
            <Chip 
              label={`Đã ẩn: ${counts?.archived || 0}`} 
              size="small" 
              sx={{ fontWeight: 600, bgcolor: '#f1f5f9', color: '#475569' }} 
            />
          </Box>
        </Box>
        <Button 
          variant="outlined" 
          startIcon={updatingFeatured ? <CircularProgress size={16} /> : <UpdateIcon />} 
          onClick={handleUpdateFeatured}
          disabled={updatingFeatured}
          sx={{ borderColor: '#e2e8f0', color: 'text.secondary' }}
        >
          {updatingFeatured ? 'Đang cập nhật...' : 'Cập nhật bài nổi bật'}
        </Button>
      </Box>

      <Paper sx={{ p: 1.5, borderRadius: 3, border: '1px solid #e2e8f0', mb: 2, display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          placeholder="Tìm bài viết..."
          size="small"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" color="action" /></InputAdornment> }}
          sx={{ width: 220, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
        
        <Autocomplete
          size="small"
          options={topics}
          getOptionLabel={(option: any) => option.name}
          value={topics.find(t => t.id === topic) || null}
          onChange={(_, newValue) => { setTopic(newValue?.id || ''); setPage(1) }}
          sx={{ width: 180 }}
          renderInput={(params) => (
            <TextField {...params} placeholder="Chủ đề" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          )}
        />

        <FormControl size="small" sx={{ width: 140 }}>
          <Select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1) }}
            displayEmpty
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="">Tất cả trạng thái</MenuItem>
            <MenuItem value="pending">Chờ duyệt (Pending)</MenuItem>
            <MenuItem value="published">Đã đăng</MenuItem>
            <MenuItem value="archived">Đã ẩn</MenuItem>
            <MenuItem value="rejected">Bị từ chối (Rejected)</MenuItem>
            <MenuItem value="deleted">Đã xóa (Deleted)</MenuItem>
            <MenuItem value="draft">Bản nháp</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', maxHeight: 'calc(100vh - 280px)' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', bgcolor: '#f8fafc' } }}>
              <TableCell sx={{ width: 60 }}>STT</TableCell>
              <TableCell>Tiêu đề</TableCell>
              <TableCell>Tác giả</TableCell>
              <TableCell>Tags</TableCell>
              <TableCell>Stats</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ngày đăng</TableCell>
              <TableCell align="right">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4 }}><CircularProgress /></TableCell></TableRow>
            ) : posts.map((post, idx) => (
              <TableRow key={post.id} sx={{ '&:hover': { bgcolor: 'rgba(99,102,241,0.03)' } }}>
                <TableCell><Typography variant="body2" color="text.secondary">{(page - 1) * 15 + idx + 1}</Typography></TableCell>
                <TableCell sx={{ maxWidth: 300 }}>
                  <Box>
                    <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
                      {post.isPinned && <Chip label="Ghim" size="small" sx={{ height: 16, fontSize: '0.6rem', bgcolor: alpha('#0c5d95', 0.1), color: '#1d4ed8' }} />}
                      {post.isFeatured && <Chip label="Nổi bật" size="small" sx={{ height: 16, fontSize: '0.6rem', bgcolor: '#f59e0b20', color: '#fbbf24' }} />}
                    </Box>
                    <Typography variant="body2" fontWeight={600}
                      component={Link} to={`/posts/${post.slug}`}
                      sx={{ color: 'text.primary', textDecoration: 'none', '&:hover': { color: 'primary.light' }, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {post.title}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">{post.author?.username}</Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {post.tags?.slice(0, 2).map((tag: any) => (
                      <Chip key={tag.id} label={tag.name} size="small" sx={{ height: 18, fontSize: '0.6rem' }} />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                    👁 {post.viewCount} · ❤ {post.likeCount} · 💬 {post.commentCount}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={
                      post.isDeleted ? 'Đã xóa' :
                      post.status === 'published' ? 'Đã đăng' : 
                      post.status === 'pending' ? 'Chờ duyệt' :
                      post.status === 'rejected' ? 'Bị từ chối' :
                      post.status === 'archived' ? 'Đã ẩn' : 'Nháp'
                    } 
                    size="small" 
                    color={
                      post.isDeleted ? 'error' :
                      post.status === 'published' ? 'success' : 
                      post.status === 'pending' ? 'warning' :
                      post.status === 'rejected' ? 'error' : 'default'
                    } 
                    variant={(post.status === 'published' || post.status === 'pending') ? 'outlined' : 'filled'}
                    sx={{ height: 20, fontSize: '0.65rem' }} 
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>{dayjs(post.createdAt).format('DD/MM/YY')}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                    {post.isDeleted ? (
                      <Tooltip title="Khôi phục bài viết">
                        <IconButton size="small" onClick={() => handleRestore(post)} color="success">
                          <RestoreIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <>
                        {post.status === 'pending' && (
                          <Stack direction="row" spacing={0.5}>
                            <Tooltip title="Phê duyệt">
                              <IconButton size="small" onClick={() => handleApprove(post)} color="success">
                                <ApproveIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Từ chối">
                              <IconButton size="small" onClick={() => handleReject(post)} color="error">
                                <RejectIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        )}
                        <Tooltip title="Sửa bài viết">
                          <IconButton size="small" onClick={() => setEditPost({ ...post })} color="primary">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={post.status === 'published' ? 'Ẩn bài viết' : 'Hiện bài viết'}>
                          <IconButton size="small" onClick={() => handleToggleStatus(post)} sx={{ color: post.status === 'published' ? '#6b7280' : '#10b981' }}>
                            {post.status === 'published' ? <HideIcon fontSize="small" /> : <ShowIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={post.isPinned ? 'Bỏ ghim' : 'Ghim'}>
                          <IconButton size="small" onClick={() => togglePin(post)} sx={{ color: post.isPinned ? '#0c5d95' : 'text.secondary' }}>
                            <PinIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={post.isFeatured ? 'Bỏ nổi bật' : 'Nổi bật'}>
                          <IconButton size="small" onClick={() => toggleFeature(post)} sx={{ color: post.isFeatured ? '#f59e0b' : 'text.secondary' }}>
                            <FeaturedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton size="small" onClick={() => handleDelete(post)} sx={{ color: '#ef4444' }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
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

      {/* Edit Dialog */}
      <Dialog open={!!editPost} onClose={() => setEditPost(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>📝 Sửa bài viết: {editPost?.title}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1.5 }}>
            <TextField fullWidth label="Tiêu đề bài viết" value={editPost?.title || ''}
              onChange={(e) => setEditPost({ ...editPost, title: e.target.value })} />
            
            <FormControl fullWidth>
              <Select value={editPost?.topicId || ''} onChange={(e) => setEditPost({ ...editPost, topicId: e.target.value })}>
                {topics.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
              </Select>
            </FormControl>

            <Stack direction="row" spacing={2.5}>
              <FormControl fullWidth>
                <Select value={editPost?.status || 'published'} onChange={(e) => setEditPost({ ...editPost, status: e.target.value })}>
                  <MenuItem value="published">Công khai (Published)</MenuItem>
                  <MenuItem value="archived">Ẩn (Archived)</MenuItem>
                  <MenuItem value="draft">Bản nháp (Draft)</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flex: 1 }}>
                <Chip label="Ghim" onClick={() => setEditPost({ ...editPost, isPinned: !editPost.isPinned })}
                  color={editPost?.isPinned ? 'primary' : 'default'} variant={editPost?.isPinned ? 'filled' : 'outlined'} />
                <Chip label="Nổi bật" onClick={() => setEditPost({ ...editPost, isFeatured: !editPost.isFeatured })}
                  color={editPost?.isFeatured ? 'warning' : 'default'} variant={editPost?.isFeatured ? 'filled' : 'outlined'} />
              </Box>
            </Stack>

            <Box sx={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
              <TiptapEditor 
                value={editPost?.content || ''} 
                onChange={(val) => setEditPost({ ...editPost, content: val })} 
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={() => setEditPost(null)} variant="outlined" sx={{ borderColor: '#e2e8f0' }}>Hủy</Button>
          <Button onClick={handleUpdatePost} variant="contained" sx={{ px: 4 }}>Lưu thay đổi</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
