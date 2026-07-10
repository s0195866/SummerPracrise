import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { authApi, type ClientOut } from '../api'

interface AuthContextType {
  client: ClientOut | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string) => void
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<ClientOut | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('access_token'))
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

  const login = useCallback((newToken: string) => {
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