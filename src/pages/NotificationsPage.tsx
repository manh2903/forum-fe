import { useState, useEffect } from 'react'
import {
  Box, Typography, Paper, List, ListItem, ListItemAvatar, ListItemText,
  Avatar, IconButton, Button, Chip, CircularProgress, Divider, Badge
} from '@mui/material'
import {
  Favorite as LikeIcon, Comment as CommentIcon, PersonAdd as FollowIcon,
  Star as MentionIcon, EmojiEvents as BadgeIcon, CheckCircle as ReadIcon,
  Delete as DeleteIcon, DoneAll as MarkAllIcon, Notifications as NotifIcon
} from '@mui/icons-material'
import { Link, useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/vi'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import type { Notification } from '../types'
import { alpha } from '@mui/material/styles'

dayjs.extend(relativeTime)
dayjs.locale('vi')

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  like_post: { icon: <LikeIcon fontSize="small" />, color: '#ef4444', label: 'Thích bài viết' },
  like_comment: { icon: <LikeIcon fontSize="small" />, color: '#f97316', label: 'Thích bình luận' },
  comment: { icon: <CommentIcon fontSize="small" />, color: '#6366f1', label: 'Bình luận' },
  reply: { icon: <CommentIcon fontSize="small" />, color: '#8b5cf6', label: 'Trả lời' },
  follow: { icon: <FollowIcon fontSize="small" />, color: '#06b6d4', label: 'Theo dõi' },
  mention: { icon: <MentionIcon fontSize="small" />, color: '#f59e0b', label: 'Nhắc đến' },
  badge_earned: { icon: <BadgeIcon fontSize="small" />, color: '#fbbf24', label: 'Huy hiệu' },
  report_resolved: { icon: <ReadIcon fontSize="small" />, color: '#10b981', label: 'Báo cáo' },
  system: { icon: <NotifIcon fontSize="small" />, color: '#64748b', label: 'Hệ thống' },
}

export default function NotificationsPage() {
  const { setUnreadCount } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    loadNotifications(1)
  }, [filter])

  const loadNotifications = async (p: number) => {
    setLoading(true)
    try {
      const { data } = await api.get('/notifications', { params: { page: p, limit: 20, unread: filter === 'unread' || undefined } })
      if (p === 1) setNotifications(data.notifications)
      else setNotifications(prev => [...prev, ...data.notifications])
      setTotalPages(data.totalPages)
      setPage(p)
      setUnreadCount(data.unreadCount)
    } finally { setLoading(false) }
  }

  const markRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch {}
  }

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch {}
  }

  const deleteNotif = async (id: number) => {
    try {
      await api.delete(`/notifications/${id}`)
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch {}
  }

  const handleClick = (notif: Notification) => {
    if (!notif.isRead) markRead(notif.id)
    if (notif.link) navigate(notif.link)
  }

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" fontWeight={800}>🔔 Thông báo</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {['all', 'unread'].map((f) => (
            <Chip
              key={f}
              label={f === 'all' ? 'Tất cả' : 'Chưa đọc'}
              onClick={() => setFilter(f as any)}
              variant={filter === f ? 'filled' : 'outlined'}
              color={filter === f ? 'primary' : 'default'}
              sx={{ cursor: 'pointer', borderColor: '#e2e8f0' }}
            />
          ))}
          <Button size="small" startIcon={<MarkAllIcon />} onClick={markAllRead}
            sx={{ color: 'text.secondary', borderColor: '#e2e8f0' }} variant="outlined">
            Đọc tất cả
          </Button>
        </Box>
      </Box>

      <Paper sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {loading && page === 1 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <NotifIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography color="text.secondary">Không có thông báo nào</Typography>
          </Box>
        ) : (
          <List disablePadding>
            {notifications.map((notif, index) => {
              const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.system
              return (
                <Box key={notif.id}>
                  {index > 0 && <Divider sx={{ borderColor: '#e2e8f0' }} />}
                  <ListItem
                    onClick={() => handleClick(notif)}
                    sx={{
                      px: 3, py: 2, cursor: 'pointer',
                      bgcolor: notif.isRead ? 'transparent' : alpha('#6366f1', 0.05),
                      '&:hover': { bgcolor: alpha('#6366f1', 0.08) },
                      transition: 'background 0.2s',
                    }}
                    secondaryAction={
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {!notif.isRead && (
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); markRead(notif.id) }} sx={{ color: 'primary.light' }}>
                            <ReadIcon fontSize="small" />
                          </IconButton>
                        )}
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); deleteNotif(notif.id) }} sx={{ color: 'text.secondary' }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemAvatar>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                          <Box sx={{
                            bgcolor: config.color, borderRadius: '50%', width: 18, height: 18,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '2px solid #ffffff',
                            '& svg': { fontSize: '10px !important', color: 'white' }
                          }}>
                            {config.icon}
                          </Box>
                        }
                      >
                        <Avatar src={notif.sender?.avatar} sx={{ width: 40, height: 40 }}>
                          {notif.sender?.username?.[0]?.toUpperCase() || '?'}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2" color={notif.isRead ? 'text.secondary' : 'text.primary'} fontWeight={notif.isRead ? 400 : 600}>
                          {notif.content}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {dayjs(notif.createdAt).fromNow()}
                        </Typography>
                      }
                    />
                  </ListItem>
                </Box>
              )
            })}
          </List>
        )}
      </Paper>

      {page < totalPages && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button variant="outlined" onClick={() => loadNotifications(page + 1)} disabled={loading}
            sx={{ borderRadius: '10px', borderColor: '#e2e8f0' }}>
            Xem thêm
          </Button>
        </Box>
      )}
    </Box>
  )
}
