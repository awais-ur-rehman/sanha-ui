import { type TabType } from '../types/rbac'

interface TabNavigationProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  showAdmins?: boolean
  showModules?: boolean
  showRoles?: boolean
}

const TabNavigation = ({ activeTab, onTabChange, showAdmins = true, showModules = true, showRoles = true }: TabNavigationProps) => {
  const allTabs = [
    { id: 'admins' as TabType, label: 'Admins', show: showAdmins },
    { id: 'modules' as TabType, label: 'Modules', show: showModules },
    { id: 'roles' as TabType, label: 'Roles & Permissions', show: showRoles },
  ]

  const tabs = allTabs.filter(tab => tab.show)

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-2 px-1 border-b-2 font-medium text-sm cursor-pointer ${
              activeTab === tab.id
                ? 'border-[#0c684b] text-[#0c684b]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  )
}

export default TabNavigation 