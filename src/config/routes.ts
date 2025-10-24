import { type ReactNode } from 'react'

export interface Route {
    path: string
    element: ReactNode
    isProtected?: boolean
    title?: string
}

export interface SidebarItem {
    id: string
    title: string
    path: string
    icon: ReactNode
    isBottom?: boolean
}

export const ROUTES = {
    LOGIN: '/login',
    DASHBOARD: '/dashboard',
    ACCESS_CONTROL: '/access-control',
    BOOKS: '/books',
    E_CODES: '/e-codes',
    RESOURCES: '/resources',
    NEWS: '/news',
    RESEARCH: '/research',
    SETTINGS: '/settings',
    ACCESS_RESTRICTED: '/access-restricted',
    FAQS: '/faqs',
    CLIENTS: '/clients',
    PRODUCTS: '/products',
    HALAL_PRODUCTS: '/products/halal',
    NON_HALAL_PRODUCTS: '/products/non-halal',
    ENQUIRIES: '/enquiries',
    CONTACT_US: '/contact-us',
    REPORTED_PRODUCTS: '/reported-products',
    NEWSLETTER: '/newsletter',
} as const

export type RouteKey = keyof typeof ROUTES 