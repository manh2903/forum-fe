import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, CircularProgress, InputAdornment, IconButton, Divider
} from '@mui/material'
import {
  Person as PersonIcon, Email as EmailIcon, Lock as LockIcon,
  Visibility, VisibilityOff, Code as CodeIcon,
  Google as GoogleIcon, GitHub as GitHubIcon,
  Badge as BadgeIcon, School as SchoolIcon
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', fullName: '', email: '', password: '', confirmPassword: '', studentId: '', class: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) return setError('Mật khẩu không khớp')
    if (form.password.length < 8) return setError('Mật khẩu phải có ít nhất 8 ký tự')
    if (form.username.length < 3) return setError('Username phải có ít nhất 3 ký tự')
    setLoading(true)
    try {
      await register(form.username, form.fullName, form.email, form.password, form.studentId, form.class)
      toast.success('Đăng ký thành công! Chào mừng bạn!')
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng ký thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at top right, rgba(6,182,212,0.15) 0%, transparent 50%), radial-gradient(ellipse at bottom left, rgba(99,102,241,0.1) 0%, transparent 50%)',
      px: 2, py: 4,
    }}>
      <Box sx={{ width: '100%', maxWidth: 440 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{
            width: 56, height: 56, borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2,
            boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
          }}>
            <CodeIcon sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Typography variant="h4" fontWeight={800} letterSpacing="-0.02em">Tạo tài khoản</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>Tham gia cộng đồng FitaVnua - CNTT HVNNVN ngay hôm nay</Typography>
        </Box>

        <Card sx={{ borderRadius: 4, border: '1px solid #e2e8f0' }}>
          <CardContent sx={{ p: 4 }}>
            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

            <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
              <Button fullWidth variant="outlined" startIcon={<GoogleIcon />} href="/api/auth/google"
                sx={{ borderColor: '#e2e8f0', py: 1.2 }}>Google</Button>
              <Button fullWidth variant="outlined" startIcon={<GitHubIcon />} href="/api/auth/github"
                sx={{ borderColor: '#e2e8f0', py: 1.2 }}>GitHub</Button>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Divider sx={{ flex: 1, borderColor: '#e2e8f0' }} />
              <Typography variant="caption" color="text.secondary">hoặc đăng ký với email</Typography>
              <Divider sx={{ flex: 1, borderColor: '#e2e8f0' }} />
            </Box>

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Họ và tên" fullWidth required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> }}
              />
              <TextField
                label="Username" fullWidth required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                helperText="Handle định danh (VD: nguyenvana)"
                InputProps={{ startAdornment: <InputAdornment position="start"><CodeIcon sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> }}
              />
              <TextField
                label="Email" type="email" fullWidth required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> }}
              />
              <TextField
                label="Mật khẩu" fullWidth required
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                helperText="Ít nhất 8 ký tự"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPass(!showPass)} edge="end" size="small">
                        {showPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <TextField
                label="Xác nhận mật khẩu" fullWidth required
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                error={form.confirmPassword !== '' && form.password !== form.confirmPassword}
                helperText={form.confirmPassword !== '' && form.password !== form.confirmPassword ? 'Mật khẩu không khớp' : ''}
                InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> }}
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Mã SV (nếu có)" fullWidth
                  value={form.studentId}
                  onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                  placeholder="2021..."
                  InputProps={{ startAdornment: <InputAdornment position="start"><BadgeIcon sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> }}
                />
                <TextField
                  label="Lớp (nếu có)" fullWidth
                  value={form.class}
                  onChange={(e) => setForm({ ...form, class: e.target.value })}
                  placeholder="CNTT..."
                  InputProps={{ startAdornment: <InputAdornment position="start"><SchoolIcon sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> }}
                />
              </Box>
              <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ py: 1.5, fontSize: '1rem', mt: 1 }}>
                {loading ? <CircularProgress size={22} color="inherit" /> : 'Đăng ký'}
              </Button>
              <Typography variant="caption" color="text.secondary" align="center">
                Bằng cách đăng ký, bạn đồng ý với{' '}
                <Box component="span" sx={{ color: 'primary.light', cursor: 'pointer' }}>Điều khoản dịch vụ</Box>
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Typography align="center" sx={{ mt: 3, color: 'text.secondary' }}>
          Đã có tài khoản?{' '}
          <Box component={Link} to="/login" sx={{ color: 'primary.light', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
            Đăng nhập
          </Box>
        </Typography>
      </Box>
    </Box>
  )
}
