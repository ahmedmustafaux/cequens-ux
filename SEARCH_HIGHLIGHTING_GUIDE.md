# Search Highlighting Master Component Guide

This guide explains how to use the master search highlighting approach in your data tables. The highlighting system is now integrated directly into the `DataTable` component, making it reusable across your entire application.

## 🚀 Quick Start

### 1. Wrap your table with SearchProvider

```tsx
import { SearchProvider } from '@/contexts/search-context'

export default function MyTablePage() {
  return (
    <SearchProvider>
      <MyTableContent />
    </SearchProvider>
  )
}
```

### 2. Use the useTableSearch hook

```tsx
import { useTableSearch } from '@/hooks/use-table-search'

function MyTableContent() {
  const table = useReactTable({...})
  
  // Enable search highlighting for specific columns
  useTableSearch({ 
    table, 
    searchColumns: ['name', 'email'] // Specify which columns to highlight
  })
  
  return (
    // Your table JSX
  )
}
```

### 3. Enable auto-highlighting in DataTableCell

```tsx
<DataTableCell 
  key={cell.id}
  columnId={cell.column.id}
  autoHighlight={cell.column.id === 'name'} // Enable for specific columns
>
  {flexRender(cell.column.columnDef.cell, cell.getContext())}
</DataTableCell>
```

## 📋 Complete Example

```tsx
"use client"

import React from 'react'
import { ColumnDef, useReactTable, getCoreRowModel, getFilteredRowModel } from '@tanstack/react-table'
import { SearchProvider } from '@/contexts/search-context'
import { useTableSearch } from '@/hooks/use-table-search'
import { DataTable, DataTableHeader, DataTableBody, DataTableRow, DataTableCell, DataTableHead } from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface MyData {
  id: string
  name: string
  email: string
}

const data: MyData[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
]

const columns: ColumnDef<MyData>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ getValue }) => <span>{getValue() as string}</span>,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ getValue }) => <span>{getValue() as string}</span>,
  },
]

function MyTableContent() {
  const [columnFilters, setColumnFilters] = React.useState([])

  const table = useReactTable({
    data,
    columns,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { columnFilters },
  })

  // Enable search highlighting for name and email columns
  useTableSearch({ 
    table, 
    searchColumns: ['name', 'email'] 
  })

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <DataTable>
        <DataTableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            headerGroup.headers.map((header) => (
              <DataTableHead key={header.id}>
                {header.isPlaceholder ? null : header.column.columnDef.header}
              </DataTableHead>
            ))
          ))}
        </DataTableHeader>
        <DataTableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <DataTableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <DataTableCell 
                    key={cell.id}
                    columnId={cell.column.id}
                    autoHighlight={['name', 'email'].includes(cell.column.id)}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </DataTableCell>
                ))}
              </DataTableRow>
            ))
          ) : (
            <DataTableRow>
              <DataTableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </DataTableCell>
            </DataTableRow>
          )}
        </DataTableBody>
      </DataTable>
    </div>
  )
}

export default function MyTablePage() {
  return (
    <SearchProvider>
      <MyTableContent />
    </SearchProvider>
  )
}
```

## 🎨 Customization

### Custom Highlight Styling

You can customize the highlight appearance by passing a `highlightClassName` prop:

```tsx
<DataTableCell 
  key={cell.id}
  columnId={cell.column.id}
  autoHighlight={cell.column.id === 'name'}
  highlightClassName="bg-blue-200 text-blue-900 px-1 py-0.5 rounded font-semibold"
>
  {flexRender(cell.column.columnDef.cell, cell.getContext())}
</DataTableCell>
```

### Multiple Search Columns

You can enable highlighting for multiple columns:

```tsx
// In useTableSearch
useTableSearch({ 
  table, 
  searchColumns: ['name', 'email', 'phone'] 
})

// In DataTableCell
<DataTableCell 
  key={cell.id}
  columnId={cell.column.id}
  autoHighlight={['name', 'email', 'phone'].includes(cell.column.id)}
>
  {flexRender(cell.column.columnDef.cell, cell.getContext())}
</DataTableCell>
```

## 🔧 Advanced Usage

### Manual Highlight Component

If you need more control, you can still use the `Highlight` component manually:

```tsx
import { Highlight } from '@/components/ui/highlight'

// In your cell renderer
cell: ({ row, table }) => {
  const searchTerm = (table.getColumn("name")?.getFilterValue() as string) ?? ""
  return (
    <Highlight 
      text={row.original.name} 
      searchTerm={searchTerm}
      className="font-medium"
    />
  )
}
```

### Context-based Highlighting

You can also use the search context directly:

```tsx
import { useSearch } from '@/contexts/search-context'

function MyComponent() {
  const { getSearchTerm } = useSearch()
  const searchTerm = getSearchTerm('name')
  
  return (
    <Highlight 
      text="Some text" 
      columnId="name"
      className="text-lg"
    />
  )
}
```

## 🎯 Benefits

1. **Automatic**: No need to manually pass search terms to every cell
2. **Reusable**: Works across all tables in your application
3. **Consistent**: Same highlighting behavior everywhere
4. **Flexible**: Easy to enable/disable per column
5. **Customizable**: Full control over highlight styling
6. **Performance**: Efficient context-based updates

## 📁 File Structure

```
src/
├── contexts/
│   └── search-context.tsx          # Search context provider
├── hooks/
│   └── use-table-search.ts         # Table search integration hook
├── components/
│   ├── ui/
│   │   ├── data-table.tsx          # Enhanced DataTable with highlighting
│   │   └── highlight.tsx           # Highlight components
│   └── examples/
│       └── table-highlight-example.tsx  # Complete example
```

## 🚨 Important Notes

1. **SearchProvider Required**: Always wrap your table with `SearchProvider`
2. **Column IDs**: Make sure your column IDs match between `searchColumns` and `autoHighlight`
3. **Performance**: Only enable `autoHighlight` for columns that need highlighting
4. **TypeScript**: The system is fully typed for better development experience

This master approach makes search highlighting a first-class feature of your data tables, ensuring consistency and reducing boilerplate code across your application.
