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
            output.menu[`option${i+1}`] = {
                title: item.title,
                icon: "{base64 icon string...}",
                sub: item.subtitle,
                data: item.data
            };
        }
        
        return JSON.stringify(output, null, 2);
    } else {
        // Create VCARD preview with placeholder
        let vCardOutput = '';
        
        for (const item of state.menuItems) {
            const iconPlaceholder = item.iconName 
                ? "{base64 icon string...}"
                : "";
            
            vCardOutput += `BEGIN:VCARD
VERSION:3.0
N;CHARSET=utf-8:${item.title || ''};
ORG:${item.subtitle || ''};
NOTE:${item.data || ''};
PHOTO;ENCODING=b:${iconPlaceholder};
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