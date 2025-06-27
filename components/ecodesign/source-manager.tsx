"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle, Loader2, Edit, Trash2, LinkIcon } from "lucide-react"
import { ecodesignService, type Source } from "@/lib/services/ecodesign-service"
import { useToast } from "@/hooks/use-toast"
import AddEditSourceDialog from "./add-edit-source-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog" // Import Dialog components

export default function SourceManager() {
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false)
  const [editingSource, setEditingSource] = useState<Source | null>(null)
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false) // New state for image preview dialog
  const [previewImageUrl, setPreviewImageUrl] = useState("") // New state for image URL to preview
  const { toast } = useToast()

  const fetchSources = async () => {
    setLoading(true)
    try {
      const data = await ecodesignService.getSources()
      setSources(data)
      console.log("Fetched sources data:", data) // Log per debug
    } catch (error) {
      console.error("Failed to fetch sources:", error)
      toast({
        title: "Error",
        description: "Failed to load sources.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSources()
  }, [])

  const handleAddSource = () => {
    setEditingSource(null)
    setIsAddEditDialogOpen(true)
  }

  const handleEditSource = (source: Source) => {
    setEditingSource(source)
    setIsAddEditDialogOpen(true)
  }

  const handleSaveSource = async (sourceData: Omit<Source, "id"> & { id?: string }) => {
    try {
      if (sourceData.id) {
        await ecodesignService.updateSource(sourceData.id, sourceData)
        toast({
          title: "Success",
          description: "Source updated successfully.",
        })
      } else {
        await ecodesignService.createSource(sourceData)
        toast({
          title: "Success",
          description: "Source added successfully.",
        })
      }
      fetchSources()
    } catch (error) {
      console.error("Failed to save source:", error)
      toast({
        title: "Error",
        description: `Failed to save source: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
    }
  }

  const handleDeleteSource = async (id: string) => {
    if (!confirm("Are you sure you want to delete this source? This action cannot be undone.")) {
      return
    }
    try {
      await ecodesignService.deleteSource(id)
      toast({
        title: "Success",
        description: "Source deleted successfully.",
      })
      fetchSources()
    } catch (error) {
      console.error("Failed to delete source:", error)
      toast({
        title: "Error",
        description: `Failed to delete source: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
    }
  }

  // New function to open image preview
  const handleImageClick = (imageUrl: string | undefined) => {
    if (imageUrl) {
      setPreviewImageUrl(imageUrl)
      setIsImagePreviewOpen(true)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Sources</h2>
        <Button onClick={handleAddSource}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Source
        </Button>
      </div>

      {sources.length === 0 ? (
        <div className="text-center py-8 text-slate-500">No sources found. Click 'Add New Source' to get started.</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.map((source) => (
                <TableRow key={source.id}>
                  <TableCell className="font-medium">
                    {source.link ? (
                      <a
                        href={source.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {source.name} <LinkIcon className="h-4 w-4" />
                      </a>
                    ) : (
                      source.name
                    )}
                  </TableCell>
                  <TableCell>
                    {source.description ? (
                      <span className="text-sm text-gray-500 line-clamp-2">{source.description}</span>
                    ) : (
                      <span className="text-gray-400 italic">No description</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {source.image_url ? (
                      <button
                        onClick={() => handleImageClick(source.image_url)} // Add onClick handler
                        className="cursor-pointer"
                      >
                        <Image
                          src={source.image_url || "/placeholder.svg"}
                          alt={source.name}
                          width={40}
                          height={40}
                          className="object-cover rounded-md"
                        />
                      </button>
                    ) : (
                      <span className="text-gray-400 italic">No image</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditSource(source)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteSource(source.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AddEditSourceDialog
        isOpen={isAddEditDialogOpen}
        onClose={() => setIsAddEditDialogOpen(false)}
        onSave={handleSaveSource}
        initialData={editingSource}
      />

      {/* Image Preview Dialog */}
      <Dialog open={isImagePreviewOpen} onOpenChange={setIsImagePreviewOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center p-4">
            {previewImageUrl ? (
              <Image
                src={previewImageUrl || "/placeholder.svg"}
                alt="Preview"
                width={500} // Adjust as needed for larger view
                height={500} // Adjust as needed for larger view
                className="max-w-full h-auto object-contain"
              />
            ) : (
              <p>No image to display.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
