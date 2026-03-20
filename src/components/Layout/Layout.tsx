import { Outlet } from 'react-router-dom'
import { Box } from '@mui/material'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <Box component="main" sx={{ maxWidth: 1440, mx: 'auto', px: { xs: 2, md: 3 }, py: 3, width: '100%', flex: 1 }}>
        <Outlet />
      </Box>
      <Footer />
    </Box>
  )
}
