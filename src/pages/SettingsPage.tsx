import { useState, useEffect } from 'react'
import {
  Box, Typography, Paper, Grid, TextField, Button, Avatar,
  Switch, FormControlLabel, Stack, CircularProgress, Alert, InputAdornment, IconButton, Chip, 
  Divider
} from '@mui/material'
import { 
  Person as PersonIcon, Lock as LockIcon, 
  Notifications as NotifIcon, Visibility, VisibilityOff,
  CloudUpload as UploadIcon
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'
import { alpha } from '@mui/material/styles'

export default function SettingsPage() {
  const { user, updateUser } = useAuth()
  const [tab, setTab] = useState<'profile' | 'security' | 'notifications'>('profile')
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState({
    fullName: user?.fullName || '',
    bio: user?.bio || '',
    website: user?.website || '',
    location: user?.location || '',
    jobTitle: user?.jobTitle || '',
    githubUrl: user?.githubUrl || '',
    twitterUrl: user?.twitterUrl || '',
    studentId: user?.studentId || '',
    class: user?.class || '',
  })
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showPass, setShowPass] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(user?.emailNotifications ?? true)

  useEffect(() => {
    if (user) {
      setProfile({
        fullName: user.fullName || '',
        bio: user.bio || '',
        website: user.website || '',
        location: user.location || '',
        jobTitle: user.jobTitle || '',
        githubUrl: user.githubUrl || '',
        twitterUrl: user.twitterUrl || '',
        studentId: user.studentId || '',
        class: user.class || '',
      })
      setEmailNotifications(user.emailNotifications ?? true)
    }
  }, [user])

  const handleProfileSave = async () => {
    setLoading(true)
    try {
      const { data } = await api.put('/users/me', profile)
      updateUser(data.user)
      toast.success('Đã cập nhật hồ sơ!')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi cập nhật')
    } finally { setLoading(false) }
  }

  const handlePasswordChange = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) return toast.error('Mật khẩu không khớp')
    if (passwords.newPassword.length < 8) return toast.error('Mật khẩu phải có ít nhất 8 ký tự')
    setLoading(true)
    try {
      await api.put('/users/me/password', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword })
      toast.success('Đã đổi mật khẩu!')
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi đổi mật khẩu')
    } finally { setLoading(false) }
  }

  const handleNotifSave = async () => {
    try {
      await api.put('/users/me', { emailNotifications })
      updateUser({ emailNotifications })
      toast.success('Đã lưu cài đặt thông báo!')
    } catch {}
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const formData = new FormData()
    formData.append('image', file)
    
    setLoading(true)
    try {
      const { data } = await api.post('/upload/image?type=avatars', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      // Update user avatar URL
      const { data: userData } = await api.put('/users/me', { avatar: data.url })
      updateUser(userData.user)
      toast.success('Đã cập nhật ảnh đại diện!')
    } catch (err: any) {
      toast.error('Lỗi khi tải ảnh lên')
    } finally {
      setLoading(false)
    }
  }

  const TABS = [
    { key: 'profile', label: 'Hồ sơ cá nhân', icon: <PersonIcon /> },
    { key: 'security', label: 'Bảo mật', icon: <LockIcon /> },
    { key: 'notifications', label: 'Thông báo', icon: <NotifIcon /> },
  ]

  return (
    <Box sx={{ mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800}>⚙️ Cài đặt</Typography>
        <Typography variant="body2" color="text.secondary">Quản lý thông tin tài khoản và tùy chọn bảo mật của bạn</Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Sidebar */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper sx={{ p: 2, borderRadius: 4, border: '1px solid #eef2f6', boxShadow: 'none' }}>
            <Stack spacing={0.5}>
              {TABS.map(t => (
                <Button
                  key={t.key}
                  onClick={() => setTab(t.key as any)}
                  startIcon={t.icon}
                  fullWidth
                  sx={{
                    justifyContent: 'flex-start', py: 1.5, px: 2, borderRadius: 2.5,
                    bgcolor: tab === t.key ? alpha('#6366f1', 0.1) : 'transparent',
                    color: tab === t.key ? 'primary.main' : 'text.secondary',
                    fontWeight: tab === t.key ? 700 : 500,
                    '&:hover': { bgcolor: alpha('#6366f1', 0.05) }
                  }}
                >
                  {t.label}
                </Button>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Content */}
        <Grid size={{ xs: 12, md: 9 }}>
          {tab === 'profile' && (
            <Paper sx={{ p: 4, borderRadius: 4, border: '1px solid #eef2f6', boxShadow: 'none' }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 4 }}>Thông tin cá nhân</Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 5 }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar src={user?.avatar} sx={{ width: 100, height: 100, fontSize: '2.5rem', border: '4px solid #fff', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                    {user?.username?.[0]?.toUpperCase()}
                  </Avatar>
                  <IconButton 
                    size="small" 
                    component="label"
                    disabled={loading}
                    sx={{ 
                      position: 'absolute', bottom: 0, right: 0, 
                      bgcolor: 'primary.main', color: '#fff', 
                      '&:hover': { bgcolor: 'primary.dark' },
                      border: '2px solid #fff' 
                    }}
                  >
                    {loading ? <CircularProgress size={16} color="inherit" /> : <UploadIcon sx={{ fontSize: 16 }} />}
                    <input type="file" hidden accept="image/*" onChange={handleAvatarUpload} />
                  </IconButton>
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={800}>{user?.fullName || user?.username}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    @{user?.username} · {user?.email}
                  </Typography>
                  <Chip label={user?.role?.toUpperCase()} size="small" sx={{ mt: 1, fontWeight: 800, bgcolor: alpha('#6366f1', 0.1), color: '#6366f1' }} />
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Họ và tên" variant="outlined" value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} 
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Vị trí" variant="outlined" value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })} 
                    placeholder="VD: Hà Nội, Việt Nam"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
                </Grid>
                <Grid size={12}>
                  <TextField fullWidth label="Giới thiệu bản thân" multiline rows={4} value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    helperText={`${profile.bio.length}/300 ký tự`}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Chức danh" value={profile.jobTitle}
                    onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })} 
                    placeholder="VD: Full-stack Developer"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Website / Portfolio" value={profile.website}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })} 
                    placeholder="https://yourwebsite.com"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
                </Grid>
                
                <Grid size={12}>
                  <Divider sx={{ my: 1 }}><Chip label="Mạng xã hội" size="small" /></Divider>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="GitHub" value={profile.githubUrl}
                    onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })} 
                    placeholder="https://github.com/username"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Twitter / X" value={profile.twitterUrl}
                    onChange={(e) => setProfile({ ...profile, twitterUrl: e.target.value })} 
                    placeholder="https://twitter.com/username"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
                </Grid>

                <Grid size={12}>
                  <Divider sx={{ my: 1 }}><Chip label="Thông tin Sinh viên" size="small" /></Divider>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Mã sinh viên (MSV)" value={profile.studentId}
                    onChange={(e) => setProfile({ ...profile, studentId: e.target.value })} 
                    placeholder="VD: 20211234"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Lớp / Khoa" value={profile.class}
                    onChange={(e) => setProfile({ ...profile, class: e.target.value })} 
                    placeholder="VD: CNTT1-K62"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 5 }}>
                <Button 
                  variant="contained" 
                  onClick={handleProfileSave} 
                  disabled={loading}
                  sx={{ borderRadius: 2.5, px: 4, py: 1.2, fontWeight: 700, boxShadow: '0 8px 20px rgba(99,102,241,0.2)' }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Lưu thay đổi'}
                </Button>
              </Box>
            </Paper>
          )}

          {tab === 'security' && (
            <Paper sx={{ p: 4, borderRadius: 4, border: '1px solid #eef2f6', boxShadow: 'none' }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 4 }}>🛡️ Bảo mật & Mật khẩu</Typography>
              {!user?.hasPassword && (
                <Alert severity="info" sx={{ mb: 4, borderRadius: 2.5 }}>
                  Tài khoản của bạn được liên kết qua mạng xã hội. Bạn không cần đổi mật khẩu tại đây.
                </Alert>
              )}
              <Stack spacing={3}>
                <TextField
                  fullWidth label="Mật khẩu hiện tại" type={showPass ? 'text' : 'password'}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  disabled={!user?.hasPassword}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">
                      <IconButton onClick={() => setShowPass(!showPass)} edge="end">
                        {showPass ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }}
                />
                <TextField 
                  fullWidth label="Mật khẩu mới" type="password" value={passwords.newPassword}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  disabled={!user?.hasPassword} helperText="Gợi ý: Sử dụng mật khẩu mạnh với ít nhất 8 ký tự" />
                <TextField 
                  fullWidth label="Xác nhận mật khẩu mới" type="password" value={passwords.confirmPassword}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  disabled={!user?.hasPassword}
                  error={passwords.confirmPassword !== '' && passwords.newPassword !== passwords.confirmPassword} />
              </Stack>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 5 }}>
                <Button 
                  variant="contained" 
                  onClick={handlePasswordChange} 
                  disabled={loading || !user?.hasPassword}
                  sx={{ borderRadius: 2.5, px: 4, py: 1.2, fontWeight: 700 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Cập nhật mật khẩu'}
                </Button>
              </Box>
            </Paper>
          )}

          {tab === 'notifications' && (
            <Paper sx={{ p: 4, borderRadius: 4, border: '1px solid #eef2f6', boxShadow: 'none' }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 4 }}>🔔 Thông báo hệ thống</Typography>
              <Paper sx={{ p: 3, borderRadius: 3, bgcolor: '#f8fafc', border: '1px solid #eef2f6' }}>
                <FormControlLabel
                  control={<Switch checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)} color="primary" />}
                  label={
                    <Box sx={{ ml: 1 }}>
                      <Typography variant="subtitle1" fontWeight={700}>Thông báo qua Email</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Chúng tôi sẽ gửi email khi có hoạt động quan trọng như: trả lời bài viết, nhắc tên hoặc báo cáo liên quan đến bạn.
                      </Typography>
                    </Box>
                  }
                />
              </Paper>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                <Button variant="contained" onClick={handleNotifSave} sx={{ borderRadius: 2.5, px: 4 }}>Lưu cấu hình</Button>
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  )
}
