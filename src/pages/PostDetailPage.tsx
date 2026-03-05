import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Box, Typography, Chip, Avatar, Button, IconButton,
  Tooltip, CircularProgress, Paper, Grid, Skeleton, Menu, MenuItem
} from '@mui/material'
import {
  FavoriteBorder as LikeIcon, Favorite as LikedIcon,
  BookmarkBorder, Bookmark, Share as ShareIcon,
  Edit as EditIcon, Delete as DeleteIcon,
  MoreVert as MoreIcon, Flag as ReportIcon,
  PushPin as PinIcon, Star as FeaturedIcon,
  Visibility as ViewIcon, Schedule as TimeIcon, AccessTime as ReadTimeIcon
} from '@mui/icons-material'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/vi'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import CommentSection from '../components/Comment/CommentSection'
import ReportDialog from '../components/Report/ReportDialog'
import toast from 'react-hot-toast'
import { alpha } from '@mui/material/styles'

dayjs.extend(relativeTime)
dayjs.locale('vi')

export default function PostDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [liking, setLiking] = useState(false)
  const [bookmarking, setBookmarking] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [reportOpen, setReportOpen] = useState(false)

  useEffect(() => {
    loadPost()
  }, [slug])

  const loadPost = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/posts/${slug}`)
      setPost(data.post)
    } catch (err: any) {
      if (err.response?.status === 404) navigate('/404')
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!user) return toast.error('Đăng nhập để thích bài viết')
    setLiking(true)
    try {
      const { data } = await api.post(`/posts/${post.id}/like`)
      setPost((prev: any) => ({ ...prev, isLiked: data.liked, likeCount: data.likeCount }))
    } catch {} finally { setLiking(false) }
  }

  const handleBookmark = async () => {
    if (!user) return toast.error('Đăng nhập để lưu bài viết')
    setBookmarking(true)
    try {
      const { data } = await api.post(`/posts/${post.id}/bookmark`)
      setPost((prev: any) => ({ ...prev, isBookmarked: data.bookmarked }))
      toast.success(data.bookmarked ? 'Đã lưu bài viết' : 'Đã bỏ lưu')
    } catch {} finally { setBookmarking(false) }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Đã sao chép link!')
  }

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc muốn xóa bài viết này?')) return
    try {
      await api.delete(`/posts/${post.id}`)
      toast.success('Đã xóa bài viết')
      navigate('/')
    } catch { toast.error('Không thể xóa bài viết') }
    setAnchorEl(null)
  }

  if (loading) {
    return (
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 4, borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <Skeleton variant="text" width="80%" height={40} />
            <Box sx={{ display: 'flex', gap: 1, my: 2 }}>
              <Skeleton variant="circular" width={36} height={36} />
              <Box sx={{ flex: 1 }}><Skeleton variant="text" width="30%" /><Skeleton variant="text" width="20%" /></Box>
            </Box>
            {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} variant="text" />)}
          </Paper>
        </Grid>
      </Grid>
    )
  }

  if (!post) return null

  const isAuthor = user?.id === post.author?.id
  const canModerate = user?.role === 'admin' || user?.role === 'moderator'

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 8 }}>
        <Paper sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          {/* Cover image */}
          {post.coverImage && (
            <Box component="img" src={post.coverImage} alt={post.title}
              sx={{ width: '100%', maxHeight: 400, objectFit: 'cover' }} />
          )}

          <Box sx={{ p: { xs: 3, md: 4 } }}>
            {/* Tags + Topic */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              {post.topic && (
                <Chip label={post.topic.name} component={Link} to={`/topics?id=${post.topic.id}`}
                  clickable size="small" color="primary" variant="outlined" />
              )}
              {post.tags?.map((tag: any) => (
                <Chip key={tag.id} label={`#${tag.name}`} component={Link} to={`/tags?tag=${tag.slug}`}
                  clickable size="small"
                  sx={{ bgcolor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', fontWeight: 600 }} />
              ))}
              {post.isPinned && <Chip icon={<PinIcon sx={{ fontSize: '0.75rem !important' }} />} label="Ghim" size="small" color="secondary" variant="outlined" />}
              {post.isFeatured && <Chip icon={<FeaturedIcon sx={{ fontSize: '0.75rem !important' }} />} label="Nổi bật" size="small" color="warning" variant="outlined" />}
            </Box>

            {/* Title */}
            <Typography variant="h3" fontWeight={800} letterSpacing="-0.02em" sx={{ mb: 3, lineHeight: 1.25, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
              {post.title}
            </Typography>

            {/* Author + Meta */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, pb: 3, borderBottom: '1px solid #e2e8f0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar src={post.author?.avatar} component={Link} to={`/profile/${post.author?.username}`}
                  sx={{ width: 44, height: 44, cursor: 'pointer', border: '2px solid', borderColor: 'primary.dark' }}>
                  {post.author?.username?.[0]?.toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="body1" fontWeight={700} component={Link} to={`/profile/${post.author?.username}`}
                    sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { color: 'primary.light' } }}>
                    {post.author?.username}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TimeIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">{dayjs(post.createdAt).fromNow()}</Typography>
                    <Typography variant="caption" color="text.secondary">·</Typography>
                    <ReadTimeIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">{post.readTime} phút đọc</Typography>
                    <Typography variant="caption" color="text.secondary">·</Typography>
                    <ViewIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">{post.viewCount} lượt xem</Typography>
                  </Box>
                </Box>
              </Box>
              {(isAuthor || canModerate) && (
                <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
                  <MoreIcon fontSize="small" />
                </IconButton>
              )}
            </Box>

            {/* Content */}
            <Box 
              className="markdown-body" 
              dangerouslySetInnerHTML={{ __html: post.content }} 
            />

            {/* Action bar */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 4, pt: 3, borderTop: '1px solid #e2e8f0' }}>
              <Tooltip title={post.isLiked ? 'Bỏ thích' : 'Thích'}>
                <Button
                  variant={post.isLiked ? 'contained' : 'outlined'}
                  startIcon={liking ? <CircularProgress size={16} /> : post.isLiked ? <LikedIcon /> : <LikeIcon />}
                  onClick={handleLike}
                  disabled={liking}
                  sx={{ borderRadius: '10px', borderColor: '#e2e8f0', color: post.isLiked ? 'white' : '#ef4444', bgcolor: post.isLiked ? '#ef4444' : 'transparent', '&:hover': { borderColor: '#ef4444', bgcolor: alpha('#ef4444', 0.1) } }}
                >
                  {post.likeCount}
                </Button>
              </Tooltip>
              <Tooltip title={post.isBookmarked ? 'Bỏ lưu' : 'Lưu bài'}>
                <IconButton onClick={handleBookmark} disabled={bookmarking}
                  sx={{ color: post.isBookmarked ? '#f59e0b' : 'text.secondary', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                  {post.isBookmarked ? <Bookmark /> : <BookmarkBorder />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Sao chép link">
                <IconButton onClick={handleShare} sx={{ color: 'text.secondary', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                  <ShareIcon />
                </IconButton>
              </Tooltip>
              {user && !isAuthor && (
                <Tooltip title="Báo cáo">
                  <IconButton onClick={() => setReportOpen(true)} sx={{ color: 'text.secondary', border: '1px solid #e2e8f0', borderRadius: '10px', ml: 'auto' }}>
                    <ReportIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
        </Paper>

        {/* Comments */}
        <Box sx={{ mt: 3 }}>
          <CommentSection postId={post.id} slug={slug!} />
        </Box>
      </Grid>

      {/* Sidebar */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Box sx={{ position: 'sticky', top: 80 }}>
          {/* Author card */}
          <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.1em' }}>
              Tác giả
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Avatar src={post.author?.avatar} sx={{ width: 48, height: 48 }}>
                {post.author?.username?.[0]?.toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="body1" fontWeight={700}>{post.author?.username}</Typography>
                <Typography variant="caption" color="text.secondary">
                  ⭐ {post.author?.reputation} điểm
                </Typography>
              </Box>
            </Box>
            {post.author?.bio && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>{post.author.bio}</Typography>
            )}
            <Button
              fullWidth variant="outlined" component={Link} to={`/profile/${post.author?.username}`}
              sx={{ borderRadius: '10px', borderColor: '#e2e8f0' }}
            >
              Xem hồ sơ
            </Button>
          </Paper>
        </Box>
      </Grid>

      {/* More options menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { borderRadius: 2, border: '1px solid #e2e8f0' } }}>
        {isAuthor && (
          <MenuItem onClick={() => { navigate(`/edit/${post.slug}`); setAnchorEl(null) }}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} /> Chỉnh sửa
          </MenuItem>
        )}
        {(isAuthor || canModerate) && (
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Xóa bài viết
          </MenuItem>
        )}
        {canModerate && (
          <MenuItem onClick={async () => {
            await api.put(`/admin/posts/${post.id}/pin`)
            setPost((p: any) => ({ ...p, isPinned: !p.isPinned }))
            setAnchorEl(null)
          }}>
            <PinIcon fontSize="small" sx={{ mr: 1 }} /> {post.isPinned ? 'Bỏ ghim' : 'Ghim bài'}
          </MenuItem>
        )}
      </Menu>

      {/* Report dialog */}
      <ReportDialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="post"
        targetId={post.id}
      />
    </Grid>
  )
}
