import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { useRegister } from '@/features/auth/hooks'

export const Route = createFileRoute('/signup')({
  component: SignupPage,
})

function SignupPage() {
  const navigate = useNavigate()
  const register = useRegister()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border bg-background p-6">
        <div className="text-lg font-semibold">Create account</div>
        <div className="mt-1 text-sm text-muted-foreground">Sign up to start creating canvases</div>

        <div className="mt-6 flex flex-col gap-3">
          <input
            className="h-10 rounded-md border bg-background px-3 text-sm"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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
            disabled={register.isPending}
            onClick={async () => {
              await register.mutateAsync({ name, email, password })
              navigate({ to: '/login' })
            }}
          >
            {register.isPending ? 'Creating…' : 'Sign up'}
          </Button>

          {register.isError && (
            <div className="text-sm text-red-600">Failed to sign up</div>
          )}

          <button
            className="mt-2 text-sm text-muted-foreground underline"
            onClick={() => navigate({ to: '/login' })}
            type="button"
          >
            Already have an account?
          </button>
        </div>
      </div>
    </div>
  )
}
