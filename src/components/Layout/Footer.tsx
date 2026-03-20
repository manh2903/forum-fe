import { Box, Typography, Stack, Divider, IconButton } from '@mui/material'
import {
  GitHub as GitHubIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Code as CodeIcon,
} from '@mui/icons-material'
import { Link } from 'react-router-dom'
import { alpha } from '@mui/material/styles'


const FOOTER_LINKS = [
  {
    title: 'Khám phá',
    links: [
      { label: 'Trang chủ', to: '/' },
      { label: 'Chủ đề', to: '/topics' },
      { label: 'Tags', to: '/tags' },
    ],
  },
  {
    title: 'Tài khoản',
    links: [
      { label: 'Đăng nhập', to: '/login' },
      { label: 'Đăng ký', to: '/register' },
      { label: 'Bài đã lưu', to: '/bookmarks' },
    ],
  },
  {
    title: 'Về chúng tôi',
    links: [
      { label: 'Điều khoản sử dụng', to: '/policy' },
      { label: 'Chính sách bảo mật', to: '/policy' },
    ],
  },
]

const SOCIAL = [
  { icon: <GitHubIcon fontSize="small" />, href: 'https://github.com', label: 'GitHub' },
  { icon: <TwitterIcon fontSize="small" />, href: 'https://twitter.com', label: 'Twitter' },
  { icon: <LinkedInIcon fontSize="small" />, href: 'https://linkedin.com', label: 'LinkedIn' },
]

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 8,
        borderTop: '1px solid #e2e8f0',
        bgcolor: '#f8fafc',
      }}
    >
      <Box sx={{ maxWidth: 1440, mx: 'auto', px: { xs: 2, md: 3 }, py: { xs: 5, md: 6 } }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 5, md: 8 }, justifyContent: 'space-between' }}>

          {/* Brand */}
          <Box sx={{ maxWidth: 260 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2 }}>
              <Box sx={{
                width: 36, height: 36, borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <CodeIcon sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Typography fontWeight={800} fontSize="1.1rem" letterSpacing="-0.02em">
                Fita<Box component="span" sx={{ color: '#6366f1' }}>Vnua</Box>
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" lineHeight={1.7} sx={{ mb: 3 }}>
              Cộng đồng công nghệ dành cho sinh viên khoa CNTT trường Học viện Nông nghiệp Việt Nam. Học hỏi, kết nối và cùng nhau phát triển.
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {SOCIAL.map(s => (
                <IconButton
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  size="small"
                  aria-label={s.label}
                  sx={{
                    color: 'text.secondary',
                    bgcolor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    '&:hover': {
                      color: '#6366f1',
                      borderColor: '#6366f1',
                      bgcolor: alpha('#6366f1', 0.05),
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  {s.icon}
                </IconButton>
              ))}
            </Box>
          </Box>

          {/* Links */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 4, sm: 6 } }}>
            {FOOTER_LINKS.map(col => (
              <Box key={col.title} sx={{ minWidth: 130 }}>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="text.secondary"
                  sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', mb: 2 }}
                >
                  {col.title}
                </Typography>
                <Stack spacing={1.25}>
                  {col.links.map(link => (
                    <Typography
                      key={link.label}
                      component={Link}
                      to={link.to}
                      variant="body2"
                      sx={{
                        textDecoration: 'none',
                        color: 'text.secondary',
                        fontWeight: 500,
                        '&:hover': { color: '#6366f1' },
                        transition: 'color 0.15s',
                      }}
                    >
                      {link.label}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            ))}
          </Box>
        </Box>

        <Divider sx={{ my: 4, borderColor: '#e2e8f0' }} />

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} FitaVnua. Được tạo với ❤️ bởi sinh viên khoa CNTT - HVNNVN.
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
