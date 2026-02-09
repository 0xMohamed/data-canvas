import type { paths } from '@/api/schema'
import { api } from '@/lib/api/axios'

type CreateBlockReq = NonNullable<paths['/canvases/{id}/blocks']['post']['requestBody']>['content']['application/json']
type CreateBlockRes = paths['/canvases/{id}/blocks']['post']['responses']['201']['content']['application/json']

type BulkUpdateReq = NonNullable<paths['/canvases/{id}/blocks']['patch']['requestBody']>['content']['application/json']
type BulkUpdateRes = paths['/canvases/{id}/blocks']['patch']['responses']['200']['content']['application/json']

type UpdateBlockReq = NonNullable<paths['/blocks/{blockId}']['patch']['requestBody']>['content']['application/json']
type UpdateBlockRes = paths['/blocks/{blockId}']['patch']['responses']['200']['content']['application/json']

type DeleteBlockRes = paths['/blocks/{blockId}']['delete']['responses']['204']

export async function createBlock(canvasId: string, body: CreateBlockReq) {
  const res = await api.post<CreateBlockRes>(`/canvases/${canvasId}/blocks`, body)
  return res.data
}

export async function bulkUpdateBlocks(canvasId: string, body: BulkUpdateReq) {
  const res = await api.patch<BulkUpdateRes>(`/canvases/${canvasId}/blocks`, body)
  return res.data
}

export async function updateBlock(blockId: string, body: UpdateBlockReq) {
  const res = await api.patch<UpdateBlockRes>(`/blocks/${blockId}`, body)
  return res.data
}

export async function deleteBlock(blockId: string) {
  const res = await api.delete<DeleteBlockRes>(`/blocks/${blockId}`)
  return res.data
}
