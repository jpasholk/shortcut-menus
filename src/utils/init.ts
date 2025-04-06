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
    resetState,
    initializeState,
    toggleMenuType // Add this import
} from './menuState';
import { validateIcon, waitForLucide } from './icons';
import { updatePreview, updateUI, toggleMenuTypeVisibility } from './ui'; // Add toggleMenuTypeVisibility
import { copyToClipboard } from './clipboard';
import { downloadData } from './download';
import { processImage } from './images';
import { MenuType } from './types'; // Add MenuType

/**
 * Initialize the application and set up event listeners
 */
export function initShortcutMenu(): void {
    // Initialize state with dark/light mode colors
    initializeState();

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
    const menuOptionInput = document.getElementById('menu-option') as HTMLInputElement;

    // Setup menu type radio buttons
    const iconRadio = document.getElementById('menu-type-icon') as HTMLInputElement;
    const simpleRadio = document.getElementById('menu-type-simple') as HTMLInputElement;
    // Add mobile radio buttons
    const iconRadioMobile = document.getElementById('menu-type-icon-mobile') as HTMLInputElement;
    const simpleRadioMobile = document.getElementById('menu-type-simple-mobile') as HTMLInputElement;

    // Function to update all radio buttons based on state
    function syncRadioButtons() {
        // Set desktop radios
        if (iconRadio) iconRadio.checked = state.menuType === MenuType.ICON;
        if (simpleRadio) simpleRadio.checked = state.menuType === MenuType.SIMPLE;
        
        // Set mobile radios
        if (iconRadioMobile) iconRadioMobile.checked = state.menuType === MenuType.ICON;
        if (simpleRadioMobile) simpleRadioMobile.checked = state.menuType === MenuType.SIMPLE;
    }

    // Function to handle radio button changes
    async function handleMenuTypeChange(type: MenuType) {
        toggleMenuType(type);
        toggleMenuTypeVisibility();
        syncFormToActiveItem();
        syncRadioButtons(); // Keep all radio buttons in sync
        
        // Reset validation state
        if (menuSubtitleInput) {
            menuSubtitleInput.classList.remove('border-red-500');
            const validationMsg = document.getElementById('subtitle-validation');
            if (validationMsg) {
                validationMsg.remove();
            }
        }
        
        if (menuOptionInput) {
            menuOptionInput.classList.remove('border-red-500');
        }

        // Update the output preview
        const outputPreview = document.getElementById('output-preview');
        if (outputPreview) {
            outputPreview.textContent = await getPreviewText();
        }
        
        updateUI();
    }

    // Add event listeners to all radio buttons
    if (iconRadio && simpleRadio) {
        // Desktop radio buttons
        iconRadio.addEventListener('change', async () => {
            if (iconRadio.checked) {
                await handleMenuTypeChange(MenuType.ICON);
            }
        });

        simpleRadio.addEventListener('change', async () => {
            if (simpleRadio.checked) {
                await handleMenuTypeChange(MenuType.SIMPLE);
            }
        });
    }

    // Mobile radio buttons
    if (iconRadioMobile && simpleRadioMobile) {
        iconRadioMobile.addEventListener('change', async () => {
            if (iconRadioMobile.checked) {
                await handleMenuTypeChange(MenuType.ICON);
            }
        });

        simpleRadioMobile.addEventListener('change', async () => {
            if (simpleRadioMobile.checked) {
                await handleMenuTypeChange(MenuType.SIMPLE);
            }
        });
    }

    // Initial sync of radio buttons
    syncRadioButtons();

    // Initial visibility setup
    toggleMenuTypeVisibility();

    // Event listeners for form inputs
    menuTitleInput?.addEventListener('input', async (e) => {
        updateActiveItem('title', (e.target as HTMLInputElement).value);
        await updatePreview();
    });

    menuSubtitleInput?.addEventListener('input', async (e) => {
        const value = (e.target as HTMLInputElement).value;
        updateActiveItem('subtitle', value);
        
        // Highlight input as invalid if it contains spaces in SIMPLE mode
        if (state.menuType === MenuType.SIMPLE) {
            const hasSpaces = value.includes(' ');
            
            if (hasSpaces) {
                menuSubtitleInput.classList.add('border-red-500');
                // Create or update validation message
                let validationMsg = document.getElementById('subtitle-validation');
                if (!validationMsg) {
                    validationMsg = document.createElement('p');
                    validationMsg.id = 'subtitle-validation';
                    validationMsg.className = 'text-red-500 text-xs mt-1';
                    menuSubtitleInput.parentNode?.appendChild(validationMsg);
                }
                validationMsg.textContent = 'Phone numbers cannot contain spaces';
            } else {
                menuSubtitleInput.classList.remove('border-red-500');
                // Remove validation message if exists
                const validationMsg = document.getElementById('subtitle-validation');
                if (validationMsg) {
                    validationMsg.remove();
                }
            }
        }
        
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

    menuOptionInput?.addEventListener('input', async (e) => {
        const value = (e.target as HTMLInputElement).value;
        updateActiveItem('option', value);
        
        // Highlight input as invalid if empty in SIMPLE mode
        if (state.menuType === MenuType.SIMPLE) {
            if (value.trim() === '') {
                menuOptionInput.classList.add('border-red-500');
            } else {
                menuOptionInput.classList.remove('border-red-500');
            }
        }
        
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
        // Validate simple menu fields before copying
        if (state.menuType === MenuType.SIMPLE) {
            const hasInvalidItems = validateMenuItems();
            if (hasInvalidItems) {
                return; // Stop if validation failed
            }
        }
        copyToClipboard(notification ?? undefined);
    });

    // Download button handler
    downloadButton?.addEventListener('click', async () => {
        // Validate simple menu fields before downloading
        if (state.menuType === MenuType.SIMPLE) {
            const hasInvalidItems = validateMenuItems();
            if (hasInvalidItems) {
                return; // Stop if validation failed
            }
        }
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
        syncFormToActiveItem(); // This will pull the correct colors to the form
        await updateUI();
    })();

    // Listen for color scheme changes
    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    colorSchemeQuery.addEventListener('change', (e) => {
        // Only update if we're on the first item with default colors
        if (state.activeItemIndex === 0 && 
            state.menuItems.length === 1 && 
            !state.menuItems[0].title && 
            !state.menuItems[0].subtitle && 
            !state.menuItems[0].iconName) {
            
            // If we're still at the initial state, update colors
            const newIconColor = e.matches ? '#ffffff' : '#000000';
            const newBgColor = e.matches ? '#000000' : '#ffffff';
            
            updateActiveItem('iconColor', newIconColor);
            updateActiveItem('backgroundColor', newBgColor);
            
            // Update form controls
            if (iconColorInput) iconColorInput.value = newIconColor;
            if (bgColorInput) bgColorInput.value = newBgColor;
            
            // Update UI
            updatePreview();
        }
    });

    // Add this validation helper function
    function validateMenuItems(): boolean {
        // Only validate for SIMPLE menu type
        if (state.menuType !== MenuType.SIMPLE) return false;
        
        let hasInvalidItems = false;
        let errorMessage = '';
        
        // Check each menu item for required fields
        state.menuItems.forEach((item, index) => {
            // Create an item identifier for the error message
            const itemName = item.title || `Item #${index + 1}`;
            
            // For simple menu, subtitle and option are required
            if (!item.subtitle || item.subtitle.trim() === '') {
                hasInvalidItems = true;
                errorMessage += `• "${itemName}" is missing Option Subtitle\n`;
            } else if (item.subtitle.includes(' ')) {
                hasInvalidItems = true;
                errorMessage += `• "${itemName}" has spaces in Option Subtitle\n`;
            }
            
            if (!item.option || item.option.trim() === '') {
                hasInvalidItems = true;
                errorMessage += `• "${itemName}" is missing Second Column value\n`;
            }
        });
        
        if (hasInvalidItems) {
            alert(`Please fix the following issues before continuing:\n\n${errorMessage}\n\nIn Two Column Menu mode, both Option Subtitle and Second Column are required, and Option Subtitle cannot contain spaces.`);
        }
        
        return hasInvalidItems;
    }
}
/**
 * Returns the current preview text for the VCARD output
 */
async function getPreviewText(): Promise<string> {
    // Wait for all icons to be loaded
    await waitForLucide();
    
    // Generate VCARD data based on current state
    const activeItem = getActiveItem();
    
    // Create a basic preview of the VCARD data
    let previewText = 'BEGIN:VCARD\nVERSION:3.0\n';
    
    // Add menu title as FN (Full Name)
    if (activeItem.title) {
        previewText += `FN:${activeItem.title}\n`;
    }
    
    // Add menu subtitle as NOTE
    if (activeItem.subtitle) {
        previewText += `NOTE:${activeItem.subtitle}\n`;
    }
    
    // Add menu data as URL
    if (activeItem.data) {
        previewText += `URL:${activeItem.data}\n`;
    }
    
    // Show different preview based on menu type
    previewText += `X-MENU-TYPE:${state.menuType}\n`;
    
    if (state.menuType === MenuType.ICON && activeItem.iconName) {
        previewText += `X-ICON:${activeItem.iconName}\n`;
    }
    
    previewText += 'END:VCARD';
    return previewText;
}
