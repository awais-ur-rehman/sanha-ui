import { useNavigate, useLocation } from 'react-router-dom'
import { 
  FiMenu, 
  FiX, 
  FiShield, 
  FiBook, 
  FiFileText, 
  FiSearch, 
  FiSettings, 
  FiLogOut,
  FiHome,
  FiCode,
  FiBookOpen,
  FiHelpCircle,
  FiUsers,
  FiMail,
  FiMessageSquare
} from 'react-icons/fi'
import { 
  HiHome,
  HiShieldCheck,
  HiBookOpen,
  HiDocumentText,
  HiOutlineCube,
  HiSearch,
  HiCog,
  HiLogout,
  HiChevronLeft,
  HiChevronRight,
  HiCode,
  HiQuestionMarkCircle,
  HiUsers,
  HiMail,
  HiChatAlt2
} from 'react-icons/hi'
import { useAuthStore, useUIStore } from '../store'
import logo from '../assets/logo/sanhaLogo.png'
import { ROUTES } from '../config/routes'

interface SidebarItem {
  id: string
  title: string
  path: string
  icon: React.ReactNode
  isBottom?: boolean
}

const Sidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuthStore()

  const { 
    isSidebarCollapsed, 
    isMobileMenuOpen, 
    toggleSidebar, 
    toggleMobileMenu, 
    setMobileMenuOpen 
  } = useUIStore()

  const isActive = (path: string) => {
    if (path === ROUTES.DASHBOARD) {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  const getIcon = (iconType: string, isActive: boolean) => {
    const iconClass = "w-4 h-4 sm:w-5 sm:h-5 lg:w-4 lg:h-4 xl:w-5 xl:h-5"
    
    if (isActive) {
      switch (iconType) {
        case 'dashboard':
          return <HiHome className={iconClass} />
        case 'access-control':
          return <HiShieldCheck className={iconClass} />
        case 'books':
          return <HiBookOpen className={iconClass} />
        case 'e-codes':
          return <HiCode className={iconClass} />
        case 'resources':
          return <HiBookOpen className={iconClass} />
        case 'faqs':
          return <HiQuestionMarkCircle className={iconClass} />
        case 'enquiries':
          return <HiMail className={iconClass} />
        case 'contact-us':
          return <HiChatAlt2 className={iconClass} />
        case 'clients':
          return <HiUsers className={iconClass} />
        case 'products':
          return <HiOutlineCube className={iconClass} />
        case 'news':
          return <HiDocumentText className={iconClass} />
        case 'research':
          return <HiSearch className={iconClass} />
        case 'settings':
          return <HiCog className={iconClass} />
        case 'logout':
          return <HiLogout className={iconClass} />
        default:
          return <FiHome className={iconClass} />
      }
    } else {
      switch (iconType) {
        case 'dashboard':
          return <FiHome className={iconClass} />
        case 'access-control':
          return <FiShield className={iconClass} />
        case 'books':
          return <FiBook className={iconClass} />
        case 'e-codes':
          return <FiCode className={iconClass} />
        case 'resources':
          return <FiBookOpen className={iconClass} />
        case 'faqs':
          return <FiHelpCircle className={iconClass} />
        case 'enquiries':
          return <FiMail className={iconClass} />
        case 'contact-us':
          return <FiMessageSquare className={iconClass} />
        case 'clients':
          return <FiUsers className={iconClass} />
        case 'products':
          return <HiOutlineCube className={iconClass} />
        case 'news':
          return <FiFileText className={iconClass} />
        case 'research':
          return <FiSearch className={iconClass} />
        case 'settings':
          return <FiSettings className={iconClass} />
        case 'logout':
          return <FiLogOut className={iconClass} />
        default:
          return <FiHome className={iconClass} />
      }
    }
  }

  const topSidebarItems: SidebarItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      path: ROUTES.DASHBOARD,
      icon: getIcon('dashboard', isActive(ROUTES.DASHBOARD))
    },
    {
      id: 'access-control',
      title: 'Access Control',
      path: ROUTES.ACCESS_CONTROL,
      icon: getIcon('access-control', isActive(ROUTES.ACCESS_CONTROL))
    },
  ]

  const managementSidebarItems: SidebarItem[] = [
    {
      id: 'clients',
      title: 'Clients',
      path: ROUTES.CLIENTS,
      icon: getIcon('clients', isActive(ROUTES.CLIENTS))
    },
    {
      id: 'products',
      title: 'Products',
      path: ROUTES.PRODUCTS,
      icon: getIcon('products', isActive(ROUTES.PRODUCTS))
    },
    {
      id: 'e-codes',
      title: 'E-Codes',
      path: ROUTES.E_CODES,
      icon: getIcon('e-codes', isActive(ROUTES.E_CODES))
    },
    {
      id: 'resources',
      title: 'Resources',
      path: ROUTES.RESOURCES,
      icon: getIcon('resources', isActive(ROUTES.RESOURCES))
    },
    {
      id: 'books',
      title: 'Books',
      path: ROUTES.BOOKS,
      icon: getIcon('books', isActive(ROUTES.BOOKS))
    },
    {
      id: 'faqs',
      title: 'FAQs',
      path: ROUTES.FAQS,
      icon: getIcon('faqs', isActive(ROUTES.FAQS))
    },
    {
      id: 'enquiries',
      title: 'Enquiries',
      path: ROUTES.ENQUIRIES,
      icon: getIcon('enquiries', isActive(ROUTES.ENQUIRIES))
    },
    {
      id: 'contact-us',
      title: 'Contact Us',
      path: ROUTES.CONTACT_US,
      icon: getIcon('contact-us', isActive(ROUTES.CONTACT_US))
    },
  ]

  // Show all sidebar items (don't filter based on permissions)


  const bottomItems: SidebarItem[] = [
    {
      id: 'settings',
      title: 'Settings',
      path: ROUTES.SETTINGS,
      icon: getIcon('settings', isActive(ROUTES.SETTINGS)),
      isBottom: true
    },
    {
      id: 'logout',
      title: 'Logout',
      path: '#',
      icon: getIcon('logout', false),
      isBottom: true
    }
  ]

  const handleItemClick = (item: SidebarItem) => {
    if (item.id === 'logout') {
      logout()
      navigate(ROUTES.LOGIN)
    } else {
      navigate(item.path)
    }
    
    // Close mobile menu after navigation
    if (isMobileMenuOpen) {
      setMobileMenuOpen(false)
    }
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white rounded-xl">
      <div className='px-2'> 
        {/* Logo/Brand */}
      <div className="p-3 sm:p-4 border-b border-gray-200">
        <div className="flex items-center justify-center">
          <img 
            src={logo} 
            alt="Sanha Admin" 
            className={`transition-all duration-300 ${
              isSidebarCollapsed ? 'w-12 h-5 sm:w-14 sm:h-6 lg:w-12 lg:h-5 xl:w-14 xl:h-6' : 'w-10 h-10 sm:w-12 sm:h-12 lg:w-10 lg:h-10 xl:w-12 xl:h-12'
            }`} 
          />
        </div>
      </div>
      </div>

      {/* Toggle Button - Positioned absolutely */}
      <button
        onClick={toggleSidebar}
        className={`absolute -right-2 sm:-right-3 w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-300 hover:shadow-xl hover:scale-110 z-10 ${isSidebarCollapsed ? 'top-10 sm:top-12' : 'top-14 sm:top-16'}`}
      >
        {isSidebarCollapsed ? (
          <HiChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
        ) : (
          <HiChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
        )}
      </button>

      {/* Navigation Items */}
      <nav className="flex-1 py-2 px-2 sm:px-4">
        {/* Top Items */}
        <ul className="space-y-2">
          {topSidebarItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleItemClick(item)}
                className={`w-full flex items-center text-xs lg:text-sm py-2 sm:py-3 lg:py-2.5 rounded-lg transition-all duration-300 ease-in-out transform relative group ${
                  isSidebarCollapsed 
                    ? isActive(item.path)
                      ? 'justify-center px-1 text-[#0c684b] bg-transparent'
                      : 'justify-center px-1 text-gray-900 bg-transparent hover:bg-gray-100'
                    : isActive(item.path)
                      ? 'justify-start gap-2 sm:gap-3 lg:gap-2.5 px-2 sm:px-4 lg:px-3 bg-[#0c684b] text-white shadow-lg'
                      : 'justify-start gap-2 sm:gap-3 lg:gap-2.5 px-2 sm:px-4 lg:px-3 text-black/70 font-extralight hover:bg-gray-100 hover:text-gray-900 bg-white'
                }`}
              >
                {item.icon}
                {!isSidebarCollapsed && <span className="font-medium">{item.title}</span>}
                
                {/* Tooltip for collapsed state */}
                {isSidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                    {item.title}
                  </div>
                )}
              </button>
            </li>
          ))}
        </ul>

        {/* Management Section */}
        <div className="mt-4">
          {!isSidebarCollapsed && (
            <h1 className='text-[10px] sm:text-[12px] lg:text-[11px] xl:text-[12px] font-semibold text-black/40 ms-2 sm:ms-4 lg:ms-3 mb-2 sm:mb-3 lg:mb-2.5'>Management</h1>
          )}
          <ul className="space-y-2">
            {managementSidebarItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleItemClick(item)}
                  className={`w-full flex items-center text-xs py-2 sm:py-3 rounded-lg transition-all duration-300 ease-in-out transform relative group ${
                    isSidebarCollapsed 
                      ? isActive(item.path)
                        ? 'justify-center px-1 text-[#0c684b] bg-transparent'
                        : 'justify-center px-1 text-gray-900 bg-transparent hover:bg-gray-100'
                      : isActive(item.path)
                        ? 'justify-start gap-2 sm:gap-3 px-2 sm:px-4 bg-[#0c684b] text-white shadow-lg'
                        : 'justify-start gap-2 sm:gap-3 px-2 sm:px-4 text-black/70 font-extralight hover:bg-gray-100 hover:text-gray-900 bg-white'
                  }`}
                >
                  {item.icon}
                  {!isSidebarCollapsed && <span className="font-medium">{item.title}</span>}
                  
                  {/* Tooltip for collapsed state */}
                  {isSidebarCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                      {item.title}
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Bottom Items */}
      <div className="pt-3 sm:pt-4 px-2 py-3 sm:py-4">
      {!isSidebarCollapsed && (
            <h1 className='text-[10px] sm:text-[12px] font-semibold text-black/40 ms-2 sm:ms-4 mb-2'>System Settings</h1>
          )}
        <ul className="space-y-2">
          {bottomItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleItemClick(item)}
                className={`w-full flex items-center py-2 sm:py-3 rounded-lg text-xs transition-all duration-300 ease-in-out transform relative group ${
                  isSidebarCollapsed 
                    ? isActive(item.path)
                      ? 'justify-center px-2 text-[#0c684b] bg-transparent'
                      : 'justify-center px-2 text-gray-900 bg-transparent hover:bg-gray-100'
                    : isActive(item.path)
                      ? 'justify-start gap-2 sm:gap-3 px-2 sm:px-4 bg-[#0c684b] text-white shadow-lg'
                      : 'justify-start gap-2 sm:gap-3 px-2 sm:px-4 text-gray-700 hover:bg-green-50 hover:text-green-700 bg-white'
                }`}
              >
                {item.icon}
                {!isSidebarCollapsed && <span className="font-medium">{item.title}</span>}
                
                {/* Tooltip for collapsed state */}
                {isSidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                    {item.title}
                  </div>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="fixed top-3 left-3 sm:top-4 sm:left-4 z-50 p-1.5 sm:p-2 bg-green-600 text-white rounded-lg lg:hidden"
      >
        <FiMenu className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-3 left-3 sm:top-4 sm:left-4 h-[calc(100vh-1.5rem)] sm:h-[calc(100vh-2rem)] bg-white shadow-lg z-50 transition-all duration-300 rounded-xl ${
          isSidebarCollapsed ? 'w-14 sm:w-16' : 'w-56 sm:w-64'
        } ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Close Button */}
      {isMobileMenuOpen && (
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50 p-1.5 sm:p-2 bg-red-600 text-white rounded-lg lg:hidden"
        >
          <FiX className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      )}
    </>
  )
}

export default Sidebar 