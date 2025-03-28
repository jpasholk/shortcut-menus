/**
 * UI rendering utilities for menu items
 */
import { state, setActiveItem, removeMenuItem, syncFormToActiveItem } from './menuState';
import { waitForLucide } from './icons';
import { getPreviewText } from './preview';

/**
 * Update the visual preview of menu items in the UI
 */
export async function updatePreview(): Promise<void> {
    const menuPreview = document.getElementById('menu-preview');
    if (!menuPreview) return;
    
    // Ensure Lucide is loaded before proceeding
    await waitForLucide();
    
    let previewHtml = '';
    
    // Generate HTML for each menu item
    for (let i = 0; i < state.menuItems.length; i++) {
        const item = state.menuItems[i];
        const iconToUse = item.iconName || 'home';
        const isActive = i === state.activeItemIndex;
        
        // Enhance the highlight for active item
        previewHtml += `
            <div class="menu-item ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''} py-2 ${i > 0 ? 'border-t border-gray-200 dark:border-gray-700' : ''} rounded-lg">
                <div class="flex items-center gap-4 px-3">
                    <div class="w-10 h-10 flex items-center justify-center ${state.isCircular ? 'rounded-full' : 'rounded-lg'}"
                         style="background-color: ${item.backgroundColor}">
                        <i data-lucide="${iconToUse}" class="w-6 h-6"
                           style="color: ${item.iconColor}"></i>
                    </div>
                    <div class="flex-1">
                        <h3 class="font-medium text-gray-900 dark:text-white">${item.title || 'Untitled Option'}</h3>
                        ${item.subtitle ? `<p class="text-sm text-gray-500 dark:text-gray-400">${item.subtitle}</p>` : ''}
                    </div>
                    <button class="edit-item-btn p-1.5 text-gray-500 hover:text-indigo-600 dark:text-gray-400 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}" data-index="${i}">
                        <i data-lucide="pencil" class="w-4 h-4"></i>
                    </button>
                    ${state.menuItems.length > 1 ? `
                    <button class="delete-item-btn p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400" data-index="${i}">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>` : ''}
                </div>
            </div>
        `;
    }
    
    menuPreview.innerHTML = previewHtml;
    
    // Add event listeners to edit/delete buttons
    const editButtons = menuPreview.querySelectorAll('.edit-item-btn');
    editButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt((e.currentTarget as HTMLElement).dataset.index || '0');
            
            // Set this item as active
            setActiveItem(index);
            
            // Update the form inputs to reflect this item's data
            syncFormToActiveItem();
            
            // Update UI to show the highlight
            updatePreview();
        });
    });
    
    const deleteButtons = menuPreview.querySelectorAll('.delete-item-btn');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt((e.currentTarget as HTMLElement).dataset.index || '0');
            removeMenuItem(index);
            syncFormToActiveItem(); // Update form after deleting
            updatePreview();
        });
    });
    
    // Create Lucide icons
    await window.lucide.createIcons({
        elements: [menuPreview]
    });
    
    // Update output preview
    const outputPreview = document.getElementById('output-preview');
    if (outputPreview) {
        outputPreview.textContent = await getPreviewText();
    }
}

/**
 * Update all UI elements to reflect current state
 */
export async function updateUI(): Promise<void> {
    // Update the visual preview
    await updatePreview();
    
    // Update button texts based on mode
    const copyButton = document.getElementById('copyButton');
    const downloadButton = document.getElementById('downloadButton');
    
    const mode = state.isAdvancedMode ? 'JSON' : 'VCARD';
    if (copyButton) {
        copyButton.textContent = `Copy ${mode}`;
    }
    if (downloadButton) {
        downloadButton.textContent = `Download ${mode}`;
    }
}