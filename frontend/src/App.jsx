import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Header from './components/Header'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CatalogPage from './pages/CatalogPage'
import ProductPage from './pages/ProductPage'
import ArticlePage from './pages/ArticlePage'
import CartPage from './pages/CartPage'
import OrdersPage from './pages/OrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'
import ProfilePage from './pages/ProfilePage'
import AdminGuard from './components/admin/AdminGuard'
import AdminLayout from './components/admin/AdminLayout'
import AdminOrdersPage from './pages/admin/AdminOrdersPage'
import AdminOrderDetailPage from './pages/admin/AdminOrderDetailPage'
import AdminProductsPage from './pages/admin/AdminProductsPage'
import AdminStatisticsPage from './pages/admin/AdminStatisticsPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'

function AdminRoutes() {
  return (
    <AdminGuard pageRole="manager">
      <AdminLayout>
        <Routes>
          <Route path="/orders" element={<AdminOrdersPage />} />
          <Route path="/orders/:id" element={<AdminOrderDetailPage />} />
          <Route path="/products" element={<AdminProductsPage />} />
          <Route path="/statistics" element={<AdminStatisticsPage />} />
          <Route path="/users" element={
            <AdminGuard pageRole="admin">
              <AdminUsersPage />
            </AdminGuard>
          } />
          <Route path="" element={<AdminOrdersPage />} />
        </Routes>
      </AdminLayout>
    </AdminGuard>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Admin panel — no Header/Footer */}
          <Route path="/admin/*" element={<AdminRoutes />} />

          {/* Public / Client routes */}
          <Route path="*" element={
            <div style={{ backgroundColor: '#F8FAFD', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
              <Header />
              <div style={{ flex: 1 }}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/catalog" element={<CatalogPage />} />
                  <Route path="/products/:id" element={<ProductPage />} />
                  <Route path="/articles/:id" element={<ArticlePage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/orders/:id" element={<OrderDetailPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Routes>
              </div>
              <Footer />
            </div>
          } />
        </Routes>
        <ScrollToTop />
      </AuthProvider>
    </BrowserRouter>
  )
}