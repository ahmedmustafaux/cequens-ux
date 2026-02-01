import { UPDATE_LOGS, type UpdateLog } from '@/config/update-log';
import { ChevronLeft, Check, CheckCheck, Info, Sparkles, Wrench, RefreshCw, Smartphone } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const TYPE_ICONS = {
    feature: <Sparkles className="w-4 h-4 text-blue-500" />,
    fix: <Wrench className="w-4 h-4 text-red-500" />,
    update: <RefreshCw className="w-4 h-4 text-green-500" />,
    improvement: <Smartphone className="w-4 h-4 text-purple-500" />,
};

export function DevUpdatesDrawer() {
    const [readIds, setReadIds] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('read_update_ids');
        if (stored) {
            try {
                setReadIds(JSON.parse(stored));
            } catch (e) {
                setReadIds([]);
            }
        }
    }, []);

    const unreadCount = UPDATE_LOGS.filter(log => !readIds.includes(log.id)).length;

    const markAsRead = (id: string) => {
        if (readIds.includes(id)) return;
        const newReadIds = [...readIds, id];
        setReadIds(newReadIds);
        localStorage.setItem('read_update_ids', JSON.stringify(newReadIds));
    };

    const markAllAsRead = () => {
        const allIds = UPDATE_LOGS.map(log => log.id);
        setReadIds(allIds);
        localStorage.setItem('read_update_ids', JSON.stringify(allIds));
    };

    if (UPDATE_LOGS.length === 0) return null;

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative group">
                    <ChevronLeft className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    {unreadCount > 0 && (
                        <div className="absolute top-2 right-2">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                        </div>
                    )}
                    <span className="sr-only">View Updates</span>
                </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-[480px] p-0 flex flex-col">
                {unreadCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-3 right-12 h-8 px-3 text-xs text-muted-foreground hover:text-foreground z-10"
                        onClick={markAllAsRead}
                    >
                        <CheckCheck className="w-3.5 h-3.5 mr-1.5" />
                        Mark all as read
                    </Button>
                )}
                <div className="p-4 border-b border-border">
                    <SheetHeader className="text-left">
                        <SheetTitle className="text-xl">What's New</SheetTitle>
                        <SheetDescription>
                            Stay up to date with the latest changes and features in dev.
                        </SheetDescription>
                    </SheetHeader>
                </div>

                <div className="flex-1 p-4 space-y-4">
                    {UPDATE_LOGS.map((log) => {
                        const isRead = readIds.includes(log.id);
                        return (
                            <div
                                key={log.id}
                                className={cn(
                                    "relative group bg-background border rounded-xl p-4 transition-all duration-200",
                                    isRead ? "border-border shadow-none opacity-80" : "border-primary/20 shadow-sm shadow-primary/5"
                                )}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        {log.type && TYPE_ICONS[log.type]}
                                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            {log.date}
                                        </span>
                                        {!isRead && (
                                            <Badge variant="default" className="h-1.5 w-1.5 rounded-full p-0 bg-primary" />
                                        )}
                                    </div>
                                    {!isRead && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => markAsRead(log.id)}
                                            title="Mark as read"
                                        >
                                            <Check className="h-3 w-3" />
                                        </Button>
                                    )}
                                </div>
                                <h3 className={cn("text-sm font-semibold mb-2", !isRead && "text-primary")}>
                                    {log.title}
                                </h3>
                                <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                                    {log.content}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </SheetContent>
        </Sheet>
    );
}
