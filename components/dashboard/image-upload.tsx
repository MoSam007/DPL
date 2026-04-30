"use client"

import * as React from "react"
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import type { CVAnalysisResult } from "@/lib/types"

type UploadStatus = "idle" | "uploading" | "analyzing" | "complete" | "error"

export function ImageUpload() {
  const [isDragging, setIsDragging] = React.useState(false)
  const [file, setFile] = React.useState<File | null>(null)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [status, setStatus] = React.useState<UploadStatus>("idle")
  const [progress, setProgress] = React.useState(0)
  const [result, setResult] = React.useState<CVAnalysisResult | null>(null)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false) }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped?.type.startsWith("image/")) handleFile(dropped)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) handleFile(selected)
  }

  const handleFile = (selected: File) => {
    setFile(selected)
    setStatus("idle")
    setResult(null)
    setErrorMsg(null)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(selected)
  }

  const handleAnalyze = async () => {
    if (!file) return
    setStatus("uploading")
    setProgress(0)
    setErrorMsg(null)

    // Animate progress bar during upload
    const timer = setInterval(() => setProgress((p) => Math.min(p + 15, 90)), 150)

    try {
      const form = new FormData()
      form.append("file", file)
      form.append("cropType", "mixed") // dashboard quick-upload default

      const res = await fetch("/api/uploads", { method: "POST", body: form })
      clearInterval(timer)
      setProgress(100)

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error?.message ?? `Upload failed (${res.status})`)
      }

      const body = await res.json()
      setStatus("analyzing")

      // Brief pause so the "Analyzing…" state is visible
      await new Promise((r) => setTimeout(r, 600))

      if (body.success && body.data?.analysis) {
        setResult(body.data.analysis as CVAnalysisResult)
        setStatus("complete")
      } else {
        throw new Error("Unexpected response from server")
      }
    } catch (err) {
      clearInterval(timer)
      setErrorMsg(err instanceof Error ? err.message : "Upload failed. Please try again.")
      setStatus("error")
    }
  }

  const handleReset = () => {
    setFile(null)
    setPreview(null)
    setStatus("idle")
    setProgress(0)
    setResult(null)
    setErrorMsg(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Analyze Crop Image</CardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">
          Upload a photo for AI-powered disease detection
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!preview ? (
          <div
            className={cn(
              "relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer",
              isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/30"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="rounded-full bg-primary/10 p-3.5">
                <Upload className="size-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Drop your image here</p>
                <p className="text-xs text-muted-foreground mt-0.5">or click to browse (JPG, PNG, WEBP, max 10MB)</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
              <img src={preview} alt="Preview" className="size-full object-cover" />
              <Button variant="secondary" size="icon" className="absolute top-2 right-2 size-7 shadow-md" onClick={handleReset}>
                <X className="size-3.5" />
              </Button>
            </div>

            {status === "uploading" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Uploading…</span>
                  <span className="font-semibold tabular-nums">{progress}%</span>
                </div>
                <Progress value={progress} className="h-1.5" />
              </div>
            )}

            {status === "analyzing" && (
              <div className="flex items-center justify-center gap-2 py-3">
                <Loader2 className="size-4 animate-spin text-primary" />
                <span className="text-sm font-medium">Analyzing image…</span>
              </div>
            )}

            {status === "complete" && result && (
              <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle2 className="size-4" />
                  <span className="font-semibold text-sm">Analysis Complete</span>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Disease</span>
                    <span className="font-semibold">{result.disease}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Confidence</span>
                    <span className="font-semibold">{result.confidence}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Severity</span>
                    <span className={cn(
                      "font-semibold capitalize",
                      result.severity === "mild" && "text-success",
                      result.severity === "moderate" && "text-warning-foreground",
                      result.severity === "severe" && "text-destructive"
                    )}>{result.severity}</span>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs font-semibold mb-1.5">Recommendations</p>
                  <ul className="space-y-1">
                    {result.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="size-1 rounded-full bg-primary shrink-0 mt-1.5" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                <span className="text-sm font-medium">{errorMsg ?? "Analysis failed. Please try again."}</span>
              </div>
            )}

            <div className="flex gap-2">
              {status === "idle" && (
                <Button onClick={handleAnalyze} className="flex-1 h-9">
                  <ImageIcon className="mr-2 size-4" />
                  Analyze Image
                </Button>
              )}
              {status === "complete" && (
                <Button onClick={handleReset} variant="outline" className="w-full h-9">
                  Upload New Image
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
