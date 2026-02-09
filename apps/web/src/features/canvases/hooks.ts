import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import * as canvasesApi from './api'

export function useCanvasesList(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['canvases', 'list', params],
    queryFn: () => canvasesApi.listCanvases(params),
  })
}

export function useCreateCanvas() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: canvasesApi.createCanvas,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['canvases', 'list'] })
    },
  })
}

export function useCanvas(canvasId: string) {
  return useQuery({
    queryKey: ['canvases', 'detail', canvasId],
    queryFn: () => canvasesApi.getCanvasWithBlocks(canvasId),
    enabled: Boolean(canvasId),
  })
}
