import { type ReactNode } from 'react'
import Sidebar from '../components/Sidebar'
import { useUIStore } from '../store'

interface MainLayoutProps {
  children: ReactNode
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { isSidebarCollapsed } = useUIStore()
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      {/* Main Content Area */}
      <main className={`transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        <div className={` animate-fade-in max-h-screen min-h-screen overflow-y-auto ${isSidebarCollapsed ? 'lg:px-6' : 'lg:px-2'}`}>
          <div className="transition-all duration-300 ease-in-out min-h-screen transform">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}

export default MainLayout 