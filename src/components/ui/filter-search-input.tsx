import * as React from "react"
import { Search } from "lucide-react"
import { Field, FieldContent } from "@/components/ui/field"
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group"

interface FilterSearchInputProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  autoFocus?: boolean
}

export function FilterSearchInput({
  placeholder = "Search...",
  value,
  onChange,
  autoFocus = false,
}: FilterSearchInputProps) {
  return (
    <div className="flex flex-col">
      <div>
        <Field>
          <FieldContent>
            <InputGroup className="border-0 bg-background focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none">
              <InputGroupAddon>
                <Search className="h-3 w-3" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-6 text-sm"
                autoFocus={autoFocus}
              />
            </InputGroup>
          </FieldContent>
        </Field>
      </div>
      <div className="border-t border-border" />
    </div>
  )
}
