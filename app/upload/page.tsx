"use client"

import * as React from "react"
import {
  Upload,
  Image as ImageIcon,
  FileSpreadsheet,
  Camera,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  Download,
  Eye,
  Trash2,
  FileText,
  MoreHorizontal,
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
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
import type { CVAnalysisResult } from "@/lib/types"

type UploadStatus = "idle" | "uploading" | "complete" | "error"

interface UploadedFile {
  id: string
  name: string
  type: "image" | "data"
  size: string
  status: "processing" | "completed" | "error"
  uploadedAt: string
  analysis?: CVAnalysisResult
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FileIcon({ type }: { type: "image" | "data" }) {
  return type === "image"
    ? <ImageIcon className="size-5 text-primary" />
    : <FileSpreadsheet className="size-5 text-primary" />
}

function StatusBadge({ status }: { status: UploadedFile["status"] }) {
  switch (status) {
    case "processing":
      return (
        <Badge variant="outline" className="gap-1 border-primary/50 bg-primary/10 text-primary">
          <Loader2 className="size-3 animate-spin" />Processing
        </Badge>
      )
    case "completed":
      return (
        <Badge variant="outline" className="gap-1 border-success/50 bg-success/10 text-success">
          <CheckCircle2 className="size-3" />Completed
        </Badge>
      )
    case "error":
      return (
        <Badge variant="outline" className="gap-1 border-destructive/50 bg-destructive/10 text-destructive">
          <AlertCircle className="size-3" />Error
        </Badge>
      )
  }
}

const cropTypes = [
  { value: "wheat", label: "Wheat" },
  { value: "rice", label: "Rice" },
  { value: "corn", label: "Corn" },
  { value: "soybean", label: "Soybean" },
  { value: "potato", label: "Potato" },
  { value: "tomato", label: "Tomato" },
]

const regions = [
  { value: "northern-plains", label: "Northern Plains" },
  { value: "central-valley", label: "Central Valley" },
  { value: "eastern-hills", label: "Eastern Hills" },
  { value: "southern-basin", label: "Southern Basin" },
  { value: "western-ridge", label: "Western Ridge" },
  { value: "river-delta", label: "River Delta" },
]

export default function UploadPage() {
  const [isDragging, setIsDragging] = React.useState(false)
  const [file, setFile] = React.useState<File | null>(null)
  const [cropType, setCropType] = React.useState("wheat")
  const [uploadStatus, setUploadStatus] = React.useState<UploadStatus>("idle")
  const [progress, setProgress] = React.useState(0)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [recentUploads, setRecentUploads] = React.useState<UploadedFile[]>([])
  const [selectedUpload, setSelectedUpload] = React.useState<UploadedFile | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleFile = (selected: File) => {
    if (!selected.type.startsWith("image/")) return
    setFile(selected)
    setUploadStatus("idle")
    setErrorMsg(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }

  const handleAnalyze = async () => {
    if (!file) return
    setUploadStatus("uploading")
    setProgress(0)
    setErrorMsg(null)

    const timer = setInterval(() => setProgress((p) => Math.min(p + 15, 90)), 150)

    try {
      const form = new FormData()
      form.append("file", file)
      form.append("cropType", cropType)

      const res = await fetch("/api/uploads", { method: "POST", body: form })
      clearInterval(timer)
      setProgress(100)

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error?.message ?? `Upload failed (${res.status})`)
      }

      const body = await res.json()
      if (body.success && body.data?.analysis) {
        const newUpload: UploadedFile = {
          id: body.data.id,
          name: file.name,
          type: "image",
          size: formatBytes(file.size),
          status: "completed",
          uploadedAt: "Just now",
          analysis: body.data.analysis as CVAnalysisResult,
        }
        setRecentUploads((prev) => [newUpload, ...prev])
        setSelectedUpload(newUpload)
        setUploadStatus("complete")
      } else {
        throw new Error("Unexpected response from server")
      }
    } catch (err) {
      clearInterval(timer)
      setErrorMsg(err instanceof Error ? err.message : "Upload failed. Please try again.")
      setUploadStatus("error")
    }
  }

  const resetUpload = () => {
    setFile(null)
    setUploadStatus("idle")
    setProgress(0)
    setErrorMsg(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  const deleteUpload = (id: string) => {
    setRecentUploads((prev) => prev.filter((u) => u.id !== id))
    if (selectedUpload?.id === id) setSelectedUpload(null)
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-balance">Upload Data</h1>
            <p className="text-muted-foreground">
              Upload crop images or sensor data for AI-powered disease analysis
            </p>
          </div>
        </div>

        <Tabs defaultValue="image" className="space-y-6">
          <TabsList>
            <TabsTrigger value="image" className="gap-2">
              <Camera className="size-4" />Image Upload
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2">
              <FileSpreadsheet className="size-4" />Data Import
            </TabsTrigger>
          </TabsList>

          {/* Image Upload Tab */}
          <TabsContent value="image" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Upload Crop Images</CardTitle>
                  <CardDescription>
                    Upload images of your crops for instant AI disease detection
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                  />

                  {/* Drag & Drop Zone */}
                  <div
                    className={cn(
                      "relative rounded-lg border-2 border-dashed p-8 transition-colors",
                      isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
                      !file && "cursor-pointer"
                    )}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => !file && inputRef.current?.click()}
                  >
                    {file ? (
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <ImageIcon className="size-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{file.name}</p>
                          <p className="text-sm text-muted-foreground">{formatBytes(file.size)}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 shrink-0"
                          onClick={(e) => { e.stopPropagation(); resetUpload() }}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-4 text-center">
                        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <Upload className="size-8 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">
                            Drag and drop images here, or{" "}
                            <span className="text-primary hover:underline">browse files</span>
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Supports JPG, PNG, WEBP up to 10MB
                          </p>
                        </div>
                      </div>
                    )}

                    {uploadStatus === "uploading" && (
                      <div className="mt-4 space-y-2" onClick={(e) => e.stopPropagation()}>
                        <Progress value={progress} className="h-2" />
                        <p className="text-sm text-muted-foreground text-center">Uploading… {progress}%</p>
                      </div>
                    )}

                    {uploadStatus === "error" && (
                      <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive" onClick={(e) => e.stopPropagation()}>
                        <AlertCircle className="size-4 shrink-0" />
                        <span className="text-sm">{errorMsg}</span>
                      </div>
                    )}

                    {uploadStatus === "complete" && (
                      <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-success/10 text-success" onClick={(e) => e.stopPropagation()}>
                        <CheckCircle2 className="size-4 shrink-0" />
                        <span className="text-sm font-medium">Analysis complete! See results below.</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Metadata */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="crop">Crop Type</Label>
                      <Select value={cropType} onValueChange={setCropType}>
                        <SelectTrigger id="crop">
                          <SelectValue placeholder="Select crop type" />
                        </SelectTrigger>
                        <SelectContent>
                          {cropTypes.map((crop) => (
                            <SelectItem key={crop.value} value={crop.value}>{crop.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="region">Region</Label>
                      <Select>
                        <SelectTrigger id="region">
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                        <SelectContent>
                          {regions.map((region) => (
                            <SelectItem key={region.value} value={region.value}>{region.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="notes">Additional Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Describe any visible symptoms or concerns..."
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleAnalyze}
                      disabled={!file || uploadStatus === "uploading"}
                      className="w-full md:w-auto"
                    >
                      {uploadStatus === "uploading" ? (
                        <><Loader2 className="mr-2 size-4 animate-spin" />Analyzing…</>
                      ) : (
                        <><Sparkles className="mr-2 size-4" />Analyze Image</>
                      )}
                    </Button>
                    {uploadStatus === "complete" && (
                      <Button variant="outline" onClick={resetUpload} className="w-full md:w-auto">
                        Upload New Image
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Tips Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tips for Best Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      { n: 1, title: "Focus on Affected Areas", desc: "Capture clear images of leaves or stems showing symptoms" },
                      { n: 2, title: "Good Lighting", desc: "Take photos in natural daylight for accurate color analysis" },
                      { n: 3, title: "Multiple Angles", desc: "Upload several images from different angles if possible" },
                      { n: 4, title: "Include Context", desc: "Some wider shots help identify spread patterns" },
                    ].map((tip) => (
                      <div key={tip.n} className="flex gap-3">
                        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-primary">{tip.n}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{tip.title}</p>
                          <p className="text-xs text-muted-foreground">{tip.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Data Import Tab */}
          <TabsContent value="data" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Import Sensor Data</CardTitle>
                  <CardDescription>
                    Upload CSV or Excel files containing weather and soil sensor data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="relative rounded-lg border-2 border-dashed p-8 transition-colors border-muted-foreground/25 hover:border-primary/50">
                    <div className="flex flex-col items-center justify-center gap-4 text-center">
                      <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <FileSpreadsheet className="size-8 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          Drag and drop data files here, or{" "}
                          <button className="text-primary hover:underline">browse files</button>
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">Supports CSV, XLSX up to 50MB</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Data Type</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {["Weather", "Soil Moisture", "Temperature", "Custom"].map((type) => (
                        <Button key={type} variant="outline" className="h-auto py-3">{type}</Button>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full md:w-auto">
                    <Upload className="mr-2 size-4" />Import Data
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Supported Formats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg border">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="size-4 text-primary" />
                        <span className="font-medium text-sm">CSV Files</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Comma-separated values with headers</p>
                    </div>
                    <div className="p-3 rounded-lg border">
                      <div className="flex items-center gap-2 mb-1">
                        <FileSpreadsheet className="size-4 text-success" />
                        <span className="font-medium text-sm">Excel Files</span>
                      </div>
                      <p className="text-xs text-muted-foreground">XLSX format with structured data</p>
                    </div>
                  </div>
                  <Separator />
                  <Button variant="link" className="h-auto p-0 text-sm">
                    Download template file<Download className="ml-1 size-3" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Recent Uploads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Uploads</CardTitle>
              <CardDescription>Uploaded files and their analysis status (this session)</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View All<ArrowRight className="ml-2 size-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <div className="grid grid-cols-6 gap-4 p-3 bg-muted/50 text-sm font-medium text-muted-foreground border-b">
                <div className="col-span-2">File</div>
                <div>Type</div>
                <div>Status</div>
                <div>Uploaded</div>
                <div className="text-right">Actions</div>
              </div>
              <ScrollArea className="h-[280px]">
                {recentUploads.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <Upload className="size-10 mb-3 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">
                      No uploads yet. Analyze an image to see it here.
                    </p>
                  </div>
                ) : (
                  recentUploads.map((upload) => (
                    <div
                      key={upload.id}
                      className={cn(
                        "grid grid-cols-6 gap-4 p-3 text-sm border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors",
                        selectedUpload?.id === upload.id && "bg-primary/5"
                      )}
                      onClick={() => setSelectedUpload(upload)}
                    >
                      <div className="col-span-2 flex items-center gap-2">
                        <FileIcon type={upload.type} />
                        <span className="truncate font-medium">{upload.name}</span>
                      </div>
                      <div className="flex items-center">
                        <Badge variant="outline" className="capitalize">{upload.type}</Badge>
                      </div>
                      <div className="flex items-center">
                        <StatusBadge status={upload.status} />
                      </div>
                      <div className="flex items-center text-muted-foreground">{upload.uploadedAt}</div>
                      <div className="flex items-center justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedUpload(upload)}>
                              <Eye className="mr-2 size-4" />View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={(e) => { e.stopPropagation(); deleteUpload(upload.id) }}
                            >
                              <Trash2 className="mr-2 size-4" />Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Result */}
        {selectedUpload?.analysis && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="size-5 text-primary" />
                <CardTitle>AI Analysis Result</CardTitle>
              </div>
              <CardDescription>Analysis for {selectedUpload.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Disease Detected</p>
                  <p className="text-lg font-semibold">{selectedUpload.analysis.disease}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Confidence</p>
                  <div className="flex items-center gap-2">
                    <Progress value={selectedUpload.analysis.confidence} className="h-2 w-20" />
                    <span className="text-lg font-semibold">{selectedUpload.analysis.confidence}%</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Severity</p>
                  <Badge
                    variant="outline"
                    className={cn(
                      "capitalize",
                      selectedUpload.analysis.severity === "mild" && "border-success/50 bg-success/10 text-success",
                      selectedUpload.analysis.severity === "moderate" && "border-warning/50 bg-warning/10 text-warning-foreground",
                      selectedUpload.analysis.severity === "severe" && "border-destructive/50 bg-destructive/10 text-destructive"
                    )}
                  >
                    {selectedUpload.analysis.severity}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Primary Recommendation</p>
                  <p className="text-sm font-medium">{selectedUpload.analysis.recommendations[0]}</p>
                </div>
              </div>
              {selectedUpload.analysis.recommendations.length > 1 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium mb-2">All Recommendations</p>
                  <ul className="space-y-1">
                    {selectedUpload.analysis.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="size-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
