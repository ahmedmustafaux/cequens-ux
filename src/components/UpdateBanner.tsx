import { UPDATE_MESSAGE } from '@/config/update-log';
import { Info, X } from 'lucide-react';
import { useState } from 'react';

export function UpdateBanner() {
    const [isVisible, setIsVisible] = useState(true);

    if (!UPDATE_MESSAGE || !isVisible) return null;

    return (
        <div className="bg-gray-100 text-gray-900 border-b border-gray-200 px-4 py-2 flex items-center justify-between text-sm font-medium relative z-50">
            <div className="flex items-center justify-center flex-1">
                <Info className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                <span>{UPDATE_MESSAGE}</span>
            </div>
            <button
                onClick={() => setIsVisible(false)}
                className="text-gray-500 hover:text-gray-900 focus:outline-none ml-4"
                aria-label="Close update banner"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
