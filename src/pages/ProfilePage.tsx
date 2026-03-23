import { useState, useEffect } from 'react'
import {
  Box, Typography, Avatar, Button, Paper, Grid, Chip, Tabs,
  Tab, Stack, CircularProgress, Divider, LinearProgress, Tooltip,
  Dialog, DialogTitle, DialogContent, List, ListItem, ListItemAvatar, ListItemText,
  ListItemButton, IconButton
} from '@mui/material'
import {
  Link as LinkIcon, LocationOn, Work, GitHub, Twitter,
  CalendarToday as JoinedIcon, Star as ReputationIcon,
  EmojiEvents as BadgeIcon, Group as FollowersIcon,
  Close as CloseIcon
} from '@mui/icons-material'
import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import PostCard from '../components/Post/PostCard'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'

function StatBox({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h5" fontWeight={800}>{value}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
        {icon}
        <Typography variant="caption" color="text.secondary">{label}</Typography>
      </Box>
    </Box>
  )
}

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { user: currentUser } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [postsLoading, setPostsLoading] = useState(false)
  const [tab, setTab] = useState(0)
  const [following, setFollowing] = useState(false)
  const [userListDialog, setUserListDialog] = useState<{ open: boolean, title: string, users: any[] }>({
    open: false, title: '', users: []
  })
  const [listLoading, setListLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.get(`/users/${username}`)
      .then(({ data }) => {
        setProfile(data.user)
        setFollowing(data.user.isFollowing)
      })
      .catch(() => toast.error('Lỗi khi tải thông tin cá nhân'))
      .finally(() => setLoading(false))
  }, [username])

  useEffect(() => {
    if (profile?.id) {
      loadPosts(profile.id, tab === 0 ? 'my' : 'saved')
    }
  }, [profile?.id, tab, currentUser?.id])

  const loadPosts = async (userId: number, type: 'my' | 'saved') => {
    setPostsLoading(true)
    try {
      const isOwn = currentUser?.id === userId
      const params: any = { limit: 20 }
      if (type === 'my') {
        params.authorId = userId
        params.status = isOwn ? 'all' : 'published'
      } else {
        params.bookmarked = 'true'
      }
      const { data } = await api.get('/posts', { params })
      setPosts(data.posts)
    } catch (err) {
      console.log("err", err)
      toast.error('Lỗi tải bài viết')
    } finally { setPostsLoading(false) }
  }

  const loadUserList = async (type: 'followers' | 'following') => {
    if (!profile) return
    setListLoading(true)
    setUserListDialog({ open: true, title: type === 'followers' ? 'Người theo dõi' : 'Đang theo dõi', users: [] })
    try {
      const { data } = await api.get(`/users/${profile.id}/${type}`)
      setUserListDialog(prev => ({ ...prev, users: data.users }))
    } catch (err) {
      toast.error('Không thể tải danh sách')
    } finally { setListLoading(false) }
  }

  const handleFollow = async () => {
    if (!currentUser) return toast.error('Đăng nhập để theo dõi')
    try {
      if (following) {
        await api.delete(`/users/${profile.id}/follow`)
        setProfile((p: any) => ({ ...p, followerCount: p.followerCount - 1 }))
      } else {
        await api.post(`/users/${profile.id}/follow`)
        setProfile((p: any) => ({ ...p, followerCount: p.followerCount + 1 }))
      }
      setFollowing(!following)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi')
    }
  }

  const handleFollowOther = async (u: any) => {
    if (!currentUser) return toast.error('Đăng nhập để theo dõi')
    try {
      if (u.isFollowing) {
        await api.delete(`/users/${u.id}/follow`)
      } else {
        await api.post(`/users/${u.id}/follow`)
      }
      setUserListDialog(prev => ({
        ...prev,
        users: prev.users.map(user => user.id === u.id ? { ...user, isFollowing: !u.isFollowing } : user)
      }))
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi')
    }
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
  if (!profile) return <Typography align="center" sx={{ py: 8 }}>Người dùng không tồn tại</Typography>

  const isOwnProfile = currentUser?.id === profile.id

  return (
    <Box>
      {/* Cover + Avatar */}
      <Box sx={{
        height: 200, borderRadius: 3, mb: -6,
        background: 'linear-gradient(135deg, #1e1b4b 0%, #0e7490 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Box sx={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.3) 0%, transparent 60%)',
        }} />
      </Box>

      <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', mb: 3, position: 'relative' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 2 }}>
          <Avatar
            src={profile.avatar}
            sx={{
              width: 96, height: 96, mt: -7,
              border: '4px solid #ffffff', fontSize: '2.5rem',
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            }}
          >
            {(profile.fullName || profile.username)[0].toUpperCase()}
          </Avatar>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {isOwnProfile ? (
              <Button component={Link} to="/settings" variant="outlined" sx={{ borderRadius: '10px', borderColor: '#e2e8f0' }}>
                Chỉnh sửa hồ sơ
              </Button>
            ) : currentUser && (
              <Button
                variant={following ? 'outlined' : 'contained'}
                onClick={handleFollow}
                sx={{ borderRadius: '10px', borderColor: following ? '#e2e8f0' : undefined }}
              >
                {following ? 'Đang theo dõi' : 'Theo dõi'}
              </Button>
            )}
          </Box>
        </Box>

        <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>{profile.fullName || profile.username}</Typography>
        {profile.fullName && <Typography color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>@{profile.username}</Typography>}
        {profile.role !== 'user' && (
          <Chip label={profile.role} color="primary" size="small" sx={{ mb: 1 }} />
        )}
        {profile.bio && <Typography color="text.secondary" sx={{ mb: 1.5 }}>{profile.bio}</Typography>}

        {/* Info row */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          {profile.location && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
              <LocationOn fontSize="small" /><Typography variant="body2">{profile.location}</Typography>
            </Box>
          )}
          {profile.jobTitle && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
              <Work fontSize="small" /><Typography variant="body2">{profile.jobTitle}</Typography>
            </Box>
          )}
          {profile.website && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LinkIcon fontSize="small" sx={{ color: 'primary.light' }} />
              <Typography variant="body2" component="a" href={profile.website} target="_blank" sx={{ color: 'primary.light', textDecoration: 'none' }}>
                {profile.website}
              </Typography>
            </Box>
          )}
          {profile.githubUrl && (
            <Box component="a" href={profile.githubUrl} target="_blank" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'text.primary' } }}>
              <GitHub fontSize="small" /><Typography variant="body2">GitHub</Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
            <JoinedIcon fontSize="small" />
            <Typography variant="body2">Tham gia {dayjs(profile.createdAt).format('MM/YYYY')}</Typography>
          </Box>
        </Box>

        {/* Stats */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, py: 2, borderTop: '1px solid #e2e8f0' }}>
          <StatBox label="Bài viết" value={profile.postCount || 0} icon={null} />
          <Box onClick={() => loadUserList('followers')} sx={{ cursor: 'pointer', '&:hover': { opacity: 0.7 } }}>
            <StatBox label="Người theo dõi" value={profile.followerCount || 0} icon={null} />
          </Box>
          <Box onClick={() => loadUserList('following')} sx={{ cursor: 'pointer', '&:hover': { opacity: 0.7 } }}>
            <StatBox label="Đang theo dõi" value={profile.followingCount || 0} icon={null} />
          </Box>
          <StatBox label="Điểm uy tín" value={profile.reputation || 0} icon={<ReputationIcon sx={{ fontSize: 12, color: '#f59e0b' }} />} />
        </Box>

        {/* Badges */}
        {profile.badges && profile.badges.length > 0 && (
          <>
            <Divider sx={{ borderColor: '#e2e8f0', mb: 2 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <BadgeIcon sx={{ color: '#f59e0b', fontSize: 18 }} />
              {profile.badges.map((badge: any) => (
                <Tooltip key={badge.id} title={badge.description || badge.name}>
                  <Chip label={badge.name} size="small"
                    sx={{ bgcolor: `${badge.color}20`, color: badge.color, border: `1px solid ${badge.color}50` }} />
                </Tooltip>
              ))}
            </Box>
          </>
        )}
      </Paper>

      {/* Posts Section */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab label={isOwnProfile ? "Bài viết của tôi" : "Bài viết"} />
            {isOwnProfile && <Tab label="Đã lưu" />}
          </Tabs>
          
          {isOwnProfile && profile.totalPostCount !== undefined && (
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <Tooltip title="Tổng số bài viết"><Chip size="small" label={`Tổng: ${profile.totalPostCount}`} variant="outlined" /></Tooltip>
              <Tooltip title="Bài viết đã duyệt"><Chip size="small" label={`Đã duyệt: ${profile.postCount}`} color="success" variant="outlined" /></Tooltip>
              <Tooltip title="Bài viết đang chờ duyệt"><Chip size="small" label={`Chờ duyệt: ${profile.pendingCount}`} color="warning" variant="outlined" /></Tooltip>
              <Tooltip title="Bài viết bị từ chối"><Chip size="small" label={`Bị từ chối: ${profile.rejectedCount}`} color="error" variant="outlined" /></Tooltip>
            </Stack>
          )}
        </Box>

        {postsLoading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
        ) : (
          <Stack spacing={2}>
            {posts.map(post => <PostCard key={post.id} post={post} showStatus={isOwnProfile && tab === 0} />)}
            {posts.length === 0 && (
              <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
                {tab === 0 
                  ? (isOwnProfile ? 'Bạn chưa đăng bài viết nào.' : 'Người dùng chưa có bài viết.')
                  : 'Bạn chưa lưu bài viết nào.'}
              </Typography>
            )}
          </Stack>
        )}
      </Box>

      {/* User List Dialog */}
      <Dialog open={userListDialog.open} onClose={() => setUserListDialog(p => ({ ...p, open: false }))} fullWidth maxWidth="xs">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {userListDialog.title}
          <IconButton size="small" onClick={() => setUserListDialog(p => ({ ...p, open: false }))}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {listLoading ? (
            <Box sx={{ textAlign: 'center', py: 3 }}><CircularProgress /></Box>
          ) : (
            <List>
              {userListDialog.users.map(u => (
                <ListItem 
                  key={u.id}
                  disablePadding
                  secondaryAction={
                    currentUser && currentUser.id !== u.id && (
                      <Button 
                        size="small" 
                        variant={u.isFollowing ? "outlined" : "contained"} 
                        onClick={() => handleFollowOther(u)}
                        sx={{ borderRadius: 2, fontSize: '0.7rem', py: 0.5 }}
                      >
                        {u.isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                      </Button>
                    )
                  }
                >
                  <ListItemButton 
                    component={Link} 
                    to={`/profile/${u.username}`}
                    onClick={() => setUserListDialog(p => ({ ...p, open: false }))}
                    sx={{ py: 1.5 }}
                  >
                    <ListItemAvatar>
                      <Avatar src={u.avatar}>{u.username[0].toUpperCase()}</Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={u.fullName || u.username} 
                      secondary={`⭐ ${u.reputation} điểm`} 
                      primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
              {userListDialog.users.length === 0 && (
                <Typography align="center" sx={{ py: 3, color: 'text.secondary' }}>Danh sách trống</Typography>
              )}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}
