import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Box, TextField, Button, Typography,
  Alert, CircularProgress, InputAdornment, IconButton,
  Stack
} from '@mui/material'
import {
  Email as EmailIcon, Lock as LockIcon,
  Visibility, VisibilityOff, Code as CodeIcon,
  ArrowBack as BackIcon, MarkEmailRead as EmailReadIcon
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

const MotionBox = motion(Box)

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { forgotPassword, verifyOTP, resetPassword, resendOTP } = useAuth()

  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [passwords, setPasswords] = useState({ password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await forgotPassword(email)
      setStep('otp')
      toast.success('Mã OTP đã được gửi đến email của bạn')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra')
    } finally { setLoading(false) }
  }

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const token = await verifyOTP(email, otp)
      setResetToken(token)
      setStep('reset')
      toast.success('Xác thực thành công')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Mã OTP không chính xác')
    } finally { setLoading(false) }
  }

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (passwords.password !== passwords.confirm) return setError('Mật khẩu không khớp')
    if (passwords.password.length < 8) return setError('Mật khẩu tối thiểu 8 ký tự')

    setLoading(true)
    try {
      await resetPassword(resetToken, passwords.password)
      toast.success('Đổi mật khẩu thành công!')
      navigate('/login')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra')
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

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', bgcolor: '#F8F7FF', position: 'relative', overflow: 'hidden',
      alignItems: 'center', justifyContent: 'center', p: 3
    }}>
      {/* Background patterns copied from Login */}
      <Box sx={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'radial-gradient(rgba(228, 226, 240, 0.5) 1.5px, transparent 1.5px)',
        backgroundSize: '48px 48px', opacity: 0.6
      }} />

      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        sx={{
          width: '100%', maxWidth: 450, bgcolor: 'white', borderRadius: '32px',
          p: { xs: 4, sm: 6 }, zIndex: 1,
          boxShadow: '0 25px 50px -12px rgba(99,102,241,0.12)',
          border: '1px solid #EDE9F6'
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Button
            component={Link} to="/login"
            startIcon={<BackIcon sx={{ fontSize: 18 }} />}
            sx={{ color: '#6B7280', textTransform: 'none', fontWeight: 600, p: 0 }}
          >
            Quay lại đăng nhập
          </Button>
        </Box>

        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Box sx={{
            width: 64, height: 64, borderRadius: '20px', mx: 'auto', mb: 3,
            background: 'linear-gradient(135deg, #6366F1, #06B6D4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(99,102,241,0.2)'
          }}>
            {step === 'email' && <EmailIcon sx={{ color: 'white', fontSize: 32 }} />}
            {step === 'otp' && <EmailReadIcon sx={{ color: 'white', fontSize: 32 }} />}
            {step === 'reset' && <LockIcon sx={{ color: 'white', fontSize: 32 }} />}
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E1B4B', mb: 1.5 }}>
            {step === 'email' && 'Quên mật khẩu?'}
            {step === 'otp' && 'Nhập mã xác thực'}
            {step === 'reset' && 'Đặt lại mật khẩu'}
          </Typography>
          <Typography sx={{ color: '#6B7280', fontSize: '15px' }}>
            {step === 'email' && 'Đừng lo lắng, chúng tôi sẽ gửi mã OTP qua email cho bạn.'}
            {step === 'otp' && `Chúng tôi đã gửi mã 6 chữ số đến ${email}`}
            {step === 'reset' && 'Bây giờ bạn có thể thiết lập mật khẩu mới cho tài khoản của mình.'}
          </Typography>
        </Box>

        <AnimatePresence mode="wait">
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>
          )}
        </AnimatePresence>

        {step === 'email' && (
          <form onSubmit={handleEmailSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth label="Địa chỉ Email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment> }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
              <Button
                type="submit" fullWidth variant="contained" disabled={loading}
                sx={{
                  py: 1.8, borderRadius: '12px', fontWeight: 700, textTransform: 'none',
                  background: 'linear-gradient(135deg, #6366F1, #4F46E5)'
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Gửi mã xác thực'}
              </Button>
            </Stack>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleOTPSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth label="Mã OTP" required
                value={otp} onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                InputProps={{ startAdornment: <InputAdornment position="start"><CodeIcon /></InputAdornment> }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
              <Button
                type="submit" fullWidth variant="contained" disabled={loading}
                sx={{
                  py: 1.8, borderRadius: '12px', fontWeight: 700, textTransform: 'none',
                  background: 'linear-gradient(135deg, #6366F1, #4F46E5)'
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Xác nhận OTP'}
              </Button>
              <Typography align="center" variant="body2" color="text.secondary">
                Không nhận được mã?{' '}
                <Button onClick={handleResend} sx={{ fontWeight: 700, textTransform: 'none', p: 0, minWidth: 'auto', verticalAlign: 'baseline' }}>
                  Gửi lại
                </Button>
              </Typography>
            </Stack>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth label="Mật khẩu mới" type={showPass ? 'text' : 'password'} required
                value={passwords.password} onChange={(e) => setPasswords(p => ({ ...p, password: e.target.value }))}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LockIcon /></InputAdornment>,
                  endAdornment: (
                    <IconButton onClick={() => setShowPass(!showPass)} edge="end">
                      {showPass ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  )
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
              <TextField
                fullWidth label="Xác nhận mật khẩu" type="password" required
                value={passwords.confirm} onChange={(e) => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon /></InputAdornment> }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
              <Button
                type="submit" fullWidth variant="contained" disabled={loading}
                sx={{
                  py: 1.8, borderRadius: '12px', fontWeight: 700, textTransform: 'none',
                  background: 'linear-gradient(135deg, #6366F1, #4F46E5)'
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Cập nhật mật khẩu'}
              </Button>
            </Stack>
          </form>
        )}
      </MotionBox>
    </Box>
  )
}
