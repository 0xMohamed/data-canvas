import { createFileRoute } from '@tanstack/react-router'
import { SlideEditor } from '../../features/editor'

export const Route = createFileRoute('/editor')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SlideEditor />
}
