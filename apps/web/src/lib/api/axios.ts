import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'

import { authStore } from '@/api/authStore'

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean
    _skipAuthRefresh?: boolean
  }
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000',
  withCredentials: true,
})

let isRefreshing = false
let queue: Array<(token: string | null) => void> = []

function resolveQueue(token: string | null) {
  queue.forEach((cb) => cb(token))
  queue = []
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = authStore.getAccessToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }

  config.headers = config.headers ?? {}
  config.headers.Accept = 'application/json'

  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig | undefined
    const status = error.response?.status

    if (!original || status !== 401 || original._retry || original._skipAuthRefresh) {
      throw error
    }

    original._retry = true

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push((token) => {
          if (!token) return reject(error)
          original.headers = original.headers ?? {}
          original.headers.Authorization = `Bearer ${token}`
          resolve(api(original))
        })
      })
    }

    isRefreshing = true

    try {
      const { data } = await api.request({
        url: '/auth/refresh',
        method: 'POST',
        _skipAuthRefresh: true,
      } as InternalAxiosRequestConfig)

      type RefreshResponse = {
        data?: {
          accessToken?: string
        }
      }

      const rr = data as unknown as RefreshResponse
      const newToken = rr?.data?.accessToken

      if (!newToken) {
        authStore.clear()
        resolveQueue(null)
        throw error
      }

      authStore.setAccessToken(newToken)
      resolveQueue(newToken)

      original.headers = original.headers ?? {}
      original.headers.Authorization = `Bearer ${newToken}`
      return api(original)
    } catch (e) {
      authStore.clear()
      resolveQueue(null)
      throw e
    } finally {
      isRefreshing = false
    }
  },
)
