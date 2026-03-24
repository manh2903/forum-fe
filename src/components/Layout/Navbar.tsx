import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar, Toolbar, Box, IconButton, Avatar, Menu, MenuItem,
  Button, Divider, Tooltip, InputBase, Chip, ListItemIcon, useScrollTrigger,
} from '@mui/material'
import {
  Search as SearchIcon,
  Add as AddIcon, Person as PersonIcon,
  Settings as SettingsIcon, Logout as LogoutIcon, BookmarkBorder as BookmarkIcon,
  AdminPanelSettings as AdminIcon, Code as CodeIcon,
  Article as ArticleIcon, TrendingUp as TrendingIcon
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import { alpha } from '@mui/material/styles'
import NotificationCenter from './NotificationCenter'


export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

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
                Fita<Box component="span" sx={{ color: '#0c5d95' }}> Vnua</Box>
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
                  <Box>
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
                    <IconButton
                      component={Link}
                      to="/create"
                      color="primary"
                      sx={{ 
                        display: { xs: 'flex', sm: 'none' }, 
                        bgcolor: alpha('#0c5d95', 0.1),
                        borderRadius: '10px'
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                </Tooltip>

                <NotificationCenter />

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
