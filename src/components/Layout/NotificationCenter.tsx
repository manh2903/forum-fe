import { useState } from 'react'
import {
  IconButton, Badge, Tooltip, Menu, Box, Typography, Button,
  CircularProgress, MenuItem, Avatar, alpha
} from '@mui/material'
import { Notifications as NotificationsIcon } from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
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
  const location = useLocation()
  const isAdminArea = location.pathname.startsWith('/admin')
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
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        sx={{ mt: 1.5 }}
        PaperProps={{
          sx: {
            width: 380,
            maxHeight: 520,
            borderRadius: 2,
            border: '1px solid #e2e8f0',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        {/* Header - Fixed */}
        <Box sx={{ 
          p: '14px 20px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          borderBottom: '1px solid #f1f5f9',
          bgcolor: '#ffffff',
          position: 'sticky',
          top: 0,
          zIndex: 2
        }}>
          <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#1e293b' }}>
            Thông báo
          </Typography>
          {unreadCount > 0 && (
            <Button 
              size="small" 
              onClick={markAllRead} 
              sx={{ 
                fontSize: '0.75rem', 
                fontWeight: 600,
                color: 'primary.main',
                '&:hover': { bgcolor: alpha('#0c5d95', 0.05) }
              }}
            >
              Đọc tất cả
            </Button>
          )}
        </Box>

        {/* List - Scrollable */}
        <Box sx={{ 
          overflowY: 'auto', 
          maxHeight: 400,
          flex: 1,
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-thumb': { bgcolor: '#e2e8f0', borderRadius: 3 }
        }}>
          {loadingNotifs ? (
            <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress size={24} /></Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                Không có thông báo mới nào
              </Typography>
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
                  px: 2.5, py: 2, gap: 1.5, alignItems: 'flex-start',
                  whiteSpace: 'normal',
                  bgcolor: notif.isRead ? 'transparent' : alpha('#0c5d95', 0.04),
                  borderBottom: '1px solid #f8fafc',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: alpha('#0c5d95', 0.08) }
                }}
              >
                <Avatar src={notif.sender?.avatar} sx={{ width: 44, height: 44, flexShrink: 0, border: '1px solid #f1f5f9' }}>
                  {notif.sender?.username?.[0]?.toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.primary" sx={{ mb: 0.5, fontWeight: notif.isRead ? 400 : 700, lineHeight: 1.4 }}>
                    {notif.content}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {dayjs(notif.createdAt).fromNow()}
                  </Typography>
                </Box>
              </MenuItem>
            ))
          )}
        </Box>

        {/* Footer - Fixed */}
        <Box sx={{ 
          p: 1.5, 
          textAlign: 'center', 
          borderTop: '1px solid #f1f5f9',
          bgcolor: '#ffffff',
          position: 'sticky',
          bottom: 0,
          zIndex: 2
        }}>
          <Button 
            fullWidth 
            onClick={() => { navigate(isAdminArea ? '/admin/notifications' : '/notifications'); handleNotifClose() }} 
            size="small" 
            sx={{ 
              color: '#64748b', 
              fontWeight: 600,
              fontSize: '0.8125rem',
              py: 0.75,
              '&:hover': { bgcolor: '#f8fafc', color: 'text.primary' }
            }}
          >
            Xem tất cả
          </Button>
        </Box>
      </Menu>
    </>
  )
}
