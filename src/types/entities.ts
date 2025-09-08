// Book entity
export interface Book {
  id: number
  imageUrl: string
  title: string
  author: string
  description: string
  url?: string
  publishedBy: string
  contentLanguage: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface BookCreateRequest {
  imageUrl: string
  title: string
  author: string
  description: string
  url?: string
  publishedBy: string
  contentLanguage: string
}

export interface BookUpdateRequest {
  imageUrl?: string
  title?: string
  author?: string
  description?: string
  url?: string
  publishedBy?: string
  contentLanguage?: string
  isActive?: boolean
}



// News entity
export interface News {
  id: number
  title: string
  content: string
  summary: string
  imageUrl?: string
  author: string
  category: string
  tags: string[]
  status: 'published' | 'draft' | 'archived'
  publishedAt?: string
  featured: boolean
  viewCount: number
  createdAt: string
  updatedAt: string
  createdBy: number
  updatedBy: number
}

// Research entity
export interface Research {
  id: number
  title: string
  abstract: string
  content: string
  authors: string[]
  keywords: string[]
  category: string
  fileUrl?: string
  status: 'published' | 'draft' | 'under_review'
  publishedAt?: string
  viewCount: number
  downloadCount: number
  createdAt: string
  updatedAt: string
  createdBy: number
  updatedBy: number
}

// Module entity
export interface Module {
  id: number
  title: string
  description: string
  content: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: number // in minutes
  prerequisites: string[]
  learningObjectives: string[]
  resources: {
    title: string
    type: 'video' | 'document' | 'link'
    url: string
  }[]
  status: 'active' | 'inactive' | 'draft'
  createdAt: string
  updatedAt: string
  createdBy: number
  updatedBy: number
}

// Role entity
export interface Role {
  id: number
  name: string
  description: string
  permissions: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy: number
  updatedBy: number
}

// Admin entity (extends User)
export interface Admin {
  role: Role
  permissions: string[]
  lastLoginAt?: string
  loginCount: number
  isSuperAdmin: boolean
}

// Category entity
export interface Category {
  id: number
  name: string
  description: string
  type: 'book' | 'news' | 'research' | 'module'
  parentId?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Tag entity
export interface Tag {
  id: number
  name: string
  type: 'book' | 'news' | 'research' | 'module'
  usageCount: number
  createdAt: string
  updatedAt: string
}

// Audit log entity
export interface AuditLog {
  id: number
  userId: number
  userName: string
  action: string
  entityType: string
  entityId: number
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
  ipAddress: string
  userAgent: string
  timestamp: string
}

// File entity
export interface File {
  id: number
  filename: string
  originalName: string
  mimetype: string
  size: number
  path: string
  url: string
  entityType: string
  entityId: number
  uploadedBy: number
  createdAt: string
  updatedAt: string
}

export interface ECode {
  id: number;
  code: string;
  name: string;
  alternateName?: string[];
  function?: string[];
  status: string;
  source?: string[];
  healthInfo?: string[];
  uses?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Resource entity
export interface ResourceUrl {
  url: string;
  type: string;
}

export interface Resource {
  id: number;
  authorName: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  listUrl: ResourceUrl[];
  publishedDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceCreateRequest {
  authorName: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  listUrl: ResourceUrl[];
  publishedDate: string;
}

export interface ResourceUpdateRequest {
  authorName?: string;
  title?: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  listUrl?: ResourceUrl[];
  publishedDate?: string;
  isActive?: boolean;
}

// FAQ entity
export interface FAQ {
  id: number;
  question: string;
  answer: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FAQCreateRequest {
  question: string;
  answer: string;
  isActive?: boolean;
}

export interface FAQUpdateRequest {
  question?: string;
  answer?: string;
  isActive?: boolean;
}

// User FAQ entity
export interface UserFAQ {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  country: string;
  question: string;
  answer?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserFAQCreateRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  country: string;
  question: string;
}

export interface UserFAQUpdateRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  country?: string;
  question?: string;
}

// Client entity
export interface Client {
  id: number;
  name: string;
  logoUrl: string;
  address: string[];
  phone: string[];
  email: string;
  fax: string;
  website: string;
  products: string[];
  standard: string;
  category: string[];
  scope: string[];
  clientCode: string[];
  certifiedSince: string;
  expiryDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClientCreateRequest {
  name: string;
  logoUrl: string;
  address: string[];
  phone: string[];
  email: string;
  fax: string;
  website: string;
  products: string[];
  standard: string;
  category: string[];
  scope: string[];
  clientCode: string[];
  certifiedSince: string;
  expiryDate: string;
  isActive?: boolean;
}

export interface ClientUpdateRequest {
  name?: string;
  logoUrl?: string;
  address?: string[];
  phone?: string[];
  email?: string;
  fax?: string;
  website?: string;
  products?: string[];
  standard?: string;
  category?: string[];
  scope?: string[];
  clientCode?: string[];
  certifiedSince?: string;
  expiryDate?: string;
  isActive?: boolean;
}

// Client Name entity for dropdown
export interface ClientName {
  id: number;
  name: string;
}

// Product entity
export interface Product {
  id: number;
  name: string;
  manufacturer: string;
  status: string;
  image: string;
  madeIn: string;
  contains: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCreateRequest {
  name: string;
  manufacturer: string;
  status: string;
  image: string;
  madeIn: string;
  contains: string[];
}

export interface ProductUpdateRequest {
  name?: string;
  manufacturer?: string;
  status?: string;
  image?: string;
  madeIn?: string;
  contains?: string[];
  isActive?: boolean;
}

// Enquiry entity
export interface Enquiry {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  message: string;
  state: 'Pending' | 'Accepted' | 'Rejected';
  createdAt: string;
  updatedAt: string;
}

export interface EnquiryUpdateRequest {
  state: 'Pending' | 'Accepted' | 'Rejected';
}

// Contact Us entity
export interface ContactUs {
  id: number;
  type: 'General Inquiry' | 'Certification Inquiry (Businesses)' | 'Verification and Consumer Complaints' | 'Media and Press Inquiries' | 'Partnerships and Collaborations';
  message: string;
  firstName: string;
  lastName: string;
  email: string;
  orgName?: string;
  title?: string;
  orgWebsite?: string;
  replyMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactUsReplyRequest {
  id: number;
  replyMessage: string;
}