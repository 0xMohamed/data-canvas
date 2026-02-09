import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { useLogin } from '@/features/auth/hooks'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const login = useLogin()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border bg-background p-6">
        <div className="text-lg font-semibold">Login</div>
        <div className="mt-1 text-sm text-muted-foreground">Sign in to access your dashboard</div>

        <div className="mt-6 flex flex-col gap-3">
          <input
            className="h-10 rounded-md border bg-background px-3 text-sm"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="h-10 rounded-md border bg-background px-3 text-sm"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            disabled={login.isPending}
            onClick={async () => {
              await login.mutateAsync({ email, password })
              navigate({ to: '/dashboard' })
            }}
          >
            {login.isPending ? 'Signing in…' : 'Login'}
          </Button>

          {login.isError && (
            <div className="text-sm text-red-600">Failed to login</div>
          )}

          <button
            className="mt-2 text-sm text-muted-foreground underline"
            onClick={() => navigate({ to: '/signup' })}
            type="button"
          >
            Create an account
          </button>
        </div>
      </div>
    </div>
  )
}
