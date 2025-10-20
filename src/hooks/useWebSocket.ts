import { useEffect, useState, useRef } from 'react'
import { io, type Socket } from 'socket.io-client'
import { useAuthStore } from '../store'

interface WebSocketEvent {
    id: string
    timestamp: string
    type: string
    data: any
}

interface NotificationData {
    id: string | number
    type: 'user_faq' | 'contact_us' | 'enquiry' | 'report_product'
    title: string
    message: string
    priority: 'low' | 'medium' | 'high'
    timestamp: string
}

interface UseWebSocketReturn {
    socket: Socket | null
    isConnected: boolean
    connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
    notifications: NotificationData[]
    addNotification: (notification: NotificationData) => void
    markNotificationAsRead: (id: string | number) => void
    clearAllNotifications: () => void
    getUnreadCount: () => number
}

export const useWebSocket = (): UseWebSocketReturn => {
    const [socket, setSocket] = useState<Socket | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
    const [notifications, setNotifications] = useState<NotificationData[]>(() => {
        // Initialize notifications from localStorage immediately
        try {
            const savedNotifications = localStorage.getItem('sanha_notifications')
            if (savedNotifications) {
                return JSON.parse(savedNotifications)
            }
        } catch (error) {
            console.error('Failed to parse saved notifications:', error)
            localStorage.removeItem('sanha_notifications')
        }
        return []
    })
    const { user } = useAuthStore()
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Save notifications to localStorage whenever notifications change
    useEffect(() => {
        localStorage.setItem('sanha_notifications', JSON.stringify(notifications))
    }, [notifications])

    // Listen for localStorage changes from other tabs
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'sanha_notifications' && e.newValue) {
                try {
                    const newNotifications = JSON.parse(e.newValue)
                    setNotifications(newNotifications)
                } catch (error) {
                    console.error('Failed to parse notifications from storage event:', error)
                }
            }
        }

        window.addEventListener('storage', handleStorageChange)

        return () => {
            window.removeEventListener('storage', handleStorageChange)
        }
    }, [])

    // Get WebSocket URL from environment
    const getWebSocketUrl = () => {
        const wsUrl = import.meta.env.VITE_WEBSOCKET_URL
        if (!wsUrl) {
            return null
        }
        return wsUrl
    }

    // Connect to WebSocket
    const connect = () => {
        const wsUrl = getWebSocketUrl()
        if (!wsUrl) {
            setConnectionStatus('error')
            return
        }

        setConnectionStatus('connecting')

        const newSocket = io(wsUrl, {
            transports: ['websocket', 'polling'],
            timeout: 10000,
            autoConnect: true,
        })

        // Connection event handlers
        newSocket.on('connect', () => {
            setIsConnected(true)
            setConnectionStatus('connected')

            // Identify as admin client
            if (user) {
                newSocket.emit('identify', {
                    type: 'admin',
                    userId: user.id
                })
            }

            // Join admin room for notifications
            newSocket.emit('join_admin_room')
        })

        newSocket.on('disconnect', (reason) => {
            setIsConnected(false)
            setConnectionStatus('disconnected')

            // Attempt to reconnect after 3 seconds
            if (reason === 'io server disconnect') {
                reconnectTimeoutRef.current = setTimeout(() => {
                    connect()
                }, 3000)
            }
        })

        newSocket.on('connect_error', () => {
            setConnectionStatus('error')
            setIsConnected(false)

            // Attempt to reconnect after 5 seconds
            reconnectTimeoutRef.current = setTimeout(() => {
                connect()
            }, 5000)
        })

        // Event handlers for notifications
        newSocket.on('event', (event: WebSocketEvent) => {
            if (event.type === 'NEW_USER_FAQ' || event.type === 'NEW_CONTACT_US' || event.type === 'NEW_ENQUIRY' || event.type === 'NEW_REPORT_PRODUCT') {
                const notification: NotificationData = {
                    id: event.data.id,
                    type: event.data.type,
                    title: event.data.title,
                    message: event.data.message,
                    priority: event.data.priority,
                    timestamp: event.data.timestamp
                }

                addNotification(notification)

                // Dispatch event for real-time data updates
                window.dispatchEvent(new CustomEvent('newNotificationReceived', {
                    detail: {
                        type: event.data.type,
                        id: event.data.id,
                        notification: notification
                    }
                }))
            }
        })

        newSocket.on('identified', () => {
            // Client identification confirmed
        })

        newSocket.on('joined_admin_room', () => {
            // Successfully joined admin room
        })

        // Ping/Pong for connection health
        newSocket.on('pong', () => {
            // Received pong from server
        })

        // Send ping every 30 seconds to keep connection alive
        const pingInterval = setInterval(() => {
            if (newSocket.connected) {
                newSocket.emit('ping')
            }
        }, 30000)

        setSocket(newSocket)

        // Cleanup interval on unmount
        return () => {
            clearInterval(pingInterval)
        }
    }

    // Disconnect from WebSocket
    const disconnect = () => {
        if (socket) {
            socket.disconnect()
            setSocket(null)
            setIsConnected(false)
            setConnectionStatus('disconnected')
        }

        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
        }
    }

    // Add notification to the list
    const addNotification = (notification: NotificationData) => {
        setNotifications(prev => {
            // Check if notification already exists (avoid duplicates)
            const exists = prev.some(n => n.id === notification.id)
            if (exists) {
                return prev
            }

            // Add new notification at the beginning
            return [notification, ...prev]
        })
    }

    // Mark notification as read
    const markNotificationAsRead = (id: string | number) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === id
                    ? { ...notification, read: true }
                    : notification
            )
        )
    }

    // Clear all notifications
    const clearAllNotifications = () => {
        setNotifications([])
        localStorage.removeItem('sanha_notifications')
    }

    // Get unread notifications count
    const getUnreadCount = (): number => {
        return notifications.filter(n => !(n as any).read).length
    }

    // Initialize connection on mount
    useEffect(() => {
        connect()

        // Cleanup on unmount
        return () => {
            disconnect()
        }
    }, [])

    // Reconnect when user changes
    useEffect(() => {
        if (user && socket && !isConnected) {
            disconnect()
            setTimeout(connect, 1000)
        }
    }, [user])

    return {
        socket,
        isConnected,
        connectionStatus,
        notifications,
        addNotification,
        markNotificationAsRead,
        clearAllNotifications,
        getUnreadCount
    }
}
