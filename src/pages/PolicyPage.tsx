import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Box, Typography, Paper, CircularProgress, Breadcrumbs, Link as MuiLink } from '@mui/material'
import { Home as HomeIcon, ChevronRight as ChevronRightIcon } from '@mui/icons-material'
import api from '../services/api'

export default function PolicyPage() {
  const { key } = useParams()
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPolicy()
  }, [key])

  const loadPolicy = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/settings/${key}`)
      setContent(data.setting.value || '')
      setTitle(data.setting.description || (key === 'term-of-service' ? 'Điều khoản sử dụng' : 'Chính sách bảo mật'))
    } catch {
      setContent('Nội dung đang được cập nhật...')
      setTitle(key === 'term-of-service' ? 'Điều khoản sử dụng' : 'Chính sách bảo mật')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ py: 6 }}>
      {/* <Breadcrumbs 
        separator={<ChevronRightIcon sx={{ fontSize: 18 }} />} 
        sx={{ mb: 4, '& a': { textDecoration: 'none', color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.875rem' } }}
      >
        <MuiLink component={Link} to="/">
          <HomeIcon sx={{ fontSize: 16 }} /> Trang chủ
        </MuiLink>
        <Typography color="text.primary" fontSize="0.875rem" fontWeight={600}>
          {title}
        </Typography>
      </Breadcrumbs> */}

      <Paper sx={{ p: { xs: 3, md: 6 }, borderRadius: 4, border: '1px solid #eef2f6', boxShadow: 'none' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            <Typography variant="h3" fontWeight={800} gutterBottom>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 6 }}>
              Cập nhật gần nhất: {new Date().toLocaleDateString('vi-VN')}
            </Typography>

            <Box 
              className="tiptap-content"
              sx={{ 
                '& h1': { fontSize: '2rem', mb: 2, mt: 4 },
                '& h2': { fontSize: '1.5rem', mb: 2, mt: 3 },
                '& p': { mb: 2, lineHeight: 1.8, color: 'text.secondary' },
                '& ul, & ol': { mb: 2, pl: 3 },
                '& li': { mb: 1, color: 'text.secondary' }
              }}
              dangerouslySetInnerHTML={{ __html: content }} 
            />
          </Box>
        )}
      </Paper>
    </Box>
  )
}
