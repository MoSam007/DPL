"use client"

import * as React from "react"
import Link from "next/link"
import { Bell, Moon, Search, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import type { Alert } from "@/lib/types"

function NotificationDot({ severity }: { severity: Alert["severity"] }) {
  return (
    <div className={`size-2 rounded-full shrink-0 ${
      severity === "critical" ? "bg-destructive" : severity === "warning" ? "bg-warning" : "bg-primary"
    }`} />
  )
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function DashboardHeader() {
  const { setTheme, theme } = useTheme()
  const [notifications, setNotifications] = React.useState<Alert[]>([])

  React.useEffect(() => {
    fetch("/api/alerts?pageSize=3&severity=critical")
      .then((r) => r.json())
      .then((body) => {
        if (body.success) setNotifications(body.data?.data ?? [])
      })
      .catch(() => {})
  }, [])

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur-sm px-4 sticky top-0 z-30">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />

      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-full max-w-sm hidden sm:block">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search regions, crops, diseases..."
            className="pl-9 h-9 bg-muted/50 border-transparent focus:bg-background focus:border-input transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="size-4" />
              {notifications.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-pulse-dot">
                  {notifications.length}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span className="font-semibold">Notifications</span>
              {notifications.length > 0 && (
                <Badge variant="secondary" className="text-xs font-medium">
                  {notifications.length} new
                </Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                No critical alerts right now.
              </div>
            ) : (
              notifications.map((n) => (
                <DropdownMenuItem key={n.id} className="flex items-start gap-3 p-3 cursor-pointer">
                  <NotificationDot severity={n.severity} />
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{n.title}</span>
                      <span className="text-xs text-muted-foreground">{relativeTime(n.createdAt)}</span>
                    </div>
                    <span className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {n.message}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="justify-center text-sm font-medium text-primary cursor-pointer">
              <Link href="/alerts">View all notifications</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="mr-2 size-4" />Light
              {theme === "light" && <span className="ml-auto text-primary">&#10003;</span>}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="mr-2 size-4" />Dark
              {theme === "dark" && <span className="ml-auto text-primary">&#10003;</span>}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <Monitor className="mr-2 size-4" />System
              {theme === "system" && <span className="ml-auto text-primary">&#10003;</span>}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
