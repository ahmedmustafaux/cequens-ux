import * as React from "react"
import { PageHeader } from "@/components/page-header"
import { PageWrapper } from "@/components/page-wrapper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Copy, MoreHorizontal, Trash, Search, Link as LinkIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DataTable,
  DataTableHeader,
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
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { SearchProvider, useSearch } from "@/contexts/search-context"
import { Highlight } from "@/components/ui/highlight"
import { SearchInput } from "@/components/ui/search-input"

// Mock Data
interface DatasetApi {
  id: string
  name: string
  keyPrefix: string
  fullKey?: string
  created: string
  lastUsed: string
  status: "Active" | "Inactive"
}

const mockApis: DatasetApi[] = [
  {
    id: "ds_1",
    name: "CRM Contacts Ingestion",
    keyPrefix: "cq_ds_live_8f92...",
    created: "2024-03-01T10:00:00Z",
    lastUsed: "2024-03-10T14:30:00Z",
    status: "Active",
  },
  {
    id: "ds_2",
    name: "External Leads Receiver",
    keyPrefix: "cq_ds_live_1a2b...",
    created: "2024-02-15T09:00:00Z",
    lastUsed: "2024-03-09T11:20:00Z",
    status: "Active",
  },
  {
    id: "ds_3",
    name: "Legacy Opt-outs",
    keyPrefix: "cq_ds_live_88df...",
    created: "2023-11-20T16:45:00Z",
    lastUsed: "2024-01-05T08:15:00Z",
    status: "Inactive",
  },
]

