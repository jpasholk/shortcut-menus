/**
 * Data preparation for export operations
 */
import { state, MenuType } from './menuState';
import { svgToPngBase64 } from './icons';

/**
 * Prepare data for export with real base64 icons
 */
export async function prepareExportData(): Promise<{
    data: string;
    fileName: string;
    mimeType: string;
}> {
    try {
        let outputData: string;
        let fileName: string;
        let mimeType: string;
        
        if (state.isAdvancedMode) {
            // Generate full JSON with actual base64 icons
            const output = { menu: {} as Record<string, any> };
            
            for (let i = 0; i < state.menuItems.length; i++) {
                const item = state.menuItems[i];
                
                // Handle custom image or Lucide icon with error fallback
                let pngBase64;
                try {
                    if (item.customImageData) {
                        // Extract base64 part from custom image data
                        pngBase64 = item.customImageData.replace(/^data:image\/[a-z]+;base64,/, '');
                    } else {
                        // Generate from icon name
                        pngBase64 = await svgToPngBase64(item.iconName || 'home');
                    }
                } catch (err) {
                    console.warn("Icon conversion failed, using fallback:", err);
                    // Transparent pixel fallback
                    pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
                }
                
                // Create menu item object with required fields
                const menuItem: Record<string, any> = {
                    title: item.title,
                    icon: pngBase64
                };
                
                // Only add subtitle if it exists and isn't empty
                if (item.subtitle && item.subtitle.trim()) {
                    menuItem.sub = item.subtitle;
                }
                
                // Only add data if it exists and isn't empty
                if (item.data && item.data.trim()) {
                    menuItem.data = item.data;
                }
                
                output.menu[`option${i+1}`] = menuItem;
            }
            
            outputData = JSON.stringify(output, null, 2);
            fileName = 'menu-data.json';
            mimeType = 'application/json';
        } else {
            // Generate full VCARD data with actual base64 icons
            let vCardOutput = '';
            
            for (const item of state.menuItems) {
                if (state.menuType === MenuType.ICON) {
                    // Existing icon-based vCard format
                    vCardOutput += `BEGIN:VCARD
VERSION:3.0
N:${item.title}
ORG:${item.subtitle}`;

                    // Only include NOTE if it has content
                    if (item.data && item.data.trim()) {
                        vCardOutput += `
NOTE:${item.data}`;
                    }
                    
                    // Icon handling
                    let pngBase64;
                    try {
                        if (item.customImageData) {
                            pngBase64 = item.customImageData.replace(/^data:image\/[a-z]+;base64,/, '');
                        } else {
                            pngBase64 = await svgToPngBase64(item.iconName || 'home');
                        }
                    } catch (err) {
                        console.warn("Icon conversion failed, using fallback:", err);
                        pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
                    }
                    
                    vCardOutput += `
PHOTO;BASE64:${pngBase64}
END:VCARD

`;
                } else {
                    // New simple vCard format
                    vCardOutput += `BEGIN:VCARD
VERSION:3.0
N:${item.title}`;

                    // Only include TEL field if subtitle has content
                    if (item.subtitle && item.subtitle.trim()) {
                        // Use the option value if available, otherwise use a default like 'CELL'
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
            
            outputData = vCardOutput.trim();
            fileName = 'menu-data.vcf';
            mimeType = 'text/vcard';
        }
        
        return { data: outputData, fileName, mimeType };
    } catch (error) {
        console.error('Error preparing export data:', error);
        throw error;
    }
}