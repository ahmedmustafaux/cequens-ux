import * as React from "react"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, X, RotateCcw, ChevronDown, ChevronUp } from "lucide-react"
import { Field, FieldLabel, FieldContent } from "@/components/ui/field"
import { ButtonGroup } from "@/components/ui/button-group"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { type Segment, type SegmentFilter, mockContacts, getContactsForSegment } from "@/data/mock-data"
import { toast } from "sonner"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { FilterSearchInput } from "@/components/ui/filter-search-input"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { type DateRange } from "react-day-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FILTER_CATEGORIES, OPERATOR_LABELS, type FilterCategory } from "@/data/filter-config"
import { CircleFlag } from "react-circle-flags"

export interface CreateSegmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (segment: Omit<Segment, "id" | "contactIds" | "createdAt" | "updatedAt">) => void
  editingSegment?: Segment | null
  onUpdate?: (segmentId: string, segment: Omit<Segment, "id" | "contactIds" | "createdAt" | "updatedAt">) => void
}

// Filter item with operator support
type FilterItemWithOperator = {
  id: string
  filter: SegmentFilter
  operator?: 'and' | 'or' // Operator before this item (connects to previous)
  groupId?: string // If set, this filter belongs to a group
}

// Filter group
type FilterGroup = {
  id: string
  operator?: 'and' | 'or' // Operator before this group
  groupOperator: 'and' | 'or' // Operator within the group
  items: FilterItemWithOperator[]
}

// Combined filter structure
type FilterStructure = FilterItemWithOperator | FilterGroup

// Get unique values from contacts for filter options
const getAllTags = (): string[] => {
  const tags = new Set<string>()
  mockContacts.forEach((contact) => {
    contact.tags.forEach((tag) => tags.add(tag))
  })
  return Array.from(tags).sort()
}

const getAllChannels = (): string[] => {
  // Return all possible channels available in the system
  // Meta channels first: WhatsApp, Messenger, Instagram, then others
  return ["whatsapp", "messenger", "instagram", "sms", "email", "phone", "rcs", "push"]
}

