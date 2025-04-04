/**
 * Preview generation for menu data
 */
import { state } from './menuState';

/**
 * Generate preview text for showing in the UI
 * Shows placeholder data without actual base64 icons
 */
export async function getPreviewText(): Promise<string> {
    if (state.isAdvancedMode) {
        // Create JSON preview with placeholder for icon data
        const output = { menu: {} as Record<string, any> };
        
        for (let i = 0; i < state.menuItems.length; i++) {
            const item = state.menuItems[i];
            const menuItem: Record<string, any> = {
                title: item.title,
                icon: "{base64 icon string...}"
            };
            
            // Only include subtitle if not empty
            if (item.subtitle && item.subtitle.trim()) {
                menuItem.sub = item.subtitle;
            }
            
            // Only include data if not empty
            if (item.data && item.data.trim()) {
                menuItem.data = item.data;
            }
            
            output.menu[`option${i+1}`] = menuItem;
        }
        
        return JSON.stringify(output, null, 2);
    } else {
        // Create VCARD preview with placeholder
        let vCardOutput = '';
        
        for (const item of state.menuItems) {
            let iconPlaceholder;
            
            if (item.customImageData) {
                // Custom uploaded image
                iconPlaceholder = "{Custom uploaded image...}";
            } else if (item.iconName) {
                // Lucide icon
                iconPlaceholder = `{${item.iconName} icon...}`;
            } else {
                // No icon
                iconPlaceholder = "";
            }
            
            vCardOutput += `BEGIN:VCARD
VERSION:3.0
N:${item.title || ''}
ORG:${item.subtitle || ''}`;

            // Only include NOTE field if data is not empty
            if (item.data && item.data.trim()) {
                vCardOutput += `
NOTE:${item.data}`;
            }
            
            vCardOutput += `
PHOTO;BASE64:${iconPlaceholder}
END:VCARD

`;
        }
        
        return vCardOutput.trim();
    }
}

/**
 * Update the preview area in the UI
 */
export async function updatePreviewText(): Promise<void> {
    const outputPreview = document.getElementById('output-preview');
    if (outputPreview) {
        outputPreview.textContent = await getPreviewText();
    }
}