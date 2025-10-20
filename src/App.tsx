import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { ToastProvider } from './components/CustomToast/ToastContext'
import { NotificationProvider } from './context/NotificationContext'
import './styles/dropdown.css'
import ProtectedRoute from './components/ProtectedRoute'
import PermissionRoute from './components/PermissionRoute'
import MainLayout from './layout/MainLayout'
import Login from './pages/public/Login'
import AccessRestricted from './pages/public/AccessRestricted'
import Dashboard from './pages/private/Dashboard'
import AccessControl from './pages/private/AccessControl'
import Books from './pages/private/Books'
import ECodes from './pages/private/ECodes'
import Resources from './pages/private/Resources'
import FAQs from './pages/private/FAQs'
import Clients from './pages/private/Clients'
import Products from './pages/private/Products'
import News from './pages/private/News'
import Research from './pages/private/Research'
import Settings from './pages/private/Settings'
import Enquiries from './pages/private/Enquiries'
import ContactUs from './pages/private/ContactUs'
import ReportedProducts from './pages/private/ReportedProducts'
import Newsletter from './pages/private/Newsletter'
import { ROUTES } from './config/routes'
import { useAuthStore } from './store'

function App() {
  const { initializeAuth } = useAuthStore()

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  return (
    <ToastProvider>
      <NotificationProvider>
        <Router>
                        <Routes>
                  {/* Public Routes */}
                  <Route path={ROUTES.LOGIN} element={<Login />} />
                  
                  {/* Protected Routes */}
                  <Route
                    path={ROUTES.ACCESS_RESTRICTED}
                    element={
                      <ProtectedRoute>
                        <AccessRestricted />
                      </ProtectedRoute>
                    }
                  />
          <Route
            path={ROUTES.DASHBOARD}
            element={
              <PermissionRoute moduleName="Dashboard">
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </PermissionRoute>
            }
          />
          <Route
            path={ROUTES.ACCESS_CONTROL}
            element={
              <PermissionRoute moduleName="Access Control">
                <MainLayout>
                  <AccessControl />
                </MainLayout>
              </PermissionRoute>
            }
          />
          <Route
            path={ROUTES.BOOKS}
            element={
              <PermissionRoute moduleName="Books">
                <MainLayout>
                  <Books />
                </MainLayout>
              </PermissionRoute>
            }
          />
          <Route
            path={ROUTES.E_CODES}
            element={
              <PermissionRoute moduleName="E-Codes">
                <MainLayout>
                  <ECodes />
                </MainLayout>
              </PermissionRoute>
            }
          />
          <Route
            path={ROUTES.RESOURCES}
            element={
              <PermissionRoute moduleName="Resources">
                <MainLayout>
                  <Resources />
                </MainLayout>
              </PermissionRoute>
            }
          />
          <Route
            path={ROUTES.FAQS}
            element={
              <PermissionRoute moduleName="FAQs">
                <MainLayout>
                  <FAQs />
                </MainLayout>
              </PermissionRoute>
            }
          />
          <Route
            path={ROUTES.CLIENTS}
            element={
              <PermissionRoute moduleName="Clients">
                <MainLayout>
                  <Clients />
                </MainLayout>
              </PermissionRoute>
            }
          />
          <Route
            path={ROUTES.PRODUCTS}
            element={
              <PermissionRoute moduleName="Products">
                <MainLayout>
                  <Products />
                </MainLayout>
              </PermissionRoute>
            }
          />
          <Route
            path={ROUTES.ENQUIRIES}
            element={
              <PermissionRoute moduleName="Enquiry">
                <MainLayout>
                  <Enquiries />
                </MainLayout>
              </PermissionRoute>
            }
          />
          <Route
            path={ROUTES.CONTACT_US}
            element={
              <PermissionRoute moduleName="Contact Us">
                <MainLayout>
                  <ContactUs />
                </MainLayout>
              </PermissionRoute>
            }
          />
          <Route
            path={ROUTES.REPORTED_PRODUCTS}
            element={
              <PermissionRoute moduleName="Reported Products">
                <MainLayout>
                  <ReportedProducts />
                </MainLayout>
              </PermissionRoute>
            }
          />
          <Route
            path={ROUTES.NEWSLETTER}
            element={
              <PermissionRoute moduleName="Newsletter">
                <MainLayout>
                  <Newsletter />
                </MainLayout>
              </PermissionRoute>
            }
          />
          <Route
            path={ROUTES.NEWS}
            element={
              <PermissionRoute moduleName="News">
                <MainLayout>
                  <News />
                </MainLayout>
              </PermissionRoute>
            }
          />
          <Route
            path={ROUTES.RESEARCH}
            element={
              <PermissionRoute moduleName="Research">
                <MainLayout>
                  <Research />
                </MainLayout>
              </PermissionRoute>
            }
          />
          <Route
            path={ROUTES.SETTINGS}
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Settings />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
          <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
        </Routes>
        </Router>
      </NotificationProvider>
    </ToastProvider>
  )
}

export default App
