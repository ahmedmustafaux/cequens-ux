import * as React from "react"
import { PageHeader } from "@/components/page-header"
import { PageWrapper } from "@/components/page-wrapper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Plus, Key, Copy, Check, MoreHorizontal, Trash, Search, EyeOff, Trash2 } from "lucide-react"
import {
  DataTable,
  DataTableHeader,
  DataTableSelectionHeader,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableRow,
} from "@/components/ui/data-table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { Highlight } from "@/components/ui/highlight"
import { SearchProvider } from "@/contexts/search-context"
import { SearchInput } from "@/components/ui/search-input"

interface ApiKey {
  id: string
  name: string
  keyPrefix: string // Only showing the prefix for security
  fullKey?: string // Only available right after creation
  created: string
  lastUsed: string
  status: "Active" | "Revoked"
}

// Initial mock data
const INITIAL_KEYS: ApiKey[] = [
  {
    id: "key_1",
    name: "Production API Key",
    keyPrefix: "cq_live_8f92...",
    created: "Oct 12, 2025",
    lastUsed: "2 hours ago",
    status: "Active",
  },
  {
    id: "key_2",
    name: "Testing key",
    keyPrefix: "cq_test_1a2b...",
    created: "Oct 10, 2025",
    lastUsed: "Never",
    status: "Active",
  },
  {
    id: "key_3",
    name: "Old Staging Key",
    keyPrefix: "cq_test_88df...",
    created: "Sep 01, 2025",
    lastUsed: "Nov 12, 2025",
    status: "Revoked",
  },
]

export default function DeveloperApisKeysPage() {
  const [keys, setKeys] = React.useState<ApiKey[]>(INITIAL_KEYS)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [newKeyName, setNewKeyName] = React.useState("")
  const [newlyCreatedKey, setNewlyCreatedKey] = React.useState<ApiKey | null>(null)
  
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success("API key copied to clipboard")
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleCreateKey = () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a name for the API key")
      return
    }

    // Generate a mock key
    const randomChars = Math.random().toString(36).substring(2, 10)
    const fullKey = `cq_live_${randomChars}x${Math.random().toString(36).substring(2, 10)}`
    
    const newKey: ApiKey = {
      id: `key_${Date.now()}`,
      name: newKeyName.trim(),
      keyPrefix: `cq_live_${randomChars}...`,
      fullKey,
      created: "Just now",
      lastUsed: "Never",
      status: "Active",
    }

    setKeys([newKey, ...keys])
    setNewlyCreatedKey(newKey)
    setNewKeyName("")
    // We don't close the dialog immediately so they can copy the key
  }

  const handleRevoke = (id: string) => {
    setKeys(keys.map(k => k.id === id ? { ...k, status: "Revoked" } : k))
    toast.success("API key revoked")
  }

  const handleDelete = (id: string) => {
    setKeys(keys.filter(k => k.id !== id))
    toast.success("API key deleted")
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    // Clear the newly created key state after closing so next time it shows the form
    setTimeout(() => setNewlyCreatedKey(null), 300)
  }

  const filteredKeys = keys.filter(k => 
    k.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    k.keyPrefix.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <SearchProvider>
      <PageWrapper>
        <PageHeader
          title="API Keys"
          description="Manage your API keys for authenticating requests to Cequens services."
          customActions={
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            if (!open) handleCloseDialog()
            else setIsDialogOpen(true)
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create new API key
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{newlyCreatedKey ? "Save your new API key" : "Create a new API key"}</DialogTitle>
                <DialogDescription>
                  {newlyCreatedKey 
                    ? "Please copy this key and save it somewhere safe. For security reasons, we cannot show it to you again."
                    : "Enter a name to identify this API key (e.g., 'Production App', 'Staging')."}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                {newlyCreatedKey ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-md border text-sm font-mono break-all relative group">
                      {newlyCreatedKey.fullKey}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute right-2 top-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background"
                        onClick={() => handleCopy(newlyCreatedKey.fullKey || "", "new")}
                      >
                        {copiedId === "new" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    <Label htmlFor="name">Key Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g. My Next.js Backend"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleCreateKey()
                        }
                      }}
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                {newlyCreatedKey ? (
                  <Button onClick={handleCloseDialog}>Done</Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleCreateKey} disabled={!newKeyName.trim()}>Create key</Button>
                  </>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SearchInput
              placeholder="Search keys..."
              value={searchQuery}
              onChange={(searchValue) => setSearchQuery(searchValue)}
              minWidth="320px"
            />
          </div>
        </div>

          <DataTable>
            <DataTableHeader>
              <DataTableHead>Name</DataTableHead>
              <DataTableHead>Key Prefix</DataTableHead>
              <DataTableHead>Created</DataTableHead>
              <DataTableHead>Last Used</DataTableHead>
              <DataTableHead>Status</DataTableHead>
              <DataTableHead className="w-[80px] text-right">Actions</DataTableHead>
            </DataTableHeader>
            <DataTableBody>
              {filteredKeys.length > 0 ? (
                filteredKeys.map((k) => (
                  <DataTableRow key={k.id} className="group hover:bg-muted/50 transition-colors">
                    <DataTableCell className="font-medium p-3">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-muted-foreground" />
                        <Highlight text={k.name} searchTerm={searchQuery} />
                      </div>
                    </DataTableCell>
                    <DataTableCell className="font-mono text-sm text-muted-foreground space-x-2 flex items-center h-[52px] p-3">
                      <Highlight text={k.keyPrefix} searchTerm={searchQuery} />
                      {k.status === "Active" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleCopy(k.keyPrefix, k.id)}
                          title="Copy prefix"
                        >
                          {copiedId === k.id ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      )}
                    </DataTableCell>
                    <DataTableCell className="text-muted-foreground p-3">{k.created}</DataTableCell>
                    <DataTableCell className="text-muted-foreground p-3">{k.lastUsed}</DataTableCell>
                    <DataTableCell className="p-3">
                      <Badge variant={k.status === "Active" ? "default" : "secondary"} className="font-normal">
                        {k.status}
                      </Badge>
                    </DataTableCell>
                    <DataTableCell className="text-right p-3">
                      <DropdownMenu>
                        <TooltipProvider delayDuration={0}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                            </TooltipTrigger>
                            <TooltipContent side="top" align="center">
                              <p>API Key actions</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            navigator.clipboard.writeText(k.keyPrefix);
                            toast.success("Key prefix copied");
                          }}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy prefix
                          </DropdownMenuItem>

                          {k.status === "Active" && (
                            <DropdownMenuItem onClick={() => handleRevoke(k.id)}>
                              <EyeOff className="mr-2 h-4 w-4" />
                              Revoke key
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer group"
                            onClick={() => handleDelete(k.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4 text-destructive group-focus:text-destructive group-hover:text-destructive" />
                            <span className="text-destructive font-medium group-focus:text-destructive group-hover:text-destructive">Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </DataTableCell>
                  </DataTableRow>
                ))
              ) : (
                <DataTableRow>
                  <DataTableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No keys found.
                  </DataTableCell>
                </DataTableRow>
              )}
            </DataTableBody>
          </DataTable>
      </div>
    </PageWrapper>
    </SearchProvider>
  )
}

