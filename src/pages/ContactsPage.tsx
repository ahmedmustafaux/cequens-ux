import * as React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { CircleFlag } from "react-circle-flags"
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
import { 
  Users, 
  Edit, 
  Archive,
  RotateCcw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  UserPlus,
  Download,
  Upload,
  Search,
  ChevronDown,
  FileUp,
  Cloud,
} from "lucide-react"
import { PageWrapper } from "@/components/page-wrapper"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { SearchProvider } from "@/contexts/search-context"
import { Highlight } from "@/components/ui/highlight"
import { PageHeader } from "@/components/page-header"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ContactsImportDialog } from "@/components/contacts-import-dialog"
import { 
  DataTable,
  DataTableHeader,
  DataTableSelectionHeader,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableRow,
} from "@/components/ui/data-table"
import { usePageTitle } from "@/hooks/use-dynamic-title"
import { useContacts, useArchiveContacts, useUnarchiveContacts } from "@/hooks/use-contacts"
import type { AppContact } from "@/lib/supabase/types"
import { toast } from "sonner"
import { formatPhoneWithCountryCode } from "@/lib/phone-utils"
import { useCreateContactContext } from "@/contexts/create-contact-context"

// Type alias for backward compatibility
type Contact = AppContact

// Tab values as constants
const TAB_ALL = "all"
const TAB_ARCHIVED = "archived"

