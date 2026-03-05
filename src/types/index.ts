// Shared types for frontend
export interface User {
  id: number
  username: string
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
  emailNotifications: boolean
  createdAt: string
  lastLogin?: string
  followerCount?: number
  followingCount?: number
  postCount?: number
  isFollowing?: boolean
  badges?: Badge[]
}

export interface Tag {
  id: number
  name: string
  slug: string
  color?: string
  postCount?: number
  description?: string
}

export interface Topic {
  id: number
  name: string
  slug: string
  description?: string
  postCount: number
  followerCount: number
  categoryId: number
  category?: Category
}

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  order: number
  topics?: Topic[]
}

export interface Post {
  id: number
  title: string
  slug: string
  content: string
  excerpt?: string
  coverImage?: string
  status: 'draft' | 'published' | 'archived'
  isPinned: boolean
  isFeatured: boolean
  likeCount: number
  commentCount: number
  viewCount: number
  bookmarkCount: number
  readTime: number
  publishedAt?: string
  createdAt: string
  updatedAt: string
  author: User
  topic?: Topic
  tags: Tag[]
  isLiked?: boolean
  isBookmarked?: boolean
}

export interface Comment {
  id: number
  postId: number
  authorId: number
  parentId?: number
  depth: number
  content: string
  likeCount: number
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  author: User
  replies?: Comment[]
  isLiked?: boolean
}

export interface Badge {
  id: number
  name: string
  description?: string
  icon?: string
  color: string
}

export interface Notification {
  id: number
  recipientId: number
  senderId?: number
  type: string
  entityType?: string
  entityId?: number
  content?: string
  isRead: boolean
  link?: string
  createdAt: string
  sender?: User
}

export interface Report {
  id: number
  reporterId: number
  targetType: 'post' | 'comment' | 'user'
  targetId: number
  reason: string
  description?: string
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed'
  createdAt: string
  reporter?: User
  resolver?: User
}
