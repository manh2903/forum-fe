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
      { label: 'Điều khoản sử dụng', to: '/policy/term-of-service' },
      { label: 'Chính sách bảo mật', to: '/policy/privacy-policy' },
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
        bgcolor: '#f0f5f9',
      }}
    >
      <Box sx={{ maxWidth: 1440, mx: 'auto', px: { xs: 2, md: 3 }, py: { xs: 5, md: 6 } }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 5, md: 8 }, justifyContent: 'space-between' }}>

          {/* Brand */}
          <Box sx={{ maxWidth: 260 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2 }}>
              <Box sx={{
                width: 36, height: 36, borderRadius: '10px',
                background: 'linear-gradient(135deg, #0c5d95 0%, #06b6d4 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <CodeIcon sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Typography fontWeight={800} fontSize="1.1rem" letterSpacing="-0.02em">
                Fita<Box component="span" sx={{ color: '#0c5d95' }}>Vnua</Box>
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
                      color: '#0c5d95',
                      borderColor: '#0c5d95',
                      bgcolor: alpha('#0c5d95', 0.05),
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
                        '&:hover': { color: '#0c5d95' },
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
          
          {/* Map Section */}
          <Box sx={{ 
            width: { xs: '100%', lg: 350 }, 
            height: 180, 
            overflow: 'hidden', 
            border: '2px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            bgcolor: 'white'
          }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.690045683695!2d105.92689875053574!3d21.005058238837215!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135a94c1f882977%3A0x6d016e6656923f46!2zSOG7jWMgdmnhu4duIE7DtG5nIE5naGnhu4dwIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1774260620503!5m2!1svi!2s"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </Box>
        </Box>

        <Divider sx={{ my: 4, borderColor: '#e2e8f0' }} />

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Fita Vnua. Được tạo với ❤️ bởi sinh viên khoa CNTT - HVNNVN.
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
