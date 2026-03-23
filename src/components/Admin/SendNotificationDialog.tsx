import React, { useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Stack, Autocomplete, Checkbox, Button, TextField, Box, Typography, CircularProgress
} from '@mui/material'
import { Send as SendIcon, CheckBoxOutlineBlank, CheckBox } from '@mui/icons-material'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { useDebounce } from '../../hooks/useDebounce'

interface Props {
  open: boolean
  onClose: () => void
  recipient?: { id: number; username: string } | null // Nếu null thì gửi tất cả
}

export default function SendNotificationDialog({ open, onClose, recipient }: Props) {
  const [content, setContent] = useState('')
  const [link, setLink] = useState('/')
  const [loading, setLoading] = useState(false)
  
  // New state for multi-user selection
  const [selectedUsers, setSelectedUsers] = useState<any[]>([])
  const [userSearchOptions, setUserSearchOptions] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const debouncedSearch = useDebounce(inputValue, 500)

  React.useEffect(() => {
    if (open) {
      handleSearchUsers(debouncedSearch)
    }
  }, [debouncedSearch, open])

  // Initialize if recipient is passed
  React.useEffect(() => {
    if (open) {
      if (recipient) {
        setSelectedUsers([recipient])
        setUserSearchOptions([recipient])
      } else {
        setSelectedUsers([])
      }
    }
  }, [recipient, open])

  const handleSearchUsers = async (val: string) => {
    setSearchLoading(true)
    try {
      const { data } = await api.get('/admin/users', { params: { search: val, limit: 10 } })
      setUserSearchOptions(data.users)
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSend = async () => {
    if (!content.trim()) return
    setLoading(true)
    try {
      const payload: any = { content, link, type: 'system' }
      if (selectedUsers.length === 1) {
        payload.recipientId = selectedUsers[0].id
      } else if (selectedUsers.length > 1) {
        payload.recipientIds = selectedUsers.map(u => u.id)
      }
      // Nếu selectedUsers rỗng -> Gửi tất cả (recipientIds/recipientId undefined)

      await api.post('/admin/notifications', payload)
      toast.success(
        selectedUsers.length === 0 
          ? 'Đã gửi thông báo tới toàn bộ thành viên' 
          : `Đã gửi thông báo tới ${selectedUsers.length} người dùng`
      )
      setContent('')
      onClose()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể gửi thông báo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>
        Gửi thông báo {selectedUsers.length > 1 ? `(${selectedUsers.length} người nhận)` : selectedUsers.length === 1 ? 'tới người dùng' : 'toàn hệ thống'}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Autocomplete
            multiple
            options={userSearchOptions}
            getOptionLabel={(option) => option.username}
            value={selectedUsers}
            onChange={(_, newValue) => setSelectedUsers(newValue)}
            inputValue={inputValue}
            onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
            loading={searchLoading}
            renderOption={(props, option, { selected }) => {
              const { key, ...optionProps } = props as any;
              return (
                <li key={key} {...optionProps}>
                  <Checkbox
                    icon={<CheckBoxOutlineBlank fontSize="small" />}
                    checkedIcon={<CheckBox fontSize="small" />}
                    style={{ marginRight: 8 }}
                    checked={selected}
                  />
                  <Box>
                    <Typography variant="body2" fontWeight={600}>@{option.username}</Typography>
                    <Typography variant="caption" color="text.secondary">{option.fullName}</Typography>
                  </Box>
                </li>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Người nhận"
                placeholder={selectedUsers.length === 0 ? "Bỏ trống để gửi cho TẤT CẢ" : "Chọn thêm người nhận..."}
                helperText={selectedUsers.length === 0 ? "Đang chọn chế độ: Gửi cho toàn bộ thành viên" : ""}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {searchLoading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          <TextField
            label="Nội dung thông báo"
            multiline
            rows={4}
            fullWidth
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nhập nội dung cần thông báo..."
          />

          <TextField
            label="Đường dẫn (Link)"
            fullWidth
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Ví dụ: /posts/huong-dan-moi hoặc /"
            helperText="Link này sẽ được mở ra khi người dùng click vào thông báo."
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} disabled={loading} color="inherit">Hủy</Button>
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={loading || !content.trim()}
          startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
          sx={{ px: 3 }}
        >
          {loading ? 'Đang gửi...' : 'Gửi ngay'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
