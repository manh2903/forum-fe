import { useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, FormControl, InputLabel, Select, MenuItem,
  TextField, Typography, CircularProgress
} from '@mui/material'
import api from '../../services/api'
import toast from 'react-hot-toast'

const REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Quấy rối / Thù địch' },
  { value: 'misinformation', label: 'Thông tin sai lệch' },
  { value: 'inappropriate', label: 'Nội dung không phù hợp' },
  { value: 'copyright', label: 'Vi phạm bản quyền' },
  { value: 'other', label: 'Lý do khác' },
]

interface Props {
  open: boolean
  onClose: () => void
  targetType: 'post' | 'comment' | 'user'
  targetId: number
}

export default function ReportDialog({ open, onClose, targetType, targetId }: Props) {
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!reason) return toast.error('Vui lòng chọn lý do')
    setLoading(true)
    try {
      await api.post('/reports', { targetType, targetId, reason, description })
      toast.success('Báo cáo đã được gửi!')
      onClose()
      setReason('')
      setDescription('')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể gửi báo cáo')
    } finally { setLoading(false) }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>🚩 Báo cáo nội dung</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Mô tả vấn đề bạn nhận thấy với nội dung này.
        </Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Lý do báo cáo *</InputLabel>
          <Select value={reason} onChange={(e) => setReason(e.target.value)} label="Lý do báo cáo *">
            {REASONS.map(r => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField
          fullWidth multiline rows={3} label="Mô tả thêm (tùy chọn)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Cung cấp thêm thông tin về vấn đề..."
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderColor: '#e2e8f0' }}>Hủy</Button>
        <Button onClick={handleSubmit} variant="contained" color="error" disabled={loading}>
          {loading ? <CircularProgress size={20} /> : 'Gửi báo cáo'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
