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
                const pngBase64 = await svgToPngBase64(item.iconName || 'home');
                
                output.menu[`option${i+1}`] = {
                    title: item.title,
                    icon: pngBase64,
                    sub: item.subtitle,
                    data: item.data
                };
            }
            
            outputData = JSON.stringify(output, null, 2);
            fileName = 'menu-data.json';
            mimeType = 'application/json';
        } else {
            // Generate full VCARD data with actual base64 icons
            let vCardOutput = '';
            
            for (const item of state.menuItems) {
                const pngBase64 = await svgToPngBase64(item.iconName || 'home');
                
                vCardOutput += `BEGIN:VCARD
VERSION:3.0
N;CHARSET=utf-8:${item.title};
ORG:${item.subtitle};
NOTE:${item.data};
PHOTO;ENCODING=b:${pngBase64};
END:VCARD
`;
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