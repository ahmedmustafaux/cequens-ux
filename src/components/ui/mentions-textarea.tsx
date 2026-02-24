import * as React from "react"
import { MentionsInput, Mention, SuggestionDataItem } from "react-mentions"
import { cn } from "@/lib/utils"

export interface MentionsTextareaProps extends Omit<React.ComponentProps<typeof MentionsInput>, "onChange" | "children"> {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
    error?: boolean
    mentions: SuggestionDataItem[]
}

const MentionsTextarea = React.forwardRef<HTMLTextAreaElement, MentionsTextareaProps>(
    ({ className, value, onChange, placeholder, error, mentions, ...props }, ref) => {
        const [isFocused, setIsFocused] = React.useState(false)

        const handleChange = (
            event: { target: { value: string } },
            newValue: string,
            newPlainTextValue: string,
            mentions: any[]
        ) => {
            onChange(newValue)
        }
        const containerRef = React.useRef<HTMLDivElement>(null);

        const handleContainerClick = React.useCallback((e: React.MouseEvent) => {
            const target = e.target as HTMLElement;
            const mentionBadge = target.closest('.mention-badge');

            if (mentionBadge) {
                const allBadges = Array.from(containerRef.current?.querySelectorAll('.mention-badge') || []);
                const badgeIndex = allBadges.indexOf(mentionBadge);

                if (badgeIndex !== -1) {
                    let count = 0;
                    let match;
                    const regex = /@\[([^\]]+)\]\([^\)]+\)/g;

                    while ((match = regex.exec(value)) !== null) {
                        if (count === badgeIndex) {
                            const start = match.index;
                            const end = match.index + match[0].length;

                            // Check if we clicked the "X" part (roughly right 25% of the badge)
                            const rect = mentionBadge.getBoundingClientRect();
                            const xInBadge = e.clientX - rect.left;
                            const isXClicked = xInBadge > rect.width * 0.7;

                            if (isXClicked) {
                                const newValue = value.substring(0, start) + value.substring(end);
                                onChange(newValue);
                            } else {
                                // Move caret after the badge
                                const textarea = containerRef.current?.querySelector('textarea');
                                if (textarea) {
                                    textarea.focus();
                                    // Set selection to the end of the markup for this mention
                                    setTimeout(() => {
                                        textarea.setSelectionRange(end, end);
                                    }, 0);
                                }
                            }
                            return;
                        }
                        count++;
                    }
                }
            }
        }, [value, onChange]);

        return (
            <div className="space-y-2">
                <div
                    ref={containerRef}
                    onClick={handleContainerClick}
                    className={cn(
                        "relative flex w-full rounded-md border border-input bg-transparent text-sm ring-offset-background placeholder:text-muted-foreground",
                        "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
                        isFocused ? "border-primary ring-2 ring-primary/20" : "border-input",
                        className
                    )}
                >
                    <MentionsInput
                        value={value}
                        onChange={handleChange}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder={placeholder}
                        className="mentions-textarea-input w-full"
                        style={{
                            control: {
                                backgroundColor: 'transparent',
                                fontSize: '0.875rem',
                                lineHeight: '1.25rem',
                                fontFamily: 'inherit',
                                minHeight: '200px',
                                position: 'relative',
                            },
                            input: {
                                margin: 0,
                                padding: '12px',
                                border: 0,
                                outline: 'none',
                                minHeight: '200px',
                                fontFamily: 'inherit',
                                fontSize: '0.875rem',
                                lineHeight: '1.25rem',
                                fontWeight: 400,
                                color: '#000000',
                                caretColor: '#000000',
                                backgroundColor: 'transparent',
                                wordWrap: 'break-word',
                                whiteSpace: 'pre-wrap',
                                boxSizing: 'border-box',
                                position: 'relative',
                                zIndex: 1,
                            },
                            highlighter: {
                                margin: 0,
                                padding: '12px',
                                border: 0,
                                minHeight: '200px',
                                fontFamily: 'inherit',
                                fontSize: '0.875rem',
                                lineHeight: '1.25rem',
                                fontWeight: 400,
                                wordWrap: 'break-word',
                                whiteSpace: 'pre-wrap',
                                boxSizing: 'border-box',
                                color: 'transparent',
                                position: 'absolute',
                                top: 0,
                                left: -4,
                                zIndex: 2,
                                pointerEvents: 'none',
                            },
                            suggestions: {
                                list: {
                                    backgroundColor: 'white',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    fontSize: '0.875rem',
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                    color: 'black',
                                    zIndex: 100,
                                },
                                item: {
                                    padding: '0.5rem',
                                    borderBottom: '1px solid #eee',
                                    '&focused': {
                                        backgroundColor: '#f3f4f6',
                                        color: '#2563eb',
                                    },
                                },
                            },
                        }}
                        {...props}
                    >
                        <Mention
                            trigger="@"
                            data={mentions}
                            displayTransform={(id, display) => `@${display} \u2715`}
                            markup="@[__display__](__id__)"
                            className="mention-badge"
                            style={{
                                backgroundColor: '#e0f2fe',
                                borderRadius: '4px',
                                color: '#0369a1',
                                padding: '1px 1px',
                                margin: '0px 2px',
                                fontWeight: 500,
                                border: '1px solid #bae6fd',
                                pointerEvents: 'auto',
                                cursor: 'pointer',
                            }}
                        />
                    </MentionsInput>
                </div>
            </div>
        )
    }
)

MentionsTextarea.displayName = "MentionsTextarea"

export { MentionsTextarea }
