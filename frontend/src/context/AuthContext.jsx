import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [client, setClient] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('access_token'))
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const user = await authApi.me()
      setClient(user)
    } catch {
      // Если токен невалиден — чистим
      localStorage.removeItem('access_token')
      setToken(null)
      setClient(null)
    }
  }, [])

  const login = useCallback((newToken) => {
    localStorage.setItem('access_token', newToken)
    setToken(newToken)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    setToken(null)
    setClient(null)
  }, [])

  // Загружаем профиль при первом рендере, если есть токен
  useEffect(() => {
    if (token) {
      refreshUser().finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [token, refreshUser])

  // Перезагружаем профиль после логина
  useEffect(() => {
    if (token && !client) {
      refreshUser()
    }
  }, [token, client, refreshUser])

  return (
    <AuthContext.Provider
      value={{
        client,
        token,
        isAuthenticated: !!token && !!client,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}