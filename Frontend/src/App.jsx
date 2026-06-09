import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import AddProduct from './pages/AddProduct'
import EditProduct from './pages/EditProduct'
import MyProducts from './pages/MyProducts'
import HowItWorks from './pages/HowItWorks'
import SafetyTips from './pages/SafetyTips'
import Contact from './pages/Contact'
import FAQs from './pages/FAQs'
import Profile from './pages/Profile'
import CompleteProfile from './pages/CompleteProfile'
import Inbox from './pages/Inbox'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminUserDetail from './pages/admin/AdminUserDetail'
import AdminListings from './pages/admin/AdminListings'
import AdminListingDetail from './pages/admin/AdminListingDetail'

function App() {
  return (
    <AuthProvider>
      <Routes>

        {/* ─── Admin Routes — own layout (no Navbar/Footer) ──────────── */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/:id" element={<AdminUserDetail />} />
          <Route path="listings" element={<AdminListings />} />
          <Route path="listings/:id" element={<AdminListingDetail />} />
        </Route>

        {/* ─── Main App Routes — with Navbar + Footer ────────────────── */}
        <Route
          path="/*"
          element={
            <div className="app">
              <Navbar />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/safety-tips" element={<SafetyTips />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/faqs" element={<FAQs />} />
                  <Route path="/products/:id" element={
                    <ProtectedRoute><ProductDetail /></ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute><Profile /></ProtectedRoute>
                  } />
                  <Route path="/complete-profile" element={
                    <ProtectedRoute><CompleteProfile /></ProtectedRoute>
                  } />
                  <Route path="/add-product" element={
                    <ProtectedRoute><AddProduct /></ProtectedRoute>
                  } />
                  <Route path="/edit-product/:id" element={
                    <ProtectedRoute><EditProduct /></ProtectedRoute>
                  } />
                  <Route path="/my-products" element={
                    <ProtectedRoute><MyProducts /></ProtectedRoute>
                  } />
                  <Route path="/inbox" element={
                    <ProtectedRoute><Inbox /></ProtectedRoute>
                  } />
                </Routes>
              </main>
              <Footer />
            </div>
          }
        />

      </Routes>
    </AuthProvider>
  )
}

export default App

