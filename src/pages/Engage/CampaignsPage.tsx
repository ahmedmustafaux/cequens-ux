import * as React from "react"
import { useNavigate, Link } from "react-router-dom"
import { usePageTitle } from "@/hooks/use-dynamic-title"
import { PageWrapper } from "@/components/page-wrapper"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { MoreHorizontal, Plus, Eye, Edit, Trash2 } from "lucide-react"
import { EnvelopeSimple, ChatText, WhatsappLogo } from "phosphor-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { SearchProvider } from "@/contexts/search-context"
import { Highlight } from "@/components/ui/highlight"
import { PageHeader } from "@/components/page-header"
import { toast } from "sonner"
import {
  DataTable,
  DataTableHeader,
  DataTableSelectionHeader,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableRow,
} from "@/components/ui/data-table"
import { useCampaigns, useDeleteCampaign } from "@/hooks/use-campaigns"
import type { Campaign } from "@/lib/supabase/types"



function CampaignsPageContent() {
  const navigate = useNavigate()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 50,
  })
  // Fetch campaigns from database
  const { data: campaigns = [], isLoading: isDataLoading, error } = useCampaigns()

  const deleteCampaign = useDeleteCampaign()

  // Filter states
  const [typeFilter, setTypeFilter] = React.useState<string[]>([])
  const [typeSearchQuery, setTypeSearchQuery] = React.useState("")
  const [channelFilter, setChannelFilter] = React.useState<string[]>([])
  const [channelSearchQuery, setChannelSearchQuery] = React.useState("")
  const [selectedView, setSelectedView] = React.useState<string>("all")

  // Delete Campaign State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [campaignToDelete, setCampaignToDelete] = React.useState<string | null>(null)
  const [isBulkDelete, setIsBulkDelete] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  // Create Campaign Dialog State
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)
  const [newCampaignName, setNewCampaignName] = React.useState("")
  const [newCampaignType, setNewCampaignType] = React.useState<"broadcast" | "condition">("broadcast")

  const handleNewCampaign = () => {
    setNewCampaignName("")
    setNewCampaignType("broadcast")
    setIsCreateDialogOpen(true)
  }

  const handleProceedToCreate = (type?: "broadcast" | "condition") => {
    const selectedType = type || newCampaignType;
    if (!newCampaignName.trim()) {
      toast.error("Please enter a campaign name first");
      return;
    }
    navigate("/engage/campaigns/create", {
      state: {
        name: newCampaignName,
        type: selectedType === "broadcast" ? "Broadcast" : "Condition based"
      }
    })
    setIsCreateDialogOpen(false)
  }

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true)
      if (isBulkDelete) {
        // Bulk delete
        const selectedRows = table.getSelectedRowModel().rows
        const ids = selectedRows.map(row => row.original.id)

        let successCount = 0
        let failCount = 0

        for (const id of ids) {
          try {
            await deleteCampaign.mutateAsync(id)
            successCount++
          } catch (err) {
            failCount++
            console.error(`Failed to delete campaign ${id}:`, err)
          }
        }

        if (successCount > 0) {
          toast.success(`Successfully deleted ${successCount} campaign${successCount > 1 ? 's' : ''}`)
        }
        if (failCount > 0) {
          toast.error(`Failed to delete ${failCount} campaign${failCount > 1 ? 's' : ''}`)
        }

        // Clear selection after bulk delete
        table.resetRowSelection()
      } else if (campaignToDelete) {
        // Single delete
        await deleteCampaign.mutateAsync(campaignToDelete)
        toast.success("Campaign deleted successfully")
      }
    } catch (err) {
      toast.error("An error occurred during deletion")
      console.error(err)
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setCampaignToDelete(null)
      setIsBulkDelete(false)
    }
  }

  const triggerSingleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsBulkDelete(false)
    setCampaignToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const triggerBulkDelete = () => {
    setIsBulkDelete(true)
    setCampaignToDelete(null)
    setIsDeleteDialogOpen(true)
  }

  // Filter options
  const typeOptions = [
    { value: "Broadcast", label: "Broadcast" },
    { value: "Condition based", label: "Condition based" }
  ]

  const channelOptions = [
    { value: "Email", label: "Email" },
    { value: "SMS", label: "SMS" },
    { value: "Whatsapp", label: "Whatsapp" }
  ]

  // Filtered options based on search
  const filteredTypeOptions = typeOptions.filter(option =>
    option.label.toLowerCase().includes(typeSearchQuery.toLowerCase())
  )

  const filteredChannelOptions = channelOptions.filter(option =>
    option.label.toLowerCase().includes(channelSearchQuery.toLowerCase())
  )

  // Dynamic page title
  usePageTitle("Campaigns")

  // Handle errors
  React.useEffect(() => {
    if (error) {
      console.error("Error fetching campaigns:", error)
      toast.error("Failed to load campaigns. Please try again.")
    }
  }, [error])

  // Filter data based on selected view
  const filteredDataByView = React.useMemo(() => {
    const now = new Date()
    switch (selectedView) {
      case "scheduled":
        return campaigns.filter(c => c.status === "Active" && c.schedule_type !== "recurring" && c.sent_date && new Date(c.sent_date) > now)
      case "running":
        return campaigns.filter(c => c.status === "Active" && c.schedule_type === "recurring")
      case "draft":
        return campaigns.filter(c => c.status === "Draft")
      case "sent":
        return campaigns.filter(c => c.status === "Completed" || (c.status === "Active" && c.schedule_type !== "recurring" && (!c.sent_date || new Date(c.sent_date) <= now)))
      default:
        return campaigns
    }
  }, [selectedView, campaigns])

  // Apply filters to table
  React.useEffect(() => {
    const newFilters: ColumnFiltersState = []

    if (typeFilter.length > 0) {
      newFilters.push({ id: 'type', value: typeFilter })
    }

    if (channelFilter.length > 0) {
      newFilters.push({ id: 'channel', value: channelFilter })
    }

    setColumnFilters(newFilters)
  }, [typeFilter, channelFilter])

  // Column definitions for the campaigns table
  const columns = React.useMemo<ColumnDef<Campaign>[]>(() => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          containerClickable={true}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Campaign",
      cell: ({ row }) => (
        <Link
          to={`/engage/campaigns/${row.original.id}`}
          className="text-left group-hover:underline block"
          onClick={(e) => e.stopPropagation()}
        >
          <Highlight
            text={row.getValue("name") as string}
            columnId="name"
            className="font-medium text-sm whitespace-nowrap truncate cursor-pointer"
          />
        </Link>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        // If type contains a channel name, it's legacy data; default to "Broadcast"
        const isLegacyType = ["Whatsapp", "SMS", "Email"].includes(type);
        const displayType = isLegacyType ? "Broadcast" : type;
        return (
          <Badge variant="outline" className="font-normal whitespace-nowrap">
            {displayType}
          </Badge>
        );
      },
    },
    {
      accessorKey: "channel",
      header: "Channel",
      cell: ({ row }) => {
        const channel = row.getValue("channel") as string;
        const type = row.original.type as string;
        // If channel is missing but type has a channel name, use that (legacy data)
        const isLegacyChannel = ["Whatsapp", "SMS", "Email"].includes(type);
        const displayChannel = channel || (isLegacyChannel ? type : "—");
        const renderChannelIcon = (channelName: string) => {
          switch (channelName) {
            case "Whatsapp":
              return <img src="/icons/WhatsApp.svg" alt="WhatsApp" className="h-4 w-4" />
            case "Email":
              return <EnvelopeSimple className="h-4 w-4 text-primary" weight="fill" />
            case "SMS":
              return <ChatText className="h-4 w-4 text-primary" weight="fill" />
            default:
              return <span className="text-muted-foreground text-xs">{channelName}</span>
          }
        }

        return (
          <div className="flex items-center">
            {renderChannelIcon(displayChannel)}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const scheduleType = row.original.schedule_type;
        const sentDate = row.original.sent_date;
        const isFuture = sentDate && new Date(sentDate) > new Date();

        if (status === "Draft") {
          return (
            <Badge variant="secondary" className="font-normal bg-gray-100 text-gray-700 hover:bg-gray-100/80 border-gray-200">
              Draft
            </Badge>
          );
        }

        if (scheduleType === "recurring") {
          return (
            <Badge variant="secondary" className="font-normal bg-blue-100 text-blue-700 hover:bg-blue-100/80 border-blue-200">
              Running
            </Badge>
          );
        }

        if (isFuture) {
          return (
            <Badge variant="secondary" className="font-normal bg-gray-100 text-gray-700 hover:bg-gray-100/80 border-gray-200">
              Scheduled
            </Badge>
          );
        }

        return (
          <Badge variant="secondary" className="font-normal bg-green-100 text-green-700 hover:bg-green-100/80 border-green-200">
            {status === "Active" ? "Sent" : status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "recipients",
      header: () => <div className="text-left">Recipients</div>,
      cell: ({ row }) => (
        <div className="text-left whitespace-nowrap text-sm text-muted-foreground">
          {row.getValue<number>("recipients").toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "sent_date",
      header: "Sent Date",
      cell: ({ row }) => {
        const sentDate = row.getValue<string | null>("sent_date");
        return (
          <div className="whitespace-nowrap">
            {sentDate ? new Date(sentDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Not sent"}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-end">
            <DropdownMenu>
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
                  <p>Campaign actions</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end">
                {/* Removed 'Actions' header per user request */}

                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/engage/campaigns/${row.original.id}`); }}>
                  <Eye className="mr-2 h-4 w-4" />
                  View campaign
                </DropdownMenuItem>

                {/* Show Edit for all, but disable if sent (with tooltip) */}
                {row.original.status === "Completed" || (row.original.status === "Active" && (!row.original.sent_date || new Date(row.original.sent_date) <= new Date())) ? (
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <DropdownMenuItem disabled className="pointer-events-none opacity-50">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit campaign
                          </DropdownMenuItem>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p>This campaign has already been sent and cannot be edited.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/engage/campaigns/create`, { state: { campaign: row.original } });
                  }}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit campaign
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer group"
                  onClick={(e) => triggerSingleDelete(row.original.id, e)}
                >
                  <Trash2 className="mr-2 h-4 w-4 text-destructive group-focus:text-destructive group-hover:text-destructive" />
                  <span className="text-destructive font-medium group-focus:text-destructive group-hover:text-destructive">Delete campaign</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ], [navigate]);

  const table = useReactTable({
    data: filteredDataByView,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    // Custom global filter that only searches within specified columns
    globalFilterFn: (row, columnId, value) => {
      const searchColumns = ['name'] // Only search in campaign name column
      const searchValue = value.toLowerCase()

      // Check if any of the specified columns contain the search value
      return searchColumns.some(columnId => {
        const cellValue = row.getValue(columnId)
        return cellValue && cellValue.toString().toLowerCase().includes(searchValue)
      })
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  })

  return (
    <PageWrapper isLoading={isDataLoading}>
      <PageHeader
        title="Campaigns"
        description="Manage your marketing campaigns"
        showBreadcrumbs={false}
        isLoading={isDataLoading}
        customActions={
          <div className="flex items-center gap-2">
            <Button onClick={handleNewCampaign}>
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
          </div>
        }
      />

      <div className="flex flex-col">
        <DataTable
          isLoading={isDataLoading}
          views={{
            options: [
              { label: "All campaigns", value: "all", count: campaigns.length },
              { label: "Running", value: "running", count: campaigns.filter(c => c.status === "Active" && c.schedule_type === "recurring").length },
              { label: "Scheduled", value: "scheduled", count: campaigns.filter(c => c.status === "Active" && c.schedule_type !== "recurring" && c.sent_date && new Date(c.sent_date) > new Date()).length },
              { label: "Draft", value: "draft", count: campaigns.filter(c => c.status === "Draft").length },
              { label: "Sent", value: "sent", count: campaigns.filter(c => c.status === "Completed" || (c.status === "Active" && c.schedule_type !== "recurring" && (!c.sent_date || new Date(c.sent_date) <= new Date()))).length }
            ],
            selectedView: selectedView,
            onViewChange: setSelectedView
          }}
          searchConfig={{
            placeholder: "Search campaigns...",
            searchColumns: ['name'],
            table: table
          }}
          filters={[
            {
              key: "type",
              label: "Type",
              options: typeOptions,
              selectedValues: typeFilter,
              onSelectionChange: setTypeFilter,
              onClear: () => setTypeFilter([]),
              searchable: true,
              searchPlaceholder: "Search types...",
              searchQuery: typeSearchQuery,
              onSearchChange: setTypeSearchQuery,
              filteredOptions: filteredTypeOptions
            },
            {
              key: "channel",
              label: "Channel",
              options: channelOptions,
              selectedValues: channelFilter,
              onSelectionChange: setChannelFilter,
              onClear: () => setChannelFilter([]),
              searchable: true,
              searchPlaceholder: "Search channels...",
              searchQuery: channelSearchQuery,
              onSearchChange: setChannelSearchQuery,
              filteredOptions: filteredChannelOptions
            }
          ]}
          pagination={{
            currentPage: table.getState().pagination.pageIndex + 1,
            totalPages: table.getPageCount(),
            totalItems: table.getFilteredRowModel().rows.length,
            itemsPerPage: table.getState().pagination.pageSize,
            onPrevious: () => table.previousPage(),
            onNext: () => table.nextPage(),
            hasPrevious: table.getCanPreviousPage(),
            hasNext: table.getCanNextPage(),
            onPageSizeChange: (pageSize: number) => table.setPageSize(pageSize),
            pageSizeOptions: [50, 100, 200]
          }}
          footerLabel={`Showing ${table.getRowModel().rows.length} campaigns${table.getSelectedRowModel().rows.length > 0 ? ` • ${table.getSelectedRowModel().rows.length} selected` : ''}`}
        >
          {table.getSelectedRowModel().rows.length > 0 ? (
            <DataTableSelectionHeader
              selectedCount={table.getSelectedRowModel().rows.length}
              onClearSelection={() => table.resetRowSelection()}
              onSelectAll={() => table.toggleAllRowsSelected()}
              onSelectAllOnPage={() => {
                table.getRowModel().rows.forEach(row => row.toggleSelected(true))
              }}
              totalCount={table.getFilteredRowModel().rows.length}
              showCount={table.getRowModel().rows.length}
              selectedCountOnCurrentPage={table.getRowModel().rows.filter(row => row.getIsSelected()).length}
              audience="campaigns"
              columnCount={table.getVisibleFlatColumns().length}
              rightActions={
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => {
                      // TODO: Implement duplicate functionality
                    }}
                  >
                    Duplicate
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={triggerBulkDelete}
                  >
                    Delete campaigns
                  </Button>
                </>
              }
            />
          ) : (
            <DataTableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                headerGroup.headers.map((header) => {
                  return (
                    <DataTableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </DataTableHead>
                  )
                })
              ))}
            </DataTableHeader>
          )}
          <DataTableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <DataTableRow
                  key={row.id}
                  selected={row.getIsSelected()}
                  className="group cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => navigate(`/engage/campaigns/${row.original.id}`)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <DataTableCell
                      key={cell.id}
                      columnId={cell.column.id}
                      clickable={cell.column.id === "select"}
                      onClick={cell.column.id === "select" ? () => row.toggleSelected(!row.getIsSelected()) : undefined}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </DataTableCell>
                  ))}
                </DataTableRow>
              ))
            ) : (
              <DataTableRow>
                <DataTableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </DataTableCell>
              </DataTableRow>
            )}
          </DataTableBody>
        </DataTable>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px] flex flex-col gap-0 p-0 overflow-hidden">
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
            <DialogDescription>
              Start a new campaign to engage with your customers.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 p-4 overflow-y-auto">
            <div className="grid gap-2">
              <Label htmlFor="name">Campaign Name <span className="text-destructive">*</span></Label>
              <Input
                id="name"
                value={newCampaignName}
                onChange={(e) => setNewCampaignName(e.target.value)}
                placeholder="e.g. Summer Sale 2024"
              />
            </div>
            <div className="grid gap-2">
              <Label>Campaign Goal</Label>
              <RadioGroup
                value={newCampaignType}
                onValueChange={(val) => setNewCampaignType(val as "broadcast" | "condition")}
                className="grid grid-cols-1 gap-4"
              >
                <div
                  className={cn(
                    "flex flex-row items-start gap-4 rounded-md border p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-all",
                    newCampaignType === "broadcast" ? "border-primary bg-primary/5" : "border-border"
                  )}
                  onClick={() => handleProceedToCreate("broadcast")}
                >
                  <RadioGroupItem value="broadcast" id="broadcast" className="mt-1" />
                  <Label
                    htmlFor="broadcast"
                    className="grid gap-1 leading-none cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="font-semibold">Broadcast Campaign</div>
                    <div className="text-sm text-muted-foreground font-normal">
                      Send a one-time message to a list of recipients (SMS, WhatsApp, Email).
                    </div>
                  </Label>
                </div>

                <div
                  className={cn(
                    "flex flex-row items-start gap-4 rounded-md border p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-all",
                    newCampaignType === "condition" ? "border-primary bg-primary/5" : "border-border"
                  )}
                  onClick={() => handleProceedToCreate("condition")}
                >
                  <RadioGroupItem value="condition" id="condition" className="mt-1" />
                  <Label
                    htmlFor="condition"
                    className="grid gap-1 leading-none flex-1 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="font-semibold">Condition based Campaign</div>
                    <div className="text-sm text-muted-foreground font-normal">
                      Trigger messages when specific events occur defined by your conditions.
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => handleProceedToCreate()}
              disabled={!newCampaignName.trim()}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isBulkDelete ? "Delete Campaigns" : "Delete Campaign"}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {isBulkDelete ? `these ${table.getSelectedRowModel().rows.length} campaigns` : "this campaign"}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}

export default function CampaignsPage() {
  return (
    <SearchProvider>
      <CampaignsPageContent />
    </SearchProvider>
  )
}
