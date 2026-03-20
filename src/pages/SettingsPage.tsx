import { useState } from 'react'
import {
  Box, Typography, Paper, Grid, TextField, Button, Avatar,
  Switch, FormControlLabel, Stack, CircularProgress, Alert, InputAdornment
} from '@mui/material'
import { Person as PersonIcon, Lock as LockIcon, Notifications as NotifIcon, Visibility, VisibilityOff } from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'

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

  const handleProfileSave = async () => {
    setLoading(true)
    try {
      const formData = new FormData()
      Object.entries(profile).forEach(([k, v]) => formData.append(k, v))
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

  const TABS = [
    { key: 'profile', label: '👤 Hồ sơ', icon: <PersonIcon /> },
    { key: 'security', label: '🔒 Bảo mật', icon: <LockIcon /> },
    { key: 'notifications', label: '🔔 Thông báo', icon: <NotifIcon /> },
  ]

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>⚙️ Cài đặt</Typography>
      <Grid container spacing={3}>
        {/* Sidebar */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper sx={{ p: 1.5, borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <Stack>
              {TABS.map(t => (
                <Button
                  key={t.key}
                  onClick={() => setTab(t.key as any)}
                  fullWidth
                  sx={{
                    justifyContent: 'flex-start', py: 1.5, borderRadius: 2,
                    bgcolor: tab === t.key ? 'rgba(99,102,241,0.15)' : 'transparent',
                    color: tab === t.key ? 'primary.light' : 'text.secondary',
                    fontWeight: tab === t.key ? 600 : 400,
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
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Thông tin cá nhân</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar src={user?.avatar} sx={{ width: 72, height: 72, fontSize: '1.75rem' }}>
                  {user?.username?.[0]?.toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700}>{user?.fullName || user?.username}</Typography>
                  <Typography variant="body2" color="text.secondary">@{user?.username} · {user?.email}</Typography>
                </Box>
              </Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Họ và tên" value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} />
                </Grid>
                <Grid size={12}>
                  <TextField fullWidth label="Giới thiệu" multiline rows={3} value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    helperText={`${profile.bio.length}/300`} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Website" value={profile.website}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })} placeholder="https://" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Vị trí" value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })} placeholder="Hà Nội, Việt Nam" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Chức danh" value={profile.jobTitle}
                    onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })} placeholder="Full-stack Developer" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="GitHub URL" value={profile.githubUrl}
                    onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })} placeholder="https://github.com/..." />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Twitter URL" value={profile.twitterUrl}
                    onChange={(e) => setProfile({ ...profile, twitterUrl: e.target.value })} placeholder="https://twitter.com/..." />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Mã sinh viên (MSV)" value={profile.studentId}
                    onChange={(e) => setProfile({ ...profile, studentId: e.target.value })} placeholder="VD: 20211234" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Lớp" value={profile.class}
                    onChange={(e) => setProfile({ ...profile, class: e.target.value })} placeholder="VD: CNTT1-K62" />
                </Grid>
              </Grid>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button variant="contained" onClick={handleProfileSave} disabled={loading}>
                  {loading ? <CircularProgress size={20} /> : 'Lưu thay đổi'}
                </Button>
              </Box>
            </Paper>
          )}

          {tab === 'security' && (
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Đổi mật khẩu</Typography>
              {!user?.hasPassword && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Tài khoản OAuth không thể đổi mật khẩu theo cách này
                </Alert>
              )}
              <Stack spacing={2}>
                <TextField
                  label="Mật khẩu hiện tại" type={showPass ? 'text' : 'password'}
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  disabled={!user?.hasPassword}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">
                      <Box component="span" onClick={() => setShowPass(!showPass)} sx={{ cursor: 'pointer', display: 'flex', color: 'text.secondary' }}>
                        {showPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </Box>
                    </InputAdornment>
                  }}
                />
                <TextField label="Mật khẩu mới" type="password" value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  disabled={!user?.hasPassword} helperText="Ít nhất 8 ký tự" />
                <TextField label="Xác nhận mật khẩu mới" type="password" value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  disabled={!user?.hasPassword}
                  error={passwords.confirmPassword !== '' && passwords.newPassword !== passwords.confirmPassword} />
              </Stack>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button variant="contained" onClick={handlePasswordChange} disabled={loading || !user?.hasPassword}>
                  {loading ? <CircularProgress size={20} /> : 'Đổi mật khẩu'}
                </Button>
              </Box>
            </Paper>
          )}

          {tab === 'notifications' && (
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Cài đặt thông báo</Typography>
              <FormControlLabel
                control={<Switch checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)} color="primary" />}
                label={
                  <Box>
                    <Typography variant="body1" fontWeight={600}>Thông báo qua Email</Typography>
                    <Typography variant="body2" color="text.secondary">Nhận email khi có người like, comment, hoặc follow bạn</Typography>
                  </Box>
                }
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button variant="contained" onClick={handleNotifSave}>Lưu cài đặt</Button>
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  )
}
