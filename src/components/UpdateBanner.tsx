import { UPDATE_MESSAGE } from '@/config/update-log';
import { ChevronDown, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export function UpdateBanner() {
    const [hasUnread, setHasUnread] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!UPDATE_MESSAGE) return;
        const lastSeen = localStorage.getItem('last_seen_update');
        if (lastSeen !== UPDATE_MESSAGE) {
            setHasUnread(true);
        }
    }, []);

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open && hasUnread) {
            setHasUnread(false);
            localStorage.setItem('last_seen_update', UPDATE_MESSAGE);
        }
    };

    if (!UPDATE_MESSAGE) return null;

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100]">
            <Popover open={isOpen} onOpenChange={handleOpenChange}>
                <PopoverTrigger asChild>
                    <button className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm rounded-full px-4 py-1.5 flex items-center space-x-2 text-sm font-medium text-gray-700 hover:bg-white hover:text-gray-900 transition-all focus:outline-none ring-offset-2 focus:ring-2 ring-gray-200">
                        <div className="relative flex items-center gap-2">
                            <span>Updates</span>
                            {hasUnread && (
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                            )}
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="center" sideOffset={8}>
                    <div className="flex items-start space-x-3">
                        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-gray-700 leading-relaxed">
                            {UPDATE_MESSAGE}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
