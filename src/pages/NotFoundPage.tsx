import { Box, Typography, Button } from '@mui/material'
import { Home as HomeIcon } from '@mui/icons-material'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <Box sx={{
      minHeight: '60vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center',
    }}>
      <Typography variant="h1" fontWeight={800} sx={{
        fontSize: { xs: '6rem', md: '10rem' },
        background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        lineHeight: 1, mb: 2,
      }}>
        404
      </Typography>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>Trang không tìm thấy</Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Trang bạn đang tìm không tồn tại hoặc đã bị xóa.
      </Typography>
      <Button component={Link} to="/" variant="contained" startIcon={<HomeIcon />} size="large">
        Về trang chủ
      </Button>
    </Box>
  )
}
