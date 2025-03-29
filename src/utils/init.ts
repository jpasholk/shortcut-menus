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
    toggleCircular,
    toggleAdvancedMode,
    resetState
} from './menuState';
import { validateIcon, waitForLucide } from './icons';
import { updatePreview, updateUI } from './ui';
import { copyToClipboard } from './clipboard';
import { downloadData } from './download';

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
        updateActiveItem('iconColor', (e.target as HTMLInputElement).value);
        await updatePreview();
    });

    bgColorInput?.addEventListener('input', async (e) => {
        updateActiveItem('backgroundColor', (e.target as HTMLInputElement).value);
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