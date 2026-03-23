import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Box, TextField, Button, Typography,
  Alert, CircularProgress, InputAdornment, IconButton, Divider,
  Stack, useMediaQuery
} from '@mui/material'
import {
  Lock as LockIcon, Visibility, VisibilityOff, Code as CodeIcon,
  Person as PersonIcon, ChevronRight as RightIcon,
  Google as GoogleIcon, GitHub as GitHubIcon,
  ArrowBack as BackIcon, Security as SecurityIcon,
  Autorenew as RecoverIcon, Fingerprint as AuthIcon
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Framer Motion Wrappers ───
const MotionBox = motion(Box)
const MotionStack = motion(Stack)
const MotionTypography = motion(Typography)

// ─── Global Styles Injection ───
;(() => {
  if (typeof document === 'undefined' || document.getElementById('login-v3-styles')) return
  const s = document.createElement('style')
  s.id = 'login-v3-styles'
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    @keyframes rgBlob {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(30px, -50px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
    }
    @keyframes rgShimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }

    .rg-field .MuiOutlinedInput-root {
      background: #F9F8FF;
      border-radius: 12px !important;
      transition: all 0.25s ease;
    }
    .rg-field .MuiOutlinedInput-root:hover {
      background: #FFFFFF;
      border-color: #C7C4E8 !important;
    }
    .rg-field .MuiOutlinedInput-root.Mui-focused {
      background: #FFFFFF;
      border-color: #6366F1 !important;
      box-shadow: 0 0 0 4px rgba(99,102,241,0.1);
    }
    .rg-field .MuiOutlinedInput-notchedOutline {
      border-width: 1.5px !important;
      border-color: #E4E2F0 !important;
    }
    .rg-field .MuiInputLabel-root {
      color: #6B7280;
    }

    .social-btn {
      border: 1.5px solid #E4E2F0 !important;
      border-radius: 12px !important;
      color: #374151 !important;
      font-weight: 600 !important;
      text-transform: none !important;
      transition: all 0.2s !important;
    }
    .social-btn:hover {
      background: #F9F8FF !important;
      border-color: #C7C4E8 !important;
      box-shadow: 0 4px 15px rgba(0,0,0,0.04) !important;
      transform: translateY(-2px);
    }

    .submit-btn {
      background: linear-gradient(135deg, #6366F1, #4F46E5) !important;
      border-radius: 12px !important;
      font-weight: 700 !important;
      text-transform: none !important;
      padding: 14px !important;
      position: relative;
      overflow: hidden;
      transition: all 0.25s !important;
    }
    .submit-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 12px 24px rgba(99,102,241,0.3) !important;
    }
    .submit-btn::after {
      content: "";
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
      transform: translateX(-100%);
      animation: rgShimmer 3s infinite;
    }
  `
  document.head.appendChild(s)
})()

// ─── Components ───

const BrandingFeature = ({ icon, title, subtitle, index }: { icon: any, title: string, subtitle: string, index: number }) => (
  <MotionStack
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
    direction="row" spacing={2.5} alignItems="flex-start" sx={{ mb: 4 }}
  >
    <Box sx={{
      p: 1.5, borderRadius: '14px', bgcolor: 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 8px 20px rgba(99,102,241,0.08)', color: '#6366F1'
    }}>
      {icon}
    </Box>
    <Box>
      <Typography sx={{ fontWeight: 700, color: '#1E1B4B', fontSize: '16px', mb: 0.5 }}>
        {title}
      </Typography>
      <Typography sx={{ fontWeight: 400, color: '#6B7280', fontSize: '13.5px', lineHeight: 1.5 }}>
        {subtitle}
      </Typography>
    </Box>
  </MotionStack>
)

export default function LoginPage() {
  const navigate = useNavigate()
  const isDesktop = useMediaQuery('(min-width:960px)')
  const { login } = useAuth()

  const [form, setForm] = useState({ account: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (field: string) => (e: any) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.account, form.password)
      toast.success('Chào mừng bạn quay trở lại!')
      navigate('/')
    } catch (err: any) {
      if (err.response?.status === 403 && err.response?.data?.email) {
        toast.error(err.response.data.message)
        navigate('/verify-email', { state: { email: err.response.data.email } })
      } else {
        setError(err.response?.data?.message || 'Đăng nhập không thành công')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{
      height: '100vh', display: 'flex', bgcolor: '#F8F7FF', position: 'relative', overflow: 'hidden'
    }}>
      {/* Background patterns */}
      <Box sx={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'radial-gradient(rgba(228, 226, 240, 0.5) 1.5px, transparent 1.5px)',
        backgroundSize: '48px 48px', opacity: 0.6
      }} />
      <Box sx={{
        position: 'absolute', top: '-15%', right: '-5%', width: 700, height: 700,
        bgcolor: 'rgba(99,102,241,0.05)', borderRadius: '50%', filter: 'blur(100px)',
        animation: 'rgBlob 18s infinite alternate'
      }} />
      <Box sx={{
        position: 'absolute', bottom: '-10%', left: '-5%', width: 600, height: 600,
        bgcolor: 'rgba(6,182,212,0.04)', borderRadius: '50%', filter: 'blur(100px)',
        animation: 'rgBlob 15s infinite alternate-reverse 3s'
      }} />

      <Box sx={{ display: 'flex', width: '100%', maxWidth: isDesktop ? '100%' : 540, mx: 'auto', zIndex: 1 }}>

        {/* Branding Panel */}
        {isDesktop && (
          <Box sx={{
            width: '45%', background: 'linear-gradient(145deg, #EEF2FF, #ECFEFF)',
            borderRight: '1px solid #E0E7FF', display: 'flex', flexDirection: 'column',
            padding: { lg: '60px', xl: '80px' }, height: '100vh', overflow: 'hidden'
          }}>
            <MotionBox
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              sx={{ mb: 'auto' }}
            >
              <Stack direction="row" spacing={2.5} alignItems="center" sx={{ mb: { lg: 4, xl: 8 } }}>
                <Box sx={{
                  width: 60, height: 60, borderRadius: '18px',
                  background: 'linear-gradient(135deg, #6366F1, #06B6D4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 10px 30px rgba(99,102,241,0.25)'
                }}>
                  <CodeIcon sx={{ color: 'white', fontSize: 34 }} />
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: '36px', color: '#1E1B4B', letterSpacing: '-0.04em' }}>
                  Fita Vnua
                </Typography>
              </Stack>

              <MotionTypography
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                variant="h2" sx={{
                  fontWeight: 800, color: '#1E1B4B', mb: 3,
                  lineHeight: 1.15, letterSpacing: '-0.03em'
                }}
              >
                Tiếp tục hành trình<br />tại <Box component="span" sx={{ color: '#6366F1' }}>Fita Vnua</Box>
              </MotionTypography>

              <MotionTypography
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                sx={{ color: '#6B7280', fontSize: '18px', mb: { lg: 4, xl: 8 }, maxWidth: 380, lineHeight: 1.6 }}
              >
                Đăng nhập để truy cập kho tài liệu và kết nối cùng cộng đồng.
              </MotionTypography>

              <Box>
                <BrandingFeature
                  index={0} icon={<AuthIcon />}
                  title="Xác thực an toàn"
                  subtitle="Hệ thống đăng nhập bảo mật, hỗ trợ xác thực qua Google và GitHub."
                />
                <BrandingFeature
                  index={1} icon={<SecurityIcon />}
                  title="Bảo mật dữ liệu"
                  subtitle="Thông tin cá nhân và dữ liệu học tập của bạn luôn được mã hóa an toàn."
                />
                <BrandingFeature
                  index={2} icon={<RecoverIcon />}
                  title="Phục hồi nhanh chóng"
                  subtitle="Dễ dàng lấy lại quyền truy cập nếu bạn quên mật khẩu."
                />
              </Box>
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              sx={{
                mt: 'auto', p: 3.5, bgcolor: 'white', borderRadius: '24px',
                boxShadow: '0 15px 40px rgba(0,0,0,0.06)', display: 'flex',
                alignItems: 'center', gap: 2.5, width: 'fit-content', border: '1px solid #F0F0FF'
              }}
            >
              <Box sx={{ bgcolor: '#F0F9FF', color: '#0EA5E9', p: 1.2, borderRadius: '50%', display: 'flex' }}>
                <RightIcon />
              </Box>
              <Typography sx={{ fontSize: '14.5px', fontWeight: 600, color: '#1E1B4B' }}>
                Cộng đồng sinh viên FITA VNUA năng động.
              </Typography>
            </MotionBox>
          </Box>
        )}

        {/* Form Panel */}
        <Box sx={{
          flex: isDesktop ? 1 : 'none', width: isDesktop ? 'auto' : '100%',
          bgcolor: isDesktop ? 'white' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          p: { xs: 3, sm: 4, md: 6 }, zIndex: 1,
          height: '100vh', overflowY: 'auto',
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-thumb': { bgcolor: '#E2E8F0', borderRadius: '10px' }
        }}>

          <MotionBox
            initial={{ opacity: 0, x: isDesktop ? 20 : 0, y: isDesktop ? 0 : 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.6 }}
            sx={{
              width: '100%', maxWidth: 420,
              bgcolor: isDesktop ? 'transparent' : 'white',
              borderRadius: isDesktop ? 0 : '32px',
              p: isDesktop ? 0 : { xs: 3.5, sm: 5 },
              boxShadow: isDesktop ? 'none' : '0 25px 50px -12px rgba(99,102,241,0.12)',
              border: isDesktop ? 'none' : '1px solid #EDE9F6'
            }}
          >
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-start' }}>
              <Button
                component={Link}
                to="/"
                startIcon={<BackIcon sx={{ fontSize: 18 }} />}
                sx={{
                  color: '#6B7280', textTransform: 'none', fontWeight: 600, fontSize: '14px',
                  p: 0, minWidth: 'auto', '&:hover': { bgcolor: 'transparent', color: '#6366F1' }
                }}
              >
                Quay về trang chủ
              </Button>
            </Box>

            {/* Logo Mobile */}
            {!isDesktop && (
              <Box sx={{ textAlign: 'center', mb: 5 }}>
                <Box sx={{
                  width: 52, height: 52, borderRadius: '15px', mx: 'auto', mb: 2,
                  background: 'linear-gradient(135deg, #6366F1, #06B6D4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 16px rgba(99,102,241,0.2)'
                }}>
                  <CodeIcon sx={{ color: 'white', fontSize: 30 }} />
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: '26px', color: '#1E1B4B' }}>
                  Fita Vnua
                </Typography>
              </Box>
            )}

            <Box sx={{ mb: 5 }}>
              <Typography sx={{ fontWeight: 800, fontSize: '32px', color: '#1E1B4B', mb: 1, letterSpacing: '-0.02em' }}>
                Chào mừng trở lại
              </Typography>
              <Typography sx={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.5 }}>
                Vui lòng đăng nhập để tiếp tục khám phá.
              </Typography>
            </Box>

            <AnimatePresence mode="wait">
              {error && (
                <MotionBox
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Alert severity="error" sx={{
                    mb: 3.5, borderRadius: '12px', bgcolor: '#FEF2F2',
                    border: '1.5px solid #FECACA', color: '#991B1B', fontWeight: 500,
                    '& .MuiAlert-icon': { color: '#DC2626' }
                  }}>
                    {error}
                  </Alert>
                </MotionBox>
              )}
            </AnimatePresence>

            {/* Social */}
            <Stack direction="row" spacing={2} sx={{ mb: 4.5 }}>
              <Button fullWidth variant="outlined" className="social-btn" href="/api/auth/google" startIcon={<GoogleIcon sx={{ color: '#EA4335' }} />}>
                Google
              </Button>
              <Button fullWidth variant="outlined" className="social-btn" href="/api/auth/github" startIcon={<GitHubIcon sx={{ color: '#24292F' }} />}>
                GitHub
              </Button>
            </Stack>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 4.5 }}>
              <Divider sx={{ flex: 1, borderColor: '#E8E6F0' }} />
              <Typography sx={{ color: '#9CA3AF', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em' }}>
                OR LOGIN WITH ACCOUNT
              </Typography>
              <Divider sx={{ flex: 1, borderColor: '#E8E6F0' }} />
            </Box>

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                className="rg-field" label="Tên đăng nhập hoặc Email" required fullWidth
                value={form.account} onChange={set('account')}
                placeholder="nguyenvana hoặc email@st.vnua.edu.vn…"
                InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ fontSize: 20 }} /></InputAdornment> }}
              />

              <Box>
                <TextField
                  className="rg-field" label="Mật khẩu" required fullWidth
                  type={showPass ? 'text' : 'password'}
                  value={form.password} onChange={set('password')}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><LockIcon sx={{ fontSize: 20 }} /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPass(!showPass)} edge="end" size="small">
                          {showPass ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                  <Typography
                    component={Link}
                    to="/forgot-password"
                    sx={{
                      fontSize: '13px', color: '#6366F1', fontWeight: 600,
                      textDecoration: 'none', '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    Quên mật khẩu?
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ pt: 1 }}>
                <Button
                  type="submit" fullWidth disabled={loading} variant="contained"
                  className="submit-btn"
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <CircularProgress size={20} color="inherit" />
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>Đang xác thực…</Typography>
                    </Box>
                  ) : 'Đăng nhập ngay →'}
                </Button>

                <Typography align="center" sx={{ mt: 4, fontSize: '15px', color: '#6B7280', fontWeight: 500 }}>
                  Bạn chưa có tài khoản?{' '}
                  <Box
                    component={Link}
                    to="/register"
                    sx={{
                      color: '#6366F1',
                      fontWeight: 700,
                      textDecoration: 'none',
                      '&:hover': { color: '#4F46E5', textDecoration: 'underline' }
                    }}
                  >
                    Tham gia ngay
                  </Box>
                </Typography>
              </Box>
            </Box>
          </MotionBox>
        </Box>
      </Box>
    </Box>
  )
}
