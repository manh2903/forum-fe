import { useState } from 'react'
import {
  IconButton, Badge, Tooltip, Menu, Box, Typography, Button,
  CircularProgress, MenuItem, Avatar, alpha
} from '@mui/material'
import { Notifications as NotificationsIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/vi'

dayjs.extend(relativeTime)
dayjs.locale('vi')

export default function NotificationCenter() {
  const { unreadCount, setUnreadCount } = useAuth()
  const navigate = useNavigate()
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [loadingNotifs, setLoadingNotifs] = useState(false)

  const loadNotifications = async () => {
    setLoadingNotifs(true)
    try {
      const { data } = await api.get('/notifications', { params: { limit: 5 } })
      setNotifications(data.notifications)
    } catch (err) {
      console.error('Failed to load notifications:', err)
    } finally {
      setLoadingNotifs(false)
    }
  }

  const handleNotifClick = (e: React.MouseEvent<HTMLElement>) => {
    setNotifAnchorEl(e.currentTarget)
    loadNotifications()
  }

  const handleNotifClose = () => setNotifAnchorEl(null)

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark all read:', err)
    }
  }

  const handleMarkRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
      if (unreadCount > 0) setUnreadCount(unreadCount - 1)
    } catch (err) {
      console.error('Failed to mark read:', err)
    }
  }

  return (
    <>
      <Tooltip title="Thông báo">
        <IconButton onClick={handleNotifClick} size="small" sx={{ color: 'text.secondary' }}>
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={notifAnchorEl}
        open={Boolean(notifAnchorEl)}
        onClose={handleNotifClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1, width: 360, maxHeight: 480,
            borderRadius: 3, border: '1px solid #e2e8f0',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
            '& .MuiList-root': { p: 0 }
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0' }}>
          <Typography variant="subtitle1" fontWeight={700}>Thông báo</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={markAllRead} sx={{ fontSize: '0.75rem' }}>Đọc tất cả</Button>
          )}
        </Box>
        <Box sx={{ overflowY: 'auto', maxHeight: 380 }}>
          {loadingNotifs ? (
            <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress size={24} /></Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">Không có thông báo mới nào</Typography>
            </Box>
          ) : (
            notifications.map((notif: any) => (
              <MenuItem
                key={notif.id}
                onClick={() => {
                  if (!notif.isRead) handleMarkRead(notif.id)
                  if (notif.link) {
                    navigate(notif.link)
                    handleNotifClose()
                  }
                }}
                sx={{
                  px: 2, py: 1.5, gap: 1.5, alignItems: 'flex-start',
                  whiteSpace: 'normal',
                  bgcolor: notif.isRead ? 'transparent' : alpha('#0c5d95', 0.05),
                  borderBottom: '1px solid #f1f5f9',
                  '&:hover': { bgcolor: alpha('#0c5d95', 0.08) }
                }}
              >
                <Avatar src={notif.sender?.avatar} sx={{ width: 40, height: 40, flexShrink: 0 }}>
                  {notif.sender?.username?.[0]?.toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.primary" sx={{ mb: 0.25, fontWeight: notif.isRead ? 400 : 600 }}>
                    {notif.content}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {dayjs(notif.createdAt).fromNow()}
                  </Typography>
                </Box>
              </MenuItem>
            ))
          )}
        </Box>
        <Box sx={{ p: 1, textAlign: 'center', borderTop: '1px solid #e2e8f0' }}>
          <Button fullWidth onClick={() => { navigate('/notifications'); handleNotifClose() }} size="small" sx={{ color: 'text.secondary' }}>
            Xem tất cả
          </Button>
        </Box>
      </Menu>
    </>
  )
}
