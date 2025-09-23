import { type ReactNode } from 'react'
import Sidebar from '../components/Sidebar'
import FloatingNotificationButton from '../components/FloatingNotificationButton'
import { useUIStore } from '../store'

interface MainLayoutProps {
  children: ReactNode
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { isSidebarCollapsed, isMobileMenuOpen } = useUIStore()
  
  return (
    <div className="min-h-screen bg-black/5">
      <Sidebar />
      <FloatingNotificationButton />
      
      {/* Main Content Area */}
      <main className={`transition-all duration-300 ${
        isMobileMenuOpen 
          ? 'ml-0' 
          : isSidebarCollapsed 
            ? 'lg:ml-16' 
            : 'lg:ml-56'
      }`}>
        <div className={`animate-fade-in max-h-screen min-h-screen overflow-y-auto px-4 sm:px-6 ${
          isSidebarCollapsed 
            ? 'lg:px-4 xl:px-6' 
            : 'lg:px-3 xl:px-4'
        }`}>
          <div className="transition-all duration-300 ease-in-out min-h-screen transform">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}

export default MainLayout 