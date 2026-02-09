import { type SegmentFilter } from "./mock-data"

// Hierarchical filter structure - some have 3 levels, some have 2 levels
export type FilterCategory = {
  id: string
  label: string
  hasThreeLevels: boolean // true for Contact Field (Category -> Field -> Value), false for others (Category -> Value)
  fields: Array<{
    value: SegmentFilter["field"]
    label: string
    operators: SegmentFilter["operator"][]
    valueType: 'string' | 'array' | 'number' | 'date'
  }>
}

export const FILTER_CATEGORIES: FilterCategory[] = [
  {
    id: "contactField",
    label: "Contact Field",
    hasThreeLevels: true, // Category -> Field -> Value
    fields: [
      { value: "firstName", label: "First Name", operators: ["equals", "notEquals", "contains", "startsWith", "endsWith", "isEmpty", "isNotEmpty"], valueType: "string" },
      { value: "lastName", label: "Last Name", operators: ["equals", "notEquals", "contains", "startsWith", "endsWith", "isEmpty", "isNotEmpty"], valueType: "string" },
      { value: "phoneNumber", label: "Phone Number", operators: ["equals", "notEquals", "exists", "doesNotExist", "contains", "startsWith", "endsWith"], valueType: "string" },
      { value: "emailAddress", label: "Email Address", operators: ["equals", "notEquals", "exists", "doesNotExist", "contains", "startsWith", "endsWith"], valueType: "string" },
      { value: "countryISO", label: "Country", operators: ["equals", "notEquals", "in", "notIn", "hasAnyOf"], valueType: "array" },
      { value: "language", label: "Language", operators: ["equals", "notEquals", "in", "notIn", "hasAnyOf"], valueType: "array" },]
  },
  {
    id: "contactTag",
    label: "Contact Tag",
    hasThreeLevels: false, // Category -> Value (direct)
    fields: [
      { value: "tags", label: "Tags", operators: ["hasAnyOf", "hasAllOf", "hasNoneOf", "isEmpty", "isNotEmpty"], valueType: "array" },
    ]
  },
  {
    id: "customAttribute",
    label: "Custom Attribute",
    hasThreeLevels: true, // Category -> Field -> Value
    fields: [] // Will be populated dynamically in UI
  },
]

// Operator labels for display
export const OPERATOR_LABELS: Record<SegmentFilter["operator"], string> = {
  equals: "Equal to",
  notEquals: "Not equal to",
  contains: "Contains",
  notContains: "Does not contain",
  in: "Is any of",
  notIn: "Is not any of",
  hasAnyOf: "Has any of",
  hasAllOf: "Has all of",
  hasNoneOf: "Has none of",
  isEmpty: "Is empty",
  isNotEmpty: "Is not empty",
  exists: "Exists",
  doesNotExist: "Does not exist",
  startsWith: "Starts with",
  endsWith: "Ends with",
  greaterThan: "Greater than",
  lessThan: "Less than",
  between: "Between",
  from: "From",
  to: "To",
  fromOnly: "From only",
  isTimestampAfter: "Is after",
  isTimestampBefore: "Is before",
  isTimestampBetween: "Is between",
  isGreaterThanTime: "Is greater than (time)",
  isLessThanTime: "Is less than (time)",
  isBetweenTime: "Is between (time)",
}
