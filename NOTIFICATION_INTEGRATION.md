# Notification System Integration Guide

## Overview
The notification system now supports:
1. **Cross-tab persistence** - Notifications survive page refresh, tab switching, and navigation between all pages (using localStorage + Context API)
2. **Smart navigation** - Clicking notifications navigates to the correct page
3. **Dynamic updates** - If user is already on the target page, new items are fetched by ID and added to the list
4. **Real-time data updates** - Automatically fetch and add new items when notifications are received (✅ IMPLEMENTED)
5. **Global state management** - Single WebSocket connection shared across all pages via React Context

## ✅ Implementation Status
- **Enquiries**: ✅ Real-time updates implemented (pending tab only)
- **FAQs**: ✅ Real-time updates implemented (User FAQs tab only)  
- **Contact Us**: ✅ Real-time updates implemented (pending tab only)

## How to Integrate into Your Pages

### For FAQs Page (`src/pages/private/FAQs.tsx`)

Add this to your FAQs page component:

```typescript
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useRealTimeUpdates } from '../../hooks'
import type { UserFAQ } from '../../types/entities'

const FAQs = () => {
  const [userFaqs, setUserFaqs] = useState<UserFAQ[]>([])
  const location = useLocation()
  
  // Add this hook for real-time updates
  useRealTimeUpdates({
    itemType: 'faq',
    onNewItem: (newFaq: UserFAQ) => {
      // Add new FAQ to the beginning of the list
      setUserFaqs(prev => {
        // Check if FAQ already exists to avoid duplicates
        const exists = prev.some(faq => faq.id === newFaq.id)
        if (exists) return prev
        
        return [newFaq, ...prev]
      })
    },
    currentPath: location.pathname
  })

  // Rest of your existing code...
}
```

### For Enquiries Page (`src/pages/private/Enquiries.tsx`)

Add this to your Enquiries page component:

```typescript
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useRealTimeUpdates } from '../../hooks'
import type { Enquiry } from '../../types/entities'

const Enquiries = () => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const location = useLocation()
  
  // Add this hook for real-time updates
  useRealTimeUpdates({
    itemType: 'enquiry',
    onNewItem: (newEnquiry: Enquiry) => {
      // Add new enquiry to the beginning of the list
      setEnquiries(prev => {
        // Check if enquiry already exists to avoid duplicates
        const exists = prev.some(enquiry => enquiry.id === newEnquiry.id)
        if (exists) return prev
        
        return [newEnquiry, ...prev]
      })
    },
    currentPath: location.pathname
  })

  // Rest of your existing code...
}
```

### For Contact Us Page (`src/pages/private/ContactUs.tsx`)

Add this to your Contact Us page component:

```typescript
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useRealTimeUpdates } from '../../hooks'
import type { ContactUs } from '../../types/entities'

const ContactUs = () => {
  const [contactUsEntries, setContactUsEntries] = useState<ContactUs[]>([])
  const location = useLocation()
  
  // Add this hook for real-time updates
  useRealTimeUpdates({
    itemType: 'contact-us',
    onNewItem: (newContactUs: ContactUs) => {
      // Add new contact us entry to the beginning of the list
      setContactUsEntries(prev => {
        // Check if contact us entry already exists to avoid duplicates
        const exists = prev.some(entry => entry.id === newContactUs.id)
        if (exists) return prev
        
        return [newContactUs, ...prev]
      })
    },
    currentPath: location.pathname
  })

  // Rest of your existing code...
}
```

## How It Works

### 1. Cross-tab Persistence
- Notifications are automatically saved to `localStorage`
- They persist across page refreshes, navigation, and tab switching
- Real-time synchronization across browser tabs using storage events
- Only cleared when explicitly removed or browser data is cleared
- Single WebSocket connection maintained across all page navigations

### 2. Smart Navigation
When a user clicks on a notification:

**Case A: User is on a different page**
- Navigates to the target page (FAQs/Enquiries/Contact Us)
- Passes notification ID in navigation state
- Target page fetches the specific item by ID
- Item is highlighted/selected in the list

**Case B: User is already on the target page**
- Fetches the specific item by ID using the API
- Dispatches a custom event with the fetched item data
- Page receives the event and adds the item to the existing list at the top

### 3. Automatic Data Updates
- New items are fetched using the individual API endpoints
- Items are added to the top of the existing list
- No need to refresh the entire page or refetch all data

### 4. Real-time Data Updates
When a user is on the target page and receives a notification:
- **Automatic API call** - System fetches the new item by ID
- **List update** - New item is added to the top of the existing list
- **Duplicate prevention** - Checks for existing items to avoid duplicates
- **No user interaction** - Happens automatically in the background

## API Endpoints Used

The system uses these endpoints to fetch individual items:
- **User FAQs**: `GET /api/v1/user-faqs/{id}`
- **Enquiries**: `GET /api/v1/enquiries/{id}`
- **Contact Us**: `GET /api/v1/contact-us/{id}`

## Notification Types

The system handles these notification types:
- `user_faq` → FAQs page (User FAQs tab only)
- `enquiry` → Enquiries page (pending tab only)
- `contact_us` → Contact Us page (pending tab only)

## Testing

To test the system:
1. Open the admin portal
2. Submit a new FAQ/Enquiry/Contact Us from the frontend
3. Check that notification appears in the panel
4. Click the notification - should navigate to correct page
5. If already on the page, should add new item to the list
6. Refresh page - notifications should persist

## Notes

- Notifications are automatically marked as read when clicked
- The system handles duplicate prevention
- All API calls include proper authentication headers
- Error handling is built-in for failed API calls
