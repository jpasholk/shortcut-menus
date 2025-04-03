/**
 * UI rendering utilities for menu items
 */
import { state, setActiveItem, removeMenuItem, syncFormToActiveItem, reorderMenuItems } from './menuState';
import { waitForLucide } from './icons';
import { getPreviewText } from './preview';

// Add these variables at the top of the file
let dragSource: number | null = null;
let dragTarget: number | null = null;

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
        const isActive = i === state.activeItemIndex;
        
        // Determine what to show in the icon area
        let iconHtml = '';
        if (item.customImageData) {
            // Use custom image if available
            iconHtml = `<img src="${item.customImageData}" class="w-6 h-6 object-contain" alt="Custom icon">`;
        } else {
            // Otherwise use Lucide icon
            const iconToUse = item.iconName || 'home';
            iconHtml = `<i data-lucide="${iconToUse}" class="w-6 h-6" style="color: ${item.iconColor}"></i>`;
        }
        
        // Enhanced menu item with drag handle
        previewHtml += `
            <div 
                class="menu-item ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''} py-2 ${i > 0 ? 'border-t border-gray-200 dark:border-gray-700' : ''} rounded-lg"
                data-index="${i}"
                draggable="true"
            >
                <div class="flex items-center gap-4 px-3">
                    <div class="drag-handle cursor-grab active:cursor-grabbing p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <i data-lucide="grip-vertical" class="w-4 h-4"></i>
                    </div>
                    <div class="w-10 h-10 flex items-center justify-center ${state.isCircular ? 'rounded-full' : 'rounded-lg'}"
                         style="background-color: ${item.backgroundColor}">
                        ${iconHtml}
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
    
    // Add event listeners to menu items for drag and drop
    const menuItems = menuPreview.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        // Drag events
        item.addEventListener('dragstart', (e: Event) => {
            const dragEvent = e as DragEvent;
            dragSource = parseInt((dragEvent.currentTarget as HTMLElement).dataset.index || '0');
            (dragEvent.currentTarget as HTMLElement).classList.add('opacity-50', 'border-2', 'border-dashed', 'border-indigo-400');
            
            // Required for Firefox to work
            if (dragEvent.dataTransfer) {
                dragEvent.dataTransfer.effectAllowed = 'move';
                dragEvent.dataTransfer.setData('text/plain', ''); // Required for IE
            }
        });
        
        item.addEventListener('dragend', (e) => {
            (e.currentTarget as HTMLElement).classList.remove('opacity-50', 'border-2', 'border-dashed', 'border-indigo-400');
            
            if (dragSource !== null && dragTarget !== null && dragSource !== dragTarget) {
                // Perform the reorder
                reorderMenuItems(dragSource, dragTarget);
                
                // Update UI after reordering
                syncFormToActiveItem();
                updatePreview();
            }
            
            // Reset drag state
            dragSource = null;
            dragTarget = null;
        });
        
        item.addEventListener('dragover', (e) => {
            // Prevent default to allow drop
            e.preventDefault();
            return false;
        });
        
        item.addEventListener('dragenter', (e) => {
            const target = e.currentTarget as HTMLElement;
            dragTarget = parseInt(target.dataset.index || '0');
            target.classList.add('bg-indigo-100', 'dark:bg-indigo-900/40');
        });
        
        item.addEventListener('dragleave', (e) => {
            const target = e.currentTarget as HTMLElement;
            target.classList.remove('bg-indigo-100', 'dark:bg-indigo-900/40');
        });
        
        item.addEventListener('drop', (e) => {
            e.preventDefault();
            const target = e.currentTarget as HTMLElement;
            target.classList.remove('bg-indigo-100', 'dark:bg-indigo-900/40');
            dragTarget = parseInt(target.dataset.index || '0');
        });
    });
    
    // Add edit/delete button event listeners
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