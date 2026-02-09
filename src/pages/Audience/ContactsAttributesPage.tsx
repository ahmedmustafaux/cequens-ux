import * as React from "react"
import { PageHeader } from "@/components/page-header"
import { PageWrapper } from "@/components/page-wrapper"
import { usePageTitle } from "@/hooks/use-dynamic-title"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyAction,
} from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import { FileQuestion, Plus, Trash2, Loader2, Search, Settings2, Calendar, Hash, Type, CheckSquare, AlertTriangle } from "lucide-react"
import { useAttributes, useCreateAttribute, useDeleteAttribute } from "@/hooks/use-attributes"
import type { CustomAttributeDefinition } from "@/lib/supabase/types"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

const typeIcons = {
  string: <Type className="h-4 w-4 text-blue-500" />,
  number: <Hash className="h-4 w-4 text-orange-500" />,
  date: <Calendar className="h-4 w-4 text-green-500" />,
  boolean: <CheckSquare className="h-4 w-4 text-purple-500" />,
}

export default function ContactsAttributesPage() {
  usePageTitle("Custom Attributes")
  const { data: attributes, isLoading } = useAttributes()
  const createAttributeMutation = useCreateAttribute()
  const deleteAttributeMutation = useDeleteAttribute()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)
  const [newAttribute, setNewAttribute] = React.useState({
    name: "",
    key: "",
    data_type: "string" as const
  })
  const [searchQuery, setSearchQuery] = React.useState("")
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const [attributeToDelete, setAttributeToDelete] = React.useState<CustomAttributeDefinition | null>(null)

  const handleCreateAttribute = async () => {
    if (!newAttribute.name.trim()) {
      toast.error("Name is required")
      return
    }

    // Auto-generate key if empty
    const key = newAttribute.key.trim() || newAttribute.name.trim().toLowerCase().replace(/\s+/g, '_')

    try {
      await createAttributeMutation.mutateAsync({
        ...newAttribute,
        name: newAttribute.name.trim(),
        key
      })
      setNewAttribute({ name: "", key: "", data_type: "string" })
      setIsCreateDialogOpen(false)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleDeleteAttribute = async () => {
    if (!attributeToDelete) return
    try {
      await deleteAttributeMutation.mutateAsync(attributeToDelete.id)
      setShowDeleteDialog(false)
      setAttributeToDelete(null)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleOpenDeleteDialog = (attr: CustomAttributeDefinition) => {
    setAttributeToDelete(attr)
    setShowDeleteDialog(true)
  }

  const filteredAttributes = attributes?.filter(attr =>
    attr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    attr.key.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  return (
    <PageWrapper isLoading={isLoading}>
      <PageHeader
        title="Custom Attributes"
        description="Define custom fields for your contacts like 'Job Title' or 'Subscription Date'"
        customActions={
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Attribute
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Attribute</DialogTitle>
                <DialogDescription>
                  Attributes allow you to store extra information.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 p-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    value={newAttribute.name}
                    onChange={(e) => setNewAttribute(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Job Title"
                    autoFocus
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="key">Storage Key (Click to edit)</Label>
                  <Input
                    id="key"
                    value={newAttribute.key}
                    onChange={(e) => setNewAttribute(prev => ({ ...prev, key: e.target.value }))}
                    placeholder="e.g. job_title"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    This is how the field is stored in the database.
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label>Data Type</Label>
                  <Select
                    value={newAttribute.data_type}
                    onValueChange={(v: any) => setNewAttribute(prev => ({ ...prev, data_type: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string">Text</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="boolean">Boolean (Yes/No)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateAttribute} disabled={createAttributeMutation.isPending}>
                  {createAttributeMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Create Attribute
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {attributes && attributes.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search attributes..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredAttributes.map((attr) => (
              <Card key={attr.id} className="group overflow-hidden border border-border/60 transition-all hover:border-border/80">
                <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-2 overflow-hidden">
                    {typeIcons[attr.data_type as keyof typeof typeIcons] || <Settings2 className="h-4 w-4 text-muted-foreground" />}
                    <div className="overflow-hidden">
                      <CardTitle className="text-sm font-medium truncate">
                        {attr.name}
                      </CardTitle>
                      <CardDescription className="text-[10px] truncate">
                        key: {attr.key} • {attr.data_type}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                    onClick={() => handleOpenDeleteDialog(attr)}
                    disabled={deleteAttributeMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
              </Card>
            ))}
          </div>

          {filteredAttributes.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No attributes match your search.</p>
            </div>
          )}
        </div>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileQuestion />
            </EmptyMedia>
            <EmptyTitle>No custom attributes</EmptyTitle>
            <EmptyDescription>
              Custom attributes allow you to store domain-specific data about your contacts.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <EmptyAction onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Attribute
            </EmptyAction>
          </EmptyContent>
        </Empty>
      )}
      <Dialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          setShowDeleteDialog(open)
          if (!open) {
            setAttributeToDelete(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-lg p-0 gap-0">
          <DialogHeader>
            <DialogTitle>
              Delete Attribute
            </DialogTitle>
          </DialogHeader>

          <div className="p-4 space-y-4">
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <p className="text-sm text-destructive font-semibold">Warning</p>
                  <p className="text-sm text-destructive/90 leading-relaxed">
                    Deleting this attribute will permanently remove it and cannot be undone.
                    All data stored for this attribute across all contacts will be lost.
                  </p>
                </div>
              </div>
            </div>

            {attributeToDelete && (
              <div className="text-sm text-muted-foreground">
                <div className="flex flex-col gap-1">
                  <div><span className="font-medium">Attribute:</span> {attributeToDelete.name}</div>
                  <div className="text-[10px]">Key: {attributeToDelete.key} • {attributeToDelete.data_type}</div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false)
                setAttributeToDelete(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAttribute}
              disabled={deleteAttributeMutation.isPending}
            >
              {deleteAttributeMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {deleteAttributeMutation.isPending ? "Deleting..." : "Delete Attribute"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  )
}
