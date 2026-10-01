import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { toast } from 'react-toastify'

const AuthContext = createContext(null)

// Default seed users for immediate testing
const INITIAL_USERS = [
  {
    id: 'user-1',
    name: 'Vishnu Ramesh',
    email: 'yourmail@gmail.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    createdAt: '2026-01-15'
  },
  {
    id: 'user-2',
    name: 'Demo Cinephile',
    email: 'demo@vscinemas.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    createdAt: '2026-02-10'
  }
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('vscinemas_auth_user')
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })

  const [registeredUsers, setRegisteredUsers] = useState(() => {
    try {
      const stored = localStorage.getItem('vscinemas_users')
      if (stored) {
        return JSON.parse(stored)
      }
      localStorage.setItem('vscinemas_users', JSON.stringify(INITIAL_USERS))
      return INITIAL_USERS
    } catch {
      return INITIAL_USERS
    }
  })

  const [rememberedEmail, setRememberedEmail] = useState(() => {
    return localStorage.getItem('vscinemas_remember_email') || 'yourmail@gmail.com'
  })

  // Synchronize registered users with localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem('vscinemas_users', JSON.stringify(registeredUsers))
    } catch (e) {
      console.error('Failed to sync users to localStorage', e)
    }
  }, [registeredUsers])

  // Login handler
  const login = useCallback(async (email, password, rememberMe = true) => {
    const trimmedEmail = email.trim().toLowerCase()

    // Look up in registered users
    const matchedUser = registeredUsers.find(
      (u) => u.email.toLowerCase() === trimmedEmail && u.password === password
    )

    if (matchedUser) {
      const sessionUser = {
        id: matchedUser.id,
        name: matchedUser.name,
        email: matchedUser.email,
        avatar: matchedUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${matchedUser.name}`,
        token: `token_${Date.now()}`
      }

      setUser(sessionUser)
      localStorage.setItem('vscinemas_auth_user', JSON.stringify(sessionUser))

      if (rememberMe) {
        localStorage.setItem('vscinemas_remember_email', trimmedEmail)
        setRememberedEmail(trimmedEmail)
      } else {
        localStorage.removeItem('vscinemas_remember_email')
        setRememberedEmail('')
      }

      toast.success(`Welcome back, ${sessionUser.name}!`)
      return { success: true, user: sessionUser }
    } else {
      const userExists = registeredUsers.some(
        (u) => u.email.toLowerCase() === trimmedEmail
      )
      const errorMsg = userExists
        ? 'Incorrect password. Please try again.'
        : 'No account found with this email. Please register first.'

      toast.error(errorMsg)
      return { success: false, message: errorMsg }
    }
  }, [registeredUsers])

  // Register handler
  const register = useCallback(async ({ name, email, password }) => {
    const trimmedEmail = email.trim().toLowerCase()

    const exists = registeredUsers.some(
      (u) => u.email.toLowerCase() === trimmedEmail
    )

    if (exists) {
      const msg = 'Email is already registered! Please sign in.'
      toast.warning(msg)
      return { success: false, message: msg }
    }

    const newUser = {
      id: `user_${Date.now()}`,
      name: name.trim(),
      email: trimmedEmail,
      password,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`,
      createdAt: new Date().toISOString().split('T')[0]
    }

    const updatedUsers = [...registeredUsers, newUser]
    setRegisteredUsers(updatedUsers)

    // Automatically log user in upon registration
    const sessionUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      avatar: newUser.avatar,
      token: `token_${Date.now()}`
    }

    setUser(sessionUser)
    localStorage.setItem('vscinemas_auth_user', JSON.stringify(sessionUser))
    localStorage.setItem('vscinemas_remember_email', trimmedEmail)
    setRememberedEmail(trimmedEmail)

    toast.success(`Account created! Welcome to VS Cinemas, ${newUser.name}.`)
    return { success: true, user: sessionUser }
  }, [registeredUsers])

  // Forgot password handler
  const forgotPassword = useCallback(async (email) => {
    const trimmedEmail = email.trim().toLowerCase()
    const userFound = registeredUsers.find(
      (u) => u.email.toLowerCase() === trimmedEmail
    )

    if (userFound) {
      toast.success(`Password reset instructions sent to ${trimmedEmail}!`)
    } else {
      toast.info(`If an account exists for ${trimmedEmail}, a reset link has been dispatched.`)
    }
    return { success: true }
  }, [registeredUsers])

  // Update Profile handler
  const updateProfile = useCallback((profileUpdates) => {
    if (!user) return { success: false, message: 'No user logged in' }

    const updatedUser = {
      ...user,
      ...profileUpdates
    }

    setUser(updatedUser)
    localStorage.setItem('vscinemas_auth_user', JSON.stringify(updatedUser))

    setRegisteredUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, ...profileUpdates } : u))
    )

    toast.success('Profile details updated successfully!')
    return { success: true, user: updatedUser }
  }, [user])

  // Change Password handler
  const updatePassword = useCallback((currentPassword, newPassword) => {
    if (!user) return { success: false, message: 'No user logged in' }

    const userInDb = registeredUsers.find((u) => u.id === user.id)
    if (!userInDb) {
      toast.error('User record not found.')
      return { success: false, message: 'User record not found.' }
    }

    if (userInDb.password !== currentPassword) {
      toast.error('Current password does not match.')
      return { success: false, message: 'Current password does not match.' }
    }

    setRegisteredUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, password: newPassword } : u))
    )

    toast.success('Password updated successfully!')
    return { success: true }
  }, [user, registeredUsers])

  // Logout handler
  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('vscinemas_auth_user')
    toast.info('Logged out successfully.')
  }, [])

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    rememberedEmail,
    login,
    register,
    forgotPassword,
    updateProfile,
    updatePassword,
    logout
  }), [user, rememberedEmail, login, register, forgotPassword, updateProfile, updatePassword, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// oxlint-disable-next-line react/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
