import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import Movies from './pages/Movies'
import MovieDetail from './pages/MovieDetail'
import Theatres from './pages/Theatres'
import TheatreDetail from './pages/TheatreDetail'
import SeatSelection from './pages/SeatSelection'
import Payment from './pages/Payment'
import Profile from './pages/Profile'
import BookingHistory from './pages/BookingHistory'
import Reports from './pages/Reports'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Authentication Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Application Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/movies"
            element={
              <ProtectedRoute>
                <Movies />
              </ProtectedRoute>
            }
          />
          <Route
            path="/movies/:id"
            element={
              <ProtectedRoute>
                <MovieDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/theatres"
            element={
              <ProtectedRoute>
                <Theatres />
              </ProtectedRoute>
            }
          />
          <Route
            path="/theatres/:id"
            element={
              <ProtectedRoute>
                <TheatreDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seat-selection"
            element={
              <ProtectedRoute>
                <SeatSelection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seat-selection/:movieId"
            element={
              <ProtectedRoute>
                <SeatSelection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking"
            element={
              <ProtectedRoute>
                <SeatSelection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking/:movieId"
            element={
              <ProtectedRoute>
                <SeatSelection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/book-tickets"
            element={
              <ProtectedRoute>
                <SeatSelection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/book-tickets/:movieId"
            element={
              <ProtectedRoute>
                <SeatSelection />
              </ProtectedRoute>
            }
          />
          <Route path="/seats" element={<Navigate to="/booking" replace />} />
          <Route path="/seats/:movieId" element={<Navigate to="/booking/:movieId" replace />} />
          <Route path="/book" element={<Navigate to="/booking" replace />} />
          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            }
          />
          <Route path="/checkout" element={<Navigate to="/payment" replace />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/my-profile" element={<Navigate to="/profile" replace />} />
          <Route
            path="/booking-history"
            element={
              <ProtectedRoute>
                <BookingHistory />
              </ProtectedRoute>
            }
          />
          <Route path="/bookings" element={<Navigate to="/booking-history" replace />} />
          <Route path="/my-bookings" element={<Navigate to="/booking-history" replace />} />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route path="/analytics" element={<Navigate to="/reports" replace />} />
          <Route path="/reports-and-analytics" element={<Navigate to="/reports" replace />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

        {/* Global Toast Notifications */}
        <ToastContainer
          position="top-right"
          autoClose={3200}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </AuthProvider>
    </BrowserRouter>
  )
}
