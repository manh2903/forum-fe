import { useState, useEffect } from 'react'
import {
  Box, Typography, Avatar, Paper, CircularProgress, Button,
  IconButton, Chip, Menu, MenuItem
} from '@mui/material'
import {
  FavoriteBorder as LikeIcon, Favorite as LikedIcon,
  Reply as ReplyIcon, MoreVert as MoreIcon,
  Edit as EditIcon, Delete as DeleteIcon,
  Send as SendIcon
} from '@mui/icons-material'
import TiptapEditor from '../Editor/TiptapEditor'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/vi'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import type { Comment } from '../../types'
import { alpha } from '@mui/material/styles'
import toast from 'react-hot-toast'

dayjs.extend(relativeTime)
dayjs.locale('vi')

function CommentItem({
  comment, onLike, onReply, onUpdate, onDelete, depth = 0
}: {
  comment: Comment; onLike: (id: number) => void
  onReply: (parentId: number, username: string) => void
  onUpdate: (id: number, content: string) => void
  onDelete: (id: number) => void; depth?: number
}) {
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const isAuthor = user?.id === comment.authorId
  const canModerate = user?.role === 'admin' || user?.role === 'moderator'

  const handleSaveEdit = () => {
    onUpdate(comment.id, editContent)
    setEditing(false)
  }

  return (
    <Box id={`comment-${comment.id}`} sx={{ display: 'flex', gap: 1.5 }}>
      {/* Avatar + Thread line */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar src={comment.author?.avatar} sx={{ width: 32, height: 32, fontSize: '0.75rem', flexShrink: 0 }}>
          {comment.author?.username?.[0]?.toUpperCase()}
        </Avatar>
        {comment.replies && comment.replies.length > 0 && (
          <Box sx={{ width: 2, flex: 1, minHeight: 20, bgcolor: '#e2e8f0', borderRadius: 1, mt: 0.75 }} />
        )}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Comment header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
          <Typography variant="body2" fontWeight={700} color="text.primary">
            {comment.author?.username}
          </Typography>
          {comment.author?.role !== 'user' && (
            <Chip label={comment.author?.role} size="small" color="primary"
              sx={{ height: 16, fontSize: '0.6rem', fontWeight: 600 }} />
          )}
          <Typography variant="caption" color="text.secondary">
            {dayjs(comment.createdAt).fromNow()}
          </Typography>
          {(isAuthor || canModerate) && (
            <Box sx={{ ml: 'auto' }}>
              <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ color: 'text.secondary' }}>
                <MoreIcon sx={{ fontSize: 16 }} />
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
                PaperProps={{ sx: { borderRadius: 2, border: '1px solid #e2e8f0' } }}>
                {isAuthor && !comment.isDeleted && (
                  <MenuItem onClick={() => { setEditing(true); setAnchorEl(null) }} dense>
                    <EditIcon fontSize="small" sx={{ mr: 1 }} /> Sửa
                  </MenuItem>
                )}
                {(isAuthor || canModerate) && (
                  <MenuItem onClick={() => { onDelete(comment.id); setAnchorEl(null) }} sx={{ color: 'error.main' }} dense>
                    <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Xóa
                  </MenuItem>
                )}
              </Menu>
            </Box>
          )}
        </Box>

        {/* Comment content */}
        {editing ? (
          <Box sx={{ mb: 1 }}>
            <TiptapEditor
              value={editContent}
              onChange={(val) => setEditContent(val)}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" variant="contained" onClick={handleSaveEdit}>Lưu</Button>
              <Button size="small" variant="outlined" onClick={() => setEditing(false)} sx={{ borderColor: '#e2e8f0' }}>Hủy</Button>
            </Box>
          </Box>
        ) : (
          <Box sx={{
            bgcolor: comment.isDeleted ? 'transparent' : alpha('#e2e8f0', 0.3),
            borderRadius: 2, px: comment.isDeleted ? 0 : 2, py: comment.isDeleted ? 0 : 1.5, mb: 1,
            fontStyle: comment.isDeleted ? 'italic' : 'normal',
          }}>
            {comment.isDeleted ? (
              <Typography variant="body2" color="text.secondary">[Bình luận đã bị xóa]</Typography>
            ) : (
              <Box className="markdown-body" dangerouslySetInnerHTML={{ __html: comment.content }} sx={{ '& p': { m: 0 }, '& p + p': { mt: 0.5 }, fontSize: '0.875rem' }} />
            )}
          </Box>
        )}

        {/* Actions */}
        {!comment.isDeleted && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
            <Button
              size="small"
              startIcon={comment.isLiked ? <LikedIcon sx={{ fontSize: '14px !important' }} /> : <LikeIcon sx={{ fontSize: '14px !important' }} />}
              onClick={() => onLike(comment.id)}
              sx={{
                color: comment.isLiked ? '#ef4444' : 'text.secondary',
                minWidth: 0, fontSize: '0.75rem', py: 0.25,
                '&:hover': { color: '#ef4444', bgcolor: alpha('#ef4444', 0.08) }
              }}
            >
              {comment.likeCount}
            </Button>
            {user && depth < 2 && (
              <Button
                size="small"
                startIcon={<ReplyIcon sx={{ fontSize: '14px !important' }} />}
                onClick={() => onReply(comment.id, comment.author?.username)}
                sx={{ color: 'text.secondary', minWidth: 0, fontSize: '0.75rem', py: 0.25 }}
              >
                Trả lời
              </Button>
            )}
          </Box>
        )}

        {/* Nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {comment.replies.map(reply => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onLike={onLike}
                onReply={onReply}
                onUpdate={onUpdate}
                onDelete={onDelete}
                depth={depth + 1}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default function CommentSection({ postId }: { postId: number; slug?: string }) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [content, setContent] = useState('')
  const [replyTo, setReplyTo] = useState<{ parentId: number; username: string } | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  useEffect(() => { loadComments(1) }, [postId])

  const loadComments = async (p: number) => {
    setLoading(true)
    try {
      const { data } = await api.get(`/posts/${postId}/comments`, { params: { page: p, limit: 20 } })
      if (p === 1) setComments(data.comments)
      else setComments(prev => [...prev, ...data.comments])
      setTotal(data.total)
      setPage(p)
    } finally { setLoading(false) }
  }

  const handleSubmit = async () => {
    if (!content.trim()) return
    if (!user) return toast.error('Đăng nhập để bình luận')
    setSubmitting(true)
    try {
      const { data } = await api.post(`/posts/${postId}/comments`, {
        content: replyTo ? `@${replyTo.username} ${content}` : content,
        parentId: replyTo?.parentId,
      })
      if (replyTo) {
        setComments(prev => prev.map(c => {
          if (c.id === replyTo.parentId) return { ...c, replies: [...(c.replies || []), data.comment] }
          if (c.replies?.some(r => r.id === replyTo.parentId)) {
            return {
              ...c, replies: c.replies?.map(r =>
                r.id === replyTo.parentId ? { ...r, replies: [...(r.replies || []), data.comment] } : r
              )
            }
          }
          return c
        }))
      } else {
        setComments(prev => [data.comment, ...prev])
        setTotal(prev => prev + 1)
      }
      setContent('')
      setReplyTo(null)
      toast.success('Đã đăng bình luận!')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi đăng bình luận')
    } finally { setSubmitting(false) }
  }

  const handleLike = async (commentId: number) => {
    if (!user) return toast.error('Đăng nhập để thích bình luận')
    try {
      const { data } = await api.post(`/comments/${commentId}/like`)
      const updateLike = (c: Comment): Comment => {
        if (c.id === commentId) return { ...c, isLiked: data.liked, likeCount: data.likeCount }
        if (c.replies) return { ...c, replies: c.replies.map(updateLike) }
        return c
      }
      setComments(prev => prev.map(updateLike))
    } catch {}
  }

  const handleUpdate = async (commentId: number, newContent: string) => {
    try {
      await api.put(`/comments/${commentId}`, { content: newContent })
      const update = (c: Comment): Comment => {
        if (c.id === commentId) return { ...c, content: newContent }
        if (c.replies) return { ...c, replies: c.replies.map(update) }
        return c
      }
      setComments(prev => prev.map(update))
      toast.success('Đã cập nhật bình luận!')
    } catch { toast.error('Lỗi khi cập nhật') }
  }

  const handleDelete = async (commentId: number) => {
    if (!confirm('Xóa bình luận này?')) return
    try {
      await api.delete(`/comments/${commentId}`)
      const markDeleted = (c: Comment): Comment => {
        if (c.id === commentId) return { ...c, isDeleted: true, content: '[Bình luận đã bị xóa]' }
        if (c.replies) return { ...c, replies: c.replies.map(markDeleted) }
        return c
      }
      setComments(prev => prev.map(markDeleted))
      toast.success('Đã xóa bình luận')
    } catch { toast.error('Lỗi khi xóa') }
  }

  return (
    <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, border: '1px solid #e2e8f0' }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
        💬 Bình luận ({total})
      </Typography>

      {/* Comment input */}
      {user ? (
        <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
          <Avatar src={user.avatar} sx={{ width: 36, height: 36, flexShrink: 0 }}>
            {user.username[0].toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            {replyTo && (
              <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label={`Trả lời @${replyTo.username}`} onDelete={() => setReplyTo(null)} size="small"
                  sx={{ bgcolor: alpha('#6366f1', 0.15), color: '#818cf8', border: '1px solid', borderColor: alpha('#6366f1', 0.3) }} />
              </Box>
            )}
            <Box sx={{ border: '1px solid #e2e8f0', borderRadius: '12px', mb: 1 }}>
              <TiptapEditor
                value={content}
                onChange={(val) => setContent(val)}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
              <Typography variant="caption" color="text.secondary">Hỗ trợ @mention</Typography>
              <Button
                variant="contained" size="small"
                endIcon={submitting ? <CircularProgress size={14} /> : <SendIcon fontSize="small" />}
                onClick={handleSubmit}
                disabled={submitting || !content.trim()}
                sx={{ borderRadius: '8px' }}
              >
                Đăng
              </Button>
            </Box>
          </Box>
        </Box>
      ) : (
        <Paper sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: alpha('#6366f1', 0.08), border: '1px solid', borderColor: alpha('#6366f1', 0.2), textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            <Box component="a" href="/login" sx={{ color: 'primary.light', fontWeight: 600, textDecoration: 'none' }}>Đăng nhập</Box>
            {' '}để tham gia thảo luận
          </Typography>
        </Paper>
      )}

      {/* Comments list */}
      {loading && page === 1 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onLike={handleLike}
              onReply={(parentId, username) => setReplyTo({ parentId, username })}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
          {comments.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">Chưa có bình luận. Hãy là người đầu tiên!</Typography>
            </Box>
          )}
        </Box>
      )}

      {page * 20 < total && (
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button variant="outlined" onClick={() => loadComments(page + 1)} disabled={loading}
            sx={{ borderRadius: '10px', borderColor: '#e2e8f0' }}>
            Xem thêm bình luận
          </Button>
        </Box>
      )}
    </Paper>
  )
}
