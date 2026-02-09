import {
  ArrowBigLeft,
  ChevronLeft,
  Ellipsis,
  LogOut,
  Play,
  Settings,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMe, useLogout } from "@/features/auth/hooks";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

export function AppTopBar({
  className,
  children,
  showUserMenu = true,
  onEnterPublic,
}: {
  className?: string;
  children?: React.ReactNode;
  showUserMenu?: boolean;
}) {
  const me = useMe();
  const logout = useLogout();

  const user = me.data?.data;
  const initials = user?.email ? user.email.substring(0, 2).toUpperCase() : "U";

  return (
    <header
      className={cn(
        "fixed flex w-full items-center justify-between bg-background p-6 px-4",
        className
      )}
    >
      <div className="flex items-center">
        <Link to="/dashboard" className="text-sm font-bold tracking-tight">
          <ChevronLeft />
        </Link>
        {children}
      </div>

      {showUserMenu && (
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black font-bold text-xs text-primary hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {initials}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Account</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => logout.mutate()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            size="icon"
            className={cn(
              "h-8 w-8 bg-background/95 shadow-sm",
              "hover:border-primary/50"
            )}
          >
            <Ellipsis className="!size-6" />
          </Button>
          <Button
            size="icon"
            className={cn(
              "h-8 w-8 bg-background/95 shadow-sm",
              "hover:border-primary/50"
            )}
            onClick={onEnterPublic}
          >
            <Play className="!size-6" />
          </Button>
        </div>
      )}
    </header>
  );
}
