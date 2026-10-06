async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (response.status === 204) return null

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(data.message || 'Something went wrong. Please try again.')
    error.details = data.errors || {}
    throw error
  }
  return data
}

export const farmApi = {
  list: ({ query = '', stage = '', page = 1 } = {}) => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (stage) params.set('stage', stage)
    params.set('page', page)
    const suffix = params.toString() ? `?${params}` : ''
    return request(`/api/farms${suffix}`)
  },
  get: (id) => request(`/api/farms/${id}`),
  map: () => request('/api/farms-map'),
  dashboard: () => request('/api/dashboard'),
  create: (payload) => request('/api/farms', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) => request(`/api/farms/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (id) => request(`/api/farms/${id}`, { method: 'DELETE' }),
}
