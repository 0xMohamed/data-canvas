import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut, Plus } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FullPageSpinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLogout, useMe } from "@/features/auth/hooks";
import { protectRoute } from "@/features/auth/routeProtection";
import {
  useDocumentsList,
  useCreateDocument,
  useDeleteDocument,
} from "@/features/documents/hooks";
import type { DocumentMeta } from "@/features/documents/api";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async ({ context, location }) => {
    await protectRoute({
      queryClient: context.queryClient,
      location,
      params: {},
    });
  },
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const me = useMe();
  const logout = useLogout();

  const documents = useDocumentsList({ page: 1, limit: 20 });
  const create = useCreateDocument();
  const deleteDoc = useDeleteDocument();

  const [title, setTitle] = useState("");

  if (me.isLoading || documents.isLoading)
    return <FullPageSpinner label="Loading…" />;

  const user = me.data?.data;
  const initials = (user?.name ?? user?.email ?? "U").slice(0, 2).toUpperCase();

  const items = documents.data?.data?.items ?? [];

  return (
    <AppShell
      header={
        <>
          <div>
            <div className="text-base font-semibold tracking-tight">Dashboard</div>
            <div className="text-xs text-muted-foreground">Manage your documents</div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-black/30 text-xs font-semibold">
                {initials}
              </div>
              <div className="hidden sm:flex flex-col leading-tight">
                <div className="text-sm font-medium">{user?.name ?? "User"}</div>
                <div className="text-xs text-muted-foreground">{user?.email}</div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={logout.isPending}
              onClick={async () => {
                await logout.mutateAsync();
                qc.removeQueries({ queryKey: ["auth", "me"] });
                navigate({ to: "/login", search: { redirect: undefined } });
              }}
            >
              <LogOut className="h-4 w-4" />
              {logout.isPending ? "Signing out…" : "Logout"}
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create document</DialogTitle>
                </DialogHeader>

                <div className="mt-2">
                  <Input
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    autoComplete="off"
                  />
                </div>

                <DialogFooter>
                  <Button
                    disabled={create.isPending || !title.trim()}
                    onClick={async () => {
                      const res = await create.mutateAsync({
                        title: title.trim(),
                        description: null,
                        isPublic: false,
                      });
                      const id = res?.data?.id;
                      if (id) {
                        navigate({
                          to: "/editor/$documentId",
                          params: { documentId: id },
                        });
                      }
                    }}
                  >
                    {create.isPending ? "Creating…" : "Create"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((doc: DocumentMeta) => (
          <div
            key={doc.id}
            className={cn(
              "group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/20 shadow-lg backdrop-blur",
            )}
          >
            <button
              className={cn(
                "flex flex-1 flex-col text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/15",
              )}
              onClick={() =>
                navigate({
                  to: "/editor/$documentId",
                  params: { documentId: doc.id },
                })
              }
              type="button"
            >
              <div className="aspect-video w-full bg-white/5 p-4 transition-colors group-hover:bg-white/10">
                <div className="h-full w-full rounded-xl border border-dashed border-white/10 bg-black/10" />
              </div>
              <div className="flex flex-col gap-1 p-4">
                <div className="font-semibold leading-none tracking-tight">
                  {doc.title}
                </div>
                <div className="text-xs text-muted-foreground">
                  {doc.description ?? "No description"}
                </div>
                <div className="mt-2 text-[10px] text-muted-foreground/60">
                  Updated{" "}
                  {new Date(
                    doc.updatedAt ?? doc.createdAt ?? new Date().toISOString(),
                  ).toLocaleDateString()}
                </div>
              </div>
            </button>

            <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                variant="outline"
                className="hover:bg-white/5"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm("Delete this document?")) {
                    deleteDoc.mutate(doc.id);
                  }
                }}
                disabled={deleteDoc.isPending}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
