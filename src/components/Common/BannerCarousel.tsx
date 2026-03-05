import { useState, useEffect } from 'react'
import { Box, IconButton, useTheme, useMediaQuery } from '@mui/material'
import {
  ChevronLeft as LeftIcon,
  ChevronRight as RightIcon,
  FiberManualRecord as DotIcon
} from '@mui/icons-material'
import api from '../../services/api'

export default function BannerCarousel() {
  const [banners, setBanners] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  useEffect(() => {
    loadBanners()
  }, [])

  useEffect(() => {
    if (banners.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex(prev => (prev === banners.length - 1 ? 0 : prev + 1))
      }, 5000)
      return () => clearInterval(timer)
    }
  }, [banners.length])

  const loadBanners = async () => {
    try {
      const { data } = await api.get('/banners', { params: { position: 'home_top' } })
      setBanners(data.banners)
    } catch (err) {
      console.error('Failed to load banners:', err)
    }
  }

  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? banners.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex(prev => (prev === banners.length - 1 ? 0 : prev + 1))
  }

  if (banners.length === 0) return null

  return (
    <Box sx={{ position: 'relative', width: '100%', mb: 4, borderRadius: 2, overflow: 'hidden', height: { xs: 160, sm: 240, md: 320 } }}>
      {/* Slides */}
      <Box sx={{
        display: 'flex',
        width: `${banners.length * 100}%`,
        height: '100%',
        transform: `translateX(-${(currentIndex * 100) / banners.length}%)`,
        transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        {banners.map((banner, _index) => (
          <Box
            key={banner.id}
            component={banner.link ? 'a' : 'div'}
            href={banner.link}
            target={banner.link ? '_blank' : undefined}
            sx={{
              width: `${100 / banners.length}%`,
              height: '100%',
              position: 'relative',
              display: 'block',
              textDecoration: 'none'
            }}
          >
            <Box
              component="img"
              src={banner.imageUrl}
              alt={banner.title}
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {banner.title && (
              <Box sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                p: { xs: 2, md: 4 },
                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                color: 'white'
              }}>
                <Box sx={{ fontWeight: 800, fontSize: { xs: '1rem', md: '1.5rem' }, maxWidth: '80%' }}>
                  {banner.title}
                </Box>
              </Box>
            )}
          </Box>
        ))}
      </Box>

      {/* Navigation Buttons */}
      {banners.length > 1 && (
        <>
          <IconButton
            onClick={handlePrev}
            sx={{
              position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
              bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.4)' },
              display: isMobile ? 'none' : 'flex'
            }}
          >
            <LeftIcon />
          </IconButton>
          <IconButton
            onClick={handleNext}
            sx={{
              position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
              bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.4)' },
              display: isMobile ? 'none' : 'flex'
            }}
          >
            <RightIcon />
          </IconButton>

          {/* Dots */}
          <Box sx={{
            position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: 1
          }}>
            {banners.map((_, index) => (
              <DotIcon
                key={index}
                onClick={() => setCurrentIndex(index)}
                sx={{
                  fontSize: 10, cursor: 'pointer',
                  color: index === currentIndex ? 'white' : 'rgba(255,255,255,0.4)',
                  transition: 'color 0.3s'
                }}
              />
            ))}
          </Box>
        </>
      )}
    </Box>
  )
}
