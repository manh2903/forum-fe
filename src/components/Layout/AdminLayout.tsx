import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Avatar, Typography, Divider, Chip, IconButton, Tooltip
} from '@mui/material'
import {
  Dashboard as DashboardIcon, People as PeopleIcon, Article as ArticleIcon,
  Report as ReportIcon, Topic as TopicIcon, History as HistoryIcon,
  ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon,
  Home as HomeIcon, ViewCompact as BannerIcon, Settings as SettingsIcon
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import { alpha } from '@mui/material/styles'
import NotificationCenter from './NotificationCenter'

const DRAWER_WIDTH = 240
const DRAWER_COLLAPSED = 64

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: <DashboardIcon />, end: true },
  { label: 'Người dùng', path: '/admin/users', icon: <PeopleIcon /> },
  { label: 'Bài viết', path: '/admin/posts', icon: <ArticleIcon /> },
  { label: 'Báo cáo', path: '/admin/reports', icon: <ReportIcon /> },
  { label: 'Chủ đề', path: '/admin/topics', icon: <TopicIcon /> },
  { label: 'Banner', path: '/admin/banners', icon: <BannerIcon /> },
  { label: 'Audit Log', path: '/admin/audit-log', icon: <HistoryIcon /> },
  { label: 'Cài đặt', path: '/admin/settings', icon: <SettingsIcon /> },
]

export default function AdminLayout() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: collapsed ? DRAWER_COLLAPSED : DRAWER_WIDTH,
          flexShrink: 0,
          transition: 'width 0.3s ease',
          '& .MuiDrawer-paper': {
            width: collapsed ? DRAWER_COLLAPSED : DRAWER_WIDTH,
            overflowX: 'hidden',
            bgcolor: '#ffffff',
            border: 'none',
            borderRight: '1px solid #e2e8f0',
            transition: 'width 0.3s ease',
          },
        }}
      >
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: collapsed ? 'center' : 'space-between',
          px: collapsed ? 0.5 : 2, 
          height: 64, 
          borderBottom: '1px solid #e2e8f0',
          position: 'relative'
        }}>
          {!collapsed && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
              <Box sx={{
                minWidth: 32, width: 32, height: 32, borderRadius: '6px',
                background: 'linear-gradient(135deg, #0c5d95 0%, #0ea5e9 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 800, color: 'white'
              }}>T</Box>
              <Typography variant="body1" fontWeight={700} sx={{ color: 'text.primary', letterSpacing: '-0.01em' }}>
                Admin Panel
              </Typography>
            </Box>
          )}
          
          <IconButton 
            size="small" 
            onClick={() => setCollapsed(!collapsed)} 
            sx={{ 
              color: 'text.secondary',
              bgcolor: collapsed ? alpha('#0c5d95', 0.05) : 'transparent',
              '&:hover': { bgcolor: alpha('#0c5d95', 0.1) }
            }}
          >
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Box>

        {/* User info */}
        {!collapsed && user && (
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar src={user.avatar} sx={{ width: 36, height: 36, fontSize: '0.85rem' }}>
              {user.username[0].toUpperCase()}
            </Avatar>
            <Box sx={{ overflow: 'hidden' }}>
              <Typography variant="body2" fontWeight={600} noWrap>{user.username}</Typography>
              <Chip label={user.role} size="small" color="primary" sx={{ height: 16, fontSize: '0.6rem' }} />
            </Box>
          </Box>
        )}

        <Divider sx={{ borderColor: '#e2e8f0' }} />

        {/* Navigation */}
        <List sx={{ px: 1, py: 1, flex: 1 }}>
          {navItems.map((item) => (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              end={item.end}
              sx={{
                borderRadius: '6px',
                mb: 0.5,
                minHeight: 44,
                justifyContent: collapsed ? 'center' : 'flex-start',
                px: collapsed ? 1.5 : 2,
                color: 'text.secondary',
                '&.active': {
                  color: '#0c5d95',
                  bgcolor: alpha('#0c5d95', 0.1),
                  '& .MuiListItemIcon-root': { color: '#0c5d95' },
                },
                '&:hover': { bgcolor: alpha('#0c5d95', 0.08), color: 'text.primary' },
              }}
            >
              <Tooltip title={collapsed ? item.label : ''} placement="right">
                <ListItemIcon sx={{ minWidth: collapsed ? 0 : 36, color: 'inherit', mr: collapsed ? 0 : 1 }}>
                  {item.icon}
                </ListItemIcon>
              </Tooltip>
              {!collapsed && <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }} />}
            </ListItemButton>
          ))}
        </List>

        <Divider sx={{ borderColor: '#e2e8f0' }} />

        {/* Back to site */}
        <List sx={{ px: 1, py: 1 }}>
          <ListItemButton
            onClick={() => navigate('/')}
            sx={{ borderRadius: '6px', color: 'text.secondary', px: collapsed ? 1.5 : 2, justifyContent: collapsed ? 'center' : 'flex-start' }}
          >
            <Tooltip title={collapsed ? 'Về trang chủ' : ''} placement="right">
              <ListItemIcon sx={{ minWidth: collapsed ? 0 : 36, color: 'inherit', mr: collapsed ? 0 : 1 }}>
                <HomeIcon />
              </ListItemIcon>
            </Tooltip>
            {!collapsed && <ListItemText primary="Về trang chủ" primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }} />}
          </ListItemButton>
        </List>
      </Drawer>

      {/* Main content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        {/* Top Header */}
        <Box sx={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          px: 3,
          bgcolor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          gap: 2
        }}>
          <NotificationCenter />
          <Divider orientation="vertical" flexItem sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar src={user?.avatar} sx={{ width: 32, height: 32 }}>
              {user?.username?.[0]?.toUpperCase()}
            </Avatar>
            <Typography variant="body2" fontWeight={600}>{user?.username}</Typography>
          </Box>
        </Box>

        <Box component="main" sx={{ flex: 1, p: 3, overflow: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
