import type { paths } from '@/api/schema'
import { authStore } from '@/api/authStore'
import { api } from '@/lib/api/axios'

type LoginReq = NonNullable<paths['/auth/login']['post']['requestBody']>['content']['application/json']

type LoginRes = paths['/auth/login']['post']['responses']['200']['content']['application/json']

type RegisterReq = NonNullable<paths['/auth/register']['post']['requestBody']>['content']['application/json']

type RegisterRes = paths['/auth/register']['post']['responses']['201']['content']['application/json']

type RefreshRes = paths['/auth/refresh']['post']['responses']['200']['content']['application/json']

type MeRes = paths['/auth/me']['get']['responses']['200']['content']['application/json']

type LogoutRes = paths['/auth/logout']['post']['responses']['200']['content']['application/json']

export async function login(body: LoginReq) {
  const res = await api.post<LoginRes>('/auth/login', body)

  type TokenCarrier = {
    data?: {
      accessToken?: string
    }
  }

  const tc = res.data as unknown as TokenCarrier
  const accessToken = tc?.data?.accessToken
  authStore.setAccessToken(accessToken ?? null)
  return res.data
}

export async function register(body: RegisterReq) {
  const res = await api.post<RegisterRes>('/auth/register', body)
  return res.data
}

export async function refresh() {
  const res = await api.post<RefreshRes>('/auth/refresh')

  type TokenCarrier = {
    data?: {
      accessToken?: string
    }
  }

  const tc = res.data as unknown as TokenCarrier
  const accessToken = tc?.data?.accessToken
  authStore.setAccessToken(accessToken ?? null)
  return res.data
}

export async function me() {
  const res = await api.get<MeRes>('/auth/me')
  return res.data
}

export async function logout() {
  const res = await api.post<LogoutRes>('/auth/logout')
  authStore.clear()
  return res.data
}
