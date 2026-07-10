const API_BASE = '/api'

interface RequestConfig {
  method?: string
  body?: unknown
  headers?: Record<string, string>
  auth?: boolean
}

async function request<T>(path: string, config: RequestConfig = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, auth = true } = config

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  }

  if (auth) {
    const token = localStorage.getItem('access_token')
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`
    }
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (response.status === 204) {
    return undefined as T
  }

  const data = await response.json()

  if (!response.ok) {
    const message = data.detail || data.message || `Ошибка ${response.status}`
    throw new Error(message)
  }

  return data as T
}

export const api = {
  get: <T>(path: string, config?: RequestConfig) => request<T>(path, { ...config, method: 'GET' }),
  post: <T>(path: string, body?: unknown, config?: RequestConfig) =>
    request<T>(path, { ...config, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, config?: RequestConfig) =>
    request<T>(path, { ...config, method: 'PUT', body }),
  delete: <T>(path: string, config?: RequestConfig) =>
    request<T>(path, { ...config, method: 'DELETE' }),
}