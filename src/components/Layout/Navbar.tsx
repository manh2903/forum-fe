import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar, Toolbar, Box, IconButton, Avatar, Menu, MenuItem, Badge,
  Button, Divider, Tooltip, InputBase, Chip, ListItemIcon, useScrollTrigger,
  Typography, CircularProgress
} from '@mui/material'
import {
  Search as SearchIcon, Notifications as NotificationsIcon,
  Add as AddIcon, Person as PersonIcon,
  Settings as SettingsIcon, Logout as LogoutIcon, BookmarkBorder as BookmarkIcon,
  AdminPanelSettings as AdminIcon, Code as CodeIcon,
  Article as ArticleIcon, TrendingUp as TrendingIcon
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import { alpha } from '@mui/material/styles'
import api from '../../services/api'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/vi'

dayjs.extend(relativeTime)
dayjs.locale('vi')

export default function Navbar() {
  const { user, logout, unreadCount, setUnreadCount } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const loadNotifications = async () => {
    setLoadingNotifs(true)
    try {
      const { data } = await api.get('/notifications', { params: { limit: 5 } })
      setNotifications(data.notifications)
    } finally { setLoadingNotifs(false) }
  }

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch {}
  }

  const handleNotifClick = (e: React.MouseEvent<HTMLElement>) => {
    setNotifAnchorEl(e.currentTarget)
    loadNotifications()
  }

  const handleNotifClose = () => setNotifAnchorEl(null)

  const handleMarkRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
      if (unreadCount > 0) setUnreadCount(unreadCount - 1)
    } catch {}
  }
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null)
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState<any[]>([])
  const [loadingNotifs, setLoadingNotifs] = useState(false)

  const trigger = useScrollTrigger({ disableHysteresis: true, threshold: 20 })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: trigger 
          ? 'rgba(255, 255, 255, 0.98)' 
          : '#f1f7fa',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid',
        borderColor: alpha('#0c5d95', 0.08),
        transition: 'all 0.3s ease',
      }}
    >
      <Box sx={{ maxWidth: 1440, width: '100%', mx: 'auto' }}>
        <Toolbar sx={{ gap: 1, px: { xs: 2, md: 3 }, height: 64 }}>
          {/* Logo */}
          <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', mr: 2 }}>
            <Box sx={{
              width: 36, height: 36, borderRadius: '10px',
              background: 'linear-gradient(135deg, #0c5d95 0%, #06b6d4 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <CodeIcon sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Box component="span" sx={{ fontWeight: 800, fontSize: '1.1rem', color: 'text.primary', letterSpacing: '-0.02em' }}>
                Fita<Box component="span" sx={{ color: '#0c5d95' }}>Vnua</Box>
              </Box>
            </Box>
          </Box>

          {/* Nav Links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, mr: 2 }}>
            {[
              { label: 'Bài viết', path: '/', icon: <ArticleIcon fontSize="small" /> },
              { label: 'Chủ đề', path: '/topics', icon: <TrendingIcon fontSize="small" /> },
              { label: 'Tags', path: '/tags', icon: null },
            ].map(nav => (
              <Button
                key={nav.path}
                component={Link}
                to={nav.path}
                size="small"
                sx={{
                  color: location.pathname === nav.path ? 'primary.light' : 'text.secondary',
                  backgroundColor: location.pathname === nav.path ? alpha('#0c5d95', 0.1) : 'transparent',
                  '&:hover': { color: 'text.primary', backgroundColor: alpha('#0c5d95', 0.08) },
                  borderRadius: '8px',
                  px: 1.5,
                }}
              >
                {nav.label}
              </Button>
            ))}
          </Box>

          {/* Search */}
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
              flex: 1,
              maxWidth: 400,
              position: 'relative',
            }}
          >
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              background: alpha('#e2e8f0', 0.5),
              border: '1px solid',
              borderColor: searchFocused ? '#0c5d95' : '#e2e8f0',
              borderRadius: '10px',
              px: 1.5,
              transition: 'all 0.2s ease',
              '&:hover': { borderColor: '#cbd5e1' },
            }}>
              <SearchIcon sx={{ color: 'text.secondary', fontSize: 18, mr: 1 }} />
              <InputBase
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Tìm kiếm bài viết, người dùng..."
                sx={{ flex: 1, fontSize: '0.875rem', color: 'text.primary', py: 0.75 }}
              />
              {searchQuery && (
                <Chip label="↵" size="small" sx={{ height: 20, fontSize: '0.7rem', background: '#e2e8f0', color: 'text.secondary' }} />
              )}
            </Box>
          </Box>

          <Box sx={{ flex: 1 }} />

          {/* Right side */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {user ? (
              <>
                <Tooltip title="Viết bài">
                  <Button
                    component={Link}
                    to="/create"
                    variant="contained"
                    startIcon={<AddIcon />}
                    size="small"
                    sx={{ display: { xs: 'none', sm: 'flex' }, borderRadius: '10px' }}
                  >
                    Viết bài
                  </Button>
                </Tooltip>

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
                            if (notif.link) { navigate(notif.link); handleNotifClose() }
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

                <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
                  <Avatar
                    src={user.avatar}
                    alt={user.username}
                    sx={{ width: 36, height: 36, border: '2px solid', borderColor: 'primary.main' }}
                  >
                    {user.username[0].toUpperCase()}
                  </Avatar>
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  PaperProps={{
                    sx: {
                      mt: 1, minWidth: 220,
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 3,
                    }
                  }}
                >
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Box sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.95rem' }}>@{user.username}</Box>
                    <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{user.email}</Box>
                  </Box>
                  <Divider sx={{ borderColor: '#e2e8f0' }} />
                  <MenuItem onClick={() => { navigate(`/profile/${user.username}`); setAnchorEl(null) }}>
                    <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                    Trang cá nhân
                  </MenuItem>
                  <MenuItem onClick={() => { navigate('/bookmarks'); setAnchorEl(null) }}>
                    <ListItemIcon><BookmarkIcon fontSize="small" /></ListItemIcon>
                    Bài viết đã lưu
                  </MenuItem>
                  <MenuItem onClick={() => { navigate('/settings'); setAnchorEl(null) }}>
                    <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                    Cài đặt
                  </MenuItem>
                  {(user.role === 'admin' || user.role === 'moderator') && (
                    <>
                      <Divider sx={{ borderColor: '#e2e8f0' }} />
                      <MenuItem onClick={() => { navigate('/admin'); setAnchorEl(null) }}>
                        <ListItemIcon><AdminIcon fontSize="small" /></ListItemIcon>
                        Admin Panel
                      </MenuItem>
                    </>
                  )}
                  <Divider sx={{ borderColor: '#e2e8f0' }} />
                  <MenuItem onClick={() => { logout(); setAnchorEl(null); navigate('/') }} sx={{ color: 'error.main' }}>
                    <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: 'error.main' }} /></ListItemIcon>
                    Đăng xuất
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button component={Link} to="/login" variant="outlined" size="small" sx={{ borderRadius: '10px' }}>
                  Đăng nhập
                </Button>
                <Button component={Link} to="/register" variant="contained" size="small" sx={{ borderRadius: '10px', display: { xs: 'none', sm: 'flex' } }}>
                  Đăng ký
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Box>
    </AppBar>
  )
}
