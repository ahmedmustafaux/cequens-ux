import * as React from "react"
import {
    Upload,
    FileText,
    CheckCircle2,
    Loader2,
    ArrowLeft,
    ArrowRight,
    Users,
    X,
    Trash2,
    AlertCircle,
    Phone,
    Zap,
} from "lucide-react"
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface ContactsCsvImportDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

type ImportStep = "upload" | "mapping" | "importing" | "success"

interface CsvData {
    headers: string[]
    rows: string[][]
}

const CONTACT_FIELDS = [
    { id: "firstName", label: "First Name", required: true },
    { id: "lastName", label: "Last Name", required: false },
    { id: "email", label: "Email Address", required: true },
    { id: "phone", label: "Phone Number", required: false },
    { id: "company", label: "Company", required: false },
    { id: "jobTitle", label: "Job Title", required: false },
]

export function ContactsCsvImportDrawer({
    open,
    onOpenChange
}: ContactsCsvImportDrawerProps) {
    const [step, setStep] = React.useState<ImportStep>("upload")
    const [file, setFile] = React.useState<File | null>(null)
    const [csvData, setCsvData] = React.useState<CsvData | null>(null)
    const [mappings, setMappings] = React.useState<Record<string, string>>({})
    const [isProcessing, setIsProcessing] = React.useState(false)
    const [isDragging, setIsDragging] = React.useState(false)
    const [phoneValidation, setPhoneValidation] = React.useState<{
        invalidRows: number[],
        columnName: string | null
    }>({ invalidRows: [], columnName: null })
    const [defaultCountryCode, setDefaultCountryCode] = React.useState("+20")

    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            processFile(selectedFile)
        }
    }

    const processFile = (file: File) => {
        setFile(file)
        setIsProcessing(true)

        const reader = new FileReader()
        reader.onload = (e) => {
            const text = e.target?.result as string
            const lines = text.split(/\r?\n/)
            if (lines.length > 0) {
                const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""))
                const rows = lines.slice(1, 4).map(line =>
                    line.split(",").map(cell => cell.trim().replace(/^"|"$/g, ""))
                )
                setCsvData({ headers, rows })

                // Auto-map based on header names
                const initialMappings: Record<string, string> = {}
                headers.forEach(header => {
                    const normalized = header.toLowerCase().replace(/[^a-z0-9]/g, "")
                    const match = CONTACT_FIELDS.find(f =>
                        f.id.toLowerCase() === normalized ||
                        f.label.toLowerCase().replace(/[^a-z0-9]/g, "") === normalized
                    )
                    if (match) {
                        initialMappings[header] = match.id
                    }
                })
                setMappings(initialMappings)

                // Initial check for phone validation if auto-mapped
                const phoneCol = headers.find(h => initialMappings[h] === "phone")
                if (phoneCol) {
                    validatePhoneNumbers(phoneCol, headers, rows)
                }

                setStep("mapping")
            }
            setIsProcessing(false)
        }
        reader.readAsText(file)
    }

    const handleImport = async () => {
        setStep("importing")
        // Mock import logic
        await new Promise(resolve => setTimeout(resolve, 2000))
        setStep("success")
    }

    const validatePhoneNumbers = (columnName: string, headers: string[], rows: string[][]) => {
        const colIndex = headers.indexOf(columnName)
        if (colIndex === -1) return

        const invalidRows: number[] = []
        rows.forEach((row, index) => {
            const phone = row[colIndex]
            if (phone && !phone.startsWith("+") && phone.trim() !== "") {
                invalidRows.push(index)
            }
        })

        setPhoneValidation({
            invalidRows,
            columnName
        })
    }

    const applyBulkCountryCode = () => {
        if (!csvData || !phoneValidation.columnName) return

        const colIndex = csvData.headers.indexOf(phoneValidation.columnName)
        if (colIndex === -1) return

        const updatedRows = csvData.rows.map(row => {
            const phone = row[colIndex]
            if (phone && !phone.startsWith("+") && phone.trim() !== "") {
                // Ensure country code has + if not provided
                const prefix = defaultCountryCode.startsWith("+") ? defaultCountryCode : `+${defaultCountryCode}`
                const cleanedPhone = phone.replace(/^0+/, '') // Remove leading zeros if any
                return row.map((cell, i) => i === colIndex ? `${prefix}${cleanedPhone}` : cell)
            }
            return row
        })

        setCsvData({
            ...csvData,
            rows: updatedRows
        })

        // Clear validation errors after update
        setPhoneValidation({
            invalidRows: [],
            columnName: phoneValidation.columnName
        })
    }

    const handleMappingChange = (header: string, value: string) => {
        setMappings(prev => {
            const newMappings = { ...prev, [header]: value }

            // If mapping to phone, validate
            if (value === "phone") {
                validatePhoneNumbers(header, csvData?.headers || [], csvData?.rows || [])
            } else if (phoneValidation.columnName === header) {
                // If it was the phone column and now it's not, clear validation
                setPhoneValidation({ invalidRows: [], columnName: null })
            }

            return newMappings
        })
    }

    const reset = () => {
        setStep("upload")
        setFile(null)
        setCsvData(null)
        setMappings({})
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const droppedFile = e.dataTransfer.files[0]
        if (droppedFile && droppedFile.type === "text/csv") {
            processFile(droppedFile)
        }
    }

    return (
        <Sheet open={open} onOpenChange={(val) => {
            if (!val) reset()
            onOpenChange(val)
        }}>
            <SheetContent className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl flex flex-col overflow-hidden p-0">
                <div className="border-b">
                    <SheetHeader>
                        <div className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/5 border flex items-center justify-center flex-shrink-0">
                                <FileText className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <SheetTitle className="text-base">Import from CSV</SheetTitle>
                                <SheetDescription className="truncate text-xs">
                                    {step === "upload" && "Upload your file to start importing contacts"}
                                    {step === "mapping" && `Mapping columns for ${file?.name}`}
                                    {step === "importing" && "Processing your contacts..."}
                                    {step === "success" && "Import completed successfully"}
                                </SheetDescription>
                            </div>
                        </div>
                    </SheetHeader>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {step === "upload" && (
                        <div className="h-full px-4 pb-6">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={cn(
                                    "w-full min-h-[400px] rounded-xl border border-dashed transition-all duration-200 group flex flex-col items-center justify-center gap-4 cursor-pointer",
                                    isDragging
                                        ? "border-primary bg-primary/10 scale-[1.02]"
                                        : "border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5"
                                )}
                            >
                                <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                    <Upload className="w-8 h-8 text-primary" />
                                </div>
                                <div className="text-center">
                                    <p className="font-semibold text-sm">Click to upload or drag and drop</p>
                                    <p className="text-xs text-muted-foreground mt-1">Only CSV files are supported</p>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>
                    )}

                    {step === "mapping" && csvData && (
                        <div className="space-y-6 px-4 pb-6">
                            {phoneValidation.invalidRows.length > 0 && (
                                <div className="rounded-lg border border-info/20 bg-info/5 p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center text-info shrink-0">
                                            <Phone className="h-4 w-4" />
                                        </div>
                                        <h4 className="text-sm font-semibold text-info leading-none">
                                            Phone Numbers Missing Country Codes
                                        </h4>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-sm text-info/80 leading-relaxed ml-11">
                                            We found <strong>{phoneValidation.invalidRows.length}</strong> numbers without a country code. Correct them below to ensure a successful import.
                                        </p>

                                        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-info/20 ml-11">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold uppercase tracking-tight opacity-60 whitespace-nowrap text-info">Country Code</span>
                                                <Input
                                                    value={defaultCountryCode}
                                                    onChange={(e) => setDefaultCountryCode(e.target.value)}
                                                    placeholder="+20"
                                                    className="h-6 bg-background border-info/20 focus-visible:ring-info/20 text-xs w-20"
                                                />
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="default"
                                                onClick={applyBulkCountryCode}
                                                disabled={!defaultCountryCode.trim()}

                                            >
                                                Fix all
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Map Columns
                                </h3>
                                <div className="space-y-3">
                                    {csvData.headers.map((header) => (
                                        <div key={header} className="flex items-center gap-4 p-4 rounded-lg border bg-background">
                                            <div className="flex-1 min-w-0 text-left">
                                                <div className="text-[10px] text-muted-foreground font-medium mb-1 uppercase">CSV Column</div>
                                                <div className="flex items-center gap-2 flex-wrap min-w-0">
                                                    <div className="text-sm font-medium truncate">{header}</div>
                                                    {mappings[header] === "phone" && phoneValidation.invalidRows.length > 0 && (
                                                        <div className="flex items-center gap-1 text-[10px] text-amber-600 font-medium whitespace-nowrap bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                                                            <AlertCircle className="w-3 h-3" />
                                                            Missing country code
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="w-[180px]">
                                                <Select
                                                    value={mappings[header]}
                                                    onValueChange={(val) => handleMappingChange(header, val)}
                                                >
                                                    <SelectTrigger className="h-10 text-xs font-medium">
                                                        <SelectValue placeholder="Map to..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="ignore">Don't import</SelectItem>
                                                        {CONTACT_FIELDS.map(field => (
                                                            <SelectItem key={field.id} value={field.id}>
                                                                {field.label} {field.required && "*"}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Data Preview */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Data Preview
                                </h3>
                                <div className="rounded-lg border overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-[10px] border-collapse">
                                            <thead>
                                                <tr className="bg-muted/50 border-b">
                                                    {csvData.headers.slice(0, 4).map(h => (
                                                        <th key={h} className="px-3 py-2 text-left font-medium text-muted-foreground border-r last:border-r-0 truncate max-w-[100px]">{h}</th>
                                                    ))}
                                                    {csvData.headers.length > 4 && <th className="px-3 py-2 text-left font-medium text-muted-foreground italic">...</th>}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {csvData.rows.map((row, i) => (
                                                    <tr key={i} className="border-b last:border-b-0">
                                                        {row.slice(0, 4).map((cell, j) => (
                                                            <td key={j} className="px-3 py-2 border-r last:border-r-0 truncate max-w-[100px]">{cell}</td>
                                                        ))}
                                                        {row.length > 4 && <td className="px-3 py-2 text-muted-foreground">...</td>}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <p className="text-[10px] text-muted-foreground text-center italic">
                                    Showing the first {csvData.rows.length} rows for validation
                                </p>
                            </div>
                        </div>
                    )}

                    {step === "importing" && (
                        <div className="h-full flex flex-col items-center justify-center text-center gap-6">
                            <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center ring-8 ring-primary/5 animate-pulse">
                                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Importing Contacts</h3>
                                <p className="text-sm text-muted-foreground max-w-[240px] leading-relaxed">
                                    We're processing your file and syncing your contacts. This won't take long.
                                </p>
                            </div>
                        </div>
                    )}

                    {step === "success" && (
                        <div className="h-full flex flex-col items-center justify-center text-center gap-6">
                            <div className="w-20 h-20 rounded-full bg-success/5 flex items-center justify-center ring-8 ring-success/5">
                                <CheckCircle2 className="w-10 h-10 text-success" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Import Successful</h3>
                                <p className="text-sm text-muted-foreground max-w-[240px] leading-relaxed">
                                    Your contacts have been successfully imported and are now ready to use.
                                </p>
                            </div>
                            <Button onClick={() => onOpenChange(false)} className="w-full max-w-[200px]">
                                Done
                            </Button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {step !== "success" && (
                    <div className={cn(
                        "p-4 text-center",
                        step === "mapping" && "border-t"
                    )}>
                        {step === "upload" ? (
                            <p className="text-[11px] text-muted-foreground text-center mx-auto max-w-[240px] leading-relaxed">
                                By uploading, you agree to our <span className="underline cursor-pointer hover:text-foreground transition-colors">Terms of Service</span> and <span className="underline cursor-pointer hover:text-foreground transition-colors">Privacy Policy</span>.
                            </p>
                        ) : step === "mapping" ? (
                            <div className="flex flex-col gap-3">
                                <Button
                                    onClick={handleImport}
                                    className="w-full"
                                    disabled={!Object.values(mappings).some(v => v !== "ignore")}
                                >
                                    Import Contacts
                                </Button>
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="text-muted-foreground"
                                    onClick={() => setStep("upload")}
                                >
                                    <ArrowLeft className="w-3 h-3 mr-2" />
                                    Change File
                                </Button>
                            </div>
                        ) : null}
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}
