"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, X, CheckCircle, AlertCircle, File, FileSpreadsheet } from "lucide-react"

interface FileUploaderProps {
  onFilesUploaded: (files: File[]) => void
  uploadedFiles: File[]
}

export default function FileUploader({ onFilesUploaded, uploadedFiles }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState<File[]>(uploadedFiles)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files)
      setFiles((prev) => [...prev, ...newFiles])
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = () => {
    if (files.length > 0) {
      onFilesUploaded(files)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.toLowerCase().split(".").pop()
    switch (extension) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />
      case "xlsx":
      case "xls":
      case "csv":
        return <FileSpreadsheet className="h-5 w-5 text-green-500" />
      default:
        return <File className="h-5 w-5 text-slate-500" />
    }
  }

  const getFileStatus = (fileName: string) => {
    const extension = fileName.toLowerCase().split(".").pop()
    const supportedFormats = ["pdf", "xlsx", "xls", "csv", "txt"]
    return supportedFormats.includes(extension || "")
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Documentation
          </CardTitle>
          <CardDescription>
            Upload your lightshipweight documentation files. Supported formats: PDF, Excel, CSV, TXT
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              dragActive ? "border-blue-400 bg-blue-50" : "border-slate-300 hover:border-slate-400 hover:bg-slate-50"
            }`}
          >
            <input
              type="file"
              multiple
              accept=".pdf,.xlsx,.xls,.csv,.txt,.doc,.docx"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id="file-upload"
            />

            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Upload className="h-8 w-8 text-blue-600" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {dragActive ? "Drop files here" : "Upload your files"}
                </h3>
                <p className="text-slate-600 mb-4">Drag and drop files here, or click to browse</p>
                <Button variant="outline">Browse Files</Button>
              </div>

              <div className="text-sm text-slate-500">Maximum file size: 10MB per file</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Selected Files ({files.length})</span>
              <Badge variant="secondary">{files.length} files</Badge>
            </CardTitle>
            <CardDescription>Review your selected files before processing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {files.map((file: File, index) => {
                const isSupported = getFileStatus(file.name)
                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      isSupported ? "border-slate-200 bg-slate-50" : "border-red-200 bg-red-50"
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getFileIcon(file.name)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{file.name}</p>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span>{file.type || "Unknown type"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isSupported ? (
                        <Badge variant="secondary" className="text-green-700 bg-green-100">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Supported
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Unsupported
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Upload Summary */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-900">Ready to Process</p>
                  <p className="text-sm text-blue-700">
                    {files.filter((f) => getFileStatus(f.name)).length} of {files.length} files are supported
                  </p>
                </div>
                <Button
                  onClick={handleUpload}
                  disabled={files.filter((f) => getFileStatus(f.name)).length === 0}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Start Processing
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Supported Formats Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Supported File Formats</CardTitle>
          <CardDescription>The system can process various types of lightshipweight documentation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border border-slate-200 rounded-lg">
              <FileText className="h-8 w-8 text-red-500 mb-3" />
              <h4 className="font-semibold text-slate-900 mb-1">PDF Documents</h4>
              <p className="text-sm text-slate-600">Certificates, technical reports, specifications</p>
            </div>
            <div className="p-4 border border-slate-200 rounded-lg">
              <FileSpreadsheet className="h-8 w-8 text-green-500 mb-3" />
              <h4 className="font-semibold text-slate-900 mb-1">Excel Files</h4>
              <p className="text-sm text-slate-600">Material tables, weight calculations</p>
            </div>
            <div className="p-4 border border-slate-200 rounded-lg">
              <FileSpreadsheet className="h-8 w-8 text-blue-500 mb-3" />
              <h4 className="font-semibold text-slate-900 mb-1">CSV Files</h4>
              <p className="text-sm text-slate-600">Structured data exports</p>
            </div>
            <div className="p-4 border border-slate-200 rounded-lg">
              <File className="h-8 w-8 text-slate-500 mb-3" />
              <h4 className="font-semibold text-slate-900 mb-1">Text Files</h4>
              <p className="text-sm text-slate-600">Plain text documentation</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
