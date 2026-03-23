import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Box, TextField, Button, Typography,
  Alert, CircularProgress, InputAdornment, IconButton, Divider,
  Stack, useMediaQuery
} from '@mui/material'
import {
  Person as PersonIcon, Email as EmailIcon, Lock as LockIcon,
  Visibility, VisibilityOff, Code as CodeIcon,
  Badge as BadgeIcon, School as SchoolIcon,
  AutoStories as BookIcon, Psychology as SkillIcon,
  Groups as CommunityIcon, ChevronRight as RightIcon,
  Google as GoogleIcon, GitHub as GitHubIcon,
  ArrowBack as BackIcon
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
  if (typeof document === 'undefined' || document.getElementById('register-v3-styles')) return
  const s = document.createElement('style')
  s.id = 'register-v3-styles'
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
      padding: 10px !important;
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

const PasswordStrength = ({ password }: { password: string }) => {
  const getStrength = (pw: string) => {
    if (!pw) return 0
    let s = 0
    if (pw.length >= 8) s++
    if (/[A-Z]/.test(pw)) s++
    if (/[0-9]/.test(pw)) s++
    if (/[^A-Za-z0-9]/.test(pw)) s++
    return s
  }

  const s = getStrength(password)
  const colors = ['#E5E7EB', '#EF4444', '#F97316', '#EAB308', '#22C55E']
  const labels = ['', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh']

  return (
    <Box sx={{ mt: 0.75 }}>
      <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
        {[1, 2, 3, 4].map((i) => (
          <Box
            key={i}
            sx={{
              height: 5, flex: 1, borderRadius: 10,
              bgcolor: i <= s ? colors[s] : '#EEF2FF',
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          />
        ))}
        <Typography variant="caption" sx={{ ml: 1, minWidth: 65, color: colors[s], fontWeight: 800, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {labels[s]}
        </Typography>
      </Box>
    </Box>
  )
}

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

export default function RegisterPage() {
  const navigate = useNavigate()
  const isDesktop = useMediaQuery('(min-width:960px)')
  const { register } = useAuth()

  const [form, setForm] = useState({
    username: '', fullName: '', email: '', password: '', confirmPassword: '', studentId: '', class: ''
  })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (field: string) => (e: any) => {
    let val = e.target.value
    if (field === 'username') val = val.toLowerCase().replace(/\s/g, '')
    setForm(prev => ({ ...prev, [field]: val }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) return setError('Mật khẩu không khớp')
    if (form.password.length < 8) return setError('Mật khẩu phải ít nhất 8 ký tự')
    if (form.username.length < 3) return setError('Username phải ít nhất 3 ký tự')

    setLoading(true)
    try {
      const result = await register(form.username, form.fullName, form.email, form.password, form.studentId, form.class)
      if (result.requireVerification) {
        toast.success('Vui lòng kiểm tra email để lấy mã xác thực')
        navigate('/verify-email', { state: { email: form.email } })
      } else {
        toast.success('Chào mừng bạn đến với Fita Vnua!')
        navigate('/')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng ký không thành công')
    } finally {
      setLoading(false)
    }
  }

  const pwMismatch = form.confirmPassword !== '' && form.password !== form.confirmPassword

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
                Gia nhập tri thức<br />khoa <Box component="span" sx={{ color: '#6366F1' }}>CNTT</Box>
              </MotionTypography>

              <MotionTypography
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                sx={{ color: '#6B7280', fontSize: '18px', mb: { lg: 4, xl: 8 }, maxWidth: 380, lineHeight: 1.6 }}
              >
                Cộng đồng học thuật lớn nhất dành riêng cho sinh viên FITA VNUA.
              </MotionTypography>

              <Box>
                <BrandingFeature
                  index={0} icon={<BookIcon />}
                  title="Kho tri thức FITA"
                  subtitle="Truy cập kho tài liệu, giáo trình và bộ đề thi phong phú qua các năm."
                />
                <BrandingFeature
                  index={1} icon={<SkillIcon />}
                  title="Hỗ trợ lập trình 24/7"
                  subtitle="Hệ thống hỏi đáp và fix bug cùng cộng đồng các Dev tài năng."
                />
                <BrandingFeature
                  index={2} icon={<CommunityIcon />}
                  title="Kết nối Gen Z"
                  subtitle="Mở rộng mạng lưới quan hệ với các CLB và sinh viên toàn khoa."
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
                Hơn 2,000+ sinh viên đã tham gia!
              </Typography>
            </MotionBox>
          </Box>
        )}

        <Box sx={{
          flex: isDesktop ? 1 : 'none', width: isDesktop ? 'auto' : '100%',
          bgcolor: isDesktop ? 'white' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          p: { xs: 2.5, sm: 4 }, zIndex: 1,
          height: '100vh', overflowY: 'auto',
          '&::-webkit-scrollbar': { width: '4px' },
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
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start' }}>
              <Button
                component={Link}
                to="/"
                startIcon={<BackIcon sx={{ fontSize: 18 }} />}
                sx={{
                  color: '#6B7280',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '14px',
                  p: 0,
                  minWidth: 'auto',
                  '&:hover': {
                    bgcolor: 'transparent',
                    color: '#6366F1'
                  }
                }}
              >
                Quay về trang chủ
              </Button>
            </Box>

            {/* Logo Mobile */}
            {!isDesktop && (
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Box sx={{
                  width: 44, height: 44, borderRadius: '12px', mx: 'auto', mb: 1,
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

            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontWeight: 800, fontSize: '28px', color: '#1E1B4B', mb: 0.5, letterSpacing: '-0.02em' }}>
                Tạo tài khoản mới
              </Typography>
              <Typography sx={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.4 }}>
                Khám phá kho tàng tri thức khoa CNTT ngay hôm nay.
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
                    mb: 2, borderRadius: '10px', bgcolor: '#FEF2F2',
                    border: '1.5px solid #FECACA', color: '#991B1B', fontWeight: 500,
                    '& .MuiAlert-icon': { color: '#DC2626' }, py: 0
                  }}>
                    {error}
                  </Alert>
                </MotionBox>
              )}
            </AnimatePresence>

            {/* Social */}
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <Button fullWidth variant="outlined" className="social-btn" href="/api/auth/google" startIcon={<GoogleIcon sx={{ color: '#EA4335' }} />}>
                Google
              </Button>
              <Button fullWidth variant="outlined" className="social-btn" href="/api/auth/github" startIcon={<GitHubIcon sx={{ color: '#24292F' }} />}>
                GitHub
              </Button>
            </Stack>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Divider sx={{ flex: 1, borderColor: '#E8E6F0' }} />
              <Typography sx={{ color: '#9CA3AF', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em' }}>
                Hoặc đăng ký với email
              </Typography>
              <Divider sx={{ flex: 1, borderColor: '#E8E6F0' }} />
            </Box>

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.75}>
                <TextField
                  className="rg-field" label="Họ và tên" required fullWidth
                  value={form.fullName} onChange={set('fullName')}
                  InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ fontSize: 20 }} /></InputAdornment> }}
                />
                <TextField
                  className="rg-field" label="Tên đăng nhập" required fullWidth
                  value={form.username} onChange={set('username')}
                  placeholder="nguyenvana…"
                  InputProps={{ startAdornment: <InputAdornment position="start"><CodeIcon sx={{ fontSize: 20 }} /></InputAdornment> }}
                />
              </Stack>

              <TextField
                className="rg-field" label="Địa chỉ Email" type="email" required fullWidth
                value={form.email} onChange={set('email')}
                placeholder="example@st.vnua.edu.vn…"
                InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ fontSize: 20 }} /></InputAdornment> }}
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
                <PasswordStrength password={form.password} />
              </Box>

              <TextField
                className="rg-field" label="Xác nhận mật khẩu" required fullWidth
                type="password" error={pwMismatch}
                value={form.confirmPassword} onChange={set('confirmPassword')}
                helperText={pwMismatch ? 'Mật khẩu nhập lại không khớp' : ''}
                InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon sx={{ fontSize: 20 }} /></InputAdornment> }}
              />

              <Stack direction="row" spacing={1.75}>
                <TextField
                  className="rg-field" label="Mã sinh viên" fullWidth
                  value={form.studentId} onChange={set('studentId')}
                  placeholder="651234…"
                  InputProps={{ startAdornment: <InputAdornment position="start"><BadgeIcon sx={{ fontSize: 20 }} /></InputAdornment> }}
                />
                <TextField
                  className="rg-field" label="Lớp học" fullWidth
                  value={form.class} onChange={set('class')}
                  placeholder="CNTT6X…"
                  InputProps={{ startAdornment: <InputAdornment position="start"><SchoolIcon sx={{ fontSize: 20 }} /></InputAdornment> }}
                />
              </Stack>

              <Box sx={{ pt: 1 }}>
                <Button
                  type="submit" fullWidth disabled={loading} variant="contained"
                  className="submit-btn"
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <CircularProgress size={20} color="inherit" />
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>Đang tạo tài khoản…</Typography>
                    </Box>
                  ) : 'Bắt đầu ngay hôm nay →'}
                </Button>
                <Typography align="center" sx={{ mt: 1.5, fontSize: '12px', color: '#9CA3AF', lineHeight: 1.4 }}>
                  Bằng việc đăng ký, bạn đồng ý với các{' '}
                  <Box
                    component={Link}
                    to="/policy/term-of-service"
                    sx={{ color: '#6366F1', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    Điều khoản dịch vụ
                  </Box>
                  {' '}và{' '}
                  <Box
                    component={Link}
                    to="/policy/privacy-policy"
                    sx={{ color: '#6366F1', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    Chính sách bảo mật
                  </Box>
                  {' '}của Fita Vnua.
                </Typography>

                <Typography align="center" sx={{ mt: 1.5, fontSize: '14px', color: '#6B7280', fontWeight: 500 }}>
                  Bạn đã có tài khoản?{' '}
                  <Box
                    component={Link}
                    to="/login"
                    sx={{
                      color: '#6366F1',
                      fontWeight: 700,
                      textDecoration: 'none',
                      '&:hover': { color: '#4F46E5', textDecoration: 'underline' }
                    }}
                  >
                    Đăng nhập ngay
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