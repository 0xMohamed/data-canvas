import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useState } from 'react'

import type { paths } from '@/api/schema'
import { AppTopBar } from '@/components/layout/AppTopBar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useMe } from '@/features/auth/hooks'
import { useCanvasesList, useCreateCanvas } from '@/features/canvases/hooks'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const navigate = useNavigate()
  const me = useMe()

  const canvases = useCanvasesList({ page: 1, limit: 20 })
  const create = useCreateCanvas()

  type CreateCanvasRes =
    paths['/canvases']['post']['responses']['201']['content']['application/json']
  type ListCanvasesRes =
    paths['/canvases']['get']['responses']['200']['content']['application/json']
  type CanvasItem = NonNullable<ListCanvasesRes['data']>['items'][number]

  const [title, setTitle] = useState('')

  if (me.isLoading) return <div className="p-6">Loading…</div>

  if (me.isError) {
    navigate({ to: '/login' })
    return null
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/5">
      <AppTopBar />

      <main className="mx-auto w-full max-w-5xl p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xl font-semibold tracking-tight">Dashboard</div>
            <div className="text-sm text-muted-foreground">
              Manage your canvases
            </div>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create canvas
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create canvas</DialogTitle>
              </DialogHeader>

              <div className="mt-2">
                <input
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <DialogFooter>
                <Button
                  disabled={create.isPending || !title.trim()}
                  onClick={async () => {
                    const res = (await create.mutateAsync({
                      title: title.trim(),
                      description: null,
                      isPublic: false,
                    })) as CreateCanvasRes
                    const id = res?.data?.id
                    if (id) {
                      navigate({
                        to: '/editor/$canvasId',
                        params: { canvasId: id },
                      })
                    }
                  }}
                >
                  {create.isPending ? 'Creating…' : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(canvases.data as ListCanvasesRes | undefined)?.data?.items?.map(
            (c: CanvasItem) => (
              <button
                key={c.id}
                className={cn(
                  'group relative flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                )}
                onClick={() =>
                  navigate({ to: '/editor/$canvasId', params: { canvasId: c.id } })
                }
                type="button"
              >
                <div className="aspect-video w-full bg-muted/20 p-4 transition-colors group-hover:bg-muted/30">
                  <div className="h-full w-full rounded-lg border border-dashed border-border/50 bg-background/50" />
                </div>
                <div className="flex flex-col gap-1 p-4 text-left">
                  <div className="font-semibold leading-none tracking-tight">
                    {c.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {c.description ?? 'No description'}
                  </div>
                  <div className="mt-2 text-[10px] text-muted-foreground/60">
                    Updated{' '}
                    {new Date(
                      (c as { updatedAt?: string; createdAt?: string }).updatedAt ??
                        (c as { updatedAt?: string; createdAt?: string }).createdAt ??
                        new Date().toISOString(),
                    ).toLocaleDateString()}
                  </div>
                </div>
              </button>
            ),
          )}
        </div>
      </main>
    </div>
  )
}
