import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, ChevronRight, ArrowUpDownIcon, Columns3, ChevronDown } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AutoHighlight } from "@/components/ui/highlight"
import { TableHeader, TableHead, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
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
import { FilterSelect } from "@/components/ui/filter-select"
import { SearchInput } from "@/components/ui/search-input"
import { useTableSearch } from "@/hooks/use-table-search"
import { TableSkeleton } from "@/components/ui/table"
interface FilterOption {
  value: string
  label: string
}
interface FilterConfig {
  key: string
  label: string
  options: FilterOption[]
  selectedValues: string[]
  onSelectionChange: (values: string[]) => void
  onClear: () => void
  searchable?: boolean
  searchPlaceholder?: string
  searchQuery?: string
  onSearchChange?: (query: string) => void
  filteredOptions?: FilterOption[]
}
interface ViewOption {
  label: string
  value: string
  count?: number
}
interface ViewsConfig {
  options: ViewOption[]
  selectedView: string
  onViewChange: (view: string) => void
  renderSelectedView?: (view: ViewOption, onClick: () => void) => React.ReactNode
  addButton?: React.ReactNode
}
interface DataTableProps {
  children: React.ReactNode
  className?: string
  showFooter?: boolean
  footerContent?: React.ReactNode
  isLoading?: boolean
  loadingRows?: number
  pagination?: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    onPrevious: () => void
    onNext: () => void
    hasPrevious: boolean
    hasNext: boolean
    onPageSizeChange?: (pageSize: number) => void
    pageSizeOptions?: number[]
  }
  footerLabel?: string
  // Search and filter props
  searchConfig?: {
    placeholder?: string
    searchColumns?: string[]
    table: any // TanStack Table instance - TODO: Add proper typing
  }
  filters?: FilterConfig[]
  showControls?: boolean
  views?: ViewsConfig
}
interface DataTableHeaderProps {
  children: React.ReactNode
  className?: string
}
interface DataTableBodyProps {
  children: React.ReactNode
  className?: string
}
interface DataTableRowProps {
  children: React.ReactNode
  className?: string
  selected?: boolean
  onClick?: () => void
}
interface DataTableHeadProps {
  children: React.ReactNode
  className?: string
  width?: string
}
interface DataTableCellProps {
  children: React.ReactNode
  className?: string
  colSpan?: number
  columnId?: string
  autoHighlight?: boolean
  highlightClassName?: string
  onClick?: () => void
  clickable?: boolean
}
// Main DataTable component
function DataTable({ 
  children, 
  className,
  showFooter = true,
  footerContent,
  isLoading = false,
  loadingRows = 4,
  pagination,
  footerLabel,
  searchConfig,
  filters,
  showControls = true,
  views,
}: DataTableProps) {
  const tableRef = React.useRef<HTMLDivElement>(null)
  // Integrate table search if searchConfig is provided
  useTableSearch({ 
    table: searchConfig?.table, 
    searchColumns: searchConfig?.searchColumns || ['name'],
    columnFilters: searchConfig?.table?.getState().columnFilters || [],
    globalFilter: searchConfig?.table?.getState().globalFilter || ""
  })
  return (
    <div className="w-full flex flex-col gap-4 mb-4">
      {/* Search and Filters Section */}
      {(searchConfig || filters || showControls) && !isLoading && (
        <div className="flex flex-col">
          <div className="w-full space-y-4 flex flex-col">
            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Left Side - Search Bar and Filters */}
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap w-full">
                {/* Search Bar with Controls on Small Screens */}
                {searchConfig && (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <SearchInput
                      placeholder={searchConfig.placeholder || "Search..."}
                      value={searchConfig.table.getState().globalFilter ?? ""}
                      onChange={(searchValue) => {
                        // Use global filter for OR logic across multiple columns
                        searchConfig.table.setGlobalFilter(searchValue)
                      }}
                      minWidth="320px"
                    />
                    
                    {/* Toggle Column and Sorting Controls - Only on Small Screens */}
                    {showControls && searchConfig?.table && (
                      <div className="flex items-center gap-1 sm:hidden">
                        {/* Toggle Columns */}
                        <DropdownMenu>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" className="h-9 w-9">
                                  <Columns3 className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Toggle columns</p>
                            </TooltipContent>
                          </Tooltip>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {searchConfig.table
                              .getAllColumns()
                              .filter((column: any) => column.getCanHide()) // eslint-disable-line @typescript-eslint/no-explicit-any
                              .map((column: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                                return (
                                  <DropdownMenuCheckboxItem
                                    key={column.id}
                                    className="capitalize"
                                    checked={column.getIsVisible()}
                                    onCheckedChange={(value) =>
                                      column.toggleVisibility(!!value)
                                    }
                                  >
                                    {column.columnDef.meta?.displayName || column.id}
                                  </DropdownMenuCheckboxItem>
                                )
                              })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        {/* Sorting */}
                        <DropdownMenu>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" className="h-9 w-9">
                                  <ArrowUpDownIcon className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Sort</p>
                            </TooltipContent>
                          </Tooltip>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {searchConfig.table
                              .getAllColumns()
                              .filter((column: any) => column.getCanSort()) // eslint-disable-line @typescript-eslint/no-explicit-any
                              .map((column: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                                return (
                                  <DropdownMenuItem
                                    key={column.id}
                                    onClick={() => column.toggleSorting()}
                                    className="capitalize"
                                  >
                                    {column.id}
                                  </DropdownMenuItem>
                                )
                              })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                )}
                {/* Filters */}
                {filters && filters.length > 0 && (
                  <div className="flex flex-row gap-3 items-center flex-wrap">
                    {/* Dynamic Filters */}
                    {filters.map((filter) => (
                      <FilterSelect
                        key={filter.key}
                        placeholder={filter.label}
                        options={filter.options}
                        selectedValues={filter.selectedValues}
                        onSelectionChange={filter.onSelectionChange}
                        onClear={filter.onClear}
                        searchable={filter.searchable}
                        searchPlaceholder={filter.searchPlaceholder}
                        searchQuery={filter.searchQuery}
                        onSearchChange={filter.onSearchChange}
                        filteredOptions={filter.filteredOptions}
                      />
                    ))}
                    {/* Reset All Button - only show when filters are active */}
                    {filters.some(filter => filter.selectedValues.length > 0) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          filters.forEach(filter => filter.onClear())
                        }}
                        className="h-9 px-3 text-sm"
                      >
                        Reset All
                      </Button>
                    )}
                  </div>
                )}
              </div>
              {/* Right Side - Table Controls */}
              {showControls && searchConfig?.table && (
                <div className="hidden sm:flex items-center gap-2">
                    <DropdownMenu>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                              <ArrowUpDownIcon className="h-4 w-4" />
                              <span className="sr-only">Sort</span>
                            </Button>
                          </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center">
                          <p>Sort table</p>
                        </TooltipContent>
                      </Tooltip>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {searchConfig.table
                          .getAllColumns()
                          .filter((column: any) => column.getCanSort()) // eslint-disable-line @typescript-eslint/no-explicit-any
                          .map((column: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                            const isSorted = column.getIsSorted()
                            return (
                              <DropdownMenuItem
                                key={column.id}
                                onClick={() => {
                                  if (isSorted === false) {
                                    column.toggleSorting(false)
                                  } else if (isSorted === "asc") {
                                    column.toggleSorting(true)
                                  } else {
                                    column.clearSorting()
                                  }
                                }}
                                className="capitalize"
                              >
                                {column.id}
                                {isSorted === "asc" && " ↑"}
                                {isSorted === "desc" && " ↓"}
                              </DropdownMenuItem>
                            )
                          })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                              <Columns3 className="h-4 w-4" />
                              <span className="sr-only">Edit columns</span>
                            </Button>
                          </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center">
                          <p>Toggle columns</p>
                        </TooltipContent>
                      </Tooltip>
                      <DropdownMenuContent align="end">
                        {searchConfig.table
                          .getAllColumns()
                          .filter((column: any) => column.getCanHide()) // eslint-disable-line @typescript-eslint/no-explicit-any
                          .map((column: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                            return (
                              <DropdownMenuCheckboxItem
                                key={column.id}
                                className="capitalize"
                                checked={column.getIsVisible()}
                                onCheckedChange={(value) =>
                                  column.toggleVisibility(!!value)
                                }
                              >
                                {column.columnDef.meta?.displayName || column.id}
                              </DropdownMenuCheckboxItem>
                            )
                          })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
      {/* Table container with content-fitted height */}
      <div className="w-full flex flex-col mb-2 relative" data-table-container>
        {isLoading ? (
          <TableSkeleton 
            rows={loadingRows} 
            columns={4}
          />
        ) : (
          <div className="flex flex-col gap-0" ref={tableRef}>
            <div className="w-full overflow-x-auto rounded-md border bg-card">
              <table className={cn("w-full caption-bottom text-sm", className)}>
                {views && (
                  <thead>
                    <tr>
                      <th colSpan={999} className="px-2 py-2 bg-card border-b border-border">
                        <div className="flex items-center gap-2">
                          {views.options.map((view) => {
                            const isSelected = views.selectedView === view.value
                            const handleClick = () => views.onViewChange(view.value)
                            
                            if (isSelected && views.renderSelectedView) {
                              return (
                                <React.Fragment key={view.value}>
                                  {views.renderSelectedView(view, handleClick)}
                                </React.Fragment>
                              )
                            }
                            
                            return (
                              <Button
                                key={view.value}
                                variant={isSelected ? "secondary" : "ghost"}
                                size="sm"
                                onClick={handleClick}
                                className="h-8"
                              >
                                {view.label}
                                {view.count !== undefined && (
                                  <span className="ml-1.5 text-xs text-muted-foreground">
                                    ({view.count})
                                  </span>
                                )}
                              </Button>
                            )
                          })}
                          {views.addButton}
                        </div>
                      </th>
                    </tr>
                  </thead>
                )}
                {children}
              </table>
            </div>
            
            {/* Footer - Outside table container with 0 gap */}
            {showFooter && (pagination || footerLabel || footerContent) && (
              <DataTableFooter
                pagination={pagination}
                footerLabel={footerLabel}
                footerContent={footerContent}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
// Fixed Footer Component
function DataTableFooter({ 
  pagination, 
  footerLabel, 
  footerContent 
}: {
  pagination?: DataTableProps['pagination']
  footerLabel?: string
  footerContent?: React.ReactNode
}) {
  if (!pagination && !footerLabel && !footerContent) return null
  return (
    <div className="px-2 lg:px-4 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
        {/* First line - Entry count info */}
        <div className="flex items-center">
          {pagination && (
            <div className="text-sm">
              <span className="text-muted-foreground">Showing </span>
              <span className="text-foreground">
                {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
              </span>
              <span className="text-muted-foreground"> of </span>
              <span className="text-foreground">
                {pagination.totalItems}
              </span>
              <span className="text-muted-foreground"> entries</span>
            </div>
          )}
          {footerLabel && !pagination && (
            <div className="text-muted-foreground text-sm">
              {footerLabel}
            </div>
          )}
        </div>
        
        {/* Second line - Pagination controls */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {pagination ? (
            <>
              {/* Page size selector */}
              {pagination.onPageSizeChange && pagination.pageSizeOptions && (
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span className="text-muted-foreground text-sm">Show:</span>
                  <Select
                    value={pagination.itemsPerPage.toString()}
                    onValueChange={(value) => pagination.onPageSizeChange?.(parseInt(value))}
                  >
                    <SelectTrigger className="h-8 w-20 bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {pagination.pageSizeOptions.map((size) => (
                        <SelectItem key={size} value={size.toString()}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {/* Page info */}
              <div className="text-muted-foreground text-sm">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              
              {/* Pagination buttons */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={pagination.onPrevious}
                  disabled={!pagination.hasPrevious}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={pagination.onNext}
                  disabled={!pagination.hasNext}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            footerContent
          )}
        </div>
      </div>
    </div>
  )
}
// DataTable Selection Header component
const DataTableSelectionHeader = React.forwardRef<HTMLTableSectionElement, {
  selectedCount: number
  onClearSelection: () => void
  onSelectAll: () => void
  onSelectAllOnPage?: () => void
  totalCount: number
  showCount?: number
  selectedCountOnCurrentPage?: number
  audience?: string
  rightActions?: React.ReactNode
  className?: string
  columnCount?: number
}>(({ 
  selectedCount, 
  onClearSelection, 
  onSelectAll,
  onSelectAllOnPage,
  totalCount,
  showCount,
  selectedCountOnCurrentPage,
  audience = "contacts",
  rightActions,
  className,
  columnCount = 99
}, ref) => {
  const allPageItemsSelected = selectedCountOnCurrentPage !== undefined 
    ? selectedCountOnCurrentPage >= (showCount ?? totalCount)
    : false
  // Calculate colSpan: total columns minus the select column (which is always 1)
  const colSpan = columnCount > 1 ? columnCount - 1 : 99
  return (
    <TableHeader ref={ref} className={className}>
      <TableRow className="bg-table-header">
        <TableHead>
          <Checkbox
            checked={
              selectedCount === 0 
                ? false 
                : selectedCount === totalCount 
                  ? true 
                  : "indeterminate"
            }
            onCheckedChange={(checked) => {
              if (checked === true) {
                onSelectAll()
              } else {
                onClearSelection()
              }
            }}
          />
        </TableHead>
        <TableHead colSpan={colSpan}>
          <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="inline-flex items-center justify-center gap-1 whitespace-nowrap text-sm font-medium cursor-pointer text-foreground hover:text-accent-foreground h-6">
                    {selectedCount} selected
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {!allPageItemsSelected && (
                  <DropdownMenuItem 
                    onClick={onSelectAllOnPage || onSelectAll} 
                    className="cursor-pointer"
                  >
                    Select all {showCount ?? totalCount} in this page
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={onSelectAll} className="cursor-pointer">
                  Select all {audience}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onClearSelection} className="cursor-pointer">
                  Unselect all
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex items-center gap-1">
              {rightActions || (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs"
                  >
                    Export
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs text-destructive hover:text-destructive hover:border-destructive"
                  >
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        </TableHead>
      </TableRow>
    </TableHeader>
  )
})
DataTableSelectionHeader.displayName = "DataTableSelectionHeader"
// DataTable Header component
const DataTableHeader = React.forwardRef<HTMLTableSectionElement, DataTableHeaderProps>(
  ({ children, className }, ref) => {
    return (
      <TableHeader ref={ref} className={className}>
        <TableRow className="bg-table-header">
          {children}
        </TableRow>
      </TableHeader>
    )
  }
)
DataTableHeader.displayName = "DataTableHeader"
// DataTable Body component
function DataTableBody({ children, className }: DataTableBodyProps) {
  return (
    <tbody className={cn("[&_tr:last-child]:border-0", className)}>
      {children}
    </tbody>
  )
}
// DataTable Row component
function DataTableRow({ children, className, selected, onClick }: DataTableRowProps) {
  return (
    <tr 
      className={cn(
        "border-b border-border hover:bg-accent data-[state=selected]:bg-muted", // Use same background as body
        selected && "bg-accent", // Apply selected state styling
        className
      )}
      data-state={selected ? "selected" : undefined}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}
// DataTable Head component
function DataTableHead({ children, className, width }: DataTableHeadProps) {
  return (
    <th className={cn(
      "text-foreground px-4 py-2 text-left align-middle font-medium [&:has([role=checkbox])]:pr-0 [&:has([role=checkbox])]:w-12 [&>[role=checkbox]]:translate-y-[2px]",
      width && `w-${width}`,
      className
    )}>
      {children}
    </th>
  )
}
// DataTable Cell component
function DataTableCell({ 
  children, 
  className, 
  colSpan, 
  columnId, 
  autoHighlight = false,
  highlightClassName,
  onClick,
  clickable = false
}: DataTableCellProps) {
  // Memoize the processed children to prevent unnecessary re-processing
  const processedChildren = React.useMemo(() => {
    if (!autoHighlight || !columnId) {
      return children
    }
    // Helper function to recursively process children and highlight text content
    const processChildren = (children: React.ReactNode): React.ReactNode => {
      return React.Children.map(children, (child) => {
        if (typeof child === 'string') {
          return (
            <AutoHighlight 
              text={child} 
              columnId={columnId}
              highlightClassName={highlightClassName}
            />
          )
        }
        
        if (React.isValidElement(child)) {
          // If the child is a React element, recursively process its children
          const childProps = child.props as any // eslint-disable-line @typescript-eslint/no-explicit-any
          if (childProps.children) {
            return React.cloneElement(child as any, { // eslint-disable-line @typescript-eslint/no-explicit-any
              ...childProps,
              children: processChildren(childProps.children)
            })
          }
          return child
        }
        
        return child
      })
    }
    return processChildren(children)
  }, [children, autoHighlight, columnId, highlightClassName])
  const handleClick = (event: React.MouseEvent) => {
    // Only handle click if the cell is clickable and onClick is provided
    if (clickable && onClick) {
      // Check if the click target is the checkbox itself
      const target = event.target as HTMLElement
      const isCheckbox = target.closest('[data-slot="checkbox"]')
      
      // If it's not the checkbox, handle the click and stop propagation
      if (!isCheckbox) {
        event.stopPropagation() // Prevent row click handler from being triggered
        onClick()
      }
    }
  }
  return (
    <td 
      className={cn(
        "px-4 py-2 align-middle [&:has([role=checkbox])]:pr-0 [&:has([role=checkbox])]:w-12 [&>[role=checkbox]]:translate-y-[2px]",
        clickable && "cursor-pointer hover:bg-accent",
        className
      )} 
      colSpan={colSpan}
      onClick={handleClick}
    >
      {processedChildren}
    </td>
  )
}
export {
  DataTable,
  DataTableHeader,
  DataTableSelectionHeader,
  DataTableBody,
  DataTableRow,
  DataTableHead,
  DataTableCell,
  DataTableFooter
}
