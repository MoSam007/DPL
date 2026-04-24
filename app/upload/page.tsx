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
  MapPin,
  Calendar,
  Leaf,
  Sparkles,
  ArrowRight,
  Download,
  Eye,
  Trash2,
  Clock,
  FileText,
  MoreHorizontal,
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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

interface UploadedFile {
  id: string
  name: string
  type: "image" | "data"
  size: string
  status: "processing" | "completed" | "error"
  uploadedAt: string
  analysis?: {
    disease?: string
    confidence?: number
    severity?: string
    recommendation?: string
  }
}

const recentUploads: UploadedFile[] = [
  {
    id: "1",
    name: "field_sample_001.jpg",
    type: "image",
    size: "2.4 MB",
    status: "completed",
    uploadedAt: "Today, 10:30 AM",
    analysis: {
      disease: "Late Blight",
      confidence: 94,
      severity: "Moderate",
      recommendation: "Apply copper-based fungicide",
    },
  },
  {
    id: "2",
    name: "sensor_data_april.csv",
    type: "data",
    size: "1.8 MB",
    status: "completed",
    uploadedAt: "Today, 09:15 AM",
  },
  {
    id: "3",
    name: "leaf_closeup_002.jpg",
    type: "image",
    size: "3.1 MB",
    status: "processing",
    uploadedAt: "Today, 08:45 AM",
  },
  {
    id: "4",
    name: "wheat_field_scan.jpg",
    type: "image",
    size: "4.2 MB",
    status: "completed",
    uploadedAt: "Yesterday, 04:20 PM",
    analysis: {
      disease: "None Detected",
      confidence: 89,
      severity: "N/A",
      recommendation: "Continue regular monitoring",
    },
  },
  {
    id: "5",
    name: "weather_station_log.csv",
    type: "data",
    size: "856 KB",
    status: "completed",
    uploadedAt: "Yesterday, 02:10 PM",
  },
  {
    id: "6",
    name: "infected_leaf_sample.jpg",
    type: "image",
    size: "2.8 MB",
    status: "error",
    uploadedAt: "Yesterday, 11:30 AM",
  },
]

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

function FileIcon({ type }: { type: "image" | "data" }) {
  if (type === "image") {
    return <ImageIcon className="size-5 text-primary" />
  }
  return <FileSpreadsheet className="size-5 text-primary" />
}

function StatusBadge({ status }: { status: UploadedFile["status"] }) {
  switch (status) {
    case "processing":
      return (
        <Badge variant="outline" className="gap-1 border-primary/50 bg-primary/10 text-primary">
          <Loader2 className="size-3 animate-spin" />
          Processing
        </Badge>
      )
    case "completed":
      return (
        <Badge variant="outline" className="gap-1 border-success/50 bg-success/10 text-success">
          <CheckCircle2 className="size-3" />
          Completed
        </Badge>
      )
    case "error":
      return (
        <Badge variant="outline" className="gap-1 border-destructive/50 bg-destructive/10 text-destructive">
          <AlertCircle className="size-3" />
          Error
        </Badge>
      )
  }
}