const ContactsPageContent = (): React.JSX.Element => {
  const navigate = useNavigate()
  const location = useLocation()
  const { open: openCreateContactSheet } = useCreateContactContext()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 15,
  })
  
  // Filter states
  const [selectedChannels, setSelectedChannels] = React.useState<string[]>([])
  const [selectedTags, setSelectedTags] = React.useState<string[]>([])
  const [channelSearchQuery, setChannelSearchQuery] = React.useState("")
  const [tagSearchQuery, setTagSearchQuery] = React.useState("")
  const [isImportDialogOpen, setIsImportDialogOpen] = React.useState(false)
  const [selectedView, setSelectedView] = React.useState<string>(TAB_ALL)
  const [showArchiveDialog, setShowArchiveDialog] = React.useState(false)
  const [archiveConfirmation, setArchiveConfirmation] = React.useState("")
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  
  // Dynamic page title
  usePageTitle("Audience")
  
  // Debounced search query for database search (minimal debounce for real-time feel)
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState("")
  
  // Minimal debounce (100ms) to avoid excessive queries while keeping real-time feel
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(globalFilter)
    }, 100) // 100ms debounce for real-time feel

    return () => clearTimeout(timer)
  }, [globalFilter])

  // Fetch contacts from Supabase with search query
  // Always fetch all contacts (including archived) to get accurate counts
  const { data: allContacts = [], isLoading: isDataLoading, error } = useContacts(
    debouncedSearchQuery || undefined,
    true // Always include archived for accurate counts
  )
  
  // Archive and unarchive mutations
  const archiveContactsMutation = useArchiveContacts()
  const unarchiveContactsMutation = useUnarchiveContacts()
  
  // Column definitions for the contacts table
  const columns: ColumnDef<Contact>[] = [
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
      id: "name",
      header: "Users",
      cell: ({ row }) => {
        const contact = row.original;
        const firstName = contact.firstName || ''
        const lastName = contact.lastName || ''
        const hasName = firstName || lastName
        
        return (
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage src="" />
              <AvatarFallback className="font-medium text-xs">
                {contact.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              {hasName ? (
                <div className="text-left group-hover:underline">
                  <Highlight 
                    text={`${firstName} ${lastName}`.trim()} 
                    columnId="name"
                    className="font-medium text-sm whitespace-nowrap truncate"
                  />
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Contact
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => {
        const contact = row.original;
        // Format phone number with country code for display
        const displayPhone = formatPhoneWithCountryCode(contact.phone, contact.countryISO);
        return (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-4 h-4 flex-shrink-0 overflow-hidden rounded-full">
              <CircleFlag countryCode={contact.countryISO.toLowerCase()} className="w-full h-full" />
            </div>
            <div className="flex flex-col min-w-0">
              <Highlight 
                text={displayPhone} 
                columnId="phone"
                className="font-normal text-sm text-muted-foreground whitespace-nowrap truncate"
              />
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "channel",
      header: "Channels",
      filterFn: (row, columnId, filterValue: string[]) => {
        // OR logic: show row if its channel is in the selected channels array
        if (!filterValue || filterValue.length === 0) {
          return true; // No filter applied, show all rows
        }
        const rowChannel = row.getValue(columnId) as string | null;
        // If channel is null/empty, don't show it in filtered results unless explicitly filtering for "null"
        if (!rowChannel || (typeof rowChannel === 'string' && rowChannel.trim() === '')) {
          return false; // Hide rows with undefined channels when filtering
        }
        return filterValue.includes(rowChannel);
      },
      cell: ({ row }) => {
        const channel = row.getValue("channel") as string | null;
        
        // If channel is null or empty, show badge
        if (!channel || (typeof channel === 'string' && channel.trim() === '')) {
          return (
            <Badge variant="outline" className="text-xs">
              Not defined yet
            </Badge>
          );
        }
        
        const getChannelIconPath = (channel: string) => {
          switch (channel.toLowerCase()) {
            case 'whatsapp':
              return '/icons/WhatsApp.svg'
            case 'instagram':
              return '/icons/Instagram.svg'
            case 'messenger':
              return '/icons/Messenger.png'
            default:
              return '/icons/Messenger.png'
          }
        }

        return (
          <div className="flex items-center justify-start whitespace-nowrap">
            <img 
              src={getChannelIconPath(channel)} 
              alt={`${channel} icon`}
              className="w-4 h-4 flex-shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        );
      },
    },
    {
      accessorKey: "updatedAt",
      header: "Last Update",
      meta: {
        displayName: "Last Update"
      },
      cell: ({ row }) => {
        const updatedAt = row.original.updatedAt;
        const lastInteractionTime = row.original.lastInteractionTime;
        
        // Use lastInteractionTime if available, otherwise use updatedAt
        const displayDate = lastInteractionTime || updatedAt;
        
        if (!displayDate) {
          return (
            <div className="text-sm text-muted-foreground">
              —
            </div>
          );
        }
        
        // Format date as relative time (e.g., "2 hours ago", "3 days ago")
        const formatRelativeTime = (date: Date): string => {
          const now = new Date();
          const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
          
          if (diffInSeconds < 60) {
            return 'Just now';
          } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
          } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
          } else if (diffInSeconds < 604800) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} ${days === 1 ? 'day' : 'days'} ago`;
          } else {
            // For older dates, show formatted date
            return date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
            });
          }
        };
        
        return (
          <div className="text-sm text-muted-foreground">
            {formatRelativeTime(displayDate)}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      enableHiding: false,
      cell: () => {
        return (
          <div className="flex items-center justify-end">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" align="center">
                <p>Edit contact</p>
              </TooltipContent>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  // Apply global search from query param (?query=...)
  React.useEffect(() => {
    const params = new URLSearchParams(location.search)
    const q = params.get('query') || ""
    if (q) {
      setGlobalFilter(q)
    }
  }, [location.search])

  // Filter data based on selected view
  const filteredDataByView = React.useMemo(() => {
    if (selectedView === TAB_ARCHIVED) {
      return allContacts.filter(c => c.archived === true)
    }
    return allContacts.filter(c => !c.archived)
  }, [selectedView, allContacts])

  // Apply filters to table
  React.useEffect(() => {
    const newFilters: ColumnFiltersState = []
    
    if (selectedChannels.length > 0) {
      newFilters.push({ id: 'channel', value: selectedChannels })
    }
    
    if (selectedTags.length > 0) {
      newFilters.push({ id: 'tags', value: selectedTags })
    }
    
    setColumnFilters(newFilters)
  }, [selectedChannels, selectedTags])

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
    onGlobalFilterChange: setGlobalFilter,
    // No client-side filtering needed - search is done in database
    // Keep this for backward compatibility but it will always return true
    // since filtering is done at the database level
    globalFilterFn: () => true,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
      globalFilter,
    },
  })

  // Filter options
  const channelOptions = [
    { value: "whatsapp", label: "WhatsApp" },
    { value: "instagram", label: "Instagram" },
    { value: "messenger", label: "Messenger" }
  ]

  const tagOptions = [
    { value: "VIP", label: "VIP" },
    { value: "Enterprise", label: "Enterprise" },
    { value: "Active User", label: "Active User" },
    { value: "New Customer", label: "New Customer" }
  ]

  // Filtered options based on search
  const filteredChannelOptions = channelOptions.filter(option =>
    option.label.toLowerCase().includes(channelSearchQuery.toLowerCase())
  )

  const filteredTagOptions = tagOptions.filter(option =>
    option.label.toLowerCase().includes(tagSearchQuery.toLowerCase())
  )

  const handleCSVImport = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // TODO: Implement CSV file processing
      console.log("Selected file:", file.name)
    }
  }

  const handleThirdPartyImport = () => {
    setIsImportDialogOpen(true)
  }

  const handleExport = () => {
    // TODO: Implement export functionality
  }

  const handleCreateContact = () => {
    openCreateContactSheet()
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileChange}
      />
      
      <ContactsImportDialog 
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
      />

      {error && (
        <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">
            Error loading contacts: {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      )}
      
      <PageHeader
        title="Audience"
        description="Create and manage your audience."
        showBreadcrumbs={false}
        isLoading={isDataLoading}
        customActions={
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Upload className="w-4 h-4" />
                  Import
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCSVImport}>
                  <FileUp className="w-4 h-4 mr-2" />
                  Import from CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleThirdPartyImport}>
                  <Cloud className="w-4 h-4 mr-2" />
                  Import from 3rd Party
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button 
              size="sm" 
              className="gap-2"
              onClick={handleCreateContact}
            >
              <UserPlus className="w-4 h-4" />
              Create Contact
            </Button>
          </div>
        }
      />

      <div className="flex flex-col">
        <DataTable
          isLoading={isDataLoading}
          views={{
            options: [
              { label: "All contacts", value: TAB_ALL, count: allContacts.filter(c => !c.archived).length },
              { label: "Archived", value: TAB_ARCHIVED, count: allContacts.filter(c => c.archived === true).length }
            ],
            selectedView: selectedView,
            onViewChange: setSelectedView
          }}
          searchConfig={{
            placeholder: "Search contacts by name or phone",
            searchColumns: ['name', 'phone', 'lastUpdate'],
            table: table
          }}
          filters={[
            {
              key: "channels",
              label: "Channel",
              options: channelOptions,
              selectedValues: selectedChannels,
              onSelectionChange: setSelectedChannels,
              onClear: () => setSelectedChannels([]),
              searchable: true,
              searchPlaceholder: "Search channels...",
              searchQuery: channelSearchQuery,
              onSearchChange: setChannelSearchQuery,
              filteredOptions: filteredChannelOptions
            },
            {
              key: "tags",
              label: "Tags",
              options: tagOptions,
              selectedValues: selectedTags,
              onSelectionChange: setSelectedTags,
              onClear: () => setSelectedTags([]),
              searchable: true,
              searchPlaceholder: "Search tags...",
              searchQuery: tagSearchQuery,
              onSearchChange: setTagSearchQuery,
              filteredOptions: filteredTagOptions
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
            pageSizeOptions: [15, 20, 30]
          }}
          footerLabel={`Showing ${table.getRowModel().rows.length} contacts${table.getSelectedRowModel().rows.length > 0 ? ` • ${table.getSelectedRowModel().rows.length} selected` : ''}`}
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
              audience="contacts"
              columnCount={table.getVisibleFlatColumns().length}
              rightActions={
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => {
                      // TODO: Implement send campaign functionality
                    }}
                  >
                    Send campaign
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => {
                      // TODO: Implement export functionality
                    }}
                  >
                    Export
                  </Button>
                  {selectedView === TAB_ARCHIVED ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={async () => {
                        const selectedRows = table.getSelectedRowModel().rows
                        const selectedIds = selectedRows.map(row => row.original.id)
                        
                        if (selectedIds.length === 0) {
                          toast.error("No contacts selected")
                          return
                        }

                        try {
                          await unarchiveContactsMutation.mutateAsync(selectedIds)
                          toast.success(`Successfully restored ${selectedIds.length} contact${selectedIds.length > 1 ? 's' : ''}`)
                          table.resetRowSelection()
                        } catch (error) {
                          console.error("Error restoring contacts:", error)
                          toast.error("Failed to restore contacts. Please try again.")
                        }
                      }}
                      disabled={unarchiveContactsMutation.isPending}
                    >
                      {unarchiveContactsMutation.isPending ? "Restoring..." : "Restore"}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => {
                        setShowArchiveDialog(true)
                      }}
                    >
                      Archive
                    </Button>
                  )}
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
                  onClick={() => navigate(`/contacts/${row.original.id}`)}
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

      {/* Archive Alert Dialog */}
      <AlertDialog 
        open={showArchiveDialog} 
        onOpenChange={(open: boolean) => {
          setShowArchiveDialog(open)
          if (!open) {
            setArchiveConfirmation("")
          }
        }}
      >
        <AlertDialogContent className="sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Archive Contacts
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive the selected contacts? 
              Archived contacts will be moved to the archived view and can be restored later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4">
            <div className="rounded-lg border border-warning/30 bg-warning/10 p-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <p className="text-sm text-amber-900 font-semibold">Warning</p>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    Archiving will move the selected contacts to the archived section. 
                    You can restore them later if needed.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="archiveConfirm" className="text-sm font-medium">
                Type <code className="bg-muted px-2 py-1 rounded font-mono text-xs">archive</code> to confirm:
              </Label>
              <Input
                id="archiveConfirm"
                value={archiveConfirmation}
                onChange={(e) => setArchiveConfirmation(e.target.value)}
                placeholder="Type 'archive' to confirm"
                className="font-mono"
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setArchiveConfirmation("")
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (archiveConfirmation.toLowerCase() === "archive") {
                  const selectedRows = table.getSelectedRowModel().rows
                  const selectedIds = selectedRows.map(row => row.original.id)
                  
                  if (selectedIds.length === 0) {
                    toast.error("No contacts selected")
                    return
                  }

                  try {
                    await archiveContactsMutation.mutateAsync(selectedIds)
                    // Close dialog and reset confirmation immediately after success
                    setArchiveConfirmation("")
                    setShowArchiveDialog(false)
                    toast.success(`Successfully archived ${selectedIds.length} contact${selectedIds.length > 1 ? 's' : ''}`)
                    table.resetRowSelection()
                  } catch (error) {
                    console.error("Error archiving contacts:", error)
                    toast.error("Failed to archive contacts. Please try again.")
                    // Don't close dialog on error so user can try again
                  }
                }
              }}
              disabled={archiveConfirmation.toLowerCase() !== "archive" || archiveContactsMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {archiveContactsMutation.isPending ? "Archiving..." : "Archive Contacts"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default function ContactsPage(): React.JSX.Element {
  return (
    <SearchProvider>
      <PageWrapper>
        <ContactsPageContent />
      </PageWrapper>
    </SearchProvider>
  )
}
