"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2 } from "lucide-react"
import LookupItemDialog from "./lookup-item-dialog"

interface LookupItem {
  id: string
  code: string
  label: string
}

interface LookupTableDisplayProps {
  tableName: string
  tableLabel: string
  data: LookupItem[]
  loading: boolean
  onAdd: (code: string, label: string) => Promise<void>
  onUpdate: (id: string, code: string, label: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export default function LookupTableDisplay({
  tableName,
  tableLabel,
  data,
  loading,
  onAdd,
  onUpdate,
  onDelete,
}: LookupTableDisplayProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<LookupItem | null>(null)

  const handleOpenDialog = (item: LookupItem | null = null) => {
    setEditingItem(item)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingItem(null)
  }

  const handleSave = async (code: string, label: string) => {
    if (editingItem) {
      await onUpdate(editingItem.id, code, label)
    } else {
      await onAdd(code, label)
    }
    handleCloseDialog()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-slate-700">Loading {tableLabel}...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-800">{tableLabel} Entries</h3>
        <Button onClick={() => handleOpenDialog()} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add New
        </Button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-slate-500">No entries found for {tableLabel}.</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Code</TableHead>
                <TableHead>Label</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.code}</TableCell>
                  <TableCell>{item.label}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <LookupItemDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        item={editingItem}
        onSave={handleSave}
        tableName={tableLabel}
      />
    </div>
  )
}
