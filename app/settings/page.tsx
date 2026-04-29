"use client"

import * as React from "react"
import {
  User,
  Bell,
  Palette,
  Shield,
  Save,
  Loader2,
  Camera,
  Mail,
  Smartphone,
  MessageSquare,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Globe,
  Moon,
  Sun,
  Monitor,
} from "lucide-react"
import { useTheme } from "next-themes"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [isSaving, setIsSaving] = React.useState(false)
  const [saved, setSaved] = React.useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 max-w-4xl">
        {/* Page Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your account, preferences, and notification settings
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="profile" className="gap-2">
              <User className="size-4 hidden sm:block" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="size-4 hidden sm:block" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="size-4 hidden sm:block" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="size-4 hidden sm:block" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details and profile photo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="size-20">
                      <AvatarImage src="/avatars/user.jpg" />
                      <AvatarFallback className="text-lg bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold">
                        JD
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute -bottom-1 -right-1 size-7 rounded-full shadow-md"
                    >
                      <Camera className="size-3.5" />
                    </Button>
                  </div>
                  <div>
                    <p className="font-semibold">John Doe</p>
                    <p className="text-sm text-muted-foreground">Agronomist</p>
                    <Badge variant="outline" className="mt-1 text-xs">Free Plan</Badge>
                  </div>
                </div>

                <Separator />

                {/* Form Fields */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue="John" className="h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue="Doe" className="h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="john.doe@farm.com" className="h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" type="tel" defaultValue="+1 234 567 8900" className="h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select defaultValue="agronomist">
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="farmer">Farmer</SelectItem>
                        <SelectItem value="agronomist">Agronomist</SelectItem>
                        <SelectItem value="researcher">Researcher</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger className="h-10">
                        <Globe className="mr-2 size-4 text-muted-foreground" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="pt">Portuguese</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    defaultValue="Senior agronomist with 10+ years of experience in crop disease management."
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Saving...
                      </>
                    ) : saved ? (
                      <>
                        <CheckCircle2 className="mr-2 size-4" />
                        Saved
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 size-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button variant="outline">Cancel</Button>
                </div>
              </CardContent>
            </Card>

            {/* Monitored Regions */}
            <Card>
              <CardHeader>
                <CardTitle>Monitored Regions</CardTitle>
                <CardDescription>Regions you are tracking for disease alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {["Northern Plains", "Central Valley", "Eastern Hills", "Southern Basin", "Western Ridge"].map((region) => (
                    <Badge key={region} variant="secondary" className="px-3 py-1.5">
                      {region}
                    </Badge>
                  ))}
                  <Button variant="outline" size="sm" className="h-7">
                    + Add Region
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Alert Types</CardTitle>
                <CardDescription>Choose which alerts you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { icon: AlertTriangle, label: "Critical Alerts", desc: "Disease outbreaks requiring immediate action", color: "text-destructive", defaultChecked: true },
                  { icon: AlertCircle, label: "Warning Alerts", desc: "Elevated risk conditions and weather warnings", color: "text-warning", defaultChecked: true },
                  { icon: Info, label: "Info Alerts", desc: "System updates, new data availability, reports", color: "text-primary", defaultChecked: true },
                  { icon: CheckCircle2, label: "Success Alerts", desc: "Treatment confirmations, contained outbreaks", color: "text-success", defaultChecked: false },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <item.icon className={cn("size-5", item.color)} />
                      <div>
                        <p className="font-medium text-sm">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                    <Switch defaultChecked={item.defaultChecked} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery Channels</CardTitle>
                <CardDescription>How you want to receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { icon: Mail, label: "Email", desc: "Receive alerts to john.doe@farm.com", defaultChecked: true },
                  { icon: Smartphone, label: "Push Notifications", desc: "Browser and mobile push alerts", defaultChecked: true },
                  { icon: MessageSquare, label: "SMS", desc: "Text messages for critical alerts only", defaultChecked: false },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <item.icon className="size-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                    <Switch defaultChecked={item.defaultChecked} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quiet Hours</CardTitle>
                <CardDescription>Pause non-critical notifications during specific hours</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Enable Quiet Hours</p>
                    <p className="text-xs text-muted-foreground">Critical alerts will still be delivered</p>
                  </div>
                  <Switch />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input type="time" defaultValue="22:00" className="h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input type="time" defaultValue="07:00" className="h-10" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
              Save Preferences
            </Button>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Theme</CardTitle>
                <CardDescription>Select your preferred color scheme</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: "light", label: "Light", icon: Sun, preview: "bg-white border-2" },
                    { value: "dark", label: "Dark", icon: Moon, preview: "bg-zinc-900 border-2" },
                    { value: "system", label: "System", icon: Monitor, preview: "bg-gradient-to-r from-white to-zinc-900 border-2" },
                  ].map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setTheme(t.value)}
                      className={cn(
                        "flex flex-col items-center gap-3 rounded-xl border p-4 transition-all hover:bg-muted/50",
                        theme === t.value && "border-primary bg-primary/5 ring-1 ring-primary"
                      )}
                    >
                      <div className={cn("size-12 rounded-lg", t.preview)} />
                      <div className="flex items-center gap-2">
                        <t.icon className="size-4" />
                        <span className="text-sm font-medium">{t.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Display</CardTitle>
                <CardDescription>Customize the dashboard layout</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Compact Mode</p>
                    <p className="text-xs text-muted-foreground">Reduce spacing for more data density</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Animate Risk Zones</p>
                    <p className="text-xs text-muted-foreground">Pulse animations on high-risk map zones</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Show Weather Overlay</p>
                    <p className="text-xs text-muted-foreground">Display weather data on the map by default</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current">Current Password</Label>
                  <Input id="current" type="password" className="h-10 max-w-md" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new">New Password</Label>
                  <Input id="new" type="password" className="h-10 max-w-md" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm New Password</Label>
                  <Input id="confirm" type="password" className="h-10 max-w-md" />
                </div>
                <Button>Update Password</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>Add an extra layer of security to your account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-warning/10 flex items-center justify-center">
                      <Shield className="size-5 text-warning" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">2FA is not enabled</p>
                      <p className="text-xs text-muted-foreground">Protect your account with TOTP authentication</p>
                    </div>
                  </div>
                  <Button variant="outline">Enable 2FA</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>Manage devices where you are currently logged in</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { device: "Chrome on Windows", location: "Lagos, Nigeria", current: true, time: "Active now" },
                    { device: "Safari on iPhone", location: "Lagos, Nigeria", current: false, time: "2 hours ago" },
                  ].map((session, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "size-2 rounded-full",
                          session.current ? "bg-success" : "bg-muted-foreground"
                        )} />
                        <div>
                          <p className="font-medium text-sm">{session.device}</p>
                          <p className="text-xs text-muted-foreground">{session.location} - {session.time}</p>
                        </div>
                      </div>
                      {session.current ? (
                        <Badge variant="outline" className="text-xs">Current</Badge>
                      ) : (
                        <Button variant="ghost" size="sm" className="text-destructive text-xs">
                          Revoke
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>Irreversible account actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Delete Account</p>
                    <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
                  </div>
                  <Button variant="destructive" size="sm">Delete Account</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
