/**
 * Type definitions for the Shortcut Menu application
 */

// Single menu item data structure
export interface MenuDataItem {
    id: string;
    title: string;
    subtitle: string;
    iconName: string;
    customImageData?: string;
    originalImageData?: string;
    data: string;
    iconColor: string;
    backgroundColor: string;
}

// Global application state
export interface GlobalState {
    menuItems: MenuDataItem[];
    activeItemIndex: number;
    isCircular: boolean;
    isAdvancedMode: boolean;
}

// Type for export formats
export type ExportFormat = 'json' | 'vcard';

// Global typings for window objects
declare global {
    interface Window {
        lucide: {
            createIcons(options?: { elements?: HTMLElement[] }): void;
        }
    }
}