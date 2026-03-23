import { Box, Chip, Avatar, Typography, Card, CardContent } from '@mui/material'
import {
  FavoriteBorder as LikeIcon, ChatBubbleOutline as CommentIcon,
  Visibility as ViewIcon, BookmarkBorder as BookmarkIcon,
  PushPin as PinIcon, Star as FeaturedIcon, Schedule as TimeIcon
} from '@mui/icons-material'
import { Link } from 'react-router-dom'
import { alpha } from '@mui/material/styles'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/vi'

dayjs.extend(relativeTime)
dayjs.locale('vi')

interface Tag { id: number; name: string; slug: string; color?: string }
interface Author { id: number; username: string; fullName?: string; avatar?: string; reputation: number; role: string }
interface Topic { id: number; name: string; slug: string }
interface Post {
  id: number; title: string; slug: string; excerpt?: string; coverImage?: string
  author: Author; topic?: Topic; tags: Tag[]; likeCount: number; commentCount: number
  viewCount: number; bookmarkCount: number; readTime: number; isPinned: boolean
  isFeatured: boolean; createdAt: string; isLiked?: boolean; isBookmarked?: boolean
  status?: string;
}

export default function PostCard({ post }: { post: Post }) {
  return (
    <Card sx={{
      position: 'relative',
      overflow: 'hidden',
      borderRadius: 1.5,
      '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' },
      transition: 'all 0.25s ease',
    }}>
      {/* Featured/Pinned badges */}
      {(post.isPinned || post.isFeatured) && (
        <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 0.5, zIndex: 1 }}>
          {post.isPinned && (
            <Box sx={{ bgcolor: alpha('#6366f1', 0.2), border: '1px solid #6366f1', borderRadius: '6px', px: 1, py: 0.2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <PinIcon sx={{ fontSize: 12, color: '#818cf8' }} />
              <Box component="span" sx={{ fontSize: '0.65rem', color: '#818cf8', fontWeight: 600 }}>Ghim</Box>
            </Box>
          )}
          {post.isFeatured && (
            <Box sx={{ bgcolor: alpha('#f59e0b', 0.15), border: '1px solid #f59e0b', borderRadius: '6px', px: 1, py: 0.2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <FeaturedIcon sx={{ fontSize: 12, color: '#fbbf24' }} />
              <Box component="span" sx={{ fontSize: '0.65rem', color: '#fbbf24', fontWeight: 600 }}>Nổi bật</Box>
            </Box>
          )}
        </Box>
      )}

      <CardContent sx={{ p: 3 }}>
        {/* Author + Topic */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
          <Box component={Link} to={`/profile/${post.author.username}`} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, textDecoration: 'none', '&:hover': { opacity: 0.8 } }}>
            <Avatar src={post.author.avatar} sx={{ width: 28, height: 28, fontSize: '0.75rem' }}>
              {(post.author.fullName || post.author.username)[0].toUpperCase()}
            </Avatar>
            <Typography variant="body2" fontWeight={600} color="text.primary">{post.author.fullName || post.author.username}</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">·</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TimeIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">{dayjs(post.createdAt).fromNow()}</Typography>
          </Box>
          {post.status && (
            <>
              <Typography variant="body2" color="text.secondary">·</Typography>
              <Chip
                label={
                  post.status === 'published' ? 'Đã duyệt' : 
                  post.status === 'pending' ? 'Đang duyệt' : 
                  post.status === 'draft' ? 'Nháp' : 
                  post.status === 'rejected' ? 'Bị từ chối' : post.status
                }
                size="small"
                sx={{ 
                  height: 20, fontSize: '0.65rem', fontWeight: 700,
                  bgcolor: post.status === 'published' ? alpha('#10b981', 0.1) : 
                           post.status === 'pending' ? alpha('#f59e0b', 0.1) : 
                           post.status === 'rejected' ? alpha('#ef4444', 0.1) : alpha('#94a3b8', 0.1),
                  color: post.status === 'published' ? '#10b981' : 
                         post.status === 'pending' ? '#f59e0b' : 
                         post.status === 'rejected' ? '#ef4444' : '#94a3b8',
                  borderColor: post.status === 'published' ? alpha('#10b981', 0.3) : 
                               post.status === 'pending' ? alpha('#f59e0b', 0.3) : 
                               post.status === 'rejected' ? alpha('#ef4444', 0.3) : alpha('#94a3b8', 0.3),
                  '& .MuiChip-label': { px: 1 }
                }}
                variant="outlined"
              />
            </>
          )}
          {post.topic && (
            <>
              <Typography variant="body2" color="text.secondary">·</Typography>
              <Chip
                label={post.topic.name}
                component={Link}
                to={`/topics?id=${post.topic.id}`}
                clickable
                size="small"
                sx={{ height: 20, fontSize: '0.7rem', bgcolor: alpha('#6366f1', 0.1), color: '#818cf8', border: '1px solid', borderColor: alpha('#6366f1', 0.3) }}
              />
            </>
          )}
          {post.readTime > 0 && (
            <>
              <Typography variant="body2" color="text.secondary">·</Typography>
              <Typography variant="body2" color="text.secondary">{post.readTime} phút đọc</Typography>
            </>
          )}
        </Box>

        {/* Cover image + Content */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              component={Link}
              to={`/posts/${post.slug}`}
              variant="h6"
              fontWeight={700}
              sx={{
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                textDecoration: 'none', color: 'text.primary', lineHeight: 1.4, mb: 0.75,
                '&:hover': { color: 'primary.light' }, transition: 'color 0.2s',
                fontSize: { xs: '1rem', sm: '1.1rem' },
              }}
            >
              {post.title}
            </Typography>
            {/* {post.excerpt && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.6, mb: 1.5 }}
              >
                {post.excerpt}
              </Typography>
            )} */}
            {/* Tags */}
            {post.tags.length > 0 && (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1.5 }}>
                {post.tags.slice(0, 4).map(tag => (
                  <Chip
                    key={tag.id}
                    label={`#${tag.name}`}
                    component={Link}
                    to={`/tags?tag=${tag.slug}`}
                    clickable
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: '0.7rem',
                      bgcolor: '#f1f5f9',
                      color: '#475569',
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      fontWeight: 600,
                      '&:hover': { borderColor: '#6366f1', color: '#6366f1', bgcolor: 'rgba(99,102,241,0.05)' }
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
          {post.coverImage && (
            <Box
              component="img"
              src={post.coverImage}
              alt={post.title}
              sx={{ width: { xs: 80, sm: 120 }, height: { xs: 60, sm: 80 }, objectFit: 'cover', borderRadius: 1.25, flexShrink: 0 }}
            />
          )}
        </Box>

        {/* Stats */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
          {[
            { icon: <LikeIcon sx={{ fontSize: 15 }} />, count: post.likeCount, active: post.isLiked, color: '#ef4444' },
            { icon: <CommentIcon sx={{ fontSize: 15 }} />, count: post.commentCount, active: false, color: '#6366f1' },
            { icon: <ViewIcon sx={{ fontSize: 15 }} />, count: post.viewCount, active: false, color: '#06b6d4' },
            { icon: <BookmarkIcon sx={{ fontSize: 15 }} />, count: post.bookmarkCount, active: post.isBookmarked, color: '#f59e0b' },
          ].map((stat, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: stat.active ? stat.color : 'text.secondary' }}>
              {stat.icon}
              <Typography variant="caption" fontWeight={500}>{stat.count}</Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  )
}
