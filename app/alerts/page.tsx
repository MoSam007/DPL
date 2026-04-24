"use client"

import * as React from "react"
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  X,
  Filter,
  Settings,
  Archive,
  Trash2,
  MoreHorizontal,
  Clock,
  MapPin,
  Leaf,
  Thermometer,
  Droplets,
  Mail,
  MessageSquare,
  Smartphone,
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface Alert {
  id: string
  type: "critical" | "warning" | "info" | "success"
  title: string
  message: string
  region: string
  timestamp: string
  read: boolean
  actionRequired: boolean
  category: string
}

const alerts: Alert[] = [
  {
    id: "1",
    type: "critical",
    title: "Late Blight Outbreak Detected",
    message: "High confidence detection in Northern Plains. Immediate fungicide application recommended within 24 hours.",
    region: "Northern Plains",
    timestamp: "10 minutes ago",
    read: false,
    actionRequired: true,
    category: "disease",
  },
  {
    id: "2",
    type: "critical",
    title: "Bacterial Wilt Spreading",
    message: "Rapid spread detected in Southern Basin. Isolate affected plants and implement containment measures.",
    region: "Southern Basin",
    timestamp: "25 minutes ago",
    read: false,
    actionRequired: true,
    category: "disease",
  },
  {
    id: "3",
    type: "warning",
    title: "High Humidity Alert",
    message: "Humidity levels exceeding 85% in River Delta region. Favorable conditions for fungal diseases.",
    region: "River Delta",
    timestamp: "1 hour ago",
    read: false,
    actionRequired: false,
    category: "weather",
  },
  {
    id: "4",
    type: "warning",
    title: "Powdery Mildew Risk Elevated",
    message: "Conditions favorable for powdery mildew development in Central Valley. Monitor closely.",
    region: "Central Valley",
    timestamp: "2 hours ago",
    read: true,
    actionRequired: false,
    category: "disease",
  },
  {
    id: "5",
    type: "info",
    title: "Scheduled Drone Survey",
    message: "Automated drone survey scheduled for Western Ridge tomorrow at 06:00 AM.",
    region: "Western Ridge",
    timestamp: "3 hours ago",
    read: true,
    actionRequired: false,
    category: "system",
  },
  {
    id: "6",
    type: "success",
    title: "Disease Contained Successfully",
    message: "Rust outbreak in Eastern Hills has been successfully contained following treatment.",
    region: "Eastern Hills",
    timestamp: "5 hours ago",
    read: true,
    actionRequired: false,
    category: "disease",
  },
  {
    id: "7",
    type: "info",
    title: "New Satellite Data Available",
    message: "Latest satellite imagery processed for all monitored regions. View updated risk maps.",
    region: "All Regions",
    timestamp: "6 hours ago",
    read: true,
    actionRequired: false,
    category: "system",
  },
  {
    id: "8",
    type: "warning",
    title: "Soil Moisture Below Threshold",
    message: "Soil moisture levels dropping in Mountain Foothills. Consider irrigation scheduling.",
    region: "Mountain Foothills",
    timestamp: "8 hours ago",
    read: true,
    actionRequired: false,
    category: "weather",
  },
  {
    id: "9",
    type: "info",
    title: "Weekly Report Generated",
    message: "Your weekly disease prediction report is ready for download.",
    region: "All Regions",
    timestamp: "1 day ago",
    read: true,
    actionRequired: false,
    category: "system",
  },
  {
    id: "10",
    type: "success",
    title: "Preventive Treatment Completed",
    message: "Scheduled preventive treatment successfully applied in Coastal Region.",
    region: "Coastal Region",
    timestamp: "1 day ago",
    read: true,
    actionRequired: false,
    category: "disease",
  },
]

function AlertIcon({ type }: { type: Alert["type"] }) {
  switch (type) {
    case "critical":
      return <AlertTriangle className="size-5 text-destructive" />
    case "warning":
      return <AlertCircle className="size-5 text-warning" />
    case "info":
      return <Info className="size-5 text-primary" />
    case "success":
      return <CheckCircle2 className="size-5 text-success" />
  }
}

