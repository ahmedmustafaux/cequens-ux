import * as React from "react"
import { useNavigate } from "react-router-dom"
import { usePageTitle } from "@/hooks/use-dynamic-title"
import { PageWrapper } from "@/components/page-wrapper"
import { PageHeader } from "@/components/page-header"
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
import { Plus, Users2, X, Download, Trash2 as TrashIcon, Send, Save, RotateCcw, ArrowLeft, ChevronDown, AlertTriangle } from "lucide-react"
import { EnvelopeSimple, ChatText, Phone as PhoneIcon, Bell } from "phosphor-react"
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
  DataTable,
  DataTableHeader,
  DataTableSelectionHeader,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableRow,
} from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { useSegments, useCreateSegment, useUpdateSegment, useDeleteSegment, useUpdateSegmentContacts } from "@/hooks/use-segments"
import { useContacts } from "@/hooks/use-contacts"
import type { Segment, SegmentFilter } from "@/lib/supabase/types"
import type { AppContact } from "@/lib/supabase/types"
import { contactMatchesFilter as dbContactMatchesFilter } from "@/lib/supabase/segments"
import { formatPhoneWithCountryCode } from "@/lib/phone-utils"
import type { Segment as MockSegment, SegmentFilter as MockSegmentFilter } from "@/data/mock-data"
import { CreateSegmentDialog, type CreateSegmentDialogProps } from "@/components/create-segment-dialog"

// Conversion functions between database and mock-data types
const convertSegmentFilterToMock = (filter: SegmentFilter): MockSegmentFilter => {
  // Convert date string values to Date objects
  let value: MockSegmentFilter["value"]
  if (typeof filter.value === 'object' && filter.value !== null && 'from' in filter.value) {
    const dateRange = filter.value as { from: string; to: string }
    value = {
      from: new Date(dateRange.from),
      to: new Date(dateRange.to)
    }
  } else {
    value = filter.value as MockSegmentFilter["value"]
  }
  
  return {
    field: filter.field as MockSegmentFilter["field"],
    operator: filter.operator as MockSegmentFilter["operator"],
    value
  }
}

const convertSegmentFilterFromMock = (filter: MockSegmentFilter): SegmentFilter => {
  // Convert Date values to strings
  let value: SegmentFilter["value"]
  if (filter.value instanceof Date) {
    value = filter.value.toISOString()
  } else if (typeof filter.value === 'object' && filter.value !== null && 'from' in filter.value) {
    const dateRange = filter.value as { from: Date; to: Date }
    value = {
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString()
    }
  } else {
    value = filter.value as SegmentFilter["value"]
  }
  
  return {
    field: filter.field,
    operator: filter.operator,
    value
  }
}

const convertSegmentToMock = (segment: Segment): MockSegment => {
  return {
    id: segment.id,
    name: segment.name,
    description: segment.description || undefined,
    filters: segment.filters.map(convertSegmentFilterToMock),
    contactIds: segment.contact_ids,
    createdAt: new Date(segment.created_at),
    updatedAt: new Date(segment.updated_at)
  }
}

const convertSegmentFromMock = (segment: Omit<MockSegment, "id" | "contactIds" | "createdAt" | "updatedAt">): Omit<Segment, "id" | "user_id" | "contact_ids" | "created_at" | "updated_at"> => {
  return {
    name: segment.name,
    description: segment.description || null,
    filters: segment.filters.map(convertSegmentFilterFromMock)
  }
}
import { SearchProvider } from "@/contexts/search-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Highlight } from "@/components/ui/highlight"
import { CircleFlag } from "react-circle-flags"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { FilterSearchInput } from "@/components/ui/filter-search-input"
import { FILTER_CATEGORIES, OPERATOR_LABELS, type FilterCategory } from "@/data/filter-config"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { type DateRange } from "react-day-picker"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

// Helper function to get all tags from contacts
const getAllTags = (contacts: AppContact[]): string[] => {
  const tags = new Set<string>()
  contacts.forEach((contact) => {
    contact.tags.forEach((tag) => tags.add(tag))
  })
  return Array.from(tags).sort()
}

const getAllChannels = (contacts: AppContact[]): string[] => {
  // Get actual channels from database contacts
  const channels = new Set<string>()
  contacts.forEach((contact) => {
    if (contact.channel && contact.channel.trim() !== '') {
      channels.add(contact.channel.toLowerCase())
    }
  })
  // Return channels in preferred order, with actual channels from DB first
  const preferredOrder = ["whatsapp", "messenger", "instagram", "sms", "email", "phone", "rcs", "push"]
  const dbChannels = Array.from(channels)
  const orderedChannels = preferredOrder.filter(ch => dbChannels.includes(ch))
  const otherChannels = dbChannels.filter(ch => !preferredOrder.includes(ch))
  return [...orderedChannels, ...otherChannels.sort()]
}

