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

  // Читаем тело ответа как текст, чтобы избежать ошибки "body stream already read"
  const bodyText = await response.text()
  let data
  try {
    data = JSON.parse(bodyText)
  } catch {
    // Если ответ не JSON
    if (!response.ok) {
      throw new Error(bodyText || `Ошибка ${response.status}`)
    }
    throw new Error(`Неожиданный ответ сервера: ${bodyText.slice(0, 100)}`)
  }

  if (!response.ok) {
    // Pydantic 422 возвращает detail как массив: [{"loc":..., "msg":"...", "type":"..."}]
    if (Array.isArray(data.detail)) {
      throw new Error(data.detail.map(e => e.msg).join('; '))
    }
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