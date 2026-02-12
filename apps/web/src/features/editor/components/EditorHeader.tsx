import { Link } from "@tanstack/react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout, useMe } from "@/features/auth/hooks";
import { useEditorStore } from "../state/editor.store";
import { cn } from "@/lib/utils";
import {
  Undo2,
  Redo2,
  Eye,
  ChevronLeft,
  Play,
  LogOut,
  Settings,
  Check,
  X,
  FileText,
  Share2,
  Download,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function EditorHeader() {
  const saveStatus = useEditorStore((s) => s.saveStatus);
  const undoStack = useEditorStore((s) => s.undoStack);
  const redoStack = useEditorStore((s) => s.redoStack);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const meta = useEditorStore((s) => s.meta);

  // OPTIONAL: لو عندك setter حقيقي للتايتل في الستور
  const setMetaTitle = (useEditorStore as any)((s: any) => s.setMetaTitle) as
    | ((title: string) => void)
    | undefined;

  const me = useMe();
  const logout = useLogout();

  const user = me.data?.data;
  const initials = user?.email ? user.email.substring(0, 2).toUpperCase() : "U";

  // Title editing
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(meta?.title ?? "Untitled");
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isEditingTitle) setTitleDraft(meta?.title ?? "Untitled");
  }, [meta?.title, isEditingTitle]);

  useEffect(() => {
    if (isEditingTitle) {
      requestAnimationFrame(() => {
        titleInputRef.current?.focus();
        titleInputRef.current?.select();
      });
    }
  }, [isEditingTitle]);

  const commitTitle = () => {
    const next = titleDraft.trim() || "Untitled";
    setIsEditingTitle(false);
    if (next === (meta?.title ?? "Untitled")) return;
    setMetaTitle?.(next);
  };

  const cancelTitle = () => {
    setIsEditingTitle(false);
    setTitleDraft(meta?.title ?? "Untitled");
  };

  const statusLabel =
    saveStatus === "saving"
      ? "Saving…"
      : saveStatus === "saved"
        ? "Saved"
        : saveStatus === "error"
          ? "Error"
          : "Idle";

  const statusDotClass =
    saveStatus === "saving"
      ? "bg-white/50 animate-pulse"
      : saveStatus === "saved"
        ? "bg-emerald-400/80"
        : saveStatus === "error"
          ? "bg-red-400/90"
          : "bg-white/20";

  // ✅ ONE TRUE ICON BUTTON STYLE (fix alignment)
  const iconBtn = cn(
    "w-9 h-9 p-0 rounded-lg",
    "grid place-items-center",
    "leading-none",
    "border border-white/10",
    "bg-transparent hover:bg-white/5",
    "text-[color:var(--text)]/70 hover:text-white",
    "focus-visible:ring-2 focus-visible:ring-white/15",
    "disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed",
    "cursor-pointer",
  );

  const icon = "h-5 w-5 block";

  // ---------------------------
  // ✅ Ephemeral Save Status logic
  // - show Saving only if it lasts > 300ms
  // - show Saved only if Saving was visible (prevents flicker)
  // - hide Saved after ~1.6s
  // - keep Error visible
  // ---------------------------
  const [showStatus, setShowStatus] = useState(false);
  const savingBecameVisibleRef = useRef(false);
  const savingDelayTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const clearTimers = () => {
      if (savingDelayTimerRef.current) {
        window.clearTimeout(savingDelayTimerRef.current);
        savingDelayTimerRef.current = null;
      }
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };

    clearTimers();

    if (saveStatus === "saving") {
      savingBecameVisibleRef.current = false;

      // ✅ delay showing "Saving…" to avoid flicker
      savingDelayTimerRef.current = window.setTimeout(() => {
        savingBecameVisibleRef.current = true;
        setShowStatus(true);
      }, 300);

      return clearTimers;
    }

    if (saveStatus === "saved") {
      // ✅ show "Saved" only if Saving was actually shown
      if (savingBecameVisibleRef.current) {
        setShowStatus(true);
        hideTimerRef.current = window.setTimeout(() => {
          setShowStatus(false);
          savingBecameVisibleRef.current = false;
        }, 1600);
      } else {
        setShowStatus(false);
      }
      return clearTimers;
    }

    if (saveStatus === "error") {
      setShowStatus(true);
      savingBecameVisibleRef.current = false;
      return clearTimers;
    }

    // idle
    setShowStatus(false);
    savingBecameVisibleRef.current = false;
    return clearTimers;
  }, [saveStatus]);

  return (
    <div
      className={cn(
        "sticky top-0 z-40",
        "px-3 py-2",
        "border-b border-white/10",
        "bg-black/40 backdrop-blur-md",
      )}
    >
      <div className="flex items-center gap-2">
        {/* Back */}
        <Link
          to="/dashboard"
          className={cn(
            "flex items-center gap-1",
            "text-sm text-[color:var(--text)]/80 hover:text-white",
            "rounded-lg px-2 py-1 hover:bg-white/5",
          )}
          title="Back to dashboard"
        >
          <ChevronLeft className={icon} />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>

        {/* Doc title */}
        <div className="flex items-center gap-2 min-w-0">
          <FileText
            className={cn(icon, "text-[color:var(--text)]/50 shrink-0")}
          />

          {!isEditingTitle ? (
            <button
              type="button"
              className={cn(
                "min-w-0 max-w-[42vw] sm:max-w-[520px]",
                "text-sm font-medium truncate",
                "text-[color:var(--text)] hover:text-white",
                "rounded-lg px-2 py-1 hover:bg-white/5",
                "text-left",
              )}
              onClick={() => setIsEditingTitle(true)}
              title="Click to rename"
            >
              {meta?.title ?? "Untitled"}
            </button>
          ) : (
            <div className="flex items-center gap-1 min-w-0">
              <input
                ref={titleInputRef}
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                className={cn(
                  "min-w-0 w-[260px] max-w-[42vw] sm:w-[360px]",
                  "bg-transparent text-sm outline-none rounded-lg px-2 py-1",
                  "ring-1 ring-white/15 focus:ring-2 focus:ring-[color:var(--accent)]/60",
                  "text-[color:var(--text)]",
                )}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitTitle();
                  if (e.key === "Escape") cancelTitle();
                }}
                onBlur={commitTitle}
              />

              <button
                type="button"
                className={iconBtn}
                onClick={commitTitle}
                title="Save title"
                aria-label="Save title"
              >
                <Check className={icon} />
              </button>

              <button
                type="button"
                className={iconBtn}
                onClick={cancelTitle}
                title="Cancel"
                aria-label="Cancel"
              >
                <X className={icon} />
              </button>
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          {/* Save status (ephemeral) */}
          <div
            className={cn(
              "hidden sm:flex items-center",
              "transition-all duration-200",
              showStatus
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-1 pointer-events-none w-0 overflow-hidden",
            )}
            aria-live="polite"
          >
            <div
              className={cn(
                "flex items-center gap-2",
                "h-9 rounded-lg px-3",
                "border border-white/10 bg-white/[0.03]",
              )}
              title={statusLabel}
            >
              <span className={cn("h-2 w-2 rounded-full", statusDotClass)} />
              <span className="text-xs text-[color:var(--text)]/60 whitespace-nowrap">
                {statusLabel}
              </span>
            </div>
          </div>

          {/* Group 1: history */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => undo()}
              disabled={undoStack.length === 0}
              className={iconBtn}
              title="Undo (Ctrl/⌘ Z)"
              aria-label="Undo"
            >
              <Undo2 className={icon} />
            </button>

            <button
              type="button"
              onClick={() => redo()}
              disabled={redoStack.length === 0}
              className={iconBtn}
              title="Redo (Ctrl/⌘ Shift Z)"
              aria-label="Redo"
            >
              <Redo2 className={icon} />
            </button>
          </div>

          {/* Divider */}
          <div className="mx-1 h-6 w-px bg-white/10" />

          {/* Group 2: mode + share/export + account */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={iconBtn}
              disabled
              title="Share (coming soon)"
              aria-label="Share (coming soon)"
            >
              <Share2 className={icon} />
            </button>

            <button
              type="button"
              className={iconBtn}
              disabled
              title="Export (coming soon)"
              aria-label="Export (coming soon)"
            >
              <Download className={icon} />
            </button>

            <button
              type="button"
              className={iconBtn}
              title="Present"
              aria-label="Present"
            >
              <Play className={icon} />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "h-9 w-9 rounded-lg",
                    "grid place-items-center p-0 leading-none",
                    "border border-white/10",
                    "bg-white/[0.04] hover:bg-white/5",
                    "text-[color:var(--text)]/80 hover:text-white",
                    "text-xs font-semibold",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/15",
                    "cursor-pointer",
                  )}
                  title={user?.email ?? "Account"}
                  aria-label="Account"
                >
                  {initials}
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className={cn(
                  "w-56 rounded-2xl p-2",
                  "bg-black/40 backdrop-blur-md border border-white/10",
                  "text-[color:var(--text)] shadow-xl",
                )}
              >
                <DropdownMenuLabel className="px-2 py-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Account</p>
                    <p className="text-xs leading-none text-[color:var(--text)]/60">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="bg-white/10" />

                <DropdownMenuItem disabled className="rounded-xl">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-white/10" />

                <DropdownMenuItem
                  className="rounded-xl text-red-400 focus:text-red-300 cursor-pointer"
                  onClick={() => logout.mutate()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
