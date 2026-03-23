import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import api from '../services/api'
import { requestForToken } from '../config/firebase'
import { onMessage } from 'firebase/messaging'
import { messaging } from '../config/firebase'
import toast from 'react-hot-toast'

interface User {
  id: number
  username: string
  fullName?: string
  email: string
  avatar?: string
  bio?: string
  role: 'user' | 'moderator' | 'admin'
  reputation: number
  isVerified: boolean
  isBanned: boolean
  website?: string
  location?: string
  jobTitle?: string
  githubUrl?: string
  twitterUrl?: string
  studentId?: string
  class?: string
  hasPassword?: boolean
  emailNotifications: boolean
  lastLogin?: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  socket: Socket | null
  login: (account: string, password: string) => Promise<void>
  register: (username: string, fullName: string, email: string, password: string, studentId?: string, className?: string) => Promise<any>
  logout: () => Promise<void>
  updateUser: (data: Partial<User>) => void
  forgotPassword: (email: string) => Promise<void>
  verifyOTP: (email: string, otp: string) => Promise<string>
  resetPassword: (resetToken: string, newPassword: string) => Promise<void>
  verifyEmail: (email: string, otp: string) => Promise<void>
  resendOTP: (email: string) => Promise<void>
  unreadCount: number
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      toast.success(payload.notification?.body || 'Thông báo mới', {
        icon: '🔔',
        duration: 5000
      })
      setUnreadCount(prev => prev + 1)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      api.get('/auth/me')
        .then(({ data }) => {
          setUser(data.user)
          initSocket(token)
          fetchUnreadCount()
          requestForToken()
        })
        .catch(() => {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUnreadCount = async () => {
    try {
      const { data } = await api.get('/notifications?limit=1')
      setUnreadCount(data.unreadCount || 0)
    } catch {}
  }

  const initSocket = (token: string) => {
    const newSocket = io('/', {
      auth: { token },
      transports: ['websocket', 'polling'],
    })
    newSocket.on('notification', (_notif) => {
      setUnreadCount(prev => prev + 1)
    })
    newSocket.on('connect_error', (err) => {
      console.warn('Socket error:', err.message)
    })
    setSocket(newSocket)
  }

  const login = async (account: string, password: string) => {
    const { data } = await api.post('/auth/login', { account, password })
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    setUser(data.user)
    initSocket(data.accessToken)
    await fetchUnreadCount()
    requestForToken()
  }

  const register = async (username: string, fullName: string, email: string, password: string, studentId?: string, className?: string) => {
    const { data } = await api.post('/auth/register', { username, fullName, email, password, studentId, class: className })
    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      setUser(data.user)
      initSocket(data.accessToken)
      requestForToken()
    }
    return data
  }

  const forgotPassword = async (email: string) => {
    await api.post('/auth/forgot-password', { email })
  }

  const verifyOTP = async (email: string, otp: string) => {
    const { data } = await api.post('/auth/verify-otp', { email, otp })
    return data.resetToken
  }

  const resetPassword = async (resetToken: string, newPassword: string) => {
    await api.post('/auth/reset-password', { resetToken, newPassword })
  }

  const verifyEmail = async (email: string, otp: string) => {
    const { data } = await api.post('/auth/verify-email', { email, otp })
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    setUser(data.user)
    initSocket(data.accessToken)
    requestForToken()
  }

  const resendOTP = async (email: string) => {
    await api.post('/auth/resend-otp', { email })
  }

  const logout = async () => {
    try {
      await api.put('/users/me/fcm-token', { token: null })
    } catch {}
    
    socket?.disconnect()
    setSocket(null)
    setUser(null)
    setUnreadCount(0)
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  const updateUser = (data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : null)
  }

  return (
    <AuthContext.Provider value={{ 
      user, loading, socket, login, register, logout, updateUser, 
      forgotPassword, verifyOTP, resetPassword, verifyEmail, resendOTP,
      unreadCount, setUnreadCount 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
