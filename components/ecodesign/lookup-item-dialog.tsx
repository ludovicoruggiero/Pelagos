"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface LookupItem {
  id: string
  code: string
  label: string
}

interface LookupItemDialogProps {
  isOpen: boolean
  onClose: () => void
  item: LookupItem | null // null for add, item for edit
  onSave: (code: string, label: string) => Promise<void>
  tableName: string // For display purposes in the dialog title
}

export default function LookupItemDialog({ isOpen, onClose, item, onSave, tableName }: LookupItemDialogProps) {
  const [code, setCode] = useState(item?.code || "")
  const [label, setLabel] = useState(item?.label || "")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setCode(item?.code || "")
      setLabel(item?.label || "")
      setIsSaving(false)
    }
  }, [isOpen, item])

  const handleSubmit = async () => {
    setIsSaving(true)
    await onSave(code, label)
    // onSave will handle closing the dialog and reloading data
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{item ? `Edit ${tableName} Item` : `Add New ${tableName} Item`}</DialogTitle>
          <DialogDescription>
            {item ? "Make changes to this item here." : "Add a new item to this lookup table."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="code" className="text-right">
              Code
            </Label>
            <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="label" className="text-right">
              Label
            </Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving || !code || !label}>
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
