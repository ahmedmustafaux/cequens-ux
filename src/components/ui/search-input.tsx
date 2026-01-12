import * as React from "react"
import { Search } from "lucide-react"
import { 
  Field, 
  FieldContent 
} from "@/components/ui/field"
import { 
  InputGroup, 
  InputGroupInput, 
  InputGroupAddon 
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"

interface SearchInputProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  className?: string
  minWidth?: string
}

export function SearchInput({
  placeholder = "Search...",
  value,
  onChange,
  className,
  minWidth = "320px",
}: SearchInputProps) {
  return (
    <div className={cn("w-auto inline-block", className)}>
      <Field>
        <FieldContent>
          <InputGroup className="bg-background w-auto">
            <InputGroupAddon>
              <Search className="h-4 w-4" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder={placeholder}
              value={value}
              onChange={(event) => {
                onChange(event.target.value)
              }}
              style={{ paddingRight: '64px', width: 'auto', minWidth: minWidth }}
            />
          </InputGroup>
        </FieldContent>
      </Field>
    </div>
  )
}
