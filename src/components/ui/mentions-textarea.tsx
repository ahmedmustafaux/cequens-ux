import * as React from "react"
import { MentionsInput, Mention, SuggestionDataItem, MentionsInputProps } from "react-mentions"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

/**
 * MentionsTextarea Component
 *
 * A specialized textarea that supports @mentions and {{variables}} with interactive badges.
 * Built on top of react-mentions with custom styling and interaction logic
 * following senior front-end engineering best practices.
 */

export interface MentionsTextareaProps extends Omit<MentionsInputProps, "onChange" | "children"> {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
    error?: boolean
    mentions: SuggestionDataItem[]
    variables?: SuggestionDataItem[]
    minHeight?: string
    leftActions?: React.ReactNode
    rightActions?: React.ReactNode
}

const MentionsTextarea = React.forwardRef<HTMLTextAreaElement, MentionsTextareaProps>(
    ({
        className,
        value,
        onChange,
        placeholder,
        error,
        mentions,
        variables = [],
        minHeight = "200px",
        leftActions,
        rightActions,
        ...props
    }, ref) => {
        const [isFocused, setIsFocused] = React.useState(false)
        const containerRef = React.useRef<HTMLDivElement>(null)

        // Sync local ref with forwarded ref if needed
        React.useImperativeHandle(ref, () => {
            return containerRef.current?.querySelector('textarea') as HTMLTextAreaElement
        })

        const handleInsertMention = (item: SuggestionDataItem, type: 'mention' | 'variable') => {
            const textarea = containerRef.current?.querySelector('textarea')
            const start = textarea ? textarea.selectionStart : value.length
            const end = textarea ? textarea.selectionEnd : value.length

            // Format the tag according to how react-mentions expects it
            const tag = type === 'mention'
                ? `@[${item.display}](${item.id})`
                : `{{${item.display}}}`

            // Insert tag at current cursor position
            const prefix = value.substring(0, start)
            const suffix = value.substring(end)

            // Add spacing if we're directly against text to ensure cleanliness
            const needsLeadingSpace = prefix.length > 0 && !prefix.endsWith(' ') && !prefix.endsWith('\n')
            const needsTrailingSpace = suffix.length > 0 && !suffix.startsWith(' ') && !suffix.startsWith('\n')

            const insertText = (needsLeadingSpace ? ' ' : '') + tag + (needsTrailingSpace ? ' ' : '')

            const newValue = prefix + insertText + suffix
            onChange(newValue)

            // Refocus text area after insertion
            setTimeout(() => {
                if (textarea) {
                    textarea.focus()
                    const newPos = start + insertText.length
                    textarea.setSelectionRange(newPos, newPos)
                }
            }, 0)
        }

        const handleChange = (
            _event: { target: { value: string } },
            newValue: string,
            _newPlainTextValue: string,
            _mentions: any[]
        ) => {
            onChange(newValue)
        }

        /**
         * Enhanced interaction handler.
         * Detects clicks on badges to handle removal or caret positioning.
         */
        const handleContainerClick = React.useCallback((e: React.MouseEvent) => {
            const target = e.target as HTMLElement
            const badge = target.closest('.mention-badge, .variable-badge')

            if (badge && containerRef.current) {
                const allBadges = Array.from(containerRef.current.querySelectorAll('.mention-badge, .variable-badge'))
                const badgeIndex = allBadges.indexOf(badge)

                if (badgeIndex !== -1) {
                    let count = 0
                    let match
                    // Regex to match both @[display](id) and {{variable}}
                    const regex = /(@\[([^\]]+)\]\([^\)]+\))|(\{\{([^\}]+)\}\})/g

                    while ((match = regex.exec(value)) !== null) {
                        if (count === badgeIndex) {
                            const end = match.index + match[0].length

                            // Focus and move caret to the end of the badge for easier navigation/backspacing
                            const textarea = containerRef.current.querySelector('textarea')
                            if (textarea) {
                                textarea.focus()
                                setTimeout(() => {
                                    textarea.setSelectionRange(end, end)
                                }, 0)
                            }
                            return
                        }
                        count++
                    }
                }
            }
        }, [value])

        const defaultStyles = {
            control: {
                backgroundColor: 'transparent',
                fontSize: '0.875rem',
                lineHeight: '1.25rem',
                fontFamily: 'inherit',
                minHeight,
            },
            input: {
                margin: 0,
                padding: '12px 12px 42px 12px',
                border: 0,
                outline: 'none',
                minHeight,
                fontFamily: 'inherit',
                fontSize: '0.875rem',
                lineHeight: '1.25rem',
                fontWeight: 400,
                color: 'currentColor',
                backgroundColor: 'transparent',
                wordWrap: 'break-word' as const,
                whiteSpace: 'pre-wrap' as const,
                boxSizing: 'border-box' as const,
                zIndex: 1,
            },
            highlighter: {
                margin: 0,
                padding: '12px 12px 42px 12px',
                border: 0,
                minHeight,
                fontFamily: 'inherit',
                fontSize: '0.875rem',
                lineHeight: '1.25rem',
                fontWeight: 400,
                wordWrap: 'break-word' as const,
                whiteSpace: 'pre-wrap' as const,
                boxSizing: 'border-box' as const,
                color: 'transparent',
                position: 'absolute' as const,
                top: 0,
                left: 0,
                zIndex: 0,
                pointerEvents: 'none' as const,
            },
            suggestions: {
                list: {
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.875rem',
                    maxHeight: '300px',
                    minWidth: '200px',
                    overflowY: 'auto' as const,
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                    color: 'hsl(var(--popover-foreground))',
                    zIndex: 50,
                    padding: '4px',
                    boxSizing: 'border-box' as const,
                },
                item: {
                    padding: 0,
                    margin: 0,
                    borderBottom: '1px solid hsl(var(--border) / 0.4)',
                    cursor: 'pointer',
                },
            },
        }

        return (
            <div className="w-full space-y-1">
                <div
                    ref={containerRef}
                    onClick={handleContainerClick}
                    className={cn(
                        "relative w-full rounded-md border transition-all duration-200",
                        "bg-background text-foreground ring-offset-background",
                        isFocused ? "border-primary ring-2 ring-primary/20" : "border-input",
                        error && "border-destructive ring-destructive/20",
                        className
                    )}
                    role="textbox"
                    aria-multiline="true"
                    aria-label={placeholder || "Mentions input"}
                >
                    <MentionsInput
                        value={value}
                        onChange={handleChange}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder={placeholder}
                        className="mentions-textarea-input"
                        style={defaultStyles}
                        {...props}
                    >
                        <Mention
                            trigger="@"
                            data={mentions}
                            displayTransform={(_id, display) => `@${display}`}
                            markup="@[__display__](__id__)"
                            className="mention-badge"
                            renderSuggestion={(suggestion, _search, _highlightedDisplay, _index, focused) => (
                                <div className={cn(
                                    "flex items-center justify-between gap-2 overflow-hidden w-full px-2 py-2 text-sm rounded-sm transition-colors",
                                    focused ? "bg-accent text-accent-foreground" : "hover:bg-accent/50 hover:text-accent-foreground"
                                )}>
                                    <span className="truncate">@{suggestion.display}</span>
                                    <span className="text-xs text-muted-foreground ml-2 shrink-0">Attribute</span>
                                </div>
                            )}
                            style={{
                                backgroundColor: 'hsl(var(--primary) / 0.1)',
                                color: 'hsl(var(--primary))',
                                borderRadius: '4px',
                                padding: '1px 4px',
                                margin: '0 1px',
                                fontWeight: 500,
                                border: '1px solid hsl(var(--primary) / 0.2)',
                                pointerEvents: 'auto',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                            }}
                        />
                        <Mention
                            trigger="{{"
                            data={variables}
                            displayTransform={(_id, display) => `{{${display}}}`}
                            markup="{{__display__}}"
                            className="variable-badge"
                            renderSuggestion={(suggestion, _search, _highlightedDisplay, _index, focused) => (
                                <div className={cn(
                                    "flex items-center justify-between gap-2 overflow-hidden w-full px-2 py-2 text-sm rounded-sm transition-colors",
                                    focused ? "bg-accent text-accent-foreground" : "hover:bg-accent/50 hover:text-accent-foreground"
                                )}>
                                    <span className="truncate">
                                        {"{{"}{suggestion.display}{"}}"}
                                    </span>
                                    <span className="text-xs text-muted-foreground ml-2 shrink-0">Variable</span>
                                </div>
                            )}
                            style={{
                                backgroundColor: 'hsl(var(--primary) / 0.1)',
                                color: 'hsl(var(--primary))',
                                borderRadius: '4px',
                                padding: '1px 4px',
                                margin: '0 1px',
                                fontWeight: 500,
                                border: '1px solid hsl(var(--primary) / 0.2)',
                                pointerEvents: 'auto',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                            }}
                        />
                    </MentionsInput>
                    <div className="absolute bottom-2 left-2 right-2 z-10 flex items-center justify-between pointer-events-none">
                        <div className="flex items-center gap-2 pointer-events-auto">
                            {((mentions && mentions.length > 0) || (variables && variables.length > 0)) && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-7 text-xs px-2.5 text-muted-foreground hover:text-foreground bg-background"
                                            tabIndex={-1}
                                        >
                                            @ mention
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-[200px]" onCloseAutoFocus={(e) => {
                                        // Prevent the trigger from grabbing focus back so the textarea can stay focused
                                        e.preventDefault()
                                        containerRef.current?.querySelector('textarea')?.focus()
                                    }}>
                                        {mentions && mentions.length > 0 && (
                                            <>
                                                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Attributes</DropdownMenuLabel>
                                                {mentions.map((item) => (
                                                    <DropdownMenuItem
                                                        key={`mention-${item.id}`}
                                                        onClick={() => handleInsertMention(item, 'mention')}
                                                        className="flex items-center justify-between"
                                                    >
                                                        <span>@{item.display}</span>
                                                    </DropdownMenuItem>
                                                ))}
                                            </>
                                        )}

                                        {variables && variables.length > 0 && (
                                            <>
                                                {mentions && mentions.length > 0 && <DropdownMenuSeparator />}
                                                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Variables</DropdownMenuLabel>
                                                {variables.map((item) => (
                                                    <DropdownMenuItem
                                                        key={`var-${item.id}`}
                                                        onClick={() => handleInsertMention(item, 'variable')}
                                                        className="flex items-center justify-between"
                                                    >
                                                        <span>{"{{"}{item.display}{"}}"}</span>
                                                    </DropdownMenuItem>
                                                ))}
                                            </>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                            {leftActions}
                        </div>
                        <div className="flex items-center gap-2 pointer-events-auto">
                            {rightActions}
                        </div>
                    </div>
                </div>
                {error && (
                    <p className="text-[0.8rem] font-medium text-destructive">
                        Invalid input detected.
                    </p>
                )}
            </div>
        )
    }
)

MentionsTextarea.displayName = "MentionsTextarea"

export { MentionsTextarea }
