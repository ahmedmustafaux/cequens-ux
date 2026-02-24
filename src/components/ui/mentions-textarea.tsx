import * as React from "react"
import { MentionsInput, Mention, SuggestionDataItem, MentionsInputProps } from "react-mentions"
import { cn } from "@/lib/utils"

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
        ...props
    }, ref) => {
        const [isFocused, setIsFocused] = React.useState(false)
        const containerRef = React.useRef<HTMLDivElement>(null)

        // Sync local ref with forwarded ref if needed
        React.useImperativeHandle(ref, () => {
            return containerRef.current?.querySelector('textarea') as HTMLTextAreaElement
        })

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
                padding: '12px',
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
                padding: '12px',
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
                    maxHeight: '256px',
                    minWidth: '200px',
                    overflowY: 'auto' as const,
                    boxShadow: 'var(--shadow-md)',
                    color: 'hsl(var(--popover-foreground))',
                    zIndex: 50,
                    padding: '4px',
                },
                item: {
                    padding: '6px 8px',
                    borderRadius: 'calc(var(--radius) - 2px)',
                    '&focused': {
                        backgroundColor: 'hsl(var(--accent))',
                        color: 'hsl(var(--accent-foreground))',
                    },
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
                                    "px-2 py-1.5 flex items-center justify-between gap-2 text-sm rounded-sm transition-colors cursor-pointer",
                                    focused ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                                )}>
                                    <span className="font-medium text-primary">@{suggestion.display}</span>
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Attribute</span>
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
                                    "px-2 py-1.5 flex items-center justify-between gap-2 text-sm rounded-sm transition-colors cursor-pointer",
                                    focused ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                                )}>
                                    <span className="font-medium text-primary">
                                        {"{{"}{suggestion.display}{"}}"}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Variable</span>
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
