/**
 * Preview generation for menu data
 */
import { state, MenuType } from './menuState';

/**
 * Generate preview text for the current menu
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
        // vCard preview
        let vCardOutput = '';
        
        for (const item of state.menuItems) {
            // Different preview based on menu type
            if (state.menuType === MenuType.ICON) {
                // Icon menu preview
                let iconPlaceholder;
                
                if (item.customImageData) {
                    iconPlaceholder = "{Custom uploaded image...}";
                } else if (item.iconName) {
                    iconPlaceholder = `{${item.iconName} icon...}`;
                } else {
                    iconPlaceholder = "{default icon...}";
                }
                
                vCardOutput += `BEGIN:VCARD
VERSION:3.0
N:${item.title || 'Title'}
ORG:${item.subtitle || 'Subtitle'}`;

                // Only include NOTE if it has content
                if (item.data && item.data.trim()) {
                    vCardOutput += `
NOTE:${item.data}`;
                }
                
                vCardOutput += `
PHOTO;BASE64:${iconPlaceholder}
END:VCARD

`;
            } else {
                // Simple menu preview
                vCardOutput += `BEGIN:VCARD
VERSION:3.0
N:${item.title || 'Title'}`;

                // Only include TEL field if subtitle has content
                if (item.subtitle && item.subtitle.trim()) {
                    // Use the option value if available, otherwise use a default
                    const optionType = item.option && item.option.trim() ? item.option : 'CELL';
                    // Remove spaces from subtitle for TEL field
                    const formattedSubtitle = item.subtitle.replace(/\s+/g, '');
                    vCardOutput += `
TEL;TYPE=${optionType}:${formattedSubtitle}`;
                }

                // Only include NOTE if it has content
                if (item.data && item.data.trim()) {
                    vCardOutput += `
NOTE:${item.data}`;
                }
                
                vCardOutput += `
END:VCARD

`;
            }
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