function DatasetKnowledgePageContent() {
  const [apis, setApis] = React.useState<DatasetApi[]>(mockApis)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)
  const [newApiName, setNewApiName] = React.useState("")
  const [searchQuery, setSearchQuery] = React.useState("")

  const [newlyCreatedApi, setNewlyCreatedApi] = React.useState<DatasetApi | null>(null)

  const handleCreateApi = () => {
    if (!newApiName.trim()) return

    const randomChars = Math.random().toString(36).substring(2, 10)
    const fullKey = `cq_ds_live_${randomChars}x${Math.random().toString(36).substring(2, 10)}`

    const newApi: DatasetApi = {
      id: `ds_${Date.now()}`,
      name: newApiName.trim(),
      keyPrefix: `cq_ds_live_${randomChars}...`,
      fullKey,
      created: new Date().toISOString(),
      lastUsed: "-",
      status: "Active",
    }

    setApis([newApi, ...apis])
    setNewlyCreatedApi(newApi)
    setNewApiName("")
    toast.success("Dataset API key created successfully")
  }

  const handleDelete = (id: string) => {
    setApis(apis.filter(api => api.id !== id))
    toast.success("Dataset API endpoint deleted")
  }
  
  const handleToggleStatus = (id: string, currentStatus: string) => {
    setApis(apis.map(api => api.id === id ? { ...api, status: currentStatus === "Active" ? "Inactive" : "Active" } : api))
    toast.success(`Dataset API endpoint ${currentStatus === "Active" ? "deactivated" : "activated"}`)
  }

  const filteredApis = React.useMemo(() => {
    if (!searchQuery) return apis;
    const lowerSearch = searchQuery.toLowerCase();
    return apis.filter(api => 
      api.name.toLowerCase().includes(lowerSearch) || 
      api.keyPrefix.toLowerCase().includes(lowerSearch)
    );
  }, [apis, searchQuery])

  return (
    <PageWrapper>
      <PageHeader
        title="Dataset & Knowledge"
        description="Manage your Dataset & Knowledge API keys for securely receiving and ingesting data from external sources."
        customActions={
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create endpoint
          </Button>
        }
      />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SearchInput
              placeholder="Search endpoints..."
              value={searchQuery}
              onChange={(searchValue) => setSearchQuery(searchValue)}
              minWidth="320px"
            />
          </div>
        </div>

          <DataTable>
            <DataTableHeader>
              <DataTableHead>Name</DataTableHead>
              <DataTableHead>API Key Prefix</DataTableHead>
              <DataTableHead>Created</DataTableHead>
              <DataTableHead>Last Used</DataTableHead>
              <DataTableHead>Status</DataTableHead>
              <DataTableHead className="w-[80px] text-right">Actions</DataTableHead>
            </DataTableHeader>
            <DataTableBody>
              {filteredApis.length > 0 ? (
                filteredApis.map((api) => (
                  <DataTableRow key={api.id} className="hover:bg-muted/50 transition-colors">
                    <DataTableCell className="font-medium p-3">
                      <Highlight text={api.name} searchTerm={searchQuery} />
                    </DataTableCell>
                    <DataTableCell className="font-mono text-sm text-muted-foreground p-3">
                       <div className="flex items-center gap-2">
                          <Highlight text={api.keyPrefix} searchTerm={searchQuery} />
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6" 
                            onClick={() => {
                              navigator.clipboard.writeText(api.keyPrefix);
                              toast.success("API key prefix copied");
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                       </div>
                    </DataTableCell>
                    <DataTableCell className="text-muted-foreground p-3">
                      {new Date(api.created).toLocaleDateString()}
                    </DataTableCell>
                    <DataTableCell className="text-muted-foreground p-3">
                      {api.lastUsed !== "-" ? new Date(api.lastUsed).toLocaleDateString() : "Never"}
                    </DataTableCell>
                    <DataTableCell className="p-3">
                      <Badge variant="secondary" className={api.status === "Active" ? "bg-green-100 text-green-700 hover:bg-green-100/80 border-green-200" : "bg-gray-100 text-gray-700 hover:bg-gray-100/80 border-gray-200"}>
                        {api.status}
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
                              <p>Endpoint actions</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            navigator.clipboard.writeText(api.keyPrefix);
                            toast.success("Key prefix copied");
                          }}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy prefix
                          </DropdownMenuItem>

                          <DropdownMenuItem onClick={() => handleToggleStatus(api.id, api.status)}>
                            <LinkIcon className="mr-2 h-4 w-4" />
                            {api.status === "Active" ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer group"
                            onClick={() => handleDelete(api.id)}
                          >
                            <Trash className="mr-2 h-4 w-4 text-destructive group-focus:text-destructive group-hover:text-destructive" />
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
                    No endpoints found.
                  </DataTableCell>
                </DataTableRow>
              )}
            </DataTableBody>
          </DataTable>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
        setIsCreateDialogOpen(open)
        if (!open) setTimeout(() => setNewlyCreatedApi(null), 300)
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{newlyCreatedApi ? "Save your new Dataset & Knowledge API Key" : "Create Dataset & Knowledge API Key"}</DialogTitle>
            <DialogDescription>
              {newlyCreatedApi 
                ? "Please copy this key and save it somewhere safe. For security reasons, we cannot show it to you again."
                : "Create a new API key to safely receive and ingest data from third party services."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {newlyCreatedApi ? (
               <div className="flex items-center gap-2 p-3 bg-muted rounded-md border text-sm font-mono break-all relative group">
                  {newlyCreatedApi.fullKey}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-2 top-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background"
                    onClick={() => {
                      navigator.clipboard.writeText(newlyCreatedApi.fullKey || "");
                      toast.success("API key copied");
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
               </div>
            ) : (
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newApiName}
                  onChange={(e) => setNewApiName(e.target.value)}
                  placeholder="e.g. CRM Contacts Ingestion"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            {newlyCreatedApi ? (
              <Button onClick={() => setIsCreateDialogOpen(false)}>Done</Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateApi} disabled={!newApiName.trim()}>
                  Create Key
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </PageWrapper>
  )
}

export default function DeveloperApisDatasetKnowledgePage() {
  return (
    <SearchProvider>
      <DatasetKnowledgePageContent />
    </SearchProvider>
  )
}
