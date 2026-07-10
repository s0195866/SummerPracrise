const API_BASE = '/api'

async function request(path, config = {}) {
  const { method = 'GET', body, headers = {}, auth = true } = config

  const requestHeaders = {
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
    return undefined
  }

  const data = await response.json()

  if (!response.ok) {
    const message = data.detail || data.message || `Ошибка ${response.status}`
    throw new Error(message)
  }

  return data
}

export const api = {
  get: (path, config) => request(path, { ...config, method: 'GET' }),
  post: (path, body, config) =>
    request(path, { ...config, method: 'POST', body }),
  put: (path, body, config) =>
    request(path, { ...config, method: 'PUT', body }),
  delete: (path, config) =>
    request(path, { ...config, method: 'DELETE' }),
}