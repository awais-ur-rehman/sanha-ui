// Dashboard statistics
export interface DashboardStats {
  totalUsers: number
  totalBooks: number
  totalNews: number
  totalResearch: number
  totalModules: number
  activeUsers: number
  pendingApprovals: number
  recentActivity: number
}

// Chart data
export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string[]
    borderColor?: string[]
    borderWidth?: number
  }[]
}

// Recent activity
export interface RecentActivity {
  id: number
  type: 'user' | 'book' | 'news' | 'research' | 'module'
  action: 'created' | 'updated' | 'deleted' | 'approved' | 'rejected'
  description: string
  userId: number
  userName: string
  timestamp: string
  itemId?: number
  itemName?: string
}

// Quick actions
export interface QuickAction {
  id: string
  title: string
  description: string
  icon: string
  path: string
  color: string
  permission?: string
}

// Dashboard widget
export interface DashboardWidget {
  id: string
  title: string
  type: 'stats' | 'chart' | 'table' | 'list'
  size: 'small' | 'medium' | 'large'
  position: {
    x: number
    y: number
    w: number
    h: number
  }
  config: {
    dataSource?: string
    refreshInterval?: number
    showHeader?: boolean
    showFooter?: boolean
  }
}

// Notification
export interface Notification {
  id: number
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  isRead: boolean
  createdAt: string
  actionUrl?: string
  userId: number
}

// System health
export interface SystemHealth {
  status: 'healthy' | 'warning' | 'error'
  uptime: number
  memoryUsage: number
  cpuUsage: number
  diskUsage: number
  activeConnections: number
  lastCheck: string
}

// Dashboard configuration
export interface DashboardConfig {
  layout: DashboardWidget[]
  theme: 'light' | 'dark' | 'auto'
  refreshInterval: number
  showNotifications: boolean
  showQuickActions: boolean
  showSystemHealth: boolean
} 