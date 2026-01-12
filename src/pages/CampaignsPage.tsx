import * as React from "react"
import { useNavigate } from "react-router-dom"
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
import { useCampaigns } from "@/hooks/use-campaigns"
import type { Campaign } from "@/lib/supabase/types"

// Column definitions for the campaigns table
const columns: ColumnDef<Campaign>[] = [
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
      <div className="text-left group-hover:underline">
        <Highlight 
          text={row.getValue("name") as string}
          columnId="name"
          className="font-medium text-sm whitespace-nowrap truncate"
        />
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-normal whitespace-nowrap">
        {row.getValue("type")}
      </Badge>
    ),
  },
  {
    accessorKey: "recipients",
    header: () => <div className="text-right">Recipients</div>,
    cell: ({ row }) => (
      <div className="text-right whitespace-nowrap text-sm text-muted-foreground">
        {row.getValue<number>("recipients").toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "open_rate",
    header: () => <div className="text-right">Open Rate</div>,
    cell: ({ row }) => {
      const sentDate = row.original.sent_date;
      const openRate = row.getValue<number>("open_rate");
      return (
        <div className="text-right whitespace-nowrap text-sm text-muted-foreground">
          {sentDate ? `${openRate}%` : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "click_rate",
    header: () => <div className="text-right">Click Rate</div>,
    cell: ({ row }) => {
      const sentDate = row.original.sent_date;
      const clickRate = row.getValue<number>("click_rate");
      return (
        <div className="text-right whitespace-nowrap text-sm text-muted-foreground">
          {sentDate ? `${clickRate}%` : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "sent_date",
    header: "Sent Date",
    cell: ({ row }) => {
      const sentDate = row.getValue<string | null>("sent_date");
      return (
        <div className="whitespace-nowrap">
          {sentDate ? new Date(sentDate).toLocaleDateString() : "Not sent"}
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
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
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
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                View campaign
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit campaign
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete campaign
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
];

function CampaignsPageContent() {
  const navigate = useNavigate()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 15,
  })
  // Fetch campaigns from database
  const { data: campaigns = [], isLoading: isDataLoading, error } = useCampaigns()

  // Filter states
  const [typeFilter, setTypeFilter] = React.useState<string[]>([])
  const [typeSearchQuery, setTypeSearchQuery] = React.useState("")
  const [selectedView, setSelectedView] = React.useState<string>("all")

  // Filter options
  const typeOptions = [
    { value: "Email", label: "Email" },
    { value: "SMS", label: "SMS" },
    { value: "Whatsapp", label: "Whatsapp" }
  ]

  // Filtered options based on search
  const filteredTypeOptions = typeOptions.filter(option =>
    option.label.toLowerCase().includes(typeSearchQuery.toLowerCase())
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
    switch (selectedView) {
      case "scheduled":
        return campaigns.filter(c => c.status === "Active")
      case "draft":
        return campaigns.filter(c => c.status === "Draft")
      case "sent":
        return campaigns.filter(c => c.status === "Completed")
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
    
    setColumnFilters(newFilters)
  }, [typeFilter])

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

  const handleNewCampaign = () => {
    navigate("/campaigns/create")
  };

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
                { label: "Scheduled", value: "scheduled", count: campaigns.filter(c => c.status === "Active").length },
                { label: "Draft", value: "draft", count: campaigns.filter(c => c.status === "Draft").length },
                { label: "Sent", value: "sent", count: campaigns.filter(c => c.status === "Completed").length }
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
                            variant="outline"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => {
                              // TODO: Implement see analytics functionality
                            }}
                          >
                            See analytics
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
                          onClick={() => navigate(`/campaigns/${row.original.id}`)}
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