// Helper function to get channel icon
const getChannelIcon = (channel: string): React.ReactNode => {
  switch (channel.toLowerCase()) {
    case "whatsapp":
      return <img src="/icons/WhatsApp.svg" alt="WhatsApp" className="w-4 h-4 flex-shrink-0" onError={(e) => { e.currentTarget.style.display = "none" }} />
    case "instagram":
      return <img src="/icons/Instagram.svg" alt="Instagram" className="w-4 h-4 flex-shrink-0" onError={(e) => { e.currentTarget.style.display = "none" }} />
    case "messenger":
      return <img src="/icons/Messenger.png" alt="Messenger" className="w-4 h-4 flex-shrink-0" onError={(e) => { e.currentTarget.style.display = "none" }} />
    case "sms":
      return <ChatText weight="fill" className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
    case "email":
      return <EnvelopeSimple weight="fill" className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
    case "phone":
      return <PhoneIcon weight="fill" className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
    case "rcs":
      return <Send className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
    case "push":
      return <Bell weight="fill" className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
    default:
      return null
  }
}

const getAllCountries = (contacts: AppContact[]): Array<{ code: string; name: string }> => {
  const countries = new Map<string, string>()
  contacts.forEach((contact) => {
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

const getAllConversationStatuses = (contacts: AppContact[]): string[] => {
  const statuses = new Set<string>()
  contacts.forEach((contact) => {
    if (contact.conversationStatus) {
      statuses.add(contact.conversationStatus)
    }
  })
  return Array.from(statuses).sort()
}

// Helper function to get all languages from contacts
const getAllLanguages = (contacts: AppContact[]): string[] => {
  const languages = new Set<string>()
  contacts.forEach((contact) => {
    if (contact.language && contact.language.trim() !== '') {
      languages.add(contact.language)
    }
  })
  return Array.from(languages).sort()
}

// Helper function to get all bot statuses from contacts
const getAllBotStatuses = (contacts: AppContact[]): string[] => {
  const botStatuses = new Set<string>()
  contacts.forEach((contact) => {
    if (contact.botStatus && contact.botStatus.trim() !== '') {
      botStatuses.add(contact.botStatus)
    }
  })
  return Array.from(botStatuses).sort()
}

// Helper function to get all assignees from contacts
const getAllAssignees = (contacts: AppContact[]): string[] => {
  const assignees = new Set<string>()
  contacts.forEach((contact) => {
    if (contact.assignee && contact.assignee.trim() !== '') {
      assignees.add(contact.assignee)
    }
  })
  return Array.from(assignees).sort()
}

// Helper function to get all last interacted channels from contacts
const getAllLastInteractedChannels = (contacts: AppContact[]): string[] => {
  const channels = new Set<string>()
  contacts.forEach((contact) => {
    if (contact.lastInteractedChannel && contact.lastInteractedChannel.trim() !== '') {
      channels.add(contact.lastInteractedChannel.toLowerCase())
    }
  })
  // Return channels in preferred order
  const preferredOrder = ["whatsapp", "messenger", "instagram", "sms", "email", "phone", "rcs", "push"]
  const dbChannels = Array.from(channels)
  const orderedChannels = preferredOrder.filter(ch => dbChannels.includes(ch))
  const otherChannels = dbChannels.filter(ch => !preferredOrder.includes(ch))
  return [...orderedChannels, ...otherChannels.sort()]
}

// Use the exported function from segments.ts to ensure consistency
const contactMatchesFilter = dbContactMatchesFilter

// Helper function to get contacts that match a segment's filters
const getContactsForSegment = (contacts: AppContact[], segment: Segment): AppContact[] => {
  if (!segment.filters || segment.filters.length === 0) {
    return contacts
  }

  return contacts.filter((contact) => {
    if (!segment.filters || segment.filters.length === 0) {
      return false // No filters means no contacts
    }
    return segment.filters.every((filter) => contactMatchesFilter(contact, filter))
  })
}

// Helper to get field info from FILTER_CATEGORIES
const getFieldInfo = (field: string): { category: FilterCategory; field: FilterCategory["fields"][0] } | null => {
  for (const category of FILTER_CATEGORIES) {
    const fieldDef = category.fields.find(f => f.value === field)
    if (fieldDef) {
      return { category, field: fieldDef }
    }
  }
  return null
}

// Helper function to format filter for display as badge
const formatFilterBadge = (filter: SegmentFilter): { label: string; value: string } => {
  const fieldInfo = getFieldInfo(filter.field)
  const fieldLabel = fieldInfo?.field.label || filter.field
  const operatorLabel = OPERATOR_LABELS[filter.operator as keyof typeof OPERATOR_LABELS] || filter.operator

  // Format value based on field type
  let valueLabel = ""
  const needsValue = !['exists', 'doesNotExist', 'isEmpty', 'isNotEmpty'].includes(filter.operator)
  
  if (!needsValue) {
    valueLabel = ""
  } else if (fieldInfo?.field.valueType === 'date') {
    // Handle date values
    if (filter.operator === 'isGreaterThanTime' || filter.operator === 'isLessThanTime') {
      const numValue = typeof filter.value === 'number' ? filter.value : 0
      if (numValue > 0) {
        valueLabel = `${numValue} seconds ago` // Default to seconds, could be enhanced
      }
    } else if (filter.operator === 'isBetweenTime') {
      const values = Array.isArray(filter.value) && filter.value.length === 2 
        ? filter.value.filter((v): v is number => typeof v === 'number')
        : [0, 0]
      if (values[0] > 0 || values[1] > 0) {
        valueLabel = `${values[0]} - ${values[1]} seconds ago`
      }
    } else if (typeof filter.value === 'object' && filter.value && 'from' in filter.value) {
      const dateValue = filter.value as { from: string; to: string }
      // Convert string dates to Date objects for formatting
      const fromDate = new Date(dateValue.from)
      const toDate = new Date(dateValue.to)
      if (filter.operator === 'isTimestampBetween') {
        valueLabel = `${format(fromDate, 'MMM dd, yyyy')} - ${format(toDate, 'MMM dd, yyyy')}`
      } else {
        valueLabel = format(fromDate, 'MMM dd, yyyy')
      }
    }
  } else if (fieldInfo?.field.valueType === 'string' && typeof filter.value === 'string') {
    valueLabel = filter.value
  } else if (fieldInfo?.field.valueType === 'number') {
    if (Array.isArray(filter.value) && filter.value.length === 2) {
      const numValues = filter.value.filter((v): v is number => typeof v === 'number')
      valueLabel = `${numValues[0]} - ${numValues[1]}`
    } else {
      const numValue = typeof filter.value === 'number' ? filter.value : 0
      valueLabel = String(numValue)
    }
  } else {
    // Handle array values
    if (Array.isArray(filter.value)) {
      const values = filter.value.filter((v): v is string => typeof v === 'string')
      if (filter.field === "countryISO") {
        const countryNames: Record<string, string> = {
          SA: "Saudi Arabia",
          US: "United States",
          EG: "Egypt",
          IN: "India",
          GB: "United Kingdom",
          AE: "United Arab Emirates",
        }
        valueLabel = values.map((code) => countryNames[code] || code).join(", ")
      } else {
        valueLabel = values.join(", ")
      }
    } else if (typeof filter.value === 'string') {
      if (filter.field === "countryISO") {
        const countryNames: Record<string, string> = {
          SA: "Saudi Arabia",
          US: "United States",
          EG: "Egypt",
          IN: "India",
          GB: "United Kingdom",
          AE: "United Arab Emirates",
        }
        valueLabel = countryNames[filter.value] || filter.value
      } else {
        valueLabel = filter.value
      }
    }
  }

  return {
    label: fieldLabel,
    value: valueLabel ? `${operatorLabel} ${valueLabel}` : operatorLabel,
  }
}

// Column definitions for contacts table
const createContactColumns = (): ColumnDef<AppContact>[] => [
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
    header: "Users",
    cell: ({ row }) => {
      const contact = row.original
      return (
        <div className="flex items-center gap-2 min-w-0">
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarImage src="" />
            <AvatarFallback className="font-medium text-xs">
              {contact.avatar}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <div className="text-left group-hover:underline">
              <Highlight
                text={`${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Contact'}
                columnId="name"
                className="font-medium text-sm whitespace-nowrap truncate"
              />
            </div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => {
      const contact = row.original
      // Format phone number with country code for display
      const displayPhone = formatPhoneWithCountryCode(contact.phone, contact.countryISO);
      return (
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-4 h-4 flex-shrink-0 overflow-hidden rounded-full">
            <CircleFlag
              countryCode={contact.countryISO.toLowerCase()}
              className="w-full h-full"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <Highlight
              text={displayPhone}
              columnId="phone"
              className="font-normal text-sm text-muted-foreground whitespace-nowrap truncate"
            />
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "channel",
    header: "Channels",
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
          case "whatsapp":
            return "/icons/WhatsApp.svg"
          case "instagram":
            return "/icons/Instagram.svg"
          case "messenger":
            return "/icons/Messenger.png"
          default:
            return "/icons/Messenger.png"
        }
      }

      return (
        <div className="flex items-center justify-start whitespace-nowrap">
          <img
            src={getChannelIconPath(channel)}
            alt={`${channel} icon`}
            className="w-4 h-4 flex-shrink-0"
            onError={(e) => {
              e.currentTarget.style.display = "none"
            }}
          />
        </div>
      )
    },
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => {
      const tags = row.original.tags
      if (!tags || tags.length === 0) {
        return <span className="text-sm text-muted-foreground">—</span>
      }
      return (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 2).map((tag, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {tags.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{tags.length - 2}
            </Badge>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Last Update",
    cell: ({ row }) => {
      const contact = row.original as AppContact;
      const updatedAt = contact.updatedAt;
      const lastInteractionTime = contact.lastInteractionTime;
      
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
    cell: ({ row }) => {
      const contact = row.original
      return (
        <div className="flex items-center justify-end">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => {
                  // Navigate to contact detail
                }}
              >
                <span className="sr-only">Open menu</span>
                <Edit className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" align="center">
              <p>Edit contact</p>
            </TooltipContent>
          </Tooltip>
        </div>
      )
    },
  },
]

function ContactsSegmentsPageContent() {
  const navigate = useNavigate()
  
  // Database hooks
  const { data: segments = [], isLoading: segmentsLoading, refetch: refetchSegments } = useSegments()
  const { data: contacts = [], isLoading: contactsLoading } = useContacts()
  const createSegmentMutation = useCreateSegment()
  const updateSegmentMutation = useUpdateSegment()
  const deleteSegmentMutation = useDeleteSegment()
  const updateSegmentContactsMutation = useUpdateSegmentContacts()
  
  const [selectedSegmentId, setSelectedSegmentId] = React.useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)
  const [editingSegment, setEditingSegment] = React.useState<MockSegment | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = React.useState("")
  const [segmentToDelete, setSegmentToDelete] = React.useState<Segment | null>(null)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 15,
  })
  const isDataLoading = segmentsLoading || contactsLoading
  // Track pending filter changes for the selected segment
  const [pendingFilters, setPendingFilters] = React.useState<SegmentFilter[] | null>(null)
  const [originalFilters, setOriginalFilters] = React.useState<SegmentFilter[] | null>(null)
  // Inline filter form state
  const [isAddingFilter, setIsAddingFilter] = React.useState(false)
  const [editingFilterIndex, setEditingFilterIndex] = React.useState<number | null>(null)
  const [fieldSearchQuery, setFieldSearchQuery] = React.useState("")
  const [valueSearchQuery, setValueSearchQuery] = React.useState("")
  const [selectedFieldForValueSelection, setSelectedFieldForValueSelection] = React.useState<string | null>(null)
  const [selectedFieldElement, setSelectedFieldElement] = React.useState<HTMLElement | null>(null)
  const [isSegmentMenuOpen, setIsSegmentMenuOpen] = React.useState(false)
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null)
  const [timeUnits, setTimeUnits] = React.useState<Record<string, string>>({})

  usePageTitle("Segments")

  // Auto-select first segment when segments are loaded
  React.useEffect(() => {
    if (segments.length > 0 && !selectedSegmentId) {
      setSelectedSegmentId(segments[0].id)
    }
  }, [segments, selectedSegmentId])

  const handleCreateSegment = async (
    segmentData: Omit<MockSegment, "id" | "contactIds" | "createdAt" | "updatedAt">
  ) => {
    try {
      // Convert from mock-data type to database type
      const dbSegmentData = convertSegmentFromMock(segmentData)
      await createSegmentMutation.mutateAsync(dbSegmentData)
      await refetchSegments()
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error("Error creating segment:", error)
    }
  }

  const handleEditSegment = React.useCallback((segment: Segment) => {
    // Convert to mock type for the dialog
    const mockSegment = convertSegmentToMock(segment)
    setEditingSegment(mockSegment)
    setIsCreateDialogOpen(true)
  }, [])

  const handleUpdateSegment = React.useCallback(
    async (
      segmentId: string,
      segmentData: Omit<MockSegment, "id" | "contactIds" | "createdAt" | "updatedAt">
    ) => {
      try {
        // Convert from mock-data type to database type
        const dbSegmentData = convertSegmentFromMock(segmentData)
        await updateSegmentMutation.mutateAsync({ id: segmentId, segment: dbSegmentData })
        await refetchSegments()
        setEditingSegment(null)
        setIsCreateDialogOpen(false)
      } catch (error) {
        console.error("Error updating segment:", error)
      }
    },
    [updateSegmentMutation, refetchSegments]
  )

  const handleDeleteSegment = React.useCallback(async () => {
    if (!segmentToDelete) return
    
    try {
      await deleteSegmentMutation.mutateAsync(segmentToDelete.id)
      await refetchSegments()
      // If deleted segment was selected, select first remaining segment or null
      if (selectedSegmentId === segmentToDelete.id) {
        const remainingSegments = segments.filter(s => s.id !== segmentToDelete.id)
        setSelectedSegmentId(remainingSegments.length > 0 ? remainingSegments[0].id : null)
      }
      toast.success(`Successfully deleted segment "${segmentToDelete.name}"`)
      setShowDeleteDialog(false)
      setDeleteConfirmation("")
      setSegmentToDelete(null)
    } catch (error) {
      console.error("Error deleting segment:", error)
      toast.error("Failed to delete segment. Please try again.")
    }
  }, [selectedSegmentId, segments, deleteSegmentMutation, refetchSegments, segmentToDelete])

  const handleOpenDeleteDialog = React.useCallback((segment: Segment) => {
    setSegmentToDelete(segment)
    setShowDeleteDialog(true)
  }, [])

  const handleRemoveFromSegment = React.useCallback(async () => {
    if (!selectedSegmentId) return
    
    const selectedContactIds = Object.keys(rowSelection)
    if (selectedContactIds.length === 0) return
    
    const selectedSegment = segments.find(s => s.id === selectedSegmentId)
    if (!selectedSegment) return
    
    // Remove selected contacts from the segment's contact_ids
    const updatedContactIds = (selectedSegment.contact_ids || []).filter(
      (id) => !selectedContactIds.includes(id)
    )
    
    try {
      await updateSegmentMutation.mutateAsync({
        id: selectedSegmentId,
        segment: {
          name: selectedSegment.name,
          description: selectedSegment.description,
          filters: selectedSegment.filters,
          contact_ids: updatedContactIds,
        }
      })
      await refetchSegments()
      // Clear selection after removal
      setRowSelection({})
    } catch (error) {
      console.error("Error removing contacts from segment:", error)
    }
  }, [rowSelection, selectedSegmentId, segments, updateSegmentMutation, refetchSegments])

  const handleSendCampaign = React.useCallback(() => {
    const selectedContactIds = Object.keys(rowSelection)
    if (selectedContactIds.length === 0) return
    
    // Navigate to create campaign page with selected contacts
    // In a real app, you might pass the contact IDs as query params or state
    navigate("/campaigns/create", {
      state: { selectedContactIds },
    })
  }, [rowSelection, navigate])


  const handleDialogClose = React.useCallback(() => {
    setIsCreateDialogOpen(false)
    setEditingSegment(null)
  }, [])

  // Get selected segment
  const selectedSegment = React.useMemo(() => {
    return segments.find((s) => s.id === selectedSegmentId) || null
  }, [segments, selectedSegmentId])

  // Reset pending filters when selected segment changes
  React.useEffect(() => {
    if (selectedSegment) {
      setPendingFilters(null)
      setOriginalFilters([...selectedSegment.filters])
      setEditingFilterIndex(null)
    } else {
      setPendingFilters(null)
      setOriginalFilters(null)
      setEditingFilterIndex(null)
    }
  }, [selectedSegment])


  const handleRemoveFilter = React.useCallback((filterIndex: number) => {
    if (!selectedSegment) return
    
    const currentFilters = pendingFilters !== null ? pendingFilters : selectedSegment.filters
    const updatedFilters = currentFilters.filter((_, i) => i !== filterIndex)
    
    setPendingFilters(updatedFilters)
    
    // Set original filters if not set yet
    if (originalFilters === null) {
      setOriginalFilters([...selectedSegment.filters])
    }
  }, [selectedSegment, pendingFilters, originalFilters])

  // Get filter value options based on field
  const getFilterValueOptions = React.useCallback((field: string) => {
    switch (field) {
      case "countryISO":
        return getAllCountries(contacts).map((c) => ({ value: c.code, label: c.name }))
      case "tags":
        return getAllTags(contacts).map((tag) => ({ value: tag, label: tag }))
      case "channel":
        return getAllChannels(contacts).map((channel) => {
          // Format channel names for display
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
          return { 
            value: channel, 
            label: channelLabels[channel] || channel.charAt(0).toUpperCase() + channel.slice(1),
            icon: channel // Pass channel ID for icon rendering
          }
        })
      case "conversationStatus":
        return getAllConversationStatuses(contacts).map((status) => ({ value: status, label: status }))
      case "language":
        return getAllLanguages(contacts).map((language) => ({ value: language, label: language }))
      case "botStatus":
        return getAllBotStatuses(contacts).map((botStatus) => ({ value: botStatus, label: botStatus }))
      case "assignee":
        return getAllAssignees(contacts).map((assignee) => ({ value: assignee, label: assignee }))
      case "lastInteractedChannel":
        return getAllLastInteractedChannels(contacts).map((channel) => {
          // Format channel names for display
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
          return { 
            value: channel, 
            label: channelLabels[channel] || channel.charAt(0).toUpperCase() + channel.slice(1),
            icon: channel
          }
        })
      default:
        return []
    }
  }, [contacts])


  const handleCategorySelected = React.useCallback((categoryId: string) => {
    const category = FILTER_CATEGORIES.find(c => c.id === categoryId)
    if (!category) return

    // If it's a 2-level category (Category -> Value), automatically select the field
    if (!category.hasThreeLevels && category.fields.length > 0) {
      const field = category.fields[0].value
      handleFieldSelected(field)
    } else {
      // 3-level category (Contact Field), show fields selection
      setSelectedCategory(categoryId)
    }
  }, [])

  const handleFieldSelected = React.useCallback((field: string, event?: React.MouseEvent<HTMLElement>) => {
    if (!selectedSegment) return
    
    try {
      const fieldInfo = getFieldInfo(field)
      if (!fieldInfo) return

      const currentFilters = pendingFilters !== null ? pendingFilters : selectedSegment.filters
      
      // Get default operator from field definition
      const defaultOperator = fieldInfo.field.operators[0] || "equals"
      
      // Get default value based on valueType
      let defaultValue: SegmentFilter["value"]
      if (fieldInfo.field.valueType === 'date') {
        // Convert Date to string for database type
        const now = new Date().toISOString()
        defaultValue = { from: now, to: now }
      } else if (fieldInfo.field.valueType === 'number') {
        defaultValue = 0
      } else if (fieldInfo.field.valueType === 'array') {
        defaultValue = []
      } else {
        defaultValue = ""
      }
      
      const filterToAdd: SegmentFilter = {
        field,
        operator: defaultOperator,
        value: defaultValue,
      }
      
      const updatedFilters = [...currentFilters, filterToAdd]
      
      // Set original filters if not set yet
      if (originalFilters === null) {
        setOriginalFilters([...selectedSegment.filters])
      }
      
      // Update pending filters
      setPendingFilters(updatedFilters)
      
      // Store the clicked element for positioning
      if (event?.currentTarget) {
        setSelectedFieldElement(event.currentTarget)
      }
      
      // Keep the popover open and show value selection for the selected field
      setSelectedFieldForValueSelection(field)
      setSelectedCategory(null)
      // Don't close isAddingFilter - we'll show value selection in the same popover
    } catch (error) {
      console.error("Error adding filter:", error)
    }
  }, [selectedSegment, pendingFilters, originalFilters])

  const handleFilterValueChange = React.useCallback((filterIndex: number, newValues: string | string[] | number | number[] | Date | { from: Date; to: Date }) => {
    if (!selectedSegment) return
    
    const currentFilters = pendingFilters !== null ? pendingFilters : selectedSegment.filters
    const updatedFilters = [...currentFilters]
    
    // Convert Date values to strings for database type
    let convertedValue: SegmentFilter["value"]
    if (newValues instanceof Date) {
      convertedValue = newValues.toISOString()
    } else if (typeof newValues === 'object' && newValues !== null && 'from' in newValues && 'to' in newValues) {
      // Convert Date objects to ISO strings
      const dateRange = newValues as { from: Date; to: Date }
      convertedValue = {
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString()
      }
    } else {
      convertedValue = newValues as SegmentFilter["value"]
    }
    
    updatedFilters[filterIndex] = {
      ...updatedFilters[filterIndex],
      value: convertedValue,
    }
    
    setPendingFilters(updatedFilters)
    
    // Set original filters if not set yet
    if (originalFilters === null) {
      setOriginalFilters([...selectedSegment.filters])
    }
    
    // If this is a new filter being created, close the "Add Filter" popover after value is selected
    if (selectedFieldForValueSelection && filterIndex === updatedFilters.length - 1) {
      setSelectedFieldForValueSelection(null)
      setSelectedFieldElement(null)
      setValueSearchQuery("")
      setIsAddingFilter(false)
    }
  }, [selectedSegment, pendingFilters, originalFilters, selectedFieldForValueSelection])

  const handleFilterOperatorChange = React.useCallback((filterIndex: number, operator: SegmentFilter["operator"]) => {
    if (!selectedSegment) return
    
    const currentFilters = pendingFilters !== null ? pendingFilters : selectedSegment.filters
    const updatedFilters = [...currentFilters]
    const currentFilter = updatedFilters[filterIndex]
    
    // Get field info to determine default value type
    const fieldInfo = getFieldInfo(currentFilter.field)
    
    // Reset value based on field type and operator
    let resetValue: SegmentFilter["value"]
    if (fieldInfo?.field.valueType === 'date') {
      // Convert Date to string for database type
      const now = new Date().toISOString()
      resetValue = { from: now, to: now }
    } else if (fieldInfo?.field.valueType === 'number') {
      resetValue = 0
    } else if (fieldInfo?.field.valueType === 'array') {
      resetValue = []
    } else {
      resetValue = ""
    }
    
    updatedFilters[filterIndex] = {
      ...updatedFilters[filterIndex],
      operator,
      value: resetValue,
    }
    
    setPendingFilters(updatedFilters)
    
    // Set original filters if not set yet
    if (originalFilters === null) {
      setOriginalFilters([...selectedSegment.filters])
    }
  }, [selectedSegment, pendingFilters, originalFilters])

  // Render value input based on field type and operator
  const renderValueInput = React.useCallback((filter: SegmentFilter, filterIndex: number) => {
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

    // Date fields - use date picker or time input
    if (fieldDef.valueType === 'date') {
      // Time-based operators (isGreaterThanTime, isLessThanTime, isBetweenTime) use number input with time unit
      if (operator === 'isGreaterThanTime' || operator === 'isLessThanTime') {
        const currentValue = typeof filter.value === 'number' ? filter.value : 0
        const currentTimeUnit = timeUnits[String(filterIndex)] || 'seconds'
        
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
                    handleFilterValueChange(filterIndex, numValue)
                  } else if (e.target.value === '') {
                    handleFilterValueChange(filterIndex, 0)
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
                  setTimeUnits(prev => ({ ...prev, [String(filterIndex)]: value }))
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
        const currentTimeUnit = timeUnits[String(filterIndex)] || 'seconds'
        
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
                  handleFilterValueChange(filterIndex, [from, values[1] || 0])
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
                  handleFilterValueChange(filterIndex, [values[0] || 0, to])
                }}
                className="w-full"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Time Unit</Label>
              <Select
                value={currentTimeUnit}
                onValueChange={(value) => {
                  setTimeUnits(prev => ({ ...prev, [String(filterIndex)]: value }))
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
          const dateValue = filter.value as { from: string; to: string }
          // Convert string dates to Date objects for Calendar component
          return { 
            from: new Date(dateValue.from), 
            to: new Date(dateValue.to) 
          }
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
                  handleFilterValueChange(filterIndex, { from: range.from, to: range.to })
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
                  handleFilterValueChange(filterIndex, { from: date, to: date })
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
                  handleFilterValueChange(filterIndex, { from: existingFrom, to: date })
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
            onChange={(e) => handleFilterValueChange(filterIndex, e.target.value)}
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
                  handleFilterValueChange(filterIndex, [from, values[1] || 0])
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
                  handleFilterValueChange(filterIndex, [values[0] || 0, to])
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
                handleFilterValueChange(filterIndex, numValue)
              } else if (e.target.value === '') {
                handleFilterValueChange(filterIndex, 0)
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
        <div className="flex flex-col h-full min-h-0">
          <div className="flex-shrink-0 p-2 border-b">
            <FilterSearchInput
              placeholder="Search..."
              value={valueSearchQuery}
              onChange={setValueSearchQuery}
              autoFocus={false}
            />
          </div>
          
          {filteredOptions.length > 0 ? (
            <div className="overflow-y-auto flex-1 min-h-0 p-1" style={{ maxHeight: '400px' }}>
              {filteredOptions.map((option) => {
                const isSelected = displayValues.includes(option.value)
                return (
                  <div key={option.value} className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm cursor-pointer" onClick={() => {
                    const newValues = isSelected
                      ? displayValues.filter((v) => v !== option.value)
                      : [...displayValues, option.value]
                    handleFilterValueChange(filterIndex, newValues)
                  }}>
                    <Checkbox
                      id={`filter-${filterIndex}-${option.value}`}
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        const newValues = checked
                          ? [...displayValues, option.value]
                          : displayValues.filter((v) => v !== option.value)
                        handleFilterValueChange(filterIndex, newValues)
                      }}
                    />
                    <label
                      htmlFor={`filter-${filterIndex}-${option.value}`}
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
                      {filter.field === "channel" && (
                        <span className="ml-2">
                          {getChannelIcon(option.value)}
                        </span>
                      )}
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
  }, [getFilterValueOptions, handleFilterValueChange, valueSearchQuery, timeUnits])

  const handleSaveFilters = React.useCallback(async () => {
    if (!selectedSegment || pendingFilters === null) return
    
    try {
      // Convert database filters to mock filters for the dialog
      const mockFilters = pendingFilters.map(convertSegmentFilterToMock)
      await handleUpdateSegment(selectedSegment.id, {
        name: selectedSegment.name,
        description: selectedSegment.description || undefined,
        filters: mockFilters,
      })
      
      // Update segment contacts after filters are saved
      await updateSegmentContactsMutation.mutateAsync(selectedSegment.id)
      await refetchSegments()
      
      setPendingFilters(null)
      setOriginalFilters(null)
    } catch (error) {
      console.error("Error saving filters:", error)
    }
  }, [selectedSegment, pendingFilters, handleUpdateSegment, updateSegmentContactsMutation, refetchSegments])

  const handleDiscardFilters = React.useCallback(() => {
    if (!selectedSegment || originalFilters === null) return
    
    setPendingFilters(null)
    setOriginalFilters(null)
  }, [selectedSegment, originalFilters])

  // Check if filters have been modified
  const hasFilterChanges = React.useMemo(() => {
    if (!selectedSegment || pendingFilters === null || originalFilters === null) return false
    
    // Compare filters arrays
    if (pendingFilters.length !== originalFilters.length) return true
    
    return JSON.stringify(pendingFilters) !== JSON.stringify(originalFilters)
  }, [selectedSegment, pendingFilters, originalFilters])

  // Get contacts for selected segment
  const segmentContacts = React.useMemo(() => {
    if (!selectedSegment) return []
    // Use contact_ids from segment if available, otherwise filter by segment filters
    if (selectedSegment.contact_ids && selectedSegment.contact_ids.length > 0) {
      return contacts.filter(contact => selectedSegment.contact_ids.includes(contact.id))
    }
    return getContactsForSegment(contacts, selectedSegment)
  }, [selectedSegment, contacts])

  // Calculate contact count for each segment
  const getSegmentContactCount = React.useCallback((segment: Segment): number => {
    if (!segment) return 0
    // If segment has contact_ids, use that length
    if (segment.contact_ids && segment.contact_ids.length > 0) {
      // Filter to only include contacts that actually exist
      return contacts.filter(contact => segment.contact_ids.includes(contact.id)).length
    }
    // Otherwise, calculate from filters
    if (segment.filters && segment.filters.length > 0) {
      return getContactsForSegment(contacts, segment).length
    }
    // No filters means no contacts
    return 0
  }, [contacts])

  const columns = React.useMemo(() => createContactColumns(), [])

  const table = useReactTable({
    data: segmentContacts,
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
        title="Segments"
        description="Manage your audience segments"
        customActions={
          !isDataLoading && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Segment
            </Button>
          )
        }
      />

      {!isDataLoading && segments.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users2 />
            </EmptyMedia>
            <EmptyTitle>No segments yet</EmptyTitle>
            <EmptyDescription>
              Create segments to dynamically organize your contacts based on filters. When a contact matches a segment's criteria, they'll be automatically added to that segment.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <EmptyAction onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Segment
            </EmptyAction>
          </EmptyContent>
        </Empty>
      ) : !isDataLoading && segments.length > 0 ? (
        <div className="flex flex-col gap-4">
          {/* Segment View Selector */}
          <DataTable
            isLoading={false}
            views={{
              options: segments.map((segment) => ({
                label: segment.name,
                value: segment.id,
                count: getSegmentContactCount(segment),
              })),
              selectedView: selectedSegmentId || "",
              onViewChange: (viewId) => setSelectedSegmentId(viewId),
              renderSelectedView: (view, onClick) => {
                const segment = segments.find(s => s.id === view.value)
                if (!segment) return null
                
                return (
                  <DropdownMenu open={isSegmentMenuOpen} onOpenChange={setIsSegmentMenuOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8"
                        onClick={onClick}
                      >
                        {view.label}
                        {view.count !== undefined && (
                          <span className="ml-1.5 text-xs text-muted-foreground">
                            ({view.count})
                          </span>
                        )}
                        <ChevronDown className={`ml-1.5 h-3.5 w-3.5 transition-transform duration-200 ${isSegmentMenuOpen ? 'rotate-180' : ''}`} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => handleEditSegment(segment)}>
                        Edit segment
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          handleOpenDeleteDialog(segment)
                        }}
                      >
                        Delete segment
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )
              },
              addButton: (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              ),
            }}
            searchConfig={{
              placeholder: "Search contacts by name or phone",
              searchColumns: ["name", "phone", "lastMessage"],
              table: table,
            }}
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
              pageSizeOptions: [15, 20, 30],
            }}
            footerLabel={`Showing ${table.getRowModel().rows.length} contact${table.getRowModel().rows.length !== 1 ? "s" : ""}${table.getSelectedRowModel().rows.length > 0 ? ` • ${table.getSelectedRowModel().rows.length} selected` : ""}`}
          >

            {table.getSelectedRowModel().rows.length > 0 ? (
              <DataTableSelectionHeader
                selectedCount={table.getSelectedRowModel().rows.length}
                onClearSelection={() => table.resetRowSelection()}
                onSelectAll={() => table.toggleAllRowsSelected()}
                onSelectAllOnPage={() => {
                  table.getRowModel().rows.forEach((row) => row.toggleSelected(true))
                }}
                totalCount={table.getFilteredRowModel().rows.length}
                showCount={table.getRowModel().rows.length}
                selectedCountOnCurrentPage={table.getRowModel().rows.filter((row) => row.getIsSelected()).length}
                audience="contacts"
                columnCount={table.getVisibleFlatColumns().length}
                rightActions={
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={handleSendCampaign}
                    >
                      Send campaign
                    </Button>
                  </>
                }
              />
            ) : (
              <DataTableHeader>
                {table.getHeaderGroups().map((headerGroup) =>
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
                )}
              </DataTableHeader>
            )}
            <DataTableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <DataTableRow
                    key={row.id}
                    selected={row.getIsSelected()}
                    onClick={() => {
                      navigate(`/contacts/${row.original.id}`)
                    }}
                    className="group cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <DataTableCell
                        key={cell.id}
                        columnId={cell.column.id}
                        clickable={cell.column.id === "select"}
                        onClick={
                          cell.column.id === "select"
                            ? () => row.toggleSelected(!row.getIsSelected())
                            : undefined
                        }
                      >
                        {cell.column.id === "actions" ? (
                          <div onClick={(e) => e.stopPropagation()}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </div>
                        ) : (
                          flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )
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
                    No contacts found in this segment.
                  </DataTableCell>
                </DataTableRow>
              )}
            </DataTableBody>
          </DataTable>
        </div>
      ) : null}

      <CreateSegmentDialog
        open={isCreateDialogOpen}
        onOpenChange={handleDialogClose}
        onSave={handleCreateSegment}
        editingSegment={editingSegment}
        onUpdate={editingSegment ? handleUpdateSegment : undefined}
      />

      {/* Delete Segment Dialog */}
      <Dialog 
        open={showDeleteDialog} 
        onOpenChange={(open) => {
          setShowDeleteDialog(open)
          if (!open) {
            setDeleteConfirmation("")
            setSegmentToDelete(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-lg p-0 gap-0">
          <DialogHeader className="p-4">
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Delete Segment
            </DialogTitle>
            <DialogDescription className="mt-2">
              Are you sure you want to delete this segment? 
              This action cannot be undone and will permanently remove the segment and all its associated data.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-4 space-y-4">
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <p className="text-sm text-destructive font-semibold">Warning</p>
                  <p className="text-sm text-destructive/90 leading-relaxed">
                    Deleting this segment will permanently remove it and cannot be undone. 
                    All contacts associated with this segment will remain, but the segment itself will be deleted.
                  </p>
                </div>
              </div>
            </div>
            
            {segmentToDelete && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Segment:</span> {segmentToDelete.name}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="deleteConfirm" className="text-sm font-medium">
                Type <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">delete</code> to confirm:
              </Label>
              <Input
                id="deleteConfirm"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Type 'delete' to confirm"
                className="font-mono"
              />
            </div>
          </div>

          <DialogFooter className="px-4 py-4 border-t gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false)
                setDeleteConfirmation("")
                setSegmentToDelete(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSegment}
              disabled={deleteConfirmation.toLowerCase() !== "delete" || deleteSegmentMutation.isPending}
            >
              {deleteSegmentMutation.isPending ? "Deleting..." : "Delete Segment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </PageWrapper>
  )
}

export default function ContactsSegmentsPage() {
  return (
    <SearchProvider>
      <ContactsSegmentsPageContent />
    </SearchProvider>
  )
}
