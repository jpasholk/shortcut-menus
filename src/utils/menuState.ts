/**
 * State management
 */
import { MenuType } from './types';
import type { MenuDataItem, GlobalState } from './types';

// Re-export MenuType for other files to import
export { MenuType };

// Function to determine if dark mode is active
function isDarkModeActive(): boolean {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// Get the initial colors based on color scheme
function getInitialColors() {
    const darkMode = isDarkModeActive();
    return {
        iconColor: darkMode ? "#ffffff" : "#000000",
        backgroundColor: darkMode ? "#000000" : "#ffffff"
    };
}

// Initial state with menu type
export const state: GlobalState = {
    menuItems: [{
        id: crypto.randomUUID(),
        title: "",
        subtitle: "",
        iconName: "",
        data: "",
        iconColor: "#000000", // This will be updated in init function
        backgroundColor: "#ffffff", // This will be updated in init function
        option: ""
    }],
    activeItemIndex: 0,
    isCircular: true,
    isAdvancedMode: false,
    menuType: MenuType.ICON // Default to icon menu
};

/**
 * Initialize state with correct dark/light mode colors
 */
export function initializeState(): void {
    const colors = getInitialColors();
    state.menuItems[0].iconColor = colors.iconColor;
    state.menuItems[0].backgroundColor = colors.backgroundColor;
}

/**
 * Add a new menu item to the state
 */
export function addMenuItem(): MenuDataItem {
    const newItem: MenuDataItem = {
        id: crypto.randomUUID(),
        title: "",
        subtitle: "",
        iconName: "",
        data: "",
        iconColor: "#000000", 
        backgroundColor: "#ffffff",
        option: "" // New field
    };
    state.menuItems.push(newItem);
    state.activeItemIndex = state.menuItems.length - 1;
    return newItem;
}

/**
 * Remove a menu item by index
 */
export function removeMenuItem(index: number): void {
    if (state.menuItems.length <= 1) {
        return; // Don't remove the last item
    }
    
    state.menuItems.splice(index, 1);
    
    // Adjust active index if needed
    if (state.activeItemIndex >= state.menuItems.length) {
        state.activeItemIndex = state.menuItems.length - 1;
    }
}

/**
 * Set the active menu item by index
 */
export function setActiveItem(index: number): void {
    if (index >= 0 && index < state.menuItems.length) {
        state.activeItemIndex = index;
    }
}

/**
 * Get the currently active menu item
 */
export function getActiveItem(): MenuDataItem {
    return state.menuItems[state.activeItemIndex];
}

/**
 * Update a property of the active menu item
 */
export function updateActiveItem<K extends keyof MenuDataItem>(
    property: K, 
    value: MenuDataItem[K]
): void {
    state.menuItems[state.activeItemIndex][property] = value;
}

/**
 * Sync form inputs with the active menu item
 */
export function syncFormToActiveItem(): void {
    const item = getActiveItem();
    
    const menuTitleInput = document.getElementById('menu-title') as HTMLInputElement;
    const menuSubtitleInput = document.getElementById('menu-subtitle') as HTMLInputElement;
    const menuDataInput = document.getElementById('menu-data') as HTMLInputElement;
    const menuOptionInput = document.getElementById('menu-option') as HTMLInputElement;
    const iconColorInput = document.getElementById('icon-color') as HTMLInputElement;
    const bgColorInput = document.getElementById('bg-color') as HTMLInputElement;
    
    if (menuTitleInput) menuTitleInput.value = item.title || '';
    if (menuSubtitleInput) menuSubtitleInput.value = item.subtitle || '';
    if (menuDataInput) menuDataInput.value = item.data || '';
    if (menuOptionInput) menuOptionInput.value = item.option || '';
    if (iconColorInput) iconColorInput.value = item.iconColor;
    if (bgColorInput) bgColorInput.value = item.backgroundColor;
}

/**
 * Toggle circular icons setting
 */
export function toggleCircular(isCircular: boolean): void {
    state.isCircular = isCircular;
}

/**
 * Toggle advanced mode setting
 */
export function toggleAdvancedMode(isAdvanced: boolean): void {
    state.isAdvancedMode = isAdvanced;
}

/**
 * Add function to toggle menu type
 */
export function toggleMenuType(type: MenuType): void {
    state.menuType = type;
}

/**
 * Reset the state to initial values
 */
export function resetState(): void {
    const colors = getInitialColors();
    
    // Clear existing menu items
    state.menuItems = [{
        id: crypto.randomUUID(),
        title: "",
        subtitle: "",
        iconName: "",
        data: "",
        iconColor: colors.iconColor || "#000000",
        backgroundColor: colors.backgroundColor || "#ffffff",
        option: ""
    }];
    
    // Reset indexes and settings
    state.activeItemIndex = 0;
    state.isCircular = true;
    state.isAdvancedMode = false;
    // Don't reset menuType to preserve user's preference
}

/**
 * Reorder menu items by moving an item from one position to another
 * @param fromIndex Source index
 * @param toIndex Destination index
 */
export function reorderMenuItems(fromIndex: number, toIndex: number): void {
    // Make sure indexes are valid
    if (
        fromIndex < 0 || 
        fromIndex >= state.menuItems.length || 
        toIndex < 0 || 
        toIndex >= state.menuItems.length ||
        fromIndex === toIndex
    ) {
        return;
    }
    
    // Remove the item from its original position
    const [movedItem] = state.menuItems.splice(fromIndex, 1);
    
    // Insert it at the new position
    state.menuItems.splice(toIndex, 0, movedItem);
    
    // If the active item was moved, update its index
    if (state.activeItemIndex === fromIndex) {
        state.activeItemIndex = toIndex;
    } 
    // Otherwise, adjust the active index if needed based on the move
    else if (
        (fromIndex < state.activeItemIndex && toIndex >= state.activeItemIndex) || 
        (fromIndex > state.activeItemIndex && toIndex <= state.activeItemIndex)
    ) {
        // The moved item crossed over the active item
        state.activeItemIndex += (fromIndex < toIndex) ? -1 : 1;
    }
}