import { createFileRoute } from "@tanstack/react-router";
import { protectRoute } from "@/features/auth/routeProtection";
import { FullPageSpinner } from "@/components/ui/spinner";
import { EditorCanvas } from "@/features/editor";
import { getDocument } from "@/features/editor/api/documents.api";
import { useDocument } from "@/features/editor/hooks/useDocument";

export const Route = createFileRoute("/editor/$documentId")({
  beforeLoad: async ({ context, location, params }) => {
    await protectRoute({
      queryClient: context.queryClient,
      location,
      params,
    });

    // Prefetch the document so the editor loads quickly after the auth guard passes.
    await context.queryClient.ensureQueryData({
      queryKey: ["documents", params.documentId],
      queryFn: () => getDocument(params.documentId),
    });
  },
  component: EditorDocumentRoute,
});

function EditorDocumentRoute() {
  const { documentId } = Route.useParams();
  const documentQuery = useDocument(documentId);

  if (documentQuery.isLoading) return <FullPageSpinner label="Loading document…" />;
  if (documentQuery.isError)
    return <div className="p-6">Failed to load document</div>;

  return <EditorCanvas />;
}
