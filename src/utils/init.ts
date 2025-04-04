/**
 * Application initialization and event handling
 */
import { 
    state, 
    addMenuItem,
    setActiveItem,
    removeMenuItem,
    syncFormToActiveItem,
    updateActiveItem,
    getActiveItem,
    toggleCircular,
    toggleAdvancedMode,
    resetState
} from './menuState';
import { validateIcon, waitForLucide } from './icons';
import { updatePreview, updateUI } from './ui';
import { copyToClipboard } from './clipboard';
import { downloadData } from './download';
import { processImage } from './images';

/**
 * Initialize the application and set up event listeners
 */
export function initShortcutMenu(): void {
    // DOM Elements
    const menuTitleInput = document.getElementById('menu-title') as HTMLInputElement;
    const menuSubtitleInput = document.getElementById('menu-subtitle') as HTMLInputElement;
    const menuDataInput = document.getElementById('menu-data') as HTMLInputElement;
    const copyButton = document.getElementById('copyButton');
    const downloadButton = document.getElementById('downloadButton');
    const notification = document.getElementById('notification');
    const iconNameInput = document.getElementById('icon-name') as HTMLInputElement;
    const addIconButton = document.getElementById('add-icon');
    const iconColorInput = document.getElementById('icon-color') as HTMLInputElement;
    const bgColorInput = document.getElementById('bg-color') as HTMLInputElement;
    const circularMaskToggle = document.getElementById('circular-mask') as HTMLInputElement;
    const advancedToggle = document.getElementById('advanced-toggle') as HTMLInputElement;
    const addMenuItemButton = document.getElementById('add-menu-item');
    const resetButton = document.getElementById('reset-button');
    const imageUploadInput = document.getElementById('image-upload') as HTMLInputElement;

    // Event listeners for form inputs
    menuTitleInput?.addEventListener('input', async (e) => {
        updateActiveItem('title', (e.target as HTMLInputElement).value);
        await updatePreview();
    });

    menuSubtitleInput?.addEventListener('input', async (e) => {
        updateActiveItem('subtitle', (e.target as HTMLInputElement).value);
        await updatePreview();
    });

    menuDataInput?.addEventListener('input', async (e) => {
        updateActiveItem('data', (e.target as HTMLInputElement).value);
        await updatePreview();
    });

    iconColorInput?.addEventListener('input', async (e) => {
        const newColor = (e.target as HTMLInputElement).value;
        updateActiveItem('iconColor', newColor);
        await updatePreview();
    });

    bgColorInput?.addEventListener('input', async (e) => {
        const newColor = (e.target as HTMLInputElement).value;
        updateActiveItem('backgroundColor', newColor);
        await updatePreview();
    });

    // Toggle circular icons
    circularMaskToggle?.addEventListener('change', async (e) => {
        toggleCircular((e.target as HTMLInputElement).checked);
        await updatePreview();
    });

    // Toggle advanced mode
    advancedToggle?.addEventListener('change', async (e) => {
        toggleAdvancedMode((e.target as HTMLInputElement).checked);
        await updateUI();
    });

    // Add icon button
    addIconButton?.addEventListener('click', async () => {
        const iconName = iconNameInput?.value.trim().toLowerCase();
        if (!iconName) return;
        
        try {
            await waitForLucide();
            const isValid = await validateIcon(iconName);
            
            if (!isValid) {
                throw new Error(`Icon "${iconName}" not found`);
            }
            
            updateActiveItem('iconName', iconName);
            await updatePreview();
            iconNameInput.value = '';
        } catch (err) {
            console.error('Icon validation failed:', err);
            alert('Icon not found. Please check https://lucide.dev/icons for available icons.');
        }
    });

    // Add "Add Menu Item" button handler
    addMenuItemButton?.addEventListener('click', async () => {
        addMenuItem();
        syncFormToActiveItem();
        await updatePreview();
    });

    // Copy button handler
    copyButton?.addEventListener('click', () => {
        copyToClipboard(notification ?? undefined);
    });

    // Download button handler
    downloadButton?.addEventListener('click', async () => {
        await downloadData();
    });

    // Reset button handler
    resetButton?.addEventListener('click', async () => {
        if (confirm('Are you sure you want to reset all menu items? This cannot be undone.')) {
            resetState();
            syncFormToActiveItem();
            await updateUI();
        }
    });

    // Image upload handler
    imageUploadInput?.addEventListener('change', function(e) {
        const file = this.files?.[0];
        if (!file) return;

        // Enhanced validation for file type
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
        if (!validImageTypes.includes(file.type)) {
            alert('Please select a valid image file (JPEG, PNG, GIF, SVG, or WebP)');
            this.value = '';
            return;
        }

        // File size check (limit to 5MB)
        const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSizeInBytes) {
            alert('Image file is too large. Please select an image smaller than 5MB.');
            this.value = '';
            return;
        }

        // Show loading state
        const menuPreview = document.getElementById('menu-preview');
        if (menuPreview) {
            const activeIconElement = menuPreview.querySelector('.w-10.h-10');
            if (activeIconElement) {
                activeIconElement.innerHTML = '<div class="animate-pulse w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>';
            }
        }

        // Read file as data URL
        const reader = new FileReader();
        reader.onload = async function(event) {
            try {
                const imageDataUrl = event.target?.result as string;
                
                // Process image for size but without color filters
                const processedImage = await processImage(imageDataUrl);
                
                // Update state with processed image
                updateActiveItem('customImageData', processedImage);
                updateActiveItem('iconName', ''); // Clear icon name when using custom image
                
                // Update UI
                await updatePreview();
            } catch (err) {
                console.error('Image processing failed:', err);
                alert('Failed to process image. Please try another one.');
                
                // Restore previous icon if there was one
                const currentItem = getActiveItem();
                if (currentItem.iconName) {
                    // Keep using the current icon name
                    await updatePreview();
                } else {
                    // Set a default icon if there wasn't one
                    updateActiveItem('iconName', 'image');
                    await updatePreview();
                }
            }
        };
        
        reader.onerror = function() {
            console.error('FileReader error');
            alert('Failed to read the image file');
        };
        
        reader.readAsDataURL(file);
        
        // Reset file input for future uploads
        this.value = '';
    });

    // Set initial button states
    if (copyButton) copyButton.textContent = 'Copy VCARD';
    if (downloadButton) downloadButton.textContent = 'Download VCARD';

    // Initialize the UI
    (async () => {
        await waitForLucide();
        syncFormToActiveItem();
        await updateUI();
    })();
}