export default function UploadPage() {
  const [isDragging, setIsDragging] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState(0)
  const [isUploading, setIsUploading] = React.useState(false)
  const [selectedFile, setSelectedFile] = React.useState<UploadedFile | null>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    simulateUpload()
  }

  const simulateUpload = () => {
    setIsUploading(true)
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setIsUploading(false)
            setUploadProgress(0)
          }, 500)
          return 100
        }
        return prev + 10
      })
    }, 200)
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

        {/* Upload Section */}
        <Tabs defaultValue="image" className="space-y-6">
          <TabsList>
            <TabsTrigger value="image" className="gap-2">
              <Camera className="size-4" />
              Image Upload
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2">
              <FileSpreadsheet className="size-4" />
              Data Import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="image" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Upload Zone */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Upload Crop Images</CardTitle>
                  <CardDescription>
                    Upload images of your crops for instant AI disease detection
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Drag & Drop Zone */}
                  <div
                    className={cn(
                      "relative rounded-lg border-2 border-dashed p-8 transition-colors",
                      isDragging
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25 hover:border-primary/50"
                    )}
                    onDragOver={(e) => {
                      e.preventDefault()
                      setIsDragging(true)
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center justify-center gap-4 text-center">
                      <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Upload className="size-8 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          Drag and drop images here, or{" "}
                          <button
                            className="text-primary hover:underline"
                            onClick={simulateUpload}
                          >
                            browse files
                          </button>
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Supports JPG, PNG, WEBP up to 10MB
                        </p>
                      </div>
                      {isUploading && (
                        <div className="w-full max-w-xs space-y-2">
                          <Progress value={uploadProgress} className="h-2" />
                          <p className="text-sm text-muted-foreground">
                            Uploading... {uploadProgress}%
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upload Metadata */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="crop">Crop Type</Label>
                      <Select>
                        <SelectTrigger id="crop">
                          <SelectValue placeholder="Select crop type" />
                        </SelectTrigger>
                        <SelectContent>
                          {cropTypes.map((crop) => (
                            <SelectItem key={crop.value} value={crop.value}>
                              {crop.label}
                            </SelectItem>
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
                            <SelectItem key={region.value} value={region.value}>
                              {region.label}
                            </SelectItem>
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

                  <Button className="w-full md:w-auto">
                    <Sparkles className="mr-2 size-4" />
                    Analyze Image
                  </Button>
                </CardContent>
              </Card>

              {/* Tips Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tips for Best Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary">1</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Focus on Affected Areas</p>
                        <p className="text-xs text-muted-foreground">
                          Capture clear images of leaves or stems showing symptoms
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary">2</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Good Lighting</p>
                        <p className="text-xs text-muted-foreground">
                          Take photos in natural daylight for accurate color analysis
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary">3</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Multiple Angles</p>
                        <p className="text-xs text-muted-foreground">
                          Upload several images from different angles if possible
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary">4</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Include Context</p>
                        <p className="text-xs text-muted-foreground">
                          Some wider shots help identify spread patterns
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

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
                  <div
                    className={cn(
                      "relative rounded-lg border-2 border-dashed p-8 transition-colors",
                      "border-muted-foreground/25 hover:border-primary/50"
                    )}
                  >
                    <div className="flex flex-col items-center justify-center gap-4 text-center">
                      <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <FileSpreadsheet className="size-8 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          Drag and drop data files here, or{" "}
                          <button className="text-primary hover:underline">
                            browse files
                          </button>
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Supports CSV, XLSX up to 50MB
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Data Type</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {["Weather", "Soil Moisture", "Temperature", "Custom"].map((type) => (
                        <Button key={type} variant="outline" className="h-auto py-3">
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full md:w-auto">
                    <Upload className="mr-2 size-4" />
                    Import Data
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
                      <p className="text-xs text-muted-foreground">
                        Comma-separated values with headers
                      </p>
                    </div>
                    <div className="p-3 rounded-lg border">
                      <div className="flex items-center gap-2 mb-1">
                        <FileSpreadsheet className="size-4 text-success" />
                        <span className="font-medium text-sm">Excel Files</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        XLSX format with structured data
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <Button variant="link" className="h-auto p-0 text-sm">
                      Download template file
                      <Download className="ml-1 size-3" />
                    </Button>
                  </div>
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
              <CardDescription>
                Your recently uploaded files and their analysis status
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View All
              <ArrowRight className="ml-2 size-4" />
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
              <ScrollArea className="h-[320px]">
                {recentUploads.map((file) => (
                  <div
                    key={file.id}
                    className={cn(
                      "grid grid-cols-6 gap-4 p-3 text-sm border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors",
                      selectedFile?.id === file.id && "bg-primary/5"
                    )}
                    onClick={() => setSelectedFile(file)}
                  >
                    <div className="col-span-2 flex items-center gap-2">
                      <FileIcon type={file.type} />
                      <span className="truncate font-medium">{file.name}</span>
                    </div>
                    <div className="flex items-center">
                      <Badge variant="outline" className="capitalize">
                        {file.type}
                      </Badge>
                    </div>
                    <div className="flex items-center">
                      <StatusBadge status={file.status} />
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      {file.uploadedAt}
                    </div>
                    <div className="flex items-center justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 size-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 size-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Result Card */}
        {selectedFile?.analysis && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="size-5 text-primary" />
                <CardTitle>AI Analysis Result</CardTitle>
              </div>
              <CardDescription>
                Analysis for {selectedFile.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Disease Detected</p>
                  <p className="text-lg font-semibold">
                    {selectedFile.analysis.disease}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Confidence</p>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={selectedFile.analysis.confidence}
                      className="h-2 w-20 [&>[data-slot=indicator]]:bg-primary"
                    />
                    <span className="text-lg font-semibold">
                      {selectedFile.analysis.confidence}%
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Severity</p>
                  <Badge
                    variant="outline"
                    className={cn(
                      selectedFile.analysis.severity === "N/A" && "border-muted",
                      selectedFile.analysis.severity === "Low" && "border-success/50 bg-success/10 text-success",
                      selectedFile.analysis.severity === "Moderate" && "border-warning/50 bg-warning/10 text-warning-foreground",
                      selectedFile.analysis.severity === "High" && "border-destructive/50 bg-destructive/10 text-destructive"
                    )}
                  >
                    {selectedFile.analysis.severity}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Recommendation</p>
                  <p className="text-sm font-medium">{selectedFile.analysis.recommendation}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
