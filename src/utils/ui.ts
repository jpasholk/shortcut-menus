/**
 * UI rendering utilities for menu items
 */
import { state, setActiveItem, removeMenuItem, syncFormToActiveItem, reorderMenuItems, updateActiveItem } from './menuState';
import { waitForLucide } from './icons';
import { getPreviewText } from './preview';
import { MenuType } from './types';

// Add these variables at the top of the file
let dragSource: number | null = null;
let dragTarget: number | null = null;

/**
 * Toggle visibility of UI elements based on menu type
 */
export function toggleMenuTypeVisibility(): void {
  const isIconMenu = state.menuType === MenuType.ICON;
  const iconFields = document.querySelectorAll('.menu-icon-field');
  const simpleFields = document.querySelectorAll('.menu-simple-field');
  
  // Show/hide icon-related fields
  iconFields.forEach(field => {
    field.classList.toggle('hidden', !isIconMenu);
  });
  
  // Show/hide simple menu-related fields
  simpleFields.forEach(field => {
    field.classList.toggle('hidden', isIconMenu);
  });
  
  // Update subtitle label and placeholder based on menu type
  const subtitleInput = document.getElementById('menu-subtitle') as HTMLInputElement;
  const subtitleLabel = document.getElementById('subtitle-label');
  const subtitleRequired = document.getElementById('subtitle-required');
  
  if (subtitleInput) {
    if (isIconMenu) {
      // Icon menu - normal subtitle
      subtitleInput.placeholder = "Enter menu option subtitle...";
      if (subtitleLabel) subtitleLabel.textContent = "Option Subtitle";
      if (subtitleRequired) subtitleRequired.classList.add('hidden');
    } else {
      // Simple menu - TEL field (required)
      subtitleInput.placeholder = "Enter menu option subtitle (Required)...";
      if (subtitleLabel) subtitleLabel.textContent = "Option Subtitle (Required)";
      if (subtitleRequired) subtitleRequired.classList.remove('hidden');
    }
  }
  
  // Set default value for option field if empty
  const optionInput = document.getElementById('menu-option') as HTMLInputElement;
  if (optionInput && !isIconMenu && (!optionInput.value || optionInput.value.trim() === '')) {
    optionInput.value = '';
    // Update state if this is an actual menu type change (not initial load)
    const activeItem = state.menuItems[state.activeItemIndex];
    if (activeItem && (!activeItem.option || activeItem.option.trim() === '')) {
      updateActiveItem('option', '');
    }
  }
}

/**
 * Update the visual preview of menu items in the UI
 */
export async function updatePreview(): Promise<void> {
  const menuPreview = document.getElementById('menu-preview');
  if (!menuPreview) return;
  
  await waitForLucide(); // If you have this function
  
  let previewHtml = '';
  
  // Generate preview based on menu type
  for (let i = 0; i < state.menuItems.length; i++) {
    const item = state.menuItems[i];
    const isActive = i === state.activeItemIndex;
    
    if (state.menuType === MenuType.ICON) {
      // Icon menu preview
      let iconHtml = '';
      if (item.customImageData) {
        iconHtml = `<img src="${item.customImageData}" class="w-6 h-6 object-contain" alt="Custom icon">`;
      } else if (item.iconName) {
        iconHtml = `<i data-lucide="${item.iconName}" class="w-6 h-6" style="color: ${item.iconColor}"></i>`;
      } else {
        iconHtml = `<i data-lucide="home" class="w-6 h-6" style="color: ${item.iconColor}"></i>`;
      }
      
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
    } else {
      // Simple menu preview
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
          <div class="flex-1">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="font-medium text-gray-900 dark:text-white">${item.title || 'Untitled Option'}</h3>
                ${item.subtitle ? `<p class="text-sm text-gray-500 dark:text-gray-400">${item.subtitle.replace(/\s+/g, '')}</p>` : ''}
              </div>
              ${item.option ? `<span class="text-sm text-gray-900 dark:text-white">${item.option}</span>` : ''}
            </div>
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
 * Update the syncFormToState function to handle the option field
 */
export function syncFormToState(): void {
  const titleInput = document.getElementById('menu-title') as HTMLInputElement;
  const subtitleInput = document.getElementById('menu-subtitle') as HTMLInputElement;
  const dataInput = document.getElementById('menu-data') as HTMLInputElement;
  const optionInput = document.getElementById('menu-option') as HTMLInputElement;
  const iconNameInput = document.getElementById('icon-name') as HTMLInputElement;
  const iconColorInput = document.getElementById('icon-color') as HTMLInputElement;
  const bgColorInput = document.getElementById('bg-color') as HTMLInputElement;
  
  if (!titleInput || !subtitleInput || !dataInput) return;
  
  const activeItem = state.menuItems[state.activeItemIndex];
  
  titleInput.value = activeItem.title || '';
  subtitleInput.value = activeItem.subtitle || '';
  dataInput.value = activeItem.data || '';
  
  // Handle option field if it exists in the UI
  if (optionInput && activeItem.option !== undefined) {
    optionInput.value = activeItem.option;
  }
  
  // Handle icon-related inputs
  if (iconNameInput) iconNameInput.value = activeItem.iconName || '';
  if (iconColorInput) iconColorInput.value = activeItem.iconColor;
  if (bgColorInput) bgColorInput.value = activeItem.backgroundColor;
}

/**
 * Update input event handlers to capture option value
 */
export function setupFormEventListeners(): void {
  const optionInput = document.getElementById('menu-option') as HTMLInputElement;
  
  if (optionInput) {
    optionInput.addEventListener('input', (e) => {
      const value = (e.target as HTMLInputElement).value;
      updateActiveItem('option', value);
    });
  }
  
  // Rest of your existing form event listeners
}

/**
 * Update the entire UI state
 */
export async function updateUI(): Promise<void> {
  // Update visual preview
  await updatePreview();
  
  // Update text output preview
  const outputPreview = document.getElementById('output-preview');
  if (outputPreview) {
    outputPreview.textContent = await getPreviewText();
  }
  
  // Ensure the form reflects the current active menu item
  syncFormToActiveItem();
  
  // Use Lucide to create icons if needed
  if (window.lucide && window.lucide.createIcons) {
    await window.lucide.createIcons();
  }
}