"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Source } from "@/lib/services/ecodesign-service"

interface AddEditSourceDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (source: Omit<Source, "id"> & { id?: string }) => void
  initialData?: Source | null
}

export default function AddEditSourceDialog({ isOpen, onClose, onSave, initialData }: AddEditSourceDialogProps) {
  const [name, setName] = useState(initialData?.name || "")
  const [link, setLink] = useState(initialData?.link || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || "")

  useEffect(() => {
    if (initialData) {
      setName(initialData.name)
      setLink(initialData.link || "")
      setDescription(initialData.description || "")
      setImageUrl(initialData.image_url || "")
    } else {
      setName("")
      setLink("")
      setDescription("")
      setImageUrl("")
    }
  }, [initialData])

  const handleSubmit = () => {
    if (!name.trim()) {
      alert("Source name is required.")
      return
    }
    onSave({
      id: initialData?.id,
      name: name.trim(),
      link: link.trim() || undefined, // Save as undefined if empty
      description: description.trim() || undefined, // Save as undefined if empty
      image_url: imageUrl.trim() || undefined, // Save as undefined if empty
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        {" "}
        {/* Modificato qui: da 425px a 600px */}
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Source" : "Add New Source"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="link" className="text-right">
              Link
            </Label>
            <Input
              id="link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="col-span-3"
              placeholder="e.g., https://example.com"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="A brief description of the source"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="imageUrl" className="text-right">
              Image URL
            </Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="col-span-3"
              placeholder="e.g., https://example.com/image.png"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
