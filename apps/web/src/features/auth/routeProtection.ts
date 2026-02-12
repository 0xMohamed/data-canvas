import type { QueryClient } from '@tanstack/react-query'
import { redirect } from '@tanstack/react-router'

import type { paths } from '@/api/schema'
import * as authApi from './api'

export type MeResponse = paths['/auth/me']['get']['responses']['200']['content']['application/json']
export type UserPublic = MeResponse['data']

export type Permission = string
export type Role = string

export function meQueryOptions() {
  return {
    queryKey: ['auth', 'me'] as const,
    queryFn: authApi.me,
  }
}

function getUserRoles(user: unknown): Role[] {
  // The current API schema exposes only `UserPublic` without roles.
  // This keeps the guard forward-compatible if roles are later added to `/auth/me`.
  if (!user || typeof user !== 'object') return []

  const anyUser = user as any
  const roles = anyUser.roles
  if (Array.isArray(roles)) return roles.filter((r) => typeof r === 'string')

  const role = anyUser.role
  if (typeof role === 'string') return [role]

  return []
}

function getUserPermissions(user: unknown): Permission[] {
  // Same forward-compatibility note as `getUserRoles`.
  if (!user || typeof user !== 'object') return []

  const anyUser = user as any
  const perms = anyUser.permissions
  if (Array.isArray(perms)) return perms.filter((p) => typeof p === 'string')

  return []
}

export type ProtectRouteOptions<TRouteParams extends Record<string, any> = Record<string, any>> = {
  // If true, the user must be authenticated. This is the most common use.
  requireAuth?: boolean

  // If provided, user must have at least one of these roles.
  anyRole?: Role[]

  // If provided, user must have all of these permissions.
  allPermissions?: Permission[]

  // Optional dynamic check for nested routes or document-level access.
  // Return `true` to allow navigation.
  // Return `false` to redirect to `/forbidden`.
  check?: (ctx: { user: UserPublic; params: TRouteParams }) => boolean | Promise<boolean>

  // Where to send unauthenticated users.
  loginTo?: string

  // Where to send authenticated-but-unauthorized users.
  forbiddenTo?: string
}

export async function protectRoute<TRouteParams extends Record<string, any> = Record<string, any>>(args: {
  queryClient: QueryClient
  location: { href: string }
  params: TRouteParams
  options?: ProtectRouteOptions<TRouteParams>
}) {
  const {
    queryClient,
    location,
    params,
    options = {
      requireAuth: true,
      loginTo: '/login',
      forbiddenTo: '/forbidden',
    },
  } = args

  const requireAuth = options.requireAuth ?? true
  if (!requireAuth) return

  let me: MeResponse
  try {
    me = await queryClient.ensureQueryData(meQueryOptions())
  } catch {
    throw redirect({
      to: options.loginTo ?? '/login',
      search: {
        // `redirect` makes it easy to go back after login.
        redirect: location.href,
      },
    })
  }

  const user = me.data
  const roles = getUserRoles(user)
  const permissions = getUserPermissions(user)

  if (options.anyRole?.length) {
    const ok = options.anyRole.some((r) => roles.includes(r))
    if (!ok) {
      throw redirect({ to: options.forbiddenTo ?? '/forbidden' })
    }
  }

  if (options.allPermissions?.length) {
    const ok = options.allPermissions.every((p) => permissions.includes(p))
    if (!ok) {
      throw redirect({ to: options.forbiddenTo ?? '/forbidden' })
    }
  }

  if (options.check) {
    const ok = await options.check({ user, params })
    if (!ok) {
      throw redirect({ to: options.forbiddenTo ?? '/forbidden' })
    }
  }
}
