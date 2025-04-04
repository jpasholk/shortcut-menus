/**
 * Data preparation for export operations
 */
import { state } from './menuState';
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
                
                // Start building vCard
                vCardOutput += `BEGIN:VCARD
VERSION:3.0
N;CHARSET=utf-8:${item.title};
ORG:${item.subtitle};`;

                // Only include NOTE field if data exists and isn't empty
                if (item.data && item.data.trim()) {
                    vCardOutput += `
NOTE:${item.data};`;
                }
                
                // Complete the vCard
                vCardOutput += `
PHOTO;ENCODING=b:${pngBase64};
END:VCARD

`;
            }
            
            // Trim the final output to remove trailing whitespace
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