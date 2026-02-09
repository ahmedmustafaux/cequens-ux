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
import { Tag as TagIcon, Plus, Trash2, Loader2, Search, AlertTriangle } from "lucide-react"
import { useTags, useCreateTag, useDeleteTag } from "@/hooks/use-tags"
import { Badge } from "@/components/ui/badge"
import type { Tag } from "@/lib/supabase/types"
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
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const TAG_COLORS = [
  { name: 'blue', class: 'bg-blue-500' },
  { name: 'green', class: 'bg-green-500' },
  { name: 'red', class: 'bg-red-500' },
  { name: 'orange', class: 'bg-orange-500' },
  { name: 'purple', class: 'bg-purple-500' },
  { name: 'slate', class: 'bg-slate-500' },
]

export default function ContactsTagsPage() {
  usePageTitle("Tags")
  const { data: tags, isLoading } = useTags()
  const createTagMutation = useCreateTag()
  const deleteTagMutation = useDeleteTag()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)
  const [newTagName, setNewTagName] = React.useState("")
  const [newTagColor, setNewTagColor] = React.useState("blue")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const [tagToDelete, setTagToDelete] = React.useState<Tag | null>(null)

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return
    try {
      await createTagMutation.mutateAsync({ name: newTagName, color: newTagColor })
      setNewTagName("")
      setNewTagColor("blue")
      setIsCreateDialogOpen(false)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleDeleteTag = async () => {
    if (!tagToDelete) return
    try {
      await deleteTagMutation.mutateAsync(tagToDelete.id)
      setShowDeleteDialog(false)
      setTagToDelete(null)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleOpenDeleteDialog = (tag: Tag) => {
    setTagToDelete(tag)
    setShowDeleteDialog(true)
  }

  const filteredTags = tags?.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  return (
    <PageWrapper isLoading={isLoading}>
      <PageHeader
        title="Tags"
        description="Categorize and organize your contacts with tags"
        customActions={
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Tag
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Tag</DialogTitle>
                <DialogDescription>
                  Enter a name for your new tag.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 p-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Tag Name</Label>
                  <Input
                    id="name"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="e.g. VIP, Leads, Newsletter"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateTag()
                    }}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Tag Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {TAG_COLORS.map((color) => (
                      <button
                        key={color.name}
                        type="button"
                        className={cn(
                          "h-6 w-6 rounded-full border-2 transition-all",
                          color.class,
                          newTagColor === color.name ? "border-foreground ring-2 ring-ring ring-offset-2" : "border-transparent hover:scale-110"
                        )}
                        onClick={() => setNewTagColor(color.name)}
                        title={color.name.charAt(0).toUpperCase() + color.name.slice(1)}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateTag} disabled={createTagMutation.isPending}>
                  {createTagMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Create Tag
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {tags && tags.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tags..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTags.map((tag) => (
              <Card key={tag.id} className="group overflow-hidden border border-border/60 transition-all hover:border-border/80">
                <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      TAG_COLORS.find(c => c.name === tag.color)?.class || "bg-blue-500"
                    )} />
                    <CardTitle className="text-sm font-medium truncate">
                      {tag.name}
                    </CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                    onClick={() => handleOpenDeleteDialog(tag)}
                    disabled={deleteTagMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
              </Card>
            ))}
          </div>

          {filteredTags.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No tags match your search.</p>
            </div>
          )}
        </div>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <TagIcon />
            </EmptyMedia>
            <EmptyTitle>No tags yet</EmptyTitle>
            <EmptyDescription>
              Create tags to organize and segment your audience. Tags help you
              categorize contacts.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <EmptyAction onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Tag
            </EmptyAction>
          </EmptyContent>
        </Empty>
      )}
      <Dialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          setShowDeleteDialog(open)
          if (!open) {
            setTagToDelete(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-lg p-0 gap-0">
          <DialogHeader>
            <DialogTitle>
              Delete Tag
            </DialogTitle>
          </DialogHeader>

          <div className="p-4 space-y-4">
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <p className="text-sm text-destructive font-semibold">Warning</p>
                  <p className="text-sm text-destructive/90 leading-relaxed">
                    Deleting this tag will permanently remove it and cannot be undone.
                    All contacts currently using this tag will have it removed.
                  </p>
                </div>
              </div>
            </div>

            {tagToDelete && (
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  TAG_COLORS.find(c => c.name === tagToDelete.color)?.class || "bg-blue-500"
                )} />
                <span className="font-medium">{tagToDelete.name}</span>
              </div>
            )}
          </div>

          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false)
                setTagToDelete(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTag}
              disabled={deleteTagMutation.isPending}
            >
              {deleteTagMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {deleteTagMutation.isPending ? "Deleting..." : "Delete Tag"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  )
}