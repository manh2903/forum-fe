import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  Box, TextField, Button, Typography,
  Alert, CircularProgress,
  Stack
} from '@mui/material'
import {
  ArrowBack as BackIcon, Security as SecurityIcon
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

const MotionBox = motion(Box)

export default function VerifyEmailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { verifyEmail, resendOTP } = useAuth()

  // Try to get email from state (set during registration or login attempt)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email)
    } else {
      // If no email in state, redirect to login
      const timer = setTimeout(() => {
        if (!email) navigate('/login')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [location.state, navigate, email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await verifyEmail(email, otp)
      toast.success('Xác thực tài khoản thành công!')
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Mã OTP không chính xác')
    } finally { setLoading(false) }
  }

  const handleResend = async () => {
    try {
      await resendOTP(email)
      toast.success('Mã OTP mới đã được gửi')
    } catch (err: any) {
      toast.error('Gửi lại mã thất bại')
    }
  }

  if (!email) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography>Đang chuyển hướng...</Typography>
        </Stack>
      </Box>
    )
  }

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', bgcolor: '#F8F7FF', position: 'relative', overflow: 'hidden',
      alignItems: 'center', justifyContent: 'center', p: 3
    }}>
      {/* Background patterns */}
      <Box sx={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'radial-gradient(rgba(228, 226, 240, 0.5) 1.5px, transparent 1.5px)',
        backgroundSize: '48px 48px', opacity: 0.6
      }} />

      <MotionBox
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        sx={{
          width: '100%', maxWidth: 450, bgcolor: 'white', borderRadius: '32px',
          p: { xs: 4, sm: 6 }, zIndex: 1,
          boxShadow: '0 25px 50px -12px rgba(99,102,241,0.12)',
          border: '1px solid #EDE9F6'
        }}
      >
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Box sx={{
            width: 64, height: 64, borderRadius: '20px', mx: 'auto', mb: 3,
            background: 'linear-gradient(135deg, #6366F1, #06B6D4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(99,102,241,0.2)'
          }}>
            <SecurityIcon sx={{ color: 'white', fontSize: 32 }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E1B4B', mb: 1.5 }}>
            Xác minh tài khoản
          </Typography>
          <Typography sx={{ color: '#6B7280', fontSize: '15px' }}>
            Chúng tôi đã gửi mã xác thực 6 chữ số đến email:
            <br />
            <Box component="span" sx={{ fontWeight: 700, color: '#1E1B4B' }}>{email}</Box>
          </Typography>
        </Box>

        <AnimatePresence mode="wait">
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <TextField
              fullWidth label="Mã xác thực (OTP)" required
              autoFocus
              value={otp} onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              inputProps={{ maxLength: 6, style: { fontSize: '24px', textAlign: 'center', letterSpacing: '8px', fontWeight: 700 } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px', bgcolor: '#F8F9FA' } }}
            />
            
            <Box>
              <Button
                type="submit" fullWidth variant="contained" disabled={loading}
                sx={{
                  py: 1.8, borderRadius: '12px', fontWeight: 700, textTransform: 'none',
                  background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                  fontSize: '16px'
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Xác nhận ngay'}
              </Button>
              
              <Typography align="center" variant="body2" sx={{ mt: 3, color: 'text.secondary', fontWeight: 500 }}>
                Bạn không nhận được mã?{' '}
                <Button 
                  onClick={handleResend} 
                  sx={{ 
                    fontWeight: 700, textTransform: 'none', p: 0, minWidth: 'auto', 
                    verticalAlign: 'baseline', color: '#6366F1' 
                  }}
                >
                  Gửi lại mã
                </Button>
              </Typography>
            </Box>
          </Stack>
        </form>

        <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #F0F0FF', textAlign: 'center' }}>
          <Button
            component={Link} to="/login"
            startIcon={<BackIcon sx={{ fontSize: 18 }} />}
            sx={{ color: '#6B7280', textTransform: 'none', fontWeight: 600, fontSize: '14px' }}
          >
            Quay lại đăng nhập
          </Button>
        </Box>
      </MotionBox>
    </Box>
  )
}
