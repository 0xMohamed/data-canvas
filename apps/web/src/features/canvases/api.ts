import type { paths } from '@/api/schema'
import { api } from '@/lib/api/axios'

type ListCanvasesRes = paths['/canvases']['get']['responses']['200']['content']['application/json']
type CreateCanvasReq = NonNullable<paths['/canvases']['post']['requestBody']>['content']['application/json']
type CreateCanvasRes = paths['/canvases']['post']['responses']['201']['content']['application/json']

type GetCanvasRes = paths['/canvases/{id}']['get']['responses']['200']['content']['application/json']
type DeleteCanvasRes = paths['/canvases/{id}']['delete']['responses']['204']

type UpdateCanvasReq = NonNullable<paths['/canvases/{id}']['patch']['requestBody']>['content']['application/json']
type UpdateCanvasRes = paths['/canvases/{id}']['patch']['responses']['200']['content']['application/json']

export async function listCanvases(params?: { page?: number; limit?: number }) {
  const res = await api.get<ListCanvasesRes>('/canvases', { params })
  return res.data
}

export async function createCanvas(body: CreateCanvasReq) {
  const res = await api.post<CreateCanvasRes>('/canvases', body)
  return res.data
}

export async function getCanvasWithBlocks(canvasId: string) {
  const res = await api.get<GetCanvasRes>(`/canvases/${canvasId}`)
  return res.data
}

export async function deleteCanvas(canvasId: string) {
  const res = await api.delete<DeleteCanvasRes>(`/canvases/${canvasId}`)
  return res.data
}

export async function updateCanvas(canvasId: string, body: UpdateCanvasReq) {
  const res = await api.patch<UpdateCanvasRes>(`/canvases/${canvasId}`, body)
  return res.data
}
