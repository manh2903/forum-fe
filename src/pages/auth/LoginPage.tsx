import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Divider, InputAdornment, IconButton, Alert, CircularProgress
} from '@mui/material'
import {
  Email as EmailIcon, Lock as LockIcon, Visibility, VisibilityOff,
  Google as GoogleIcon, GitHub as GitHubIcon, Code as CodeIcon
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Đăng nhập thành công!')
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at top left, rgba(99,102,241,0.15) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(6,182,212,0.1) 0%, transparent 50%)',
      px: 2,
    }}>
      <Box sx={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{
            width: 56, height: 56, borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2,
            boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
          }}>
            <CodeIcon sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Typography variant="h4" fontWeight={800} letterSpacing="-0.02em">
            Chào mừng trở lại
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Đăng nhập vào tài khoản TechForum
          </Typography>
        </Box>

        <Card sx={{ borderRadius: 4, border: '1px solid #e2e8f0' }}>
          <CardContent sx={{ p: 4 }}>
            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

            {/* OAuth buttons */}
            <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
              <Button
                fullWidth variant="outlined"
                startIcon={<GoogleIcon />}
                href="/api/auth/google"
                sx={{ borderColor: '#e2e8f0', '&:hover': { borderColor: '#cbd5e1', bgcolor: 'rgba(255,255,255,0.03)' }, py: 1.2 }}
              >
                Google
              </Button>
              <Button
                fullWidth variant="outlined"
                startIcon={<GitHubIcon />}
                href="/api/auth/github"
                sx={{ borderColor: '#e2e8f0', '&:hover': { borderColor: '#cbd5e1', bgcolor: 'rgba(255,255,255,0.03)' }, py: 1.2 }}
              >
                GitHub
              </Button>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Divider sx={{ flex: 1, borderColor: '#e2e8f0' }} />
              <Typography variant="caption" color="text.secondary">hoặc đăng nhập với email</Typography>
              <Divider sx={{ flex: 1, borderColor: '#e2e8f0' }} />
            </Box>

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
              <Button
                type="submit" variant="contained" fullWidth disabled={loading}
                sx={{ py: 1.5, fontSize: '1rem', mt: 1 }}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : 'Đăng nhập'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Typography align="center" sx={{ mt: 3, color: 'text.secondary' }}>
          Chưa có tài khoản?{' '}
          <Box component={Link} to="/register" sx={{ color: 'primary.light', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
            Đăng ký ngay
          </Box>
        </Typography>
      </Box>
    </Box>
  )
}
