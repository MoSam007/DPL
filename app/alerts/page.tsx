"use client"

import * as React from "react"
import {
  Bell, AlertTriangle, AlertCircle, Info, CheckCircle2, X,
  Filter, Settings, Archive, Trash2, MoreHorizontal, Clock,
  MapPin, Leaf, Thermometer, Mail, MessageSquare, Smartphone, Loader2,
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { Alert as ApiAlert, AlertSeverity, PaginatedResponse } from "@/lib/types"

// ---------------------------------------------------------------------------
// Local alert shape (extends API type with client-only `read` state)
// ---------------------------------------------------------------------------

interface LocalAlert extends ApiAlert {
  read: boolean
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins} min ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function AlertIcon({ severity }: { severity: AlertSeverity }) {
  if (severity === "critical") return <AlertTriangle className="size-5 text-destructive" />
  if (severity === "warning") return <AlertCircle className="size-5 text-warning" />
  if (severity === "success") return <CheckCircle2 className="size-5 text-success" />
  return <Info className="size-5 text-primary" />
}

function AlertBadge({ severity }: { severity: AlertSeverity }) {
  const cls = {
    critical: "border-destructive/50 bg-destructive/10 text-destructive",
    warning: "border-warning/50 bg-warning/10 text-warning-foreground",
    info: "border-primary/50 bg-primary/10 text-primary",
    success: "border-success/50 bg-success/10 text-success",
  }
  return <Badge variant="outline" className={cn("capitalize", cls[severity])}>{severity}</Badge>
}

function CategoryIcon({ category }: { category: string }) {
  if (category === "disease") return <Leaf className="size-4" />
  if (category === "weather") return <Thermometer className="size-4" />
  return <Settings className="size-4" />
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AlertsPage() {
  const [alertList, setAlertList] = React.useState<LocalAlert[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selectedAlerts, setSelectedAlerts] = React.useState<string[]>([])
  const [filterType, setFilterType] = React.useState("all")

  // Load from API on mount
  React.useEffect(() => {
    fetch("/api/alerts?pageSize=50")
      .then((r) => r.json())
      .then((body) => {
        if (body.success) {
          const data = (body.data as PaginatedResponse<ApiAlert>).data
          setAlertList(data.map((a) => ({ ...a, read: false })))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const unreadCount = alertList.filter((a) => !a.read).length
  const criticalCount = alertList.filter((a) => a.severity === "critical").length

  const filteredAlerts = alertList.filter((a) => {
    if (filterType === "all") return true
    if (filterType === "unread") return !a.read
    if (filterType === "action") return a.actionRequired
    return a.severity === filterType
  })

  const markAsRead = (id: string) =>
    setAlertList((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)))

  const markAllAsRead = () =>
    setAlertList((prev) => prev.map((a) => ({ ...a, read: true })))

  const deleteAlert = (id: string) => {
    setAlertList((prev) => prev.filter((a) => a.id !== id))
    setSelectedAlerts((prev) => prev.filter((sid) => sid !== id))
  }

  const deleteSelected = () => {
    setAlertList((prev) => prev.filter((a) => !selectedAlerts.includes(a.id)))
    setSelectedAlerts([])
  }

  const toggleSelect = (id: string) =>
    setSelectedAlerts((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id])

  const selectAll = () =>
    setSelectedAlerts(selectedAlerts.length === filteredAlerts.length ? [] : filteredAlerts.map((a) => a.id))

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Alerts & Notifications</h1>
            <p className="text-muted-foreground">Manage disease alerts, system notifications, and preferences</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
              <CheckCircle2 className="mr-2 size-4" />Mark All Read
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="mr-2 size-4" />Preferences
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Alerts", value: alertList.length, icon: <Bell className="size-5 text-muted-foreground" />, cls: "bg-muted" },
            { label: "Unread", value: unreadCount, icon: <Mail className="size-5 text-primary" />, cls: "bg-primary/10" },
            { label: "Critical", value: criticalCount, icon: <AlertTriangle className="size-5 text-destructive" />, cls: "bg-destructive/20", cardCls: "border-destructive/20 bg-destructive/5", textCls: "text-destructive" },
            { label: "Action Required", value: alertList.filter((a) => a.actionRequired).length, icon: <Clock className="size-5 text-warning" />, cls: "bg-warning/10" },
          ].map((s) => (
            <Card key={s.label} className={s.cardCls}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className={cn("text-2xl font-bold", s.textCls)}>
                      {loading ? "—" : s.value}
                    </p>
                  </div>
                  <div className={cn("size-10 rounded-full flex items-center justify-center", s.cls)}>
                    {s.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-4">
            {/* Toolbar */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="select-all"
                      checked={filteredAlerts.length > 0 && selectedAlerts.length === filteredAlerts.length}
                      onCheckedChange={selectAll}
                    />
                    <Label htmlFor="select-all" className="text-sm cursor-pointer">Select All</Label>
                    {selectedAlerts.length > 0 && (
                      <>
                        <Separator orientation="vertical" className="h-4" />
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                          <Archive className="mr-2 size-4" />Archive ({selectedAlerts.length})
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={deleteSelected}>
                          <Trash2 className="mr-2 size-4" />Delete ({selectedAlerts.length})
                        </Button>
                      </>
                    )}
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[160px]">
                      <Filter className="mr-2 size-4" /><SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Alerts</SelectItem>
                      <SelectItem value="unread">Unread</SelectItem>
                      <SelectItem value="action">Action Required</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Alert Items */}
            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  {loading ? (
                    <div className="flex items-center justify-center py-20 gap-2">
                      <Loader2 className="size-5 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">Loading alerts…</span>
                    </div>
                  ) : filteredAlerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Bell className="size-12 text-muted-foreground/50 mb-4" />
                      <h3 className="font-medium">No alerts found</h3>
                      <p className="text-sm text-muted-foreground">No alerts match your current filter.</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredAlerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={cn("p-4 transition-colors hover:bg-muted/30", !alert.read && "bg-muted/20")}
                        >
                          <div className="flex items-start gap-4">
                            <Checkbox
                              checked={selectedAlerts.includes(alert.id)}
                              onCheckedChange={() => toggleSelect(alert.id)}
                              className="mt-1"
                            />
                            <div className={cn(
                              "size-10 rounded-full flex items-center justify-center shrink-0",
                              alert.severity === "critical" && "bg-destructive/10",
                              alert.severity === "warning" && "bg-warning/10",
                              alert.severity === "info" && "bg-primary/10",
                              alert.severity === "success" && "bg-success/10"
                            )}>
                              <AlertIcon severity={alert.severity} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h3 className={cn("font-medium", !alert.read && "font-semibold")}>{alert.title}</h3>
                                <AlertBadge severity={alert.severity} />
                                {alert.actionRequired && (
                                  <Badge variant="outline" className="border-warning/50 bg-warning/10 text-warning-foreground">
                                    Action Required
                                  </Badge>
                                )}
                                {!alert.read && <div className="size-2 rounded-full bg-primary" />}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{alert.message}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                {alert.region && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="size-3" />{alert.region.name}
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <CategoryIcon category={alert.category} />
                                  <span className="capitalize">{alert.category}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="size-3" />{relativeTime(alert.createdAt)}
                                </div>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-8">
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {!alert.read && (
                                  <DropdownMenuItem onClick={() => markAsRead(alert.id)}>
                                    <CheckCircle2 className="mr-2 size-4" />Mark as Read
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem>
                                  <Archive className="mr-2 size-4" />Archive
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive" onClick={() => deleteAlert(alert.id)}>
                                  <Trash2 className="mr-2 size-4" />Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Notification Preferences */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notification Preferences</CardTitle>
                <CardDescription>Configure how you receive alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Alert Types</h4>
                  <div className="space-y-3">
                    {[
                      { id: "critical", label: "Critical", icon: <AlertTriangle className="size-4 text-destructive" />, def: true },
                      { id: "warning", label: "Warning", icon: <AlertCircle className="size-4 text-warning" />, def: true },
                      { id: "info", label: "Info", icon: <Info className="size-4 text-primary" />, def: true },
                      { id: "success", label: "Success", icon: <CheckCircle2 className="size-4 text-success" />, def: false },
                    ].map((t) => (
                      <div key={t.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {t.icon}
                          <Label htmlFor={t.id} className="text-sm cursor-pointer">{t.label}</Label>
                        </div>
                        <Switch id={t.id} defaultChecked={t.def} />
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Delivery Channels</h4>
                  <div className="space-y-3">
                    {[
                      { id: "email", label: "Email", icon: <Mail className="size-4" />, def: true },
                      { id: "push", label: "Push Notifications", icon: <Smartphone className="size-4" />, def: true },
                      { id: "sms", label: "SMS", icon: <MessageSquare className="size-4" />, def: false },
                    ].map((c) => (
                      <div key={c.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {c.icon}
                          <Label htmlFor={c.id} className="text-sm cursor-pointer">{c.label}</Label>
                        </div>
                        <Switch id={c.id} defaultChecked={c.def} />
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Quiet Hours</h4>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="quiet" className="text-sm cursor-pointer">Enable Quiet Hours</Label>
                    <Switch id="quiet" />
                  </div>
                  <p className="text-xs text-muted-foreground">Critical alerts will still be delivered.</p>
                </div>
                <Button className="w-full" variant="outline" size="sm">Save Preferences</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
