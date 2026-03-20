import { useState, useEffect } from 'react'
import {
  Box, Typography, Paper, Tab, Tabs, Button, CircularProgress, Stack,
  Divider, Alert
} from '@mui/material'
import { Save as SaveIcon, Policy as PolicyIcon, Description as TermsIcon } from '@mui/icons-material'
import api from '../../services/api'
import toast from 'react-hot-toast'
import TiptapEditor from '../../components/Editor/TiptapEditor'

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('term-of-service')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSetting(activeTab)
  }, [activeTab])

  const loadSetting = async (key: string) => {
    setLoading(true)
    try {
      const { data } = await api.get(`/settings/${key}`)
      setContent(data.setting.value || '')
    } catch (err: any) {
      if (err.response?.status === 404) {
        setContent('')
      } else {
        toast.error('Không thể tải cài đặt')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put(`/settings/${activeTab}`, {
        value: content,
        description: activeTab === 'term-of-service' ? 'Điều khoản sử dụng' : 'Chính sách bảo mật'
      })
      toast.success('Đã lưu thay đổi!')
    } catch {
      toast.error('Lỗi khi lưu cài đặt')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800}>⚙️ Cài đặt hệ thống</Typography>
        <Typography variant="body2" color="text.secondary">Quản lý nội dung các trang chính sách và điều khoản</Typography>
      </Box>

      <Paper sx={{ borderRadius: 4, border: '1px solid #eef2f6', overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f8fafc' }}>
          <Tabs 
            value={activeTab} 
            onChange={(_, v) => setActiveTab(v)}
            sx={{ px: 2 }}
          >
            <Tab 
              icon={<TermsIcon sx={{ fontSize: 20 }} />} 
              iconPosition="start" 
              label="Điều khoản sử dụng" 
              value="term-of-service" 
              sx={{ fontWeight: 700, py: 2 }}
            />
            <Tab 
              icon={<PolicyIcon sx={{ fontSize: 20 }} />} 
              iconPosition="start" 
              label="Chính sách bảo mật" 
              value="privacy-policy" 
              sx={{ fontWeight: 700, py: 2 }}
            />
          </Tabs>
        </Box>

        <Box sx={{ p: 4 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                  Chỉnh sửa nội dung {activeTab === 'term-of-service' ? 'Điều khoản sử dụng' : 'Chính sách bảo mật'}
                </Typography>
                <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                  Nội dung này sẽ được hiển thị trực tiếp cho người dùng. Hãy sử dụng các công cụ định dạng bên dưới.
                </Alert>
                
                <Box sx={{ minHeight: 400, border: '1px solid #e2e8f0', borderRadius: 2 }}>
                  <TiptapEditor 
                    value={content} 
                    onChange={setContent} 
                  />
                </Box>
              </Box>

              <Divider />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  variant="contained" 
                  startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  onClick={handleSave}
                  disabled={saving}
                  sx={{ borderRadius: 2.5, px: 4, py: 1.2, fontWeight: 700 }}
                >
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </Box>
            </Stack>
          )}
        </Box>
      </Paper>
    </Box>
  )
}
