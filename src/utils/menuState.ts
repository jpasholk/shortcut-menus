/**
 * State management
 */
import type { MenuDataItem, GlobalState } from './types';

// Initial state with one menu item
export const state: GlobalState = {
    menuItems: [{
        id: crypto.randomUUID(),
        title: "",
        subtitle: "",
        iconName: "",
        data: "",
        iconColor: "#000000",
        backgroundColor: "#ffffff"
    }],
    activeItemIndex: 0,
    isCircular: true,
    isAdvancedMode: false
};

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
        backgroundColor: "#ffffff"
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
    const iconColorInput = document.getElementById('icon-color') as HTMLInputElement;
    const bgColorInput = document.getElementById('bg-color') as HTMLInputElement;
    
    if (menuTitleInput) menuTitleInput.value = item.title || '';
    if (menuSubtitleInput) menuSubtitleInput.value = item.subtitle || '';
    if (menuDataInput) menuDataInput.value = item.data || '';
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
 * Reset the state to initial values
 */
export function resetState(): void {
    // Clear existing menu items
    state.menuItems = [{
        id: crypto.randomUUID(),
        title: "",
        subtitle: "",
        iconName: "",
        data: "",
        iconColor: "#000000",
        backgroundColor: "#ffffff"
    }];
    
    // Reset indexes and settings
    state.activeItemIndex = 0;
    state.isCircular = true;
    state.isAdvancedMode = false;
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