const getAllCountries = (): Array<{ code: string; name: string }> => {
  const countries = new Map<string, string>()
  mockContacts.forEach((contact) => {
    if (!countries.has(contact.countryISO)) {
      const countryNames: Record<string, string> = {
        SA: "Saudi Arabia",
        US: "United States",
        EG: "Egypt",
        IN: "India",
        GB: "United Kingdom",
        AE: "United Arab Emirates",
      }
      countries.set(contact.countryISO, countryNames[contact.countryISO] || contact.countryISO)
    }
  })
  return Array.from(countries.entries())
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

const getAllConversationStatuses = (): string[] => {
  const statuses = new Set<string>()
  mockContacts.forEach((contact) => {
    statuses.add(contact.conversationStatus)
  })
  return Array.from(statuses).sort()
}

// Helper to flatten filter structure to SegmentFilter[] for saving
const flattenFilters = (structure: FilterStructure[]): SegmentFilter[] => {
  const result: SegmentFilter[] = []
  
  const processItem = (item: FilterStructure) => {
    if ('filter' in item) {
      // It's a FilterItemWithOperator
      result.push(item.filter)
    } else {
      // It's a FilterGroup - process all items in the group
      item.items.forEach(processItem)
    }
  }
  
  structure.forEach(processItem)
  return result
}

export function CreateSegmentDialog({
  open,
  onOpenChange,
  onSave,
  editingSegment,
  onUpdate,
}: CreateSegmentDialogProps): React.JSX.Element {
  const [name, setName] = React.useState("")
  const [filterStructure, setFilterStructure] = React.useState<FilterStructure[]>([])
  const [isNameDialogOpen, setIsNameDialogOpen] = React.useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
  const [isAddingFilter, setIsAddingFilter] = React.useState(false)
  const [isAddingToGroup, setIsAddingToGroup] = React.useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null)
  const [selectedFieldForValueSelection, setSelectedFieldForValueSelection] = React.useState<SegmentFilter["field"] | null>(null)
  const [fieldSearchQuery, setFieldSearchQuery] = React.useState("")
  const [valueSearchQuery, setValueSearchQuery] = React.useState("")
  const [editingFilterId, setEditingFilterId] = React.useState<string | null>(null)
  const [editingFilterPart, setEditingFilterPart] = React.useState<'category' | 'field' | 'operator' | 'value' | null>(null)
  const [timeUnits, setTimeUnits] = React.useState<Record<string, string>>({})

  // Available options for filters
  const allTags = React.useMemo(() => getAllTags(), [])
  const allChannels = React.useMemo(() => getAllChannels(), [])
  const allCountries = React.useMemo(() => getAllCountries(), [])
  const allStatuses = React.useMemo(() => getAllConversationStatuses(), [])

  // Initialize form when editing
  React.useEffect(() => {
    if (editingSegment && open) {
      setName(editingSegment.name)
      // Convert SegmentFilter[] to FilterStructure[]
      const structure: FilterStructure[] = editingSegment.filters.map((filter, index) => ({
        id: `filter-${index}`,
        filter,
        operator: index > 0 ? 'and' : undefined,
      }))
      setFilterStructure(structure)
      setIsDrawerOpen(true)
      setIsNameDialogOpen(false)
    } else if (open && !editingSegment) {
      // Reset form for new segment
      setName("")
      setFilterStructure([])
      setIsNameDialogOpen(true)
      setIsDrawerOpen(false)
    }
  }, [editingSegment, open])

  // Close both dialogs when main open changes
  React.useEffect(() => {
    if (!open) {
      setIsNameDialogOpen(false)
      setIsDrawerOpen(false)
      setSelectedFieldForValueSelection(null)
      setFieldSearchQuery("")
      setValueSearchQuery("")
      setEditingFilterId(null)
      setIsAddingToGroup(null)
    }
  }, [open])

  const handleNameSubmit = (e?: React.KeyboardEvent | React.MouseEvent) => {
    if (e && 'preventDefault' in e) {
      e.preventDefault()
    }
    if (!name.trim()) {
      toast.error("Please enter a segment name")
      return
    }
    setIsNameDialogOpen(false)
    setIsDrawerOpen(true)
  }

  const handleDrawerClose = (open: boolean) => {
    setIsDrawerOpen(open)
    if (!open) {
      onOpenChange(false)
    }
  }

  const generateId = () => `filter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  const handleCategorySelected = React.useCallback((categoryId: string, groupId?: string) => {
    const category = FILTER_CATEGORIES.find(c => c.id === categoryId)
    if (!category) return

    // If it's a 2-level category (Category -> Value), automatically select the field
    if (!category.hasThreeLevels && category.fields.length > 0) {
      // Directly select the field (there's only one field for 2-level categories)
      // We'll handle this in handleFieldSelected, so just set up the field selection
      const field = category.fields[0].value
      
      // Find the field definition to get default operator
      let defaultOperator: SegmentFilter["operator"] = "equals"
      const fieldDef = category.fields.find(f => f.value === field)
      if (fieldDef && fieldDef.operators.length > 0) {
        defaultOperator = fieldDef.operators[0]
      }

      const filterToAdd: SegmentFilter = {
        field,
        operator: defaultOperator,
        value: [],
      }
      
      const newItem: FilterItemWithOperator = {
        id: generateId(),
        filter: filterToAdd,
        operator: filterStructure.length > 0 ? 'and' : undefined,
        groupId,
      }
      
      if (groupId) {
        // Add to existing group
        setFilterStructure(prev => prev.map(item => {
          if ('groupOperator' in item && item.id === groupId) {
            const group = item as FilterGroup
            return {
              ...group,
              items: [...group.items, newItem],
            }
          }
          return item
        }))
      } else {
        // Add as new filter
        setFilterStructure(prev => [...prev, newItem])
      }
      
      setSelectedFieldForValueSelection(field)
      setSelectedCategory(null)
      setIsAddingFilter(false)
      setIsAddingToGroup(null)
    } else {
      // 3-level category (Contact Field), show fields selection
      setSelectedCategory(categoryId)
    }
  }, [filterStructure])

  const handleFieldSelected = React.useCallback((field: SegmentFilter["field"], groupId?: string) => {
    // Find the field definition to get default operator
    let defaultOperator: SegmentFilter["operator"] = "equals"
    for (const category of FILTER_CATEGORIES) {
      const fieldDef = category.fields.find(f => f.value === field)
      if (fieldDef && fieldDef.operators.length > 0) {
        defaultOperator = fieldDef.operators[0]
        break
      }
    }

    const filterToAdd: SegmentFilter = {
      field,
      operator: defaultOperator,
      value: [],
    }
    
    const newItem: FilterItemWithOperator = {
      id: generateId(),
      filter: filterToAdd,
      operator: filterStructure.length > 0 ? 'and' : undefined,
      groupId,
    }
    
    if (groupId) {
      // Add to existing group
      setFilterStructure(prev => prev.map(item => {
        if ('groupOperator' in item && item.id === groupId) {
          const group = item as FilterGroup
          return {
            ...group,
            items: [...group.items, newItem],
          }
        }
        return item
      }))
    } else {
      // Add as new filter
      setFilterStructure(prev => [...prev, newItem])
    }
    
    setSelectedFieldForValueSelection(field)
    setSelectedCategory(null)
    setIsAddingFilter(false)
    setIsAddingToGroup(null)
  }, [filterStructure])

  // Helper to get category and field info from a filter field
  const getFieldInfo = React.useCallback((field: SegmentFilter["field"]) => {
    for (const category of FILTER_CATEGORIES) {
      const fieldDef = category.fields.find(f => f.value === field)
      if (fieldDef) {
        return { category, field: fieldDef }
      }
    }
    return null
  }, [])

  const handleFilterFieldChange = React.useCallback((filterId: string, field: SegmentFilter["field"]) => {
    // Find the field definition to get default operator
    let defaultOperator: SegmentFilter["operator"] = "equals"
    for (const category of FILTER_CATEGORIES) {
      const fieldDef = category.fields.find(f => f.value === field)
      if (fieldDef && fieldDef.operators.length > 0) {
        defaultOperator = fieldDef.operators[0]
        break
      }
    }

    setFilterStructure(prev => prev.map(item => {
      if ('filter' in item && item.id === filterId) {
        return {
          ...item,
          filter: {
            field,
            operator: defaultOperator,
            value: [],
          },
        }
      } else if ('groupOperator' in item) {
        return {
          ...item,
          items: item.items.map(filterItem => 
            filterItem.id === filterId
              ? {
                  ...filterItem,
                  filter: {
                    field,
                    operator: defaultOperator,
                    value: [],
                  },
                }
              : filterItem
          ),
        }
      }
      return item
    }))
  }, [])

  const handleFilterOperatorChange = React.useCallback((filterId: string, operator: SegmentFilter["operator"]) => {
    setFilterStructure(prev => prev.map(item => {
      if ('filter' in item && item.id === filterId) {
        const fieldInfo = getFieldInfo(item.filter.field)
        let defaultValue: SegmentFilter["value"] = []
        if (fieldInfo?.field.valueType === 'string') {
          defaultValue = ''
        } else if (fieldInfo?.field.valueType === 'number') {
          defaultValue = 0
        } else if (fieldInfo?.field.valueType === 'date') {
          // For date fields, check if it's a time-based operator
          if (operator === 'isGreaterThanTime' || operator === 'isLessThanTime') {
            defaultValue = 0
          } else if (operator === 'isBetweenTime') {
            defaultValue = [0, 0]
          } else {
            defaultValue = { from: new Date(), to: new Date() }
          }
        }
        return {
          ...item,
          filter: {
            ...item.filter,
            operator,
            value: defaultValue,
          },
        }
      } else if ('groupOperator' in item) {
        return {
          ...item,
          items: item.items.map(filterItem => {
            if (filterItem.id === filterId) {
              const fieldInfo = getFieldInfo(filterItem.filter.field)
              let defaultValue: SegmentFilter["value"] = []
              if (fieldInfo?.field.valueType === 'string') {
                defaultValue = ''
              } else if (fieldInfo?.field.valueType === 'number') {
                defaultValue = 0
              } else if (fieldInfo?.field.valueType === 'date') {
                // For date fields, check if it's a time-based operator
                if (operator === 'isGreaterThanTime' || operator === 'isLessThanTime') {
                  defaultValue = 0
                } else if (operator === 'isBetweenTime') {
                  defaultValue = [0, 0]
                } else {
                  defaultValue = { from: new Date(), to: new Date() }
                }
              }
              return {
                ...filterItem,
                filter: {
                  ...filterItem.filter,
                  operator,
                  value: defaultValue,
                },
              }
            }
            return filterItem
          }),
        }
      }
      return item
    }))
  }, [getFieldInfo])

  const handleFilterValueChange = React.useCallback((filterId: string, newValues: string | string[] | number | number[] | Date | { from: Date; to: Date }) => {
    setFilterStructure(prev => prev.map(item => {
      if ('filter' in item && item.id === filterId) {
        const currentFilter = item.filter
        // Preserve the operator, only update value
        return {
          ...item,
          filter: {
            ...currentFilter,
            value: newValues,
          },
        }
      } else if ('groupOperator' in item) {
        // It's a group, update filter inside
        return {
          ...item,
          items: item.items.map(filterItem => 
            filterItem.id === filterId
              ? {
                  ...filterItem,
                  filter: {
                    ...filterItem.filter,
                    value: newValues,
                  },
                }
              : filterItem
          ),
        }
      }
      return item
    }))
  }, [])

  const handleRemoveFilter = React.useCallback((filterId: string) => {
    setFilterStructure(prev => {
      const newStructure = prev
        .map(item => {
          if ('filter' in item) {
            // Single filter - remove if ID matches
            return item.id !== filterId ? item : null
          } else {
            // It's a group - filter out the item and remove group if empty
            const filteredItems = item.items.filter(fi => fi.id !== filterId)
            if (filteredItems.length === 0) {
              return null // Remove empty group
            }
            return {
              ...item,
              items: filteredItems,
            }
          }
        })
        .filter((item): item is FilterStructure => item !== null)
      
      // Update operators for remaining items
      return newStructure.map((item, index) => ({
        ...item,
        operator: index > 0 ? (item.operator || 'and') : undefined,
      }))
    })
    if (editingFilterId === filterId) {
      setEditingFilterId(null)
    }
  }, [editingFilterId])

  const handleOperatorChange = React.useCallback((filterId: string, operator: 'and' | 'or') => {
    setFilterStructure(prev => prev.map((item, index) => {
      if (('filter' in item && item.id === filterId) || ('items' in item && item.id === filterId)) {
        return {
          ...item,
          operator: index > 0 ? operator : undefined,
        }
      }
      return item
    }))
  }, [])

  const handleCreateGroup = React.useCallback(() => {
    const newGroup: FilterGroup = {
      id: generateId(),
      operator: filterStructure.length > 0 ? 'and' : undefined,
      groupOperator: 'and',
      items: [],
    }
    setFilterStructure(prev => [...prev, newGroup])
    setIsAddingToGroup(newGroup.id)
    setIsAddingFilter(true)
  }, [filterStructure])

  const handleGroupOperatorChange = React.useCallback((groupId: string, operator: 'and' | 'or') => {
    setFilterStructure(prev => prev.map(item => {
      if ('items' in item && item.id === groupId) {
        return {
          ...item,
          groupOperator: operator,
        }
      }
      return item
    }))
  }, [])

  const handleResetFilters = () => {
    setFilterStructure([])
    setSelectedFieldForValueSelection(null)
    setFieldSearchQuery("")
    setValueSearchQuery("")
    setEditingFilterId(null)
    setIsAddingToGroup(null)
  }

  // Get filter value options based on field
  const getFilterValueOptions = React.useCallback((field: string) => {
    switch (field) {
      case "countryISO":
        return allCountries.map((c) => ({ value: c.code, label: c.name }))
      case "tags":
        return allTags.map((tag) => ({ value: tag, label: tag }))
      case "channel":
        return allChannels.map((channel) => {
          const channelLabels: Record<string, string> = {
            whatsapp: "WhatsApp",
            instagram: "Instagram",
            messenger: "Messenger",
            sms: "SMS",
            email: "Email",
            phone: "Phone",
            rcs: "RCS",
            push: "Push Notifications",
          }
          return { value: channel, label: channelLabels[channel] || channel }
        })
      case "conversationStatus":
        return allStatuses.map((status) => ({ value: status, label: status }))
      case "language":
        return [
          { value: "en", label: "English" },
          { value: "ar", label: "Arabic" },
          { value: "es", label: "Spanish" },
          { value: "fr", label: "French" },
          { value: "de", label: "German" },
        ]
      case "botStatus":
        return [
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
          { value: "pending", label: "Pending" },
        ]
      case "assignee":
        return [
          { value: "john_doe", label: "John Doe" },
          { value: "jane_smith", label: "Jane Smith" },
          { value: "unassigned", label: "Unassigned" },
        ]
      default:
        return []
    }
  }, [allCountries, allTags, allChannels, allStatuses])

  // Find filter by ID
  const findFilterById = (id: string): FilterItemWithOperator | null => {
    for (const item of filterStructure) {
      if ('filter' in item && item.id === id) {
        return item
      } else if ('items' in item) {
        const found = item.items.find(fi => fi.id === id)
        if (found) return found
      }
    }
    return null
  }

  // Render value input for filters - type-specific based on field and operator
  const renderValueInput = React.useCallback((filter: SegmentFilter, filterId: string) => {
    if (!filter || !filter.field) {
      return <div className="text-sm text-muted-foreground p-2">Loading...</div>
    }

    const fieldInfo = getFieldInfo(filter.field)
    if (!fieldInfo) {
      return <div className="px-2 py-2 text-sm text-muted-foreground text-center">Field not found</div>
    }

    const { field: fieldDef, category } = fieldInfo
    const operator = filter.operator

    // Operators that don't need value input
    if (operator === 'exists' || operator === 'doesNotExist' || operator === 'isEmpty' || operator === 'isNotEmpty') {
      return (
        <div className="px-3 py-3 text-sm text-muted-foreground text-center">
          No value needed for this operator
        </div>
      )
    }

    // Date fields - use date picker
    if (fieldDef.valueType === 'date') {
      // Time-based operators (isGreaterThanTime, isLessThanTime, isBetweenTime) use number input with time unit
      if (operator === 'isGreaterThanTime' || operator === 'isLessThanTime') {
        const currentValue = typeof filter.value === 'number' ? filter.value : 0
        const currentTimeUnit = timeUnits[filterId] || 'seconds'
        
        return (
          <div className="p-3 space-y-2">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Value</Label>
              <Input
                type="number"
                placeholder="Enter value"
                value={currentValue || ''}
                onChange={(e) => {
                  const numValue = parseFloat(e.target.value)
                  if (!isNaN(numValue)) {
                    handleFilterValueChange(filterId, numValue)
                  } else if (e.target.value === '') {
                    handleFilterValueChange(filterId, 0)
                  }
                }}
                className="w-full"
                autoFocus
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Time Unit</Label>
              <Select
                value={currentTimeUnit}
                onValueChange={(value) => {
                  setTimeUnits(prev => ({ ...prev, [filterId]: value }))
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select time unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seconds">Seconds ago</SelectItem>
                  <SelectItem value="minutes">Minutes ago</SelectItem>
                  <SelectItem value="hours">Hours ago</SelectItem>
                  <SelectItem value="days">Days ago</SelectItem>
                  <SelectItem value="weeks">Weeks ago</SelectItem>
                  <SelectItem value="months">Months ago</SelectItem>
                  <SelectItem value="years">Years ago</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )
      }
      
      if (operator === 'isBetweenTime') {
        const values = Array.isArray(filter.value) && filter.value.length === 2 
          ? filter.value.filter((v): v is number => typeof v === 'number')
          : [0, 0]
        const currentTimeUnit = timeUnits[filterId] || 'seconds'
        
        return (
          <div className="p-3 space-y-2">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">From</Label>
              <Input
                type="number"
                placeholder="From"
                value={values[0] || ''}
                onChange={(e) => {
                  const from = parseFloat(e.target.value) || 0
                  handleFilterValueChange(filterId, [from, values[1] || 0])
                }}
                className="w-full"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">To</Label>
              <Input
                type="number"
                placeholder="To"
                value={values[1] || ''}
                onChange={(e) => {
                  const to = parseFloat(e.target.value) || 0
                  handleFilterValueChange(filterId, [values[0] || 0, to])
                }}
                className="w-full"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Time Unit</Label>
              <Select
                value={currentTimeUnit}
                onValueChange={(value) => {
                  setTimeUnits(prev => ({ ...prev, [filterId]: value }))
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select time unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seconds">Seconds ago</SelectItem>
                  <SelectItem value="minutes">Minutes ago</SelectItem>
                  <SelectItem value="hours">Hours ago</SelectItem>
                  <SelectItem value="days">Days ago</SelectItem>
                  <SelectItem value="weeks">Weeks ago</SelectItem>
                  <SelectItem value="months">Months ago</SelectItem>
                  <SelectItem value="years">Years ago</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )
      }
      
      // Timestamp operators (isTimestampAfter, isTimestampBefore, isTimestampBetween) use calendar picker
      const getDateRange = (): DateRange | undefined => {
        if (typeof filter.value === 'object' && filter.value && 'from' in filter.value) {
          const dateValue = filter.value as { from: Date; to: Date }
          return { from: dateValue.from, to: dateValue.to }
        }
        return undefined
      }

      const currentDateRange = getDateRange()

      return (
        <div className="p-3">
          {operator === 'isTimestampBetween' ? (
            <Calendar
              mode="range"
              selected={currentDateRange}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  handleFilterValueChange(filterId, { from: range.from, to: range.to })
                }
              }}
              numberOfMonths={2}
              className="rounded-md"
            />
          ) : operator === 'isTimestampAfter' ? (
            <Calendar
              mode="single"
              selected={currentDateRange?.from}
              onSelect={(date) => {
                if (date) {
                  handleFilterValueChange(filterId, { from: date, to: date })
                }
              }}
              className="rounded-md"
            />
          ) : operator === 'isTimestampBefore' ? (
            <Calendar
              mode="single"
              selected={currentDateRange?.to}
              onSelect={(date) => {
                if (date) {
                  const existingFrom = currentDateRange?.from || date
                  handleFilterValueChange(filterId, { from: existingFrom, to: date })
                }
              }}
              className="rounded-md"
            />
          ) : null}
        </div>
      )
    }

    // String fields (phone, email, names) - use text input
    if (fieldDef.valueType === 'string' && (operator === 'equals' || operator === 'notEquals' || operator === 'contains' || operator === 'notContains' || operator === 'startsWith' || operator === 'endsWith')) {
      const currentValue = typeof filter.value === 'string' ? filter.value : ''
      return (
        <div className="p-3">
          <Input
            type="text"
            placeholder={`Enter ${fieldDef.label.toLowerCase()}`}
            value={currentValue}
            onChange={(e) => handleFilterValueChange(filterId, e.target.value)}
            autoFocus
            className="w-full"
          />
        </div>
      )
    }

    // Number fields - use number input
    if (fieldDef.valueType === 'number') {
      const currentValue = typeof filter.value === 'number' ? filter.value : (Array.isArray(filter.value) && typeof filter.value[0] === 'number' ? filter.value[0] : '')
      
      if (operator === 'between') {
        const values = Array.isArray(filter.value) && filter.value.length === 2 
          ? filter.value.filter((v): v is number => typeof v === 'number')
          : [0, 0]
        return (
          <div className="p-3 space-y-2">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">From</Label>
              <Input
                type="number"
                placeholder="From"
                value={values[0] || ''}
                onChange={(e) => {
                  const from = parseFloat(e.target.value) || 0
                  handleFilterValueChange(filterId, [from, values[1] || 0])
                }}
                className="w-full"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">To</Label>
              <Input
                type="number"
                placeholder="To"
                value={values[1] || ''}
                onChange={(e) => {
                  const to = parseFloat(e.target.value) || 0
                  handleFilterValueChange(filterId, [values[0] || 0, to])
                }}
                className="w-full"
              />
            </div>
          </div>
        )
      }
      
      return (
        <div className="p-3">
          <Input
            type="number"
            placeholder={`Enter ${fieldDef.label.toLowerCase()}`}
            value={currentValue}
            onChange={(e) => {
              const numValue = parseFloat(e.target.value)
              if (!isNaN(numValue)) {
                handleFilterValueChange(filterId, numValue)
              } else if (e.target.value === '') {
                handleFilterValueChange(filterId, 0)
              }
            }}
            autoFocus
            className="w-full"
          />
        </div>
      )
    }

    // Array fields (channels, tags, etc.) - use multi-select
    if (fieldDef.valueType === 'array') {
      const options = getFilterValueOptions(filter.field)
      if (!options || options.length === 0) {
        return <div className="px-2 py-2 text-sm text-muted-foreground text-center">No options available</div>
      }
      
      const displayValues: string[] = Array.isArray(filter.value) 
        ? filter.value.filter((v): v is string => typeof v === 'string')
        : typeof filter.value === 'string' ? [filter.value] : []
      
      const filteredOptions = valueSearchQuery
        ? options.filter(option => 
            option.label.toLowerCase().includes(valueSearchQuery.toLowerCase())
          )
        : options
      
      return (
        <div className="flex flex-col h-full" style={{ height: '400px', maxHeight: '400px' }}>
          <div className="flex-shrink-0 p-2 border-b">
            <FilterSearchInput
              placeholder="Search..."
              value={valueSearchQuery}
              onChange={setValueSearchQuery}
              autoFocus={false}
            />
          </div>
          
          {filteredOptions.length > 0 ? (
            <div className="overflow-y-auto overflow-x-hidden p-1 flex-1" style={{ minHeight: 0, WebkitOverflowScrolling: 'touch' }}>
              {filteredOptions.map((option) => {
                const isSelected = displayValues.includes(option.value)
                return (
                  <div 
                    key={option.value} 
                    className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm cursor-pointer"
                    onClick={() => {
                      const newValues = isSelected
                        ? displayValues.filter((v) => v !== option.value)
                        : [...displayValues, option.value]
                      handleFilterValueChange(filterId, newValues)
                    }}
                  >
                    <Checkbox
                      id={`filter-${filterId}-${option.value}`}
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        const newValues = checked
                          ? [...displayValues, option.value]
                          : displayValues.filter((v) => v !== option.value)
                        handleFilterValueChange(filterId, newValues)
                      }}
                    />
                    <label
                      htmlFor={`filter-${filterId}-${option.value}`}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1 flex items-center gap-2"
                    >
                      {filter.field === "countryISO" && (
                        <div className="w-5 h-5 flex-shrink-0 overflow-hidden rounded-full">
                          <CircleFlag
                            countryCode={option.value.toLowerCase()}
                            className="w-full h-full"
                          />
                        </div>
                      )}
                      <span className="flex-1">{option.label}</span>
                    </label>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="px-2 py-4 text-sm text-muted-foreground text-center">
              No results found
            </div>
          )}
        </div>
      )
    }

    return <div className="px-2 py-2 text-sm text-muted-foreground text-center">Unsupported field type</div>
  }, [getFilterValueOptions, handleFilterValueChange, valueSearchQuery, getFieldInfo])

  // Calculate contact count
  const contactCount = React.useMemo(() => {
    if (filterStructure.length === 0) return 0
    const flatFilters = flattenFilters(filterStructure)
    const tempSegment: Segment = {
      id: "temp",
      name,
      description: "",
      filters: flatFilters,
      contactIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    return getContactsForSegment(mockContacts, tempSegment).length
  }, [filterStructure, name])

  const handleSave = () => {
    if (filterStructure.length === 0) {
      toast.error("Please add at least one filter")
      return
    }

    const flatFilters = flattenFilters(filterStructure)
    const segmentData = {
      name: name.trim(),
      description: "",
      filters: flatFilters,
    }

    if (editingSegment && onUpdate) {
      onUpdate(editingSegment.id, segmentData)
      toast.success("Segment updated successfully")
    } else {
      onSave(segmentData)
      toast.success("Segment created successfully")
    }

    onOpenChange(false)
  }

  // Get applied filter fields
  const appliedFilterFields = React.useMemo(() => {
    const fields = new Set<SegmentFilter["field"]>()
    const processItem = (item: FilterStructure) => {
      if ('filter' in item) {
        fields.add(item.filter.field)
      } else {
        item.items.forEach(fi => fields.add(fi.filter.field))
      }
    }
    filterStructure.forEach(processItem)
    return fields
  }, [filterStructure])

  // Helper to get display label for field selector
  const getFieldDisplayLabel = React.useCallback((filter: SegmentFilter) => {
    const fieldInfo = getFieldInfo(filter.field)
    if (!fieldInfo) return filter.field

    // For 2-level categories, show category name; for 3-level, show field name
    if (!fieldInfo.category.hasThreeLevels) {
      return fieldInfo.category.label
    } else {
      return fieldInfo.field.label
    }
  }, [getFieldInfo])

  // Create filter badges for display
  const displayFilters = React.useMemo(() => {
    const result: Array<{
      id: string
      filter: SegmentFilter
      categoryLabel: string
      fieldLabel: string
      operatorLabel: string
      value: string
      valueItems: Array<{ value: string; label: string }> // Individual value items for badges
      operator?: 'and' | 'or'
      isGroup?: boolean
      groupOperator?: 'and' | 'or'
      groupItems?: Array<{ id: string; filter: SegmentFilter; categoryLabel: string; fieldLabel: string; operatorLabel: string; value: string; valueItems: Array<{ value: string; label: string }> }>
    }> = []

    filterStructure.forEach((item, index) => {
      if ('filter' in item) {
        // It's a single filter
        const fieldInfo = getFieldInfo(item.filter.field)
        const categoryLabel = fieldInfo?.category.label || ""
        const fieldLabel = getFieldDisplayLabel(item.filter)
        const operatorLabel = OPERATOR_LABELS[item.filter.operator] || item.filter.operator
        const needsValue = !['exists', 'doesNotExist', 'isEmpty', 'isNotEmpty'].includes(item.filter.operator)
        
        let valueLabels = ""
        let valueItems: Array<{ value: string; label: string }> = []
        
        if (needsValue) {
          if (fieldInfo?.field.valueType === 'date') {
            // Handle time-based operators (show number + time unit)
            if (item.filter.operator === 'isGreaterThanTime' || item.filter.operator === 'isLessThanTime') {
              const numValue = typeof item.filter.value === 'number' ? item.filter.value : 0
              const timeUnit = timeUnits[item.id] || 'seconds'
              if (numValue > 0) {
                valueLabels = `${numValue} ${timeUnit} ago`
                valueItems = [{
                  value: String(numValue),
                  label: valueLabels
                }]
              }
            } else if (item.filter.operator === 'isBetweenTime') {
              const values = Array.isArray(item.filter.value) && item.filter.value.length === 2 
                ? item.filter.value.filter((v): v is number => typeof v === 'number')
                : [0, 0]
              const timeUnit = timeUnits[item.id] || 'seconds'
              if (values[0] > 0 || values[1] > 0) {
                valueLabels = `${values[0]} - ${values[1]} ${timeUnit} ago`
                valueItems = [{
                  value: String(values[0]),
                  label: valueLabels
                }]
              }
            } else if (typeof item.filter.value === 'object' && item.filter.value && 'from' in item.filter.value) {
              // Handle timestamp operators (show date)
              const dateValue = item.filter.value as { from: Date; to: Date }
              if (item.filter.operator === 'isTimestampBetween') {
                valueLabels = `${format(dateValue.from, 'MMM dd, yyyy')} - ${format(dateValue.to, 'MMM dd, yyyy')}`
                valueItems = [{
                  value: dateValue.from.toISOString(),
                  label: valueLabels
                }]
              } else {
                valueLabels = format(dateValue.from, 'MMM dd, yyyy')
                valueItems = [{
                  value: dateValue.from.toISOString(),
                  label: valueLabels
                }]
              }
            }
          } else if (fieldInfo?.field.valueType === 'string' && typeof item.filter.value === 'string') {
            // Handle string values
            valueLabels = item.filter.value
            valueItems = [{
              value: item.filter.value,
              label: item.filter.value
            }]
          } else if (fieldInfo?.field.valueType === 'number') {
            // Handle number values
            if (Array.isArray(item.filter.value) && item.filter.value.length === 2) {
              const numValues = item.filter.value.filter((v): v is number => typeof v === 'number')
              valueLabels = `${numValues[0]} - ${numValues[1]}`
              valueItems = [{
                value: String(numValues[0]),
                label: valueLabels
              }]
            } else {
              const numValue = typeof item.filter.value === 'number' ? item.filter.value : 0
              valueLabels = String(numValue)
              valueItems = [{
                value: String(numValue),
                label: valueLabels
              }]
            }
          } else {
            // Handle array values (channels, tags, etc.)
            const values = Array.isArray(item.filter.value) 
              ? item.filter.value.filter((v): v is string => typeof v === 'string')
              : typeof item.filter.value === 'string' ? [item.filter.value] : []
            const options = getFilterValueOptions(item.filter.field)
            valueLabels = values.map(v => options.find(o => o.value === v)?.label || String(v)).join(", ")
            valueItems = values.map(v => ({
              value: v,
              label: options.find(o => o.value === v)?.label || String(v)
            }))
          }
        }
        
        result.push({
          id: item.id,
          filter: item.filter,
          categoryLabel,
          fieldLabel,
          operatorLabel,
          value: valueLabels || "",
          valueItems,
          operator: item.operator,
        })
      } else {
        // It's a group
        const groupItems = item.items.map(fi => {
          const fieldInfoItem = getFieldInfo(fi.filter.field)
          const categoryLabel = fieldInfoItem?.category.label || ""
          const fieldLabel = getFieldDisplayLabel(fi.filter)
          const operatorLabel = OPERATOR_LABELS[fi.filter.operator] || fi.filter.operator
          const needsValueItem = !['exists', 'doesNotExist', 'isEmpty', 'isNotEmpty'].includes(fi.filter.operator)
          
          let valueLabelsItem = ""
          let valueItemsItem: Array<{ value: string; label: string }> = []
          
          if (needsValueItem) {
            if (fieldInfoItem?.field.valueType === 'date') {
              // Handle time-based operators
              if (fi.filter.operator === 'isGreaterThanTime' || fi.filter.operator === 'isLessThanTime') {
                const numValue = typeof fi.filter.value === 'number' ? fi.filter.value : 0
                const timeUnit = timeUnits[fi.id] || 'seconds'
                if (numValue > 0) {
                  valueLabelsItem = `${numValue} ${timeUnit} ago`
                  valueItemsItem = [{ value: String(numValue), label: valueLabelsItem }]
                }
              } else if (fi.filter.operator === 'isBetweenTime') {
                const values = Array.isArray(fi.filter.value) && fi.filter.value.length === 2 
                  ? fi.filter.value.filter((v): v is number => typeof v === 'number')
                  : [0, 0]
                const timeUnit = timeUnits[fi.id] || 'seconds'
                if (values[0] > 0 || values[1] > 0) {
                  valueLabelsItem = `${values[0]} - ${values[1]} ${timeUnit} ago`
                  valueItemsItem = [{ value: String(values[0]), label: valueLabelsItem }]
                }
              } else if (typeof fi.filter.value === 'object' && fi.filter.value && 'from' in fi.filter.value) {
                // Handle timestamp operators
                const dateValue = fi.filter.value as { from: Date; to: Date }
                if (fi.filter.operator === 'isTimestampBetween') {
                  valueLabelsItem = `${format(dateValue.from, 'MMM dd, yyyy')} - ${format(dateValue.to, 'MMM dd, yyyy')}`
                  valueItemsItem = [{ value: dateValue.from.toISOString(), label: valueLabelsItem }]
                } else {
                  valueLabelsItem = format(dateValue.from, 'MMM dd, yyyy')
                  valueItemsItem = [{ value: dateValue.from.toISOString(), label: valueLabelsItem }]
                }
              }
            } else if (fieldInfoItem?.field.valueType === 'string' && typeof fi.filter.value === 'string') {
              valueLabelsItem = fi.filter.value
              valueItemsItem = [{ value: fi.filter.value, label: fi.filter.value }]
            } else if (fieldInfoItem?.field.valueType === 'number') {
              if (Array.isArray(fi.filter.value) && fi.filter.value.length === 2) {
                const numValues = fi.filter.value.filter((v): v is number => typeof v === 'number')
                valueLabelsItem = `${numValues[0]} - ${numValues[1]}`
                valueItemsItem = [{ value: String(numValues[0]), label: valueLabelsItem }]
              } else {
                const numValue = typeof fi.filter.value === 'number' ? fi.filter.value : 0
                valueLabelsItem = String(numValue)
                valueItemsItem = [{ value: String(numValue), label: valueLabelsItem }]
              }
            } else {
              const values = Array.isArray(fi.filter.value) 
                ? fi.filter.value.filter((v): v is string => typeof v === 'string')
                : typeof fi.filter.value === 'string' ? [fi.filter.value] : []
              const options = getFilterValueOptions(fi.filter.field)
              valueLabelsItem = values.map(v => options.find(o => o.value === v)?.label || String(v)).join(", ")
              valueItemsItem = values.map(v => ({
                value: v,
                label: options.find(o => o.value === v)?.label || String(v)
              }))
            }
          }
          return {
            id: fi.id,
            filter: fi.filter,
            categoryLabel,
            fieldLabel,
            operatorLabel,
            value: valueLabelsItem || "",
            valueItems: valueItemsItem,
          }
        })
        
        result.push({
          id: item.id,
          filter: item.items[0]?.filter || { field: 'countryISO', operator: 'in', value: [] },
          categoryLabel: "",
          fieldLabel: `Group (${item.items.length} filters)`,
          operatorLabel: "",
          value: "",
          valueItems: [],
          operator: item.operator,
          isGroup: true,
          groupOperator: item.groupOperator,
          groupItems,
        })
      }
    })

    return result
  }, [filterStructure, getFilterValueOptions, getFieldInfo, getFieldDisplayLabel, timeUnits])

  return (
    <>
      {/* Name Dialog - First Step */}
      <Dialog open={isNameDialogOpen} onOpenChange={setIsNameDialogOpen}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader>
            <DialogTitle>Create Segment</DialogTitle>
            <DialogDescription>
              Enter a name for your segment to get started.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Field>
              <FieldLabel>
                Segment Name <span className="text-destructive">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., VIP Egyptian"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && name.trim()) {
                      handleNameSubmit(e)
                    }
                  }}
                  autoFocus
                />
              </FieldContent>
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsNameDialogOpen(false)
              onOpenChange(false)
            }}>
              Cancel
            </Button>
            <Button onClick={(e) => handleNameSubmit(e)} disabled={!name.trim()}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filter Drawer - Second Step */}
      <Sheet open={isDrawerOpen} onOpenChange={handleDrawerClose}>
        <SheetContent side="right" className="w-1/4 min-w-[320px] max-w-[480px] bg-popover flex flex-col p-0 gap-0 [&>button.absolute]:hidden overflow-hidden">
          <div className="flex-1 overflow-y-auto min-h-0">
            {/* Header */}
            <div className="px-4 pt-4 pb-3 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <SheetTitle className="text-lg font-semibold">{name || "Untitled Segment"}</SheetTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {contactCount} {contactCount === 1 ? "Contact" : "Contacts"}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 relative"
                    onClick={() => handleDrawerClose(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Apply filters to find and prioritize Contacts based on specific criteria.
              </p>
            </div>

            {/* Content */}
            <div className="px-4 pt-4 pb-6">
              {/* Applied Filters - Show at top when filters exist */}
              {displayFilters.length > 0 && (
                <div className="space-y-3 mb-4">
                  {displayFilters.map((badge, index) => (
                    <React.Fragment key={badge.id}>
                      {/* Operator switcher before filter (except first) */}
                      {index > 0 && (
                        <div className="flex justify-start my-2">
                          <ToggleGroup
                            type="single"
                            value={badge.operator || 'and'}
                            onValueChange={(value) => {
                              if (value === 'and' || value === 'or') {
                                handleOperatorChange(badge.id, value)
                              }
                            }}
                            variant="outline"
                            size="sm"
                          >
                            <ToggleGroupItem value="and" aria-label="And">
                              And
                            </ToggleGroupItem>
                            <ToggleGroupItem value="or" aria-label="Or">
                              Or
                            </ToggleGroupItem>
                          </ToggleGroup>
                        </div>
                      )}
                      
                      {badge.isGroup ? (
                        // Render group
                        <div className="border border-border rounded-lg p-3 space-y-2 bg-card/50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Filter Group</span>
                            <div className="flex items-center gap-2">
                              <ToggleGroup
                                type="single"
                                value={badge.groupOperator || 'and'}
                                onValueChange={(value) => {
                                  if (value === 'and' || value === 'or') {
                                    handleGroupOperatorChange(badge.id, value)
                                  }
                                }}
                                variant="outline"
                                size="sm"
                              >
                                <ToggleGroupItem value="and" aria-label="And">
                                  And
                                </ToggleGroupItem>
                                <ToggleGroupItem value="or" aria-label="Or">
                                  Or
                                </ToggleGroupItem>
                              </ToggleGroup>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:text-destructive"
                                onClick={() => handleRemoveFilter(badge.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {badge.groupItems?.map((groupItem) => {
                              const filterItem = findFilterById(groupItem.id)
                              if (!filterItem) return null
                              return (
                                <div key={groupItem.id} className="space-y-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {/* Category/Field Selector */}
                                    <Popover 
                                      open={editingFilterId === groupItem.id && editingFilterPart === 'field'} 
                                      onOpenChange={(open) => {
                                        if (open) {
                                          setEditingFilterId(groupItem.id)
                                          setEditingFilterPart('field')
                                        } else {
                                          setEditingFilterPart(null)
                                        }
                                      }}
                                    >
                                      <PopoverTrigger asChild>
                                        <Button
                                          variant="outline"
                                          className="h-8 px-3 text-sm font-normal border border-border bg-background hover:bg-accent"
                                        >
                                          {groupItem.fieldLabel || "Select field"}
                                          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto min-w-[200px] max-w-[300px] p-0 bg-card border border-border shadow-lg flex flex-col" style={{ maxHeight: '400px' }} align="start">
                                        {selectedCategory ? (
                                          <div className="flex flex-col h-full" style={{ maxHeight: '400px', height: '400px' }}>
                                            <div className="p-2 border-b border-border flex-shrink-0">
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-full justify-start"
                                                onClick={() => setSelectedCategory(null)}
                                              >
                                                ← Back
                                              </Button>
                                            </div>
                                            <div className="flex-shrink-0">
                                              <FilterSearchInput
                                                placeholder="Search fields..."
                                                value={fieldSearchQuery}
                                                onChange={setFieldSearchQuery}
                                                autoFocus={false}
                                              />
                                            </div>
                                            <div className="overflow-y-auto overflow-x-hidden p-1 flex-1" style={{ minHeight: 0, WebkitOverflowScrolling: 'touch' }}>
                                              {FILTER_CATEGORIES.find(c => c.id === selectedCategory)?.fields
                                                .filter(field => {
                                                  const matchesSearch = field.label.toLowerCase().includes(fieldSearchQuery.toLowerCase())
                                                  return matchesSearch
                                                })
                                                .map((field) => (
                                                  <div
                                                    key={field.value}
                                                    className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm cursor-pointer"
                                                    onClick={() => {
                                                      handleFilterFieldChange(groupItem.id, field.value)
                                                      setSelectedCategory(null)
                                                      setEditingFilterPart(null)
                                                    }}
                                                  >
                                                    <span className="text-sm leading-none cursor-pointer flex-1">
                                                      {field.label}
                                                    </span>
                                                  </div>
                                                ))}
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="flex flex-col bg-card h-full" style={{ maxHeight: '400px', height: '400px' }}>
                                            <div className="flex-shrink-0">
                                              <FilterSearchInput
                                                placeholder="Search categories..."
                                                value={fieldSearchQuery}
                                                onChange={setFieldSearchQuery}
                                                autoFocus={false}
                                              />
                                            </div>
                                            <div className="overflow-y-auto overflow-x-hidden p-1 flex-1" style={{ minHeight: 0, WebkitOverflowScrolling: 'touch' }}>
                                              {FILTER_CATEGORIES.filter(category => 
                                                category.label.toLowerCase().includes(fieldSearchQuery.toLowerCase())
                                              ).map((category) => (
                                                <div
                                                  key={category.id}
                                                  className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm cursor-pointer"
                                                  onClick={() => {
                                                    // For 2-level categories, directly update filter; for 3-level, show fields
                                                    if (!category.hasThreeLevels && category.fields.length > 0) {
                                                      // Update existing filter with new field
                                                      const field = category.fields[0].value
                                                      handleFilterFieldChange(groupItem.id, field)
                                                      setEditingFilterPart(null)
                                                      setSelectedCategory(null)
                                                    } else {
                                                      setSelectedCategory(category.id)
                                                      setFieldSearchQuery("")
                                                    }
                                                  }}
                                                >
                                                  <span className="text-sm leading-none cursor-pointer flex-1">
                                                    {category.label}
                                                  </span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </PopoverContent>
                                    </Popover>

                                    {/* Operator Selector */}
                                    <Popover 
                                      open={editingFilterId === groupItem.id && editingFilterPart === 'operator'} 
                                      onOpenChange={(open) => {
                                        if (open) {
                                          setEditingFilterId(groupItem.id)
                                          setEditingFilterPart('operator')
                                        } else {
                                          setEditingFilterPart(null)
                                        }
                                      }}
                                    >
                                      <PopoverTrigger asChild>
                                        <Button
                                          variant="outline"
                                          className="h-8 px-3 text-sm font-normal border border-border bg-background hover:bg-accent"
                                        >
                                          {groupItem.operatorLabel || "Select operator"}
                                          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto min-w-[180px] p-0 bg-card border border-border shadow-lg flex flex-col" style={{ maxHeight: '400px' }} align="start">
                                        <div className="overflow-y-auto overflow-x-hidden p-1" style={{ maxHeight: '400px', height: '400px', WebkitOverflowScrolling: 'touch' }}>
                                          {(() => {
                                            const fieldInfo = getFieldInfo(filterItem.filter.field)
                                            const availableOperators = fieldInfo?.field.operators || []
                                            return availableOperators.map((op) => (
                                              <div
                                                key={op}
                                                className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm cursor-pointer"
                                                onClick={() => {
                                                  handleFilterOperatorChange(groupItem.id, op)
                                                  setEditingFilterPart(null)
                                                }}
                                              >
                                                <span className="text-sm leading-none cursor-pointer flex-1">
                                                  {OPERATOR_LABELS[op]}
                                                </span>
                                              </div>
                                            ))
                                          })()}
                                        </div>
                                      </PopoverContent>
                                    </Popover>

                                    {/* Value Input - Show input field for date/time, button for others */}
                                    {(() => {
                                      const fieldInfo = getFieldInfo(filterItem.filter.field)
                                      const needsValue = fieldInfo && !['exists', 'doesNotExist', 'isEmpty', 'isNotEmpty'].includes(filterItem.filter.operator)
                                      
                                      if (!needsValue) return null
                                      
                                      // For date/time fields, show clickable input field
                                      if (fieldInfo?.field.valueType === 'date') {
                                        const getDateDisplayValue = () => {
                                          // Time-based operators show number + time unit
                                          if (filterItem.filter.operator === 'isGreaterThanTime' || filterItem.filter.operator === 'isLessThanTime') {
                                            const numValue = typeof filterItem.filter.value === 'number' ? filterItem.filter.value : 0
                                            const timeUnit = timeUnits[groupItem.id] || 'seconds'
                                            if (numValue === 0) return "Enter value"
                                            return `${numValue} ${timeUnit} ago`
                                          }
                                          
                                          if (filterItem.filter.operator === 'isBetweenTime') {
                                            const values = Array.isArray(filterItem.filter.value) && filterItem.filter.value.length === 2 
                                              ? filterItem.filter.value.filter((v): v is number => typeof v === 'number')
                                              : [0, 0]
                                            const timeUnit = timeUnits[groupItem.id] || 'seconds'
                                            if (values[0] === 0 && values[1] === 0) return "Enter values"
                                            return `${values[0]} - ${values[1]} ${timeUnit} ago`
                                          }
                                          
                                          // Timestamp operators show date
                                          if (typeof filterItem.filter.value === 'object' && filterItem.filter.value && 'from' in filterItem.filter.value) {
                                            const dateValue = filterItem.filter.value as { from: Date; to: Date }
                                            if (filterItem.filter.operator === 'isTimestampBetween') {
                                              return `${format(dateValue.from, 'MMM dd, yyyy')} - ${format(dateValue.to, 'MMM dd, yyyy')}`
                                            } else {
                                              return format(dateValue.from, 'MMM dd, yyyy')
                                            }
                                          }
                                          return "Select date"
                                        }
                                        
                                        return (
                                          <Popover 
                                            open={editingFilterId === groupItem.id && editingFilterPart === 'value'} 
                                            onOpenChange={(open) => {
                                              if (open) {
                                                setEditingFilterId(groupItem.id)
                                                setEditingFilterPart('value')
                                              } else {
                                                setEditingFilterPart(null)
                                                setValueSearchQuery("")
                                              }
                                            }}
                                          >
                                            <PopoverTrigger asChild>
                                              <Input
                                                type="text"
                                                readOnly
                                                placeholder="Select date"
                                                value={getDateDisplayValue()}
                                                className="h-8 w-auto min-w-[180px] cursor-pointer"
                                                onClick={() => {
                                                  setEditingFilterId(groupItem.id)
                                                  setEditingFilterPart('value')
                                                }}
                                              />
                                            </PopoverTrigger>
                                            <PopoverContent 
                                              className="w-auto p-0 bg-card border border-border shadow-lg"
                                              align="start"
                                              onOpenAutoFocus={(e) => e.preventDefault()}
                                            >
                                              <div className="flex flex-col flex-1 min-h-0">
                                                {editingFilterId === groupItem.id && renderValueInput(filterItem.filter, groupItem.id)}
                                              </div>
                                            </PopoverContent>
                                          </Popover>
                                        )
                                      }
                                      
                                      // For other field types, show the (+) button
                                      return (
                                        <Popover 
                                          open={editingFilterId === groupItem.id && editingFilterPart === 'value'} 
                                          onOpenChange={(open) => {
                                            if (open) {
                                              setEditingFilterId(groupItem.id)
                                              setEditingFilterPart('value')
                                            } else {
                                              setEditingFilterPart(null)
                                              setValueSearchQuery("")
                                            }
                                          }}
                                        >
                                          <PopoverTrigger asChild>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="h-8 w-8 p-0 border border-border bg-background hover:bg-accent"
                                            >
                                              <Plus className="h-4 w-4" />
                                            </Button>
                                          </PopoverTrigger>
                                          <PopoverContent 
                                            className="w-auto min-w-[200px] max-w-[300px] p-0 bg-card border border-border shadow-lg flex flex-col"
                                            style={{ maxHeight: '400px' }}
                                            align="start"
                                            onOpenAutoFocus={(e) => e.preventDefault()}
                                          >
                                            <div className="flex flex-col h-full" style={{ maxHeight: '400px', height: '400px' }}>
                                              {editingFilterId === groupItem.id && renderValueInput(filterItem.filter, groupItem.id)}
                                            </div>
                                          </PopoverContent>
                                        </Popover>
                                      )
                                    })()}

                                    {/* Delete Button */}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 hover:text-destructive"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleRemoveFilter(groupItem.id)
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>

                                  {/* Selected Value Badges - Hide for date/time fields (they use input field instead) */}
                                  {(() => {
                                    const fieldInfo = getFieldInfo(filterItem.filter.field)
                                    // Don't show badges for date/time fields
                                    if (fieldInfo?.field.valueType === 'date') {
                                      return null
                                    }
                                    
                                    return groupItem.valueItems && groupItem.valueItems.length > 0 ? (
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {groupItem.valueItems.map((valueItem) => (
                                          <Badge
                                            key={valueItem.value}
                                            variant="secondary"
                                            className="h-7 px-2.5 text-sm font-normal bg-muted hover:bg-muted/80 flex items-center gap-1.5"
                                          >
                                            <span>{valueItem.label}</span>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-4 w-4 p-0 hover:bg-transparent hover:text-destructive ml-0.5"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                const fieldInfo = getFieldInfo(filterItem.filter.field)
                                                
                                                if (fieldInfo?.field.valueType === 'string') {
                                                  // For strings, clear the value
                                                  handleFilterValueChange(groupItem.id, '')
                                                } else if (fieldInfo?.field.valueType === 'number') {
                                                  // For numbers, clear the value
                                                  handleFilterValueChange(groupItem.id, 0)
                                                } else {
                                                  // For arrays (channels, tags, etc.)
                                                  const currentValues = Array.isArray(filterItem.filter.value) 
                                                    ? filterItem.filter.value.filter((v): v is string => typeof v === 'string')
                                                    : typeof filterItem.filter.value === 'string' ? [filterItem.filter.value] : []
                                                  const newValues = currentValues.filter(v => v !== valueItem.value)
                                                  handleFilterValueChange(groupItem.id, newValues)
                                                }
                                              }}
                                            >
                                              <X className="h-3 w-3" />
                                            </Button>
                                          </Badge>
                                        ))}
                                      </div>
                                    ) : null
                                  })()}
                                </div>
                              )
                            })}
                            <Popover 
                              open={isAddingFilter && isAddingToGroup === badge.id} 
                              onOpenChange={(open) => {
                                setIsAddingFilter(open)
                                if (!open) {
                                  setFieldSearchQuery("")
                                  setValueSearchQuery("")
                                  setSelectedFieldForValueSelection(null)
                                  setIsAddingToGroup(null)
                                }
                              }}
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 border-dashed"
                                  onClick={() => {
                                    setIsAddingFilter(true)
                                    setIsAddingToGroup(badge.id)
                                  }}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add to group
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent 
                                className="w-auto min-w-[200px] max-w-[300px] p-0 bg-card border border-border shadow-lg flex flex-col" 
                                style={{ maxHeight: '400px' }}
                                align="start"
                              >
                                {selectedFieldForValueSelection ? (
                                  (() => {
                                    const group = filterStructure.find(item => 'items' in item && item.id === badge.id) as FilterGroup | undefined
                                    if (!group) return null
                                    const newFilterIndex = group.items.length - 1
                                    const newFilter = group.items[newFilterIndex]
                                    if (!newFilter) return null
                                    return renderValueInput(newFilter.filter, newFilter.id)
                                  })()
                                ) : (
                                  <div className="flex flex-col" style={{ maxHeight: '400px' }}>
                                    <div className="flex-shrink-0">
                                      <FilterSearchInput
                                        placeholder="Search..."
                                        value={fieldSearchQuery}
                                        onChange={setFieldSearchQuery}
                                        autoFocus={false}
                                      />
                                    </div>
                                    <div className="overflow-y-auto overflow-x-hidden p-1 flex-1" style={{ minHeight: 0, WebkitOverflowScrolling: 'touch' }}>
                                      {selectedCategory ? (
                                        FILTER_CATEGORIES.find(c => c.id === selectedCategory)?.fields
                                          .filter(field => {
                                            const matchesSearch = field.label.toLowerCase().includes(fieldSearchQuery.toLowerCase())
                                            return matchesSearch
                                          })
                                          .map((field) => (
                                            <div
                                              key={field.value}
                                              className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm cursor-pointer"
                                              onClick={(e) => {
                                                handleFieldSelected(field.value, badge.id)
                                                setSelectedCategory(null)
                                              }}
                                            >
                                              <span className="text-sm leading-none cursor-pointer flex-1">
                                                {field.label}
                                              </span>
                                            </div>
                                          ))
                                      ) : (
                                        FILTER_CATEGORIES.filter(category => 
                                          category.label.toLowerCase().includes(fieldSearchQuery.toLowerCase())
                                        ).map((category) => (
                                          <div
                                            key={category.id}
                                            className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm cursor-pointer"
                                            onClick={() => {
                                              handleCategorySelected(category.id, badge.id)
                                              setFieldSearchQuery("")
                                            }}
                                          >
                                            <span className="text-sm leading-none cursor-pointer flex-1">
                                              {category.label}
                                            </span>
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  </div>
                                )}
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      ) : (
                        // Render single filter row with hierarchical structure
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Category/Field Selector */}
                            <Popover 
                              open={editingFilterId === badge.id && editingFilterPart === 'field'} 
                              onOpenChange={(open) => {
                                if (open) {
                                  setEditingFilterId(badge.id)
                                  setEditingFilterPart('field')
                                } else {
                                  setEditingFilterPart(null)
                                }
                              }}
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="h-8 px-3 text-sm font-normal border border-border bg-background hover:bg-accent"
                                >
                                  {badge.fieldLabel || "Select field"}
                                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                            <PopoverContent className="w-auto min-w-[200px] max-w-[300px] p-0 bg-card border border-border shadow-lg flex flex-col" style={{ maxHeight: '400px' }} align="start">
                              {selectedCategory ? (
                                <div className="flex flex-col" style={{ maxHeight: '400px' }}>
                                  <div className="p-2 border-b border-border flex-shrink-0">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-full justify-start"
                                      onClick={() => setSelectedCategory(null)}
                                    >
                                      ← Back
                                    </Button>
                                  </div>
                                  <div className="flex-shrink-0">
                                    <FilterSearchInput
                                      placeholder="Search fields..."
                                      value={fieldSearchQuery}
                                      onChange={setFieldSearchQuery}
                                      autoFocus={false}
                                    />
                                  </div>
                                  <div className="overflow-y-auto overflow-x-hidden p-1 flex-1" style={{ minHeight: 0, WebkitOverflowScrolling: 'touch' }}>
                                    {FILTER_CATEGORIES.find(c => c.id === selectedCategory)?.fields
                                      .filter(field => {
                                        const matchesSearch = field.label.toLowerCase().includes(fieldSearchQuery.toLowerCase())
                                        return matchesSearch
                                      })
                                      .map((field) => (
                                        <div
                                          key={field.value}
                                          className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm cursor-pointer"
                                          onClick={() => {
                                            handleFilterFieldChange(badge.id, field.value)
                                            setSelectedCategory(null)
                                            setEditingFilterPart(null)
                                          }}
                                        >
                                          <span className="text-sm leading-none cursor-pointer flex-1">
                                            {field.label}
                                          </span>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col bg-card h-full" style={{ maxHeight: '400px', height: '400px' }}>
                                  <div className="flex-shrink-0">
                                    <FilterSearchInput
                                      placeholder="Search categories..."
                                      value={fieldSearchQuery}
                                      onChange={setFieldSearchQuery}
                                      autoFocus={false}
                                    />
                                  </div>
                                  <div className="overflow-y-auto overflow-x-hidden p-1 flex-1" style={{ minHeight: 0, WebkitOverflowScrolling: 'touch' }}>
                                    {FILTER_CATEGORIES.filter(category => 
                                      category.label.toLowerCase().includes(fieldSearchQuery.toLowerCase())
                                    ).map((category) => (
                                      <div
                                        key={category.id}
                                        className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm cursor-pointer"
                                        onClick={() => {
                                          // For 2-level categories, directly update filter; for 3-level, show fields
                                          if (!category.hasThreeLevels && category.fields.length > 0) {
                                            // Update existing filter with new field
                                            const field = category.fields[0].value
                                            handleFilterFieldChange(badge.id, field)
                                            setEditingFilterPart(null)
                                            setSelectedCategory(null)
                                          } else {
                                            setSelectedCategory(category.id)
                                            setFieldSearchQuery("")
                                          }
                                        }}
                                      >
                                        <span className="text-sm leading-none cursor-pointer flex-1">
                                          {category.label}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </PopoverContent>
                          </Popover>

                          {/* Operator Selector */}
                          <Popover 
                            open={editingFilterId === badge.id && editingFilterPart === 'operator'} 
                            onOpenChange={(open) => {
                              if (open) {
                                setEditingFilterId(badge.id)
                                setEditingFilterPart('operator')
                              } else {
                                setEditingFilterPart(null)
                              }
                            }}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="h-8 px-3 text-sm font-normal border border-border bg-background hover:bg-accent"
                              >
                                {badge.operatorLabel || "Select operator"}
                                <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto min-w-[180px] p-0 bg-card border border-border shadow-lg flex flex-col" style={{ maxHeight: '400px' }} align="start">
                              <div className="overflow-y-auto overflow-x-hidden p-1" style={{ maxHeight: '400px', height: '400px', WebkitOverflowScrolling: 'touch' }}>
                                {(() => {
                                  const fieldInfo = getFieldInfo(badge.filter.field)
                                  const availableOperators = fieldInfo?.field.operators || []
                                  return availableOperators.map((op) => (
                                    <div
                                      key={op}
                                      className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm cursor-pointer"
                                      onClick={() => {
                                        handleFilterOperatorChange(badge.id, op)
                                        setEditingFilterPart(null)
                                      }}
                                    >
                                      <span className="text-sm leading-none cursor-pointer flex-1">
                                        {OPERATOR_LABELS[op]}
                                      </span>
                                    </div>
                                  ))
                                })()}
                              </div>
                            </PopoverContent>
                          </Popover>

                          {/* Value Input - Show input field for date/time, button for others */}
                          {(() => {
                            const fieldInfo = getFieldInfo(badge.filter.field)
                            const needsValue = fieldInfo && !['exists', 'doesNotExist', 'isEmpty', 'isNotEmpty'].includes(badge.filter.operator)
                            
                            if (!needsValue) return null
                            
                            // For date/time fields, show clickable input field
                            if (fieldInfo?.field.valueType === 'date') {
                              const getDateDisplayValue = () => {
                                // Time-based operators show number + time unit
                                if (badge.filter.operator === 'isGreaterThanTime' || badge.filter.operator === 'isLessThanTime') {
                                  const numValue = typeof badge.filter.value === 'number' ? badge.filter.value : 0
                                  const timeUnit = timeUnits[badge.id] || 'seconds'
                                  if (numValue === 0) return "Enter value"
                                  return `${numValue} ${timeUnit} ago`
                                }
                                
                                if (badge.filter.operator === 'isBetweenTime') {
                                  const values = Array.isArray(badge.filter.value) && badge.filter.value.length === 2 
                                    ? badge.filter.value.filter((v): v is number => typeof v === 'number')
                                    : [0, 0]
                                  const timeUnit = timeUnits[badge.id] || 'seconds'
                                  if (values[0] === 0 && values[1] === 0) return "Enter values"
                                  return `${values[0]} - ${values[1]} ${timeUnit} ago`
                                }
                                
                                // Timestamp operators show date
                                if (typeof badge.filter.value === 'object' && badge.filter.value && 'from' in badge.filter.value) {
                                  const dateValue = badge.filter.value as { from: Date; to: Date }
                                  if (badge.filter.operator === 'isTimestampBetween') {
                                    return `${format(dateValue.from, 'MMM dd, yyyy')} - ${format(dateValue.to, 'MMM dd, yyyy')}`
                                  } else {
                                    return format(dateValue.from, 'MMM dd, yyyy')
                                  }
                                }
                                return "Select date"
                              }
                              
                              return (
                                <Popover 
                                  open={editingFilterId === badge.id && editingFilterPart === 'value'} 
                                  onOpenChange={(open) => {
                                    if (open) {
                                      setEditingFilterId(badge.id)
                                      setEditingFilterPart('value')
                                    } else {
                                      setEditingFilterPart(null)
                                      setValueSearchQuery("")
                                    }
                                  }}
                                >
                                  <PopoverTrigger asChild>
                                    <Input
                                      type="text"
                                      readOnly
                                      placeholder="Select date"
                                      value={getDateDisplayValue()}
                                      className="h-8 w-auto min-w-[180px] cursor-pointer"
                                      onClick={() => {
                                        setEditingFilterId(badge.id)
                                        setEditingFilterPart('value')
                                      }}
                                    />
                                  </PopoverTrigger>
                                  <PopoverContent 
                                    className="w-auto p-0 bg-card border border-border shadow-lg"
                                    align="start"
                                    onOpenAutoFocus={(e) => e.preventDefault()}
                                  >
                                    <div className="flex flex-col flex-1 min-h-0">
                                      {editingFilterId === badge.id && renderValueInput(badge.filter, badge.id)}
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              )
                            }
                            
                            // For other field types, show the (+) button
                            return (
                              <Popover 
                                open={editingFilterId === badge.id && editingFilterPart === 'value'} 
                                onOpenChange={(open) => {
                                  if (open) {
                                    setEditingFilterId(badge.id)
                                    setEditingFilterPart('value')
                                  } else {
                                    setEditingFilterPart(null)
                                    setValueSearchQuery("")
                                  }
                                }}
                              >
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0 border border-border bg-background hover:bg-accent"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent 
                                  className="w-auto min-w-[200px] max-w-[300px] p-0 bg-card border border-border shadow-lg max-h-[400px] flex flex-col"
                                  align="start"
                                  onOpenAutoFocus={(e) => e.preventDefault()}
                                >
                                  <div className="flex flex-col flex-1 min-h-0">
                                    {editingFilterId === badge.id && renderValueInput(badge.filter, badge.id)}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            )
                          })()}

                          {/* Delete Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:text-destructive"
                            onClick={() => handleRemoveFilter(badge.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          </div>

                          {/* Selected Value Badges - Hide for date/time fields (they use input field instead) */}
                          {(() => {
                            const fieldInfo = getFieldInfo(badge.filter.field)
                            // Don't show badges for date/time fields
                            if (fieldInfo?.field.valueType === 'date') {
                              return null
                            }
                            
                            return badge.valueItems && badge.valueItems.length > 0 ? (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {badge.valueItems.map((valueItem) => (
                                  <Badge
                                    key={valueItem.value}
                                    variant="secondary"
                                    className="h-7 px-2.5 text-sm font-normal bg-muted hover:bg-muted/80 flex items-center gap-1.5"
                                  >
                                    <span>{valueItem.label}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-4 w-4 p-0 hover:bg-transparent hover:text-destructive ml-0.5"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        const fieldInfo = getFieldInfo(badge.filter.field)
                                        
                                        if (fieldInfo?.field.valueType === 'string') {
                                          // For strings, clear the value
                                          handleFilterValueChange(badge.id, '')
                                        } else if (fieldInfo?.field.valueType === 'number') {
                                          // For numbers, clear the value
                                          handleFilterValueChange(badge.id, 0)
                                        } else {
                                          // For arrays (channels, tags, etc.)
                                          const currentValues = Array.isArray(badge.filter.value) 
                                            ? badge.filter.value.filter((v): v is string => typeof v === 'string')
                                            : typeof badge.filter.value === 'string' ? [badge.filter.value] : []
                                          const newValues = currentValues.filter(v => v !== valueItem.value)
                                          handleFilterValueChange(badge.id, newValues)
                                        }
                                      }}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </Badge>
                                ))}
                              </div>
                            ) : null
                          })()}
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* Filter Action Buttons - Show below filters when filters exist */}
              <ButtonGroup className="w-full">
                <Popover 
                  open={isAddingFilter && !isAddingToGroup} 
                  onOpenChange={(open) => {
                    setIsAddingFilter(open)
                    if (open) {
                      // Reset to first level when opening
                      setSelectedFieldForValueSelection(null)
                      setSelectedCategory(null)
                      setFieldSearchQuery("")
                      setValueSearchQuery("")
                    } else {
                      // Clean up when closing
                      setFieldSearchQuery("")
                      setValueSearchQuery("")
                      setSelectedFieldForValueSelection(null)
                      setSelectedCategory(null)
                      setIsAddingToGroup(null)
                    }
                  }}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 justify-start"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add filter
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className={selectedFieldForValueSelection ? "w-auto min-w-[200px] max-w-[300px] p-0 bg-card border border-border shadow-lg max-h-[400px] flex flex-col" : "w-auto min-w-[200px] max-w-[300px] p-0 bg-card border border-border shadow-lg max-h-[400px] flex flex-col"} 
                    align="start"
                  >
                    {selectedFieldForValueSelection ? (
                      (() => {
                        const lastItem = filterStructure[filterStructure.length - 1]
                        if (!lastItem || !('filter' in lastItem)) return null
                        return renderValueInput(lastItem.filter, lastItem.id)
                      })()
                                ) : (
                                  <div className="flex flex-col h-full" style={{ maxHeight: '400px', height: '400px' }}>
                                    <div className="flex-shrink-0">
                                      <FilterSearchInput
                                        placeholder="Search..."
                                        value={fieldSearchQuery}
                                        onChange={setFieldSearchQuery}
                                        autoFocus={false}
                                      />
                                    </div>
                                    <div className="overflow-y-auto overflow-x-hidden p-1 flex-1" style={{ minHeight: 0, WebkitOverflowScrolling: 'touch' }}>
                                      {selectedCategory ? (
                                        FILTER_CATEGORIES.find(c => c.id === selectedCategory)?.fields
                              .filter(field => {
                                const matchesSearch = field.label.toLowerCase().includes(fieldSearchQuery.toLowerCase())
                                const isAlreadyApplied = appliedFilterFields.has(field.value)
                                return matchesSearch && !isAlreadyApplied
                              })
                              .map((field) => (
                                <div
                                  key={field.value}
                                  className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm cursor-pointer"
                                  onClick={(e) => {
                                    handleFieldSelected(field.value)
                                    setSelectedCategory(null)
                                  }}
                                >
                                  <span className="text-sm leading-none cursor-pointer flex-1">
                                    {field.label}
                                  </span>
                                </div>
                              ))
                          ) : (
                            FILTER_CATEGORIES.filter(category => 
                              category.label.toLowerCase().includes(fieldSearchQuery.toLowerCase())
                            ).map((category) => (
                              <div
                                key={category.id}
                                className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm cursor-pointer"
                                onClick={() => {
                                  handleCategorySelected(category.id)
                                  setFieldSearchQuery("")
                                }}
                              >
                                <span className="text-sm leading-none cursor-pointer flex-1">
                                  {category.label}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start border-dashed"
                  onClick={handleCreateGroup}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add filter group
                </Button>
              </ButtonGroup>
            </div>
          </div>

          {/* Footer */}
          <SheetFooter className="sticky bottom-0 border-t bg-popover px-4 py-3 mt-auto z-10 shrink-0">
            <div className="flex gap-3 w-full justify-between">
              <Button 
                variant="outline" 
                onClick={handleResetFilters}
                disabled={filterStructure.length === 0}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset Filter
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleDrawerClose(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={filterStructure.length === 0}
                >
                  Save
                </Button>
              </div>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