function AlertBadge({ type }: { type: Alert["type"] }) {
  const variants = {
    critical: "border-destructive/50 bg-destructive/10 text-destructive",
    warning: "border-warning/50 bg-warning/10 text-warning-foreground",
    info: "border-primary/50 bg-primary/10 text-primary",
    success: "border-success/50 bg-success/10 text-success",
  }

  return (
    <Badge variant="outline" className={cn("capitalize", variants[type])}>
      {type}
    </Badge>
  )
}

function CategoryIcon({ category }: { category: string }) {
  switch (category) {
    case "disease":
      return <Leaf className="size-4" />
    case "weather":
      return <Thermometer className="size-4" />
    case "system":
      return <Settings className="size-4" />
    default:
      return <Info className="size-4" />
  }
}

export default function AlertsPage() {
  const [selectedAlerts, setSelectedAlerts] = React.useState<string[]>([])
  const [filterType, setFilterType] = React.useState("all")
  const [alertList, setAlertList] = React.useState(alerts)

  const unreadCount = alertList.filter((a) => !a.read).length
  const criticalCount = alertList.filter((a) => a.type === "critical").length

  const filteredAlerts = alertList.filter((alert) => {
    if (filterType === "all") return true
    if (filterType === "unread") return !alert.read
    if (filterType === "action") return alert.actionRequired
    return alert.type === filterType
  })

  const markAsRead = (id: string) => {
    setAlertList((prev) =>
      prev.map((alert) => (alert.id === id ? { ...alert, read: true } : alert))
    )
  }

  const markAllAsRead = () => {
    setAlertList((prev) => prev.map((alert) => ({ ...alert, read: true })))
  }

  const deleteAlert = (id: string) => {
    setAlertList((prev) => prev.filter((alert) => alert.id !== id))
    setSelectedAlerts((prev) => prev.filter((alertId) => alertId !== id))
  }

  const toggleSelectAlert = (id: string) => {
    setSelectedAlerts((prev) =>
      prev.includes(id) ? prev.filter((alertId) => alertId !== id) : [...prev, id]
    )
  }

  const selectAll = () => {
    if (selectedAlerts.length === filteredAlerts.length) {
      setSelectedAlerts([])
    } else {
      setSelectedAlerts(filteredAlerts.map((a) => a.id))
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-balance">Alerts & Notifications</h1>
            <p className="text-muted-foreground">
              Manage disease alerts, system notifications, and preferences
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCircle2 className="mr-2 size-4" />
              Mark All Read
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="mr-2 size-4" />
              Preferences
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Alerts</p>
                  <p className="text-2xl font-bold">{alertList.length}</p>
                </div>
                <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                  <Bell className="size-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Unread</p>
                  <p className="text-2xl font-bold">{unreadCount}</p>
                </div>
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="size-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical</p>
                  <p className="text-2xl font-bold text-destructive">{criticalCount}</p>
                </div>
                <div className="size-10 rounded-full bg-destructive/20 flex items-center justify-center">
                  <AlertTriangle className="size-5 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Action Required</p>
                  <p className="text-2xl font-bold">{alertList.filter((a) => a.actionRequired).length}</p>
                </div>
                <div className="size-10 rounded-full bg-warning/10 flex items-center justify-center">
                  <Clock className="size-5 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Alerts List */}
          <div className="lg:col-span-3 space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="select-all"
                      checked={selectedAlerts.length === filteredAlerts.length && filteredAlerts.length > 0}
                      onCheckedChange={selectAll}
                    />
                    <Label htmlFor="select-all" className="text-sm cursor-pointer">
                      Select All
                    </Label>
                    {selectedAlerts.length > 0 && (
                      <>
                        <Separator orientation="vertical" className="h-4" />
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                          <Archive className="mr-2 size-4" />
                          Archive ({selectedAlerts.length})
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="mr-2 size-4" />
                          Delete ({selectedAlerts.length})
                        </Button>
                      </>
                    )}
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[160px]">
                      <Filter className="mr-2 size-4" />
                      <SelectValue placeholder="Filter" />
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
                  <div className="divide-y">
                    {filteredAlerts.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Bell className="size-12 text-muted-foreground/50 mb-4" />
                        <h3 className="font-medium">No alerts found</h3>
                        <p className="text-sm text-muted-foreground">
                          No alerts match your current filter criteria.
                        </p>
                      </div>
                    ) : (
                      filteredAlerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={cn(
                            "p-4 transition-colors hover:bg-muted/30",
                            !alert.read && "bg-muted/20"
                          )}
                        >
                          <div className="flex items-start gap-4">
                            <Checkbox
                              checked={selectedAlerts.includes(alert.id)}
                              onCheckedChange={() => toggleSelectAlert(alert.id)}
                              className="mt-1"
                            />
                            <div
                              className={cn(
                                "size-10 rounded-full flex items-center justify-center shrink-0",
                                alert.type === "critical" && "bg-destructive/10",
                                alert.type === "warning" && "bg-warning/10",
                                alert.type === "info" && "bg-primary/10",
                                alert.type === "success" && "bg-success/10"
                              )}
                            >
                              <AlertIcon type={alert.type} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h3 className={cn("font-medium", !alert.read && "font-semibold")}>
                                  {alert.title}
                                </h3>
                                <AlertBadge type={alert.type} />
                                {alert.actionRequired && (
                                  <Badge variant="outline" className="border-warning/50 bg-warning/10 text-warning-foreground">
                                    Action Required
                                  </Badge>
                                )}
                                {!alert.read && (
                                  <div className="size-2 rounded-full bg-primary" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                {alert.message}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <MapPin className="size-3" />
                                  {alert.region}
                                </div>
                                <div className="flex items-center gap-1">
                                  <CategoryIcon category={alert.category} />
                                  <span className="capitalize">{alert.category}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="size-3" />
                                  {alert.timestamp}
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
                                    <CheckCircle2 className="mr-2 size-4" />
                                    Mark as Read
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem>
                                  <Archive className="mr-2 size-4" />
                                  Archive
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => deleteAlert(alert.id)}
                                >
                                  <Trash2 className="mr-2 size-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Notification Preferences */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notification Preferences</CardTitle>
                <CardDescription>
                  Configure how you receive alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Alert Types</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="size-4 text-destructive" />
                        <Label htmlFor="critical" className="text-sm cursor-pointer">
                          Critical
                        </Label>
                      </div>
                      <Switch id="critical" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="size-4 text-warning" />
                        <Label htmlFor="warning" className="text-sm cursor-pointer">
                          Warning
                        </Label>
                      </div>
                      <Switch id="warning" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Info className="size-4 text-primary" />
                        <Label htmlFor="info" className="text-sm cursor-pointer">
                          Info
                        </Label>
                      </div>
                      <Switch id="info" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-success" />
                        <Label htmlFor="success" className="text-sm cursor-pointer">
                          Success
                        </Label>
                      </div>
                      <Switch id="success" />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Delivery Channels</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="size-4" />
                        <Label htmlFor="email" className="text-sm cursor-pointer">
                          Email
                        </Label>
                      </div>
                      <Switch id="email" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Smartphone className="size-4" />
                        <Label htmlFor="push" className="text-sm cursor-pointer">
                          Push Notifications
                        </Label>
                      </div>
                      <Switch id="push" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="size-4" />
                        <Label htmlFor="sms" className="text-sm cursor-pointer">
                          SMS
                        </Label>
                      </div>
                      <Switch id="sms" />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Quiet Hours</h4>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="quiet" className="text-sm cursor-pointer">
                      Enable Quiet Hours
                    </Label>
                    <Switch id="quiet" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Critical alerts will still be delivered during quiet hours.
                  </p>
                </div>

                <Button className="w-full" variant="outline" size="sm">